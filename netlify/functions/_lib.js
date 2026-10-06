// Shared helpers for the pinterest-design-research proxy functions.
// Holds no secrets of its own — everything comes from Netlify env vars
// (set in the site's dashboard, never committed) and Netlify Blobs
// (token/state storage, provisioned automatically for the site).
const { getStore } = require("@netlify/blobs");

const API_BASE = "https://api.pinterest.com/v5";
const TOKEN_REFRESH_MARGIN_SECONDS = 600;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function requireSecret(event) {
  const expected = env("PROXY_SHARED_SECRET");
  if (!expected) {
    throw { statusCode: 500, message: "PROXY_SHARED_SECRET is not configured on this site." };
  }
  const got =
    event.headers["x-proxy-secret"] ||
    event.headers["X-Proxy-Secret"] ||
    (event.queryStringParameters && event.queryStringParameters.secret);
  // Trim both sides: a trailing newline/space picked up when copying the
  // generated secret into Netlify's env var UI is a common, easy-to-miss
  // way this comparison fails even with "the right" secret.
  if (String(got || "").trim() !== String(expected || "").trim()) {
    throw { statusCode: 401, message: "Missing or invalid proxy secret." };
  }
}

function tokenStore() {
  return getStore("pinterest-tokens");
}

function stateStore() {
  return getStore("pinterest-state");
}

async function getTokens() {
  const raw = await tokenStore().get("tokens.json", { type: "json" });
  return raw || null;
}

async function saveTokens(tokens) {
  await tokenStore().setJSON("tokens.json", tokens);
}

function env(key) {
  const v = process.env[key];
  return v == null ? v : v.trim();
}

async function oauthTokenRequest(grantFields) {
  const appId = env("PINTEREST_APP_ID");
  const appSecret = env("PINTEREST_APP_SECRET");
  if (!appId || !appSecret) {
    throw { statusCode: 500, message: "PINTEREST_APP_ID / PINTEREST_APP_SECRET not configured on this site." };
  }
  const basic = Buffer.from(`${appId}:${appSecret}`).toString("base64");
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(grantFields).toString(),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw { statusCode: 502, message: `Pinterest oauth/token error ${res.status}: ${detail}` };
  }
  return res.json();
}

async function ensureAccessToken() {
  const tokens = await getTokens();
  if (!tokens || !tokens.refresh_token) {
    throw {
      statusCode: 428,
      message:
        "No Pinterest tokens stored yet. Call /api/auth-url, approve access, then /api/exchange-code?code=... once.",
    };
  }
  const now = Date.now() / 1000;
  if (tokens.access_token && now < tokens.expires_at - TOKEN_REFRESH_MARGIN_SECONDS) {
    return tokens.access_token;
  }
  const result = await oauthTokenRequest({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
  });
  const updated = {
    access_token: result.access_token,
    refresh_token: result.refresh_token || tokens.refresh_token,
    expires_at: now + Number(result.expires_in || 0),
  };
  await saveTokens(updated);
  return updated.access_token;
}

async function pinterestGetAll(path, accessToken, extraParams) {
  const items = [];
  let bookmark = null;
  for (;;) {
    const params = new URLSearchParams({ page_size: "100", ...(extraParams || {}) });
    if (bookmark) params.set("bookmark", bookmark);
    const res = await fetch(`${API_BASE}${path}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const detail = await res.text();
      throw { statusCode: 502, message: `Pinterest API error ${res.status} on ${path}: ${detail}` };
    }
    const data = await res.json();
    items.push(...(data.items || []));
    bookmark = data.bookmark;
    if (!bookmark) break;
  }
  return items;
}

function largestImage(pin) {
  const images = (pin.media && pin.media.images) || {};
  let best = null;
  for (const variant of Object.values(images)) {
    if (!variant || !variant.url) continue;
    const area = (variant.width || 0) * (variant.height || 0);
    if (!best || area > best.area) best = { area, url: variant.url };
  }
  return best ? best.url : null;
}

function manifestEntry(pin, sectionName) {
  return {
    id: pin.id,
    title: pin.title,
    description: pin.description,
    alt_text: pin.alt_text,
    link: pin.link,
    board_id: pin.board_id,
    board_section_id: pin.board_section_id,
    dominant_color: pin.dominant_color,
    created_at: pin.created_at,
    image_url: largestImage(pin),
    section_name: sectionName || null,
  };
}

async function checkBoardChange(boardId, accessToken, { commit = false } = {}) {
  const boards = await pinterestGetAll("/boards", accessToken);
  const board = boards.find((b) => b.id === boardId);
  if (!board) {
    throw { statusCode: 404, message: `Board ${boardId} not found (or not owned by this account).` };
  }
  const key = `board-${boardId}`;
  const prev = await stateStore().get(key, { type: "json" });
  const current = {
    pin_count: board.pin_count,
    board_pins_modified_at: board.board_pins_modified_at,
    checked_at: new Date().toISOString(),
  };
  const changed =
    !prev ||
    prev.pin_count !== current.pin_count ||
    prev.board_pins_modified_at !== current.board_pins_modified_at;
  if (commit) {
    await stateStore().setJSON(key, current);
  }
  return { board_id: boardId, board_name: board.name, changed, current, previous: prev || null };
}

module.exports = {
  json,
  env,
  requireSecret,
  stateStore,
  getTokens,
  saveTokens,
  oauthTokenRequest,
  ensureAccessToken,
  pinterestGetAll,
  manifestEntry,
  checkBoardChange,
};

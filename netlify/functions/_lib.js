// Shared helpers for the pinterest-design-research proxy functions.
// Holds no secrets of its own — everything comes from Netlify env vars
// (set in the site's dashboard, never committed) and Netlify Blobs
// (token/state storage, provisioned automatically for the site).
// These functions use the classic Lambda-compat handler signature, so
// Netlify Blobs isn't auto-connected — callers must invoke connectLambda(event)
// first (see https://docs.netlify.com/functions/lambda-compatibility).
const { getStore, connectLambda } = require("@netlify/blobs");

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

// Read endpoints are public (the plugin ships no secret), so they only ever
// expose boards explicitly listed here. Configured as a comma-separated
// PINTEREST_BOARD_IDS, falling back to the single PINTEREST_BOARD_ID.
// Empty = nothing is exposed, which is the safe default for a fresh deploy.
function allowedBoardIds() {
  const raw = env("PINTEREST_BOARD_IDS") || env("PINTEREST_BOARD_ID") || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function requireBoardAllowed(boardId) {
  const ids = allowedBoardIds();
  if (!ids.length) {
    throw {
      statusCode: 500,
      message: "No PINTEREST_BOARD_IDS (or PINTEREST_BOARD_ID) configured on this site.",
    };
  }
  if (!ids.includes(String(boardId))) {
    throw { statusCode: 404, message: `Board ${boardId} is not exposed by this proxy.` };
  }
}

function tokenStore() {
  return getStore("pinterest-tokens");
}

function stateStore() {
  return getStore("pinterest-state");
}

function cacheStore() {
  return getStore("pinterest-cache");
}

// Public reads are unauthenticated, so anything expensive is memoized here:
// hammering /api/pull costs one Pinterest round-trip per TTL window instead of
// one per request, which is what protects this app's Pinterest rate limit.
// PROXY_CACHE_TTL is seconds (default 600, 0 disables).
function cacheTtlSeconds(fallback = 600) {
  const raw = Number(env("PROXY_CACHE_TTL"));
  return Number.isFinite(raw) && env("PROXY_CACHE_TTL") !== "" ? raw : fallback;
}

async function cachedJson(key, ttlSeconds, produce) {
  if (ttlSeconds > 0) {
    const raw = await cacheStore().get(key, { type: "json" });
    if (raw && Date.now() - raw.stored_at < ttlSeconds * 1000) return raw.value;
  }
  const value = await produce();
  if (ttlSeconds > 0) {
    await cacheStore().setJSON(key, { stored_at: Date.now(), value });
  }
  return value;
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
    throw {
      statusCode: 502,
      message:
        res.status === 400 || res.status === 401 || res.status === 403
          ? `Pinterest rejected this proxy's tokens (oauth/token ${res.status}). The proxy owner has to re-seed them once (see references/remote-proxy.md).`
          : `Pinterest oauth/token error ${res.status}: ${detail}`,
    };
  }
  return res.json();
}

async function ensureAccessToken() {
  const tokens = await getTokens();
  if (!tokens || !tokens.refresh_token) {
    throw {
      statusCode: 428,
      message:
        "This proxy has no Pinterest credentials yet. If you run the proxy, seed them once (references/remote-proxy.md). If you are using the plugin, tell its author — there is nothing you can configure on your side.",
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
      if (res.status === 429) {
        throw {
          statusCode: 429,
          message: `Pinterest rate-limited this proxy (429 on ${path}). Wait a few minutes and retry — nothing is broken.`,
        };
      }
      if (res.status >= 500) {
        throw {
          statusCode: 502,
          message: `Pinterest is having trouble (${res.status} on ${path}). Retry in a few minutes.`,
        };
      }
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
  // The board list is the whole cost of a status check, and status is the
  // endpoint most likely to be polled — memoize it for a minute.
  const boards = await cachedJson("boards-list", cacheTtlSeconds(60), () =>
    pinterestGetAll("/boards", accessToken)
  );
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
  connectLambda,
  requireSecret,
  allowedBoardIds,
  requireBoardAllowed,
  cacheTtlSeconds,
  cachedJson,
  stateStore,
  getTokens,
  saveTokens,
  oauthTokenRequest,
  ensureAccessToken,
  pinterestGetAll,
  manifestEntry,
  checkBoardChange,
};

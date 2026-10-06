// Unit tests for the proxy's shared logic. Run with: npm test
// Lives outside netlify/functions so Netlify never tries to deploy it as one.
// @netlify/blobs is stubbed before _lib loads, so the tests need no Netlify
// runtime and no Pinterest credentials.
const { test, beforeEach } = require("node:test");
const assert = require("node:assert");

const stores = new Map();
function storeFor(name) {
  if (!stores.has(name)) {
    const data = new Map();
    stores.set(name, {
      data,
      get: async (key) => (data.has(key) ? data.get(key) : null),
      setJSON: async (key, value) => {
        data.set(key, JSON.parse(JSON.stringify(value)));
      },
    });
  }
  return stores.get(name);
}

const blobsPath = require.resolve("@netlify/blobs");
require.cache[blobsPath] = {
  id: blobsPath,
  filename: blobsPath,
  loaded: true,
  exports: { getStore: (name) => storeFor(name), connectLambda: () => {} },
};

const lib = require("../netlify/functions/_lib");

const OWN_ENV = [
  "PINTEREST_BOARD_IDS",
  "PINTEREST_BOARD_ID",
  "PROXY_SHARED_SECRET",
  "PROXY_CACHE_TTL",
  "PINTEREST_APP_ID",
  "PINTEREST_APP_SECRET",
];

function catchThrow(fn) {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
}

async function catchRejection(fn) {
  try {
    await fn();
    return null;
  } catch (e) {
    return e;
  }
}

function stubFetch(handler) {
  globalThis.fetch = handler;
  return handler;
}

beforeEach(() => {
  stores.clear();
  for (const key of OWN_ENV) delete process.env[key];
  globalThis.fetch = undefined;
});

test("allowlist: PINTEREST_BOARD_IDS wins, falls back to PINTEREST_BOARD_ID, empty denies everything", () => {
  process.env.PINTEREST_BOARD_IDS = "a, b ,,";
  process.env.PINTEREST_BOARD_ID = "fallback";
  assert.deepStrictEqual(lib.allowedBoardIds(), ["a", "b"]);

  delete process.env.PINTEREST_BOARD_IDS;
  assert.deepStrictEqual(lib.allowedBoardIds(), ["fallback"]);

  delete process.env.PINTEREST_BOARD_ID;
  assert.deepStrictEqual(lib.allowedBoardIds(), []);
});

test("requireBoardAllowed: allowed passes, unknown board 404, no config 500", () => {
  process.env.PINTEREST_BOARD_IDS = "1115063257681091512";
  assert.doesNotThrow(() => lib.requireBoardAllowed("1115063257681091512"));

  const missing = catchThrow(() => lib.requireBoardAllowed("999"));
  assert.strictEqual(missing.statusCode, 404);
  assert.match(missing.message, /not exposed/);

  delete process.env.PINTEREST_BOARD_IDS;
  const unconfigured = catchThrow(() => lib.requireBoardAllowed("1115063257681091512"));
  assert.strictEqual(unconfigured.statusCode, 500);
  assert.match(unconfigured.message, /PINTEREST_BOARD_IDS/);
});

test("requireSecret: header, query fallback, whitespace-tolerant, and failures", () => {
  process.env.PROXY_SHARED_SECRET = "s3cret";

  assert.doesNotThrow(() =>
    lib.requireSecret({ headers: { "x-proxy-secret": "s3cret" }, queryStringParameters: null })
  );
  assert.doesNotThrow(() =>
    lib.requireSecret({ headers: { "X-Proxy-Secret": " s3cret \n" }, queryStringParameters: null })
  );
  assert.doesNotThrow(() =>
    lib.requireSecret({ headers: {}, queryStringParameters: { secret: "s3cret" } })
  );

  const wrong = catchThrow(() => lib.requireSecret({ headers: {}, queryStringParameters: null }));
  assert.strictEqual(wrong.statusCode, 401);

  delete process.env.PROXY_SHARED_SECRET;
  const unconfigured = catchThrow(() =>
    lib.requireSecret({ headers: { "x-proxy-secret": "s3cret" }, queryStringParameters: null })
  );
  assert.strictEqual(unconfigured.statusCode, 500);
});

test("cacheTtlSeconds: default 600, env override, 0 disables", () => {
  assert.strictEqual(lib.cacheTtlSeconds(), 600);
  assert.strictEqual(lib.cacheTtlSeconds(60), 60);
  process.env.PROXY_CACHE_TTL = "30";
  assert.strictEqual(lib.cacheTtlSeconds(), 30);
  process.env.PROXY_CACHE_TTL = "0";
  assert.strictEqual(lib.cacheTtlSeconds(), 0);
});

test("cachedJson: memoizes within the TTL and regenerates once it expires", async () => {
  let calls = 0;
  const produce = async () => ({ value: ++calls });

  const first = await lib.cachedJson("k", 600, produce);
  assert.deepStrictEqual(first, { value: 1 });

  const second = await lib.cachedJson("k", 600, produce);
  assert.deepStrictEqual(second, { value: 1 }, "second call must hit the cache");
  assert.strictEqual(calls, 1);

  const entry = storeFor("pinterest-cache").data.get("k");
  entry.stored_at = Date.now() - 601 * 1000;
  await storeFor("pinterest-cache").setJSON("k", entry);

  const third = await lib.cachedJson("k", 600, produce);
  assert.deepStrictEqual(third, { value: 2 }, "expired entry must be regenerated");
  assert.strictEqual(calls, 2);
});

test("cachedJson: ttl of 0 always regenerates and never writes", async () => {
  let calls = 0;
  const produce = async () => ({ value: ++calls });

  await lib.cachedJson("no-cache", 0, produce);
  await lib.cachedJson("no-cache", 0, produce);

  assert.strictEqual(calls, 2);
  assert.strictEqual(storeFor("pinterest-cache").data.size, 0);
});

test("ensureAccessToken: no seeded tokens -> 428 with an actionable message", async () => {
  const err = await catchRejection(() => lib.ensureAccessToken());
  assert.strictEqual(err.statusCode, 428);
  assert.match(err.message, /seed them once/);
  assert.match(err.message, /nothing you can configure/);
});

test("pinterestGetAll: 429 is reported as a temporary rate limit, not a 500", async () => {
  stubFetch(async () => ({
    ok: false,
    status: 429,
    text: async () => "too many requests",
  }));
  const err = await catchRejection(() => lib.pinterestGetAll("/boards", "token"));
  assert.strictEqual(err.statusCode, 429);
  assert.match(err.message, /rate-limited/);
  assert.match(err.message, /Wait a few minutes/);
});

test("pinterestGetAll: 5xx from Pinterest becomes a retryable 502", async () => {
  stubFetch(async () => ({ ok: false, status: 503, text: async () => "unavailable" }));
  const err = await catchRejection(() => lib.pinterestGetAll("/boards/pins", "token"));
  assert.strictEqual(err.statusCode, 502);
  assert.match(err.message, /having trouble \(503/);
});

test("pinterestGetAll: follows bookmarks until the last page", async () => {
  const pages = [
    { items: [{ id: "1" }, { id: "2" }], bookmark: "page2" },
    { items: [{ id: "3" }], bookmark: null },
  ];
  let call = 0;
  stubFetch(async (url) => {
    const page = pages[call++];
    return { ok: true, status: 200, json: async () => page, url };
  });

  const items = await lib.pinterestGetAll("/boards/b/pins", "token");
  assert.deepStrictEqual(items.map((i) => i.id), ["1", "2", "3"]);
  assert.strictEqual(call, 2);
});

test("manifestEntry: keeps the largest image variant and the section name", () => {
  const entry = lib.manifestEntry(
    {
      id: "42",
      title: "A pin",
      description: "desc",
      alt_text: "alt",
      link: "https://example.com",
      board_id: "b1",
      board_section_id: "s1",
      dominant_color: "#ff0000",
      created_at: "2026-01-01T00:00:00Z",
      media: {
        images: {
          "236x": { url: "small.jpg", width: 236, height: 300 },
          "736x": { url: "big.jpg", width: 736, height: 1000 },
        },
      },
    },
    "Editorial"
  );

  assert.strictEqual(entry.image_url, "big.jpg");
  assert.strictEqual(entry.section_name, "Editorial");
  assert.strictEqual(entry.id, "42");

  const noSection = lib.manifestEntry({ id: "1" }, undefined);
  assert.strictEqual(noSection.section_name, null);
  assert.strictEqual(noSection.image_url, null);
});

test("checkBoardChange: first call reports changed, commit stops later false positives", async () => {
  const board = {
    id: "b1",
    name: "UI Reference",
    pin_count: 251,
    board_pins_modified_at: "2026-01-02T00:00:00Z",
  };
  stubFetch(async () => ({ ok: true, status: 200, json: async () => ({ items: [board] }) }));

  const first = await lib.checkBoardChange("b1", "token", { commit: true });
  assert.strictEqual(first.changed, true);
  assert.strictEqual(first.board_name, "UI Reference");

  const second = await lib.checkBoardChange("b1", "token", { commit: true });
  assert.strictEqual(second.changed, false);

  board.pin_count = 252;
  storeFor("pinterest-cache").data.clear(); // the memoized board list would hide the change
  const third = await lib.checkBoardChange("b1", "token");
  assert.strictEqual(third.changed, true);

  const unknown = await catchRejection(() => lib.checkBoardChange("other", "token"));
  assert.strictEqual(unknown.statusCode, 404);
});

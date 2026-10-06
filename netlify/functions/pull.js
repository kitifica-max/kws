// GET /api/pull?board_id=...   -> full pin metadata + image URLs for one board.
// Public read: no shared secret (the plugin ships no credentials), but the
// board must be on the proxy's allowlist — see requireBoardAllowed(). The
// response is memoized (PROXY_CACHE_TTL, default 600s) so repeated pulls cost
// one Pinterest round-trip per window instead of one per request.
const { json, connectLambda, requireBoardAllowed, cachedJson, cacheTtlSeconds, ensureAccessToken, pinterestGetAll, manifestEntry } = require("./_lib");

exports.handler = async (event) => {
  try {
    connectLambda(event);
    const boardId = event.queryStringParameters && event.queryStringParameters.board_id;
    if (!boardId) return json(400, { error: "Missing ?board_id=..." });
    requireBoardAllowed(boardId);

    const payload = await cachedJson(`pull-${boardId}`, cacheTtlSeconds(), async () => {
      const token = await ensureAccessToken();
      const sections = await pinterestGetAll(`/boards/${boardId}/sections`, token);
      const sectionById = {};
      for (const s of sections) sectionById[s.id] = s.name;

      const pins = await pinterestGetAll(`/boards/${boardId}/pins`, token);
      const manifest = pins.map((p) => manifestEntry(p, sectionById[p.board_section_id]));

      return {
        board_id: boardId,
        section_count: sections.length,
        pin_count: manifest.length,
        pins: manifest,
      };
    });

    return json(200, payload);
  } catch (e) {
    return json(e.statusCode || 500, { error: e.message || String(e) });
  }
};

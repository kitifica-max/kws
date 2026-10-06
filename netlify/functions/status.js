// GET /api/status?board_id=...        -> peek: "did this board change since the last
//                                         brief was generated?" (does not move the baseline)
// GET /api/status?board_id=...&ack=1   -> peek AND commit the current state as the new
//                                         baseline (call this right after successfully
//                                         regenerating the Design System Brief)
// Public read: no shared secret, board must be on the allowlist.
const { json, env, connectLambda, requireBoardAllowed, ensureAccessToken, checkBoardChange } = require("./_lib");

exports.handler = async (event) => {
  try {
    connectLambda(event);
    const qs = event.queryStringParameters || {};
    const boardId = qs.board_id || env("PINTEREST_BOARD_ID");
    if (!boardId) return json(400, { error: "Missing ?board_id=... (and no PINTEREST_BOARD_ID default configured)." });
    requireBoardAllowed(boardId);
    const commit = qs.ack === "1" || qs.ack === "true";
    const token = await ensureAccessToken();
    const result = await checkBoardChange(boardId, token, { commit });
    return json(200, result);
  } catch (e) {
    return json(e.statusCode || 500, { error: e.message || String(e) });
  }
};

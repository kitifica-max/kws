// GET /api/boards -> the boards this proxy is willing to expose (the allowlist).
// Public read: no shared secret. Boards outside PINTEREST_BOARD_IDS are never
// listed, so a leaked/explored endpoint can't enumerate the account's other
// boards — private names included.
const { json, connectLambda, allowedBoardIds, ensureAccessToken, pinterestGetAll } = require("./_lib");

exports.handler = async (event) => {
  try {
    connectLambda(event);
    const allow = allowedBoardIds();
    if (!allow.length) {
      return json(500, { error: "No PINTEREST_BOARD_IDS (or PINTEREST_BOARD_ID) configured on this site." });
    }
    const token = await ensureAccessToken();
    const boards = await pinterestGetAll("/boards", token);
    const trimmed = boards
      .filter((b) => allow.includes(String(b.id)))
      .map((b) => ({
        id: b.id,
        name: b.name,
        pin_count: b.pin_count,
        board_pins_modified_at: b.board_pins_modified_at,
      }));
    return json(200, trimmed);
  } catch (e) {
    return json(e.statusCode || 500, { error: e.message || String(e) });
  }
};

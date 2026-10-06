const { json, connectLambda, requireSecret, ensureAccessToken, pinterestGetAll } = require("./_lib");

exports.handler = async (event) => {
  try {
    connectLambda(event);
    requireSecret(event);
    const token = await ensureAccessToken();
    const boards = await pinterestGetAll("/boards", token);
    const trimmed = boards.map((b) => ({
      id: b.id,
      name: b.name,
      pin_count: b.pin_count,
      privacy: b.privacy,
      board_pins_modified_at: b.board_pins_modified_at,
      owner: b.owner,
    }));
    return json(200, trimmed);
  } catch (e) {
    return json(e.statusCode || 500, { error: e.message || String(e) });
  }
};

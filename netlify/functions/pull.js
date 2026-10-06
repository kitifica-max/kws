const { json, connectLambda, requireSecret, ensureAccessToken, pinterestGetAll, manifestEntry } = require("./_lib");

exports.handler = async (event) => {
  try {
    connectLambda(event);
    requireSecret(event);
    const boardId = event.queryStringParameters && event.queryStringParameters.board_id;
    if (!boardId) return json(400, { error: "Missing ?board_id=..." });

    const token = await ensureAccessToken();
    const sections = await pinterestGetAll(`/boards/${boardId}/sections`, token);
    const sectionById = {};
    for (const s of sections) sectionById[s.id] = s.name;

    const pins = await pinterestGetAll(`/boards/${boardId}/pins`, token);
    const manifest = pins.map((p) => manifestEntry(p, sectionById[p.board_section_id]));

    return json(200, {
      board_id: boardId,
      section_count: sections.length,
      pin_count: manifest.length,
      pins: manifest,
    });
  } catch (e) {
    return json(e.statusCode || 500, { error: e.message || String(e) });
  }
};

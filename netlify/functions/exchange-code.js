const { json, env, connectLambda, requireSecret, oauthTokenRequest, saveTokens } = require("./_lib");

exports.handler = async (event) => {
  try {
    connectLambda(event);
    requireSecret(event);
    const code = (event.queryStringParameters && event.queryStringParameters.code || "").trim();
    if (!code) return json(400, { error: "Missing ?code=..." });
    const redirectUri = env("PINTEREST_REDIRECT_URI");
    if (!redirectUri) {
      return json(500, { error: "PINTEREST_REDIRECT_URI not configured on this site." });
    }
    const result = await oauthTokenRequest({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });
    const expiresAt = Date.now() / 1000 + Number(result.expires_in || 0);
    await saveTokens({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_at: expiresAt,
    });
    // Never echo access_token/refresh_token back — they stay server-side only.
    return json(200, { ok: true, expires_in: result.expires_in });
  } catch (e) {
    return json(e.statusCode || 500, { error: e.message || String(e) });
  }
};

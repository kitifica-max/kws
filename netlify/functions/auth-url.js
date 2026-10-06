const { json, requireSecret } = require("./_lib");

const AUTH_BASE = "https://www.pinterest.com/oauth/";
const DEFAULT_SCOPES = "boards:read,pins:read";

exports.handler = async (event) => {
  try {
    requireSecret(event);
    const appId = process.env.PINTEREST_APP_ID;
    const redirectUri = process.env.PINTEREST_REDIRECT_URI;
    if (!appId || !redirectUri) {
      return json(500, { error: "PINTEREST_APP_ID / PINTEREST_REDIRECT_URI not configured on this site." });
    }
    const scopes =
      (event.queryStringParameters && event.queryStringParameters.scopes) || DEFAULT_SCOPES;
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
    });
    return json(200, { url: `${AUTH_BASE}?${params.toString()}` });
  } catch (e) {
    return json(e.statusCode || 500, { error: e.message || String(e) });
  }
};

# Pinterest API v5 — setup & reference

## 1. Create the app

1. Go to https://developers.pinterest.com/apps/ and create an app (you need a
   Pinterest Business account; a personal account gets auto-converted when you
   register a developer app).
2. Note the **App ID** (`client_id`) and **App secret** (`client_secret`) —
   these go into `.env`, never into chat.
3. Register a redirect URI. For personal/single-user use you don't need a live
   server behind it — any HTTPS URL works (e.g. `https://localhost/callback` or
   your own domain). Pinterest just needs it registered so it can redirect the
   browser there with a `?code=...` query param after login; you'll copy that
   code out of the address bar even if the page itself 404s.
4. Request scopes **`boards:read`** and **`pins:read`**. That's all this skill
   needs — it only reads the user's own boards/pins, it never writes. (If you
   later want the skill to also *save* reference pins back to a board, add
   `pins:write`/`boards:write`, but that's out of scope for the design-research
   workflow.)

## 2. OAuth flow (one-time, then token refresh handles the rest)

Pinterest uses standard OAuth 2.0 authorization code flow.

```bash
# 1. Print a URL, open it in a browser, log in, approve the scopes.
python3 scripts/pinterest_client.py auth-url

# 2. Pinterest redirects to your redirect URI with ?code=XYZ in the address bar.
#    Copy that code (it's short-lived, use it immediately) and exchange it:
python3 scripts/pinterest_client.py exchange-code --code "XYZ"
```

`exchange-code` writes `PINTEREST_ACCESS_TOKEN`, `PINTEREST_REFRESH_TOKEN` and
`PINTEREST_TOKEN_EXPIRES_AT` into `.env` and prints nothing sensitive to stdout.

### Token lifetimes

- `access_token` (prefix `pina...`) is valid **30 days**.
- `refresh_token` (prefix `pinr...`) is a **continuous refresh token**: valid
  60 days, and each refresh extends it another 60 days, so as long as you use
  this skill at least every couple of months you never have to redo step 1.
- Every script command checks `PINTEREST_TOKEN_EXPIRES_AT` first and calls
  `refresh` automatically with a safety margin — you normally never run
  `refresh` yourself.

Token endpoint: `POST https://api.pinterest.com/v5/oauth/token`, authenticated
with HTTP Basic auth using `app_id:app_secret` (not query params, not the
access token).

## 3. Endpoints this skill uses

| Purpose | Endpoint |
|---|---|
| List the user's boards | `GET /v5/boards` |
| List sections on a board | `GET /v5/boards/{board_id}/sections` |
| List pins on a board | `GET /v5/boards/{board_id}/pins` |
| List pins on a specific board section | `GET /v5/boards/{board_id}/sections/{section_id}/pins` |
| Get one pin | `GET /v5/pins/{pin_id}` |
| (optional, beta, see below) search | `GET /v5/search/partner/pins` |

All list endpoints are cursor-paginated via a `bookmark` field in the response
— the script follows it automatically until exhausted.

## 4. Pin fields this skill reads

From each pin object: `id`, `title`, `description` (≤800 chars, the pinner's
caption — your best signal for intent/context), `alt_text` (≤500 chars, often
more literal than the description), `link` (the original source URL — follow
it when you need to see a feature in motion), `dominant_color`, `board_id`,
`board_section_id`, `created_at`, and `media.images` (a map of size variants,
each with `url`, `width`, `height` — the script downloads the largest).

## 5. The search/partner caveat

`GET /v5/search/partner/pins` does real keyword search across Pinterest, but
it's beta and gated behind Pinterest's content-partner approval — most apps,
including a normal personal developer app, will get a `403`/scope error on it.
Don't rely on it. The script supports it behind a feature flag
(`PINTEREST_PARTNER_SEARCH_ENABLED=true` in `.env`) purely as a bonus for the
rare case where an app does have that access; the default, reliable workflow
in this skill never depends on it.

## 6. Rate limits & errors

Pinterest enforces per-endpoint, per-app rate limits that vary by app trust
tier and aren't published as fixed numbers — don't hardcode a request budget.
The script backs off and retries once on `429`/`5xx` with the `Retry-After`
header if present, otherwise a short fixed delay; if it still fails, it
surfaces the real HTTP error instead of swallowing it, so tell the user what
happened rather than silently returning partial data.

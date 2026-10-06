# The proxy (Netlify) — owner & deployment notes

The plugin ships talking to one deployed proxy. Users never touch it beyond
calling it; **everything credential-shaped lives server-side**, in that site's
Netlify environment variables and Netlify Blobs. Nothing secret is in the repo,
nothing secret runs on the user's machine, and nobody does OAuth.

```
skill (pinterest_proxy_client.py)  -->  https://<site>/api/*  -->  api.pinterest.com
        no credentials                     allowlist               Pinterest app +
                                                                  OAuth tokens (Blobs)
```

This also sidesteps network policies that block `api.pinterest.com` directly
from a given environment (the proxy calls Pinterest from Netlify's
infrastructure, not from wherever the skill is running).

## Deploy (once, from the Netlify dashboard — Claude has no access to your
## Netlify account)

1. On [app.netlify.com](https://app.netlify.com), **Add a new site → Import an
   existing project**, connect the `kitifica-max/kws` GitHub repo, branch
   `main`. Build command: leave blank. Publish directory: leave default —
   Netlify reads `netlify.toml` for the functions config.
2. **Site configuration → Environment variables**:

   | Key | Required | Value |
   |---|---|---|
   | `PINTEREST_APP_ID` | yes | your Pinterest app's id |
   | `PINTEREST_APP_SECRET` | yes | your Pinterest app secret |
   | `PINTEREST_REDIRECT_URI` | yes | the redirect URI registered on that app |
   | `PINTEREST_BOARD_IDS` | yes | comma-separated board ids this proxy may expose — anything else is a `404`. Leave empty on purpose to expose nothing. |
   | `PINTEREST_BOARD_ID` | recommended | default board for `/api/status` when no `?board_id=` is given (set it to the same id as above) |
   | `PROXY_SHARED_SECRET` | yes | long random string — **admin only** (see below), never shipped in the plugin |

3. **Deploy site** (or redeploy after adding the vars).
4. **Netlify Blobs** needs no setup — it's automatic, and stores the OAuth
   tokens server-side (never in git, never in an env var you'd rotate by hand).

## One-time token seeding (the only OAuth in the whole system)

This is a **maintenance step for the proxy owner**, never something an end user
or the skill runs. It needs a real browser + a Pinterest login, once per app:

```bash
curl -H "x-proxy-secret: $PROXY_SHARED_SECRET" "https://<site>/api/auth-url"
```

Open the returned `url` in a browser, log in, approve, copy the `?code=...` from
the redirect, then:

```bash
curl -H "x-proxy-secret: $PROXY_SHARED_SECRET" \
  "https://<site>/api/exchange-code?code=<THE_CODE>"
```

`{"ok":true,...}` means the proxy holds working tokens and refreshes them itself
from then on. Redo this only if the Blobs data is wiped or Pinterest revokes the
refresh token.

## Endpoints

Public reads — **no secret**, allowed only for boards on `PINTEREST_BOARD_IDS`:

| Endpoint | Purpose |
|---|---|
| `GET /api/boards` | The exposed boards (id, name, pin count, last modified) |
| `GET /api/pull?board_id=...` | Full pin metadata + image URLs for one board |
| `GET /api/status?board_id=...` | Cheap check: did `pin_count` or `board_pins_modified_at` change since the last `ack`? |
| `GET /api/status?board_id=...&ack=1` | Same, and also commits the current state as the new baseline |

Admin — require `PROXY_SHARED_SECRET`, sent as the `x-proxy-secret` header
(prefer it over `?secret=`, which ends up in logs):

| Endpoint | Purpose |
|---|---|
| `GET /api/auth-url` | One-time: get the Pinterest OAuth URL |
| `GET /api/exchange-code?code=...` | One-time: trade the auth code for tokens into Blobs |

Boards outside the allowlist are never listed, never pullable, and never
checkable — the endpoint can't be used to enumerate the account's other boards,
private names included. An empty `PINTEREST_BOARD_IDS` fails closed.

## Runaway usage

The public reads are unauthenticated, so anyone who finds the site can pull the
allowlisted board as fast as they like and spend **your** Pinterest app's rate
limit (Pinterest's per-app quotas aren't published and vary by trust tier).
Keep `PINTEREST_BOARD_IDS` to the one shared board, and if it ever becomes a
problem, put Netlify's rate limiting / a WAF rule in front of `/api/pull`.

## Change detection from Claude's side

The proxy only *detects* change — it can't run the visual analysis or rewrite
`design-system/*/brief.md` (that needs Claude). The skill's `status` subcommand
is the cheap check; when it reports `changed: true`, run `pull --ack` and
regenerate the brief. If you wire that to a scheduled trigger, whatever
environment it fires into needs outbound access to this site's domain — and
nothing Pinterest-related, since the proxy does the real Pinterest calls.

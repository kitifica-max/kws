# Remote proxy (Netlify) — shared credentials, no local OAuth

This is an optional alternative to the local `.env` + `pinterest_client.py`
setup in `api-reference.md`. Instead of every machine/project holding the
Pinterest app id/secret and OAuth tokens, a small serverless proxy
(`netlify/functions/`, in this repo) holds them, and every project talks to
*that* instead — just a URL and a short shared secret, nothing OAuth-shaped.

This also sidesteps network policies that block `api.pinterest.com` directly
from a given environment (the proxy calls Pinterest from Netlify's
infrastructure, not from wherever the skill is running).

Use `scripts/pinterest_proxy_client.py` instead of `pinterest_client.py` once
this is deployed — same `pull`/`list-boards` output shape, so the rest of the
skill (steps 4–6) doesn't change.

## One-time deploy (do this yourself in the Netlify dashboard — Claude has no
## access to your Netlify account)

1. On [app.netlify.com](https://app.netlify.com), **Add a new site → Import
   an existing project**, connect the `kitifica-max/kws` GitHub repo, branch
   `claude/friendly-cannon-b3d4uo` (or `main` once this is merged). Build
   settings: no build command needed (leave blank), publish directory can
   stay default — Netlify picks up `netlify.toml` automatically for the
   functions config.
2. Once the site exists, go to **Site configuration → Environment
   variables** and add:
   | Key | Value |
   |---|---|
   | `PINTEREST_APP_ID` | `1586869` (your existing Pinterest app id) |
   | `PINTEREST_APP_SECRET` | your Pinterest app secret |
   | `PINTEREST_REDIRECT_URI` | `https://kitifica.com/` (already registered on the app) |
   | `PROXY_SHARED_SECRET` | any long random string you make up — this is what every project uses instead of real Pinterest credentials |
   | `PINTEREST_BOARD_ID` | `1115063257681091512` (the "UI Reference" board — used as the default for `/api/status`) |
3. **Deploy site** (or trigger a redeploy after adding the env vars).
4. **Enable Netlify Blobs**: no setup needed — it's automatic for any site
   deployed on Netlify, used here to store the OAuth tokens server-side
   (never in git, never in an env var you'd have to rotate by hand).
5. Seed the tokens once, from your Mac (or anywhere with normal internet —
   this is the only step that still needs a real browser + Pinterest login):
   ```bash
   curl "https://<your-site>.netlify.app/api/auth-url?secret=<PROXY_SHARED_SECRET>"
   ```
   Open the returned `url` in a browser, log in as `idealandidl`, approve,
   copy the `?code=...` from the redirect, then:
   ```bash
   curl "https://<your-site>.netlify.app/api/exchange-code?secret=<PROXY_SHARED_SECRET>&code=<THE_CODE>"
   ```
   `{"ok":true,...}` means the proxy now holds working tokens and will
   refresh them itself from then on — you never redo this unless Netlify
   Blobs data is wiped.

## Using it from any project

Set just two values (same `.env` / `PINTEREST_DOTENV_PATH` mechanism as
`api-reference.md`):

```
PINTEREST_PROXY_URL=https://<your-site>.netlify.app
PINTEREST_PROXY_SECRET=<PROXY_SHARED_SECRET>
```

Then:

```bash
python3 scripts/pinterest_proxy_client.py list-boards
python3 scripts/pinterest_proxy_client.py pull --board-id "1115063257681091512" --out-dir pinterest-pull --ack
```

`--ack` on `pull` also tells the proxy "this is the version I just analyzed"
— it updates the change-detection baseline (see below) so a later `status`
check only flags pins added *after* this pull, not the ones already in it.

## Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/auth-url` | One-time: get the Pinterest OAuth URL |
| `GET /api/exchange-code?code=...` | One-time: trade the auth code for tokens, stored in Netlify Blobs |
| `GET /api/boards` | List boards (id, name, pin_count, board_pins_modified_at) |
| `GET /api/pull?board_id=...` | Full pin metadata + image URLs for a board |
| `GET /api/status?board_id=...` | Cheap check: did `pin_count` or `board_pins_modified_at` change since the last `ack`? |
| `GET /api/status?board_id=...&ack=1` | Same, and also commits the current state as the new baseline |

Every endpoint requires the shared secret, either as `?secret=...` or header
`x-proxy-secret: ...`.

## Auto-refresh (the Claude-side half)

The proxy only *detects* change — it has no way to run the visual analysis
or rewrite `design-system/*/brief.md` itself (that needs Claude). The other
half is a Claude Code Routine (a scheduled trigger) that wakes up every few
hours, calls `/api/status`, and if `changed: true`, runs `pull --ack` and
regenerates the brief. See the session that set this up for the exact
Routine — `mcp__claude-code-remote__list_triggers` finds it if it's not
obvious which one it is.

**Important**: whatever environment that Routine fires into needs outbound
network access to your Netlify site's domain (and nothing else Pinterest-
related, since the proxy does the real Pinterest calls). If it's a cloud
Claude Code environment with a restrictive network policy, add
`<your-site>.netlify.app` to its allowed domains (environment settings →
Network access → Custom), otherwise the Routine's check will fail silently.

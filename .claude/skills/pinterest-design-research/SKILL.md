---
name: pinterest-design-research
description: Turns a curated Pinterest board (read through a preconfigured proxy — no OAuth, no API keys, no Pinterest account for the user) into a structured, citable Design System Brief — color tokens, type scale, spacing, component inventory, navigation patterns, motion/micro-interaction notes — for web apps, mobile apps, SaaS products, dashboards, landing pages and other digital products. Use this whenever the user mentions Pinterest, design inspiration, mood boards, UI/UX references, "design system from Pinterest", wants animation or interaction references, wants to turn visual references into a style guide or component library, or asks to organize/structure a Pinterest search or board for design work — even if they never say "design system" out loud.
---

# Pinterest Design Research

## The one constraint that shapes this whole skill

Pinterest's public API (v5) does **not** let third-party apps keyword-search all of
Pinterest. General search only exists as `/search/partner/pins`, a beta endpoint
restricted to approved content partners — almost no app has it. What every normal
OAuth app *can* do is read the boards and pins that belong to the authenticated
Pinterest account (`boards:read`, `pins:read`).

So don't try to make Claude "search Pinterest." Instead, split the work the way each
side is actually good at it:

- **A human** searches and curates on pinterest.com itself, where Pinterest's real
  visual search and recommendation engine runs. A human saving 10 great pins after
  scrolling through hundreds is a *better* filter than any API call would be.
- **Claude** turns that curated signal into something usable: pulls the pins
  (images + metadata) through the plugin's proxy, looks at them, and writes a
  structured, cited Design System Brief.

Treat this as the actual value of the skill, not a workaround — curated boards are
higher signal than raw search results precisely because a human already did the
filtering.

**Where the pins come from:** the human who did that filtering is the plugin's
maintainer, not the person running a brief. This skill reads one shared,
continuously curated reference board through a proxy the plugin already ships
configured — no OAuth consent screen, no Pinterest developer app, no `.env`, no
API keys. The user never connects a Pinterest account and never curates a board
just to use the skill: the board (164+ pins and growing) is the corpus.

## Workflow

**1. Clarify the brief** (skip if the user already gave this). Ask for:
   - Product archetype (SaaS dashboard, marketing site, mobile app, e-commerce,
     fintech, AI/chat product, developer tool, marketplace...)
   - Style/vibe adjectives (minimal, playful, enterprise, dark-mode-first...)
   - Which design-system layers matter most right now — just visual style, or also
     motion/interaction, data viz, etc.

**2. Pick the layers that matter.** Read `references/search-taxonomy.md` to map the
   brief onto the design-system layers (color, typography, layout & spacing,
   navigation, components, states, motion, data viz) × product archetype, and
   `references/curation-rules.md` for what a pin must satisfy to count as evidence
   for a layer. This step produces no API calls — it decides what to extract.

**3. Pull the board.** Use `scripts/pinterest_proxy_client.py`:
   ```bash
   python3 scripts/pinterest_proxy_client.py list-boards
   python3 scripts/pinterest_proxy_client.py pull --out-dir pinterest-pull --limit 40 --sample
   ```
   `pull` defaults to the plugin's shared board — the only required flag is
   `--out-dir`. It downloads each pin's largest image plus metadata into the
   workspace folder and writes a `manifest.json` (pin_id → title, description,
   alt_text, link, board/section, dominant_color, local image path) plus an
   `images/` folder.

   The board is large and keeps growing, so don't default to pulling all of it:
   start with `--limit 40 --sample` (40 pins spread evenly across the board) for
   a first pass, write the brief from that, and only pull more — raise `--limit`
   or drop it entirely — if a layer from step 2 still has weak evidence after
   looking at the sample. `pull` also skips any image it already has on disk, so
   widening the limit on a second run only costs what's new.

   Expect `section_count: 0`: the board is currently flat, so `section_name`
   comes back `null` and grouping pins by layer is part of step 4 (see
   `references/search-taxonomy.md`).
   Nothing to configure: the proxy URL is baked into the script. Only a self-hosted
   proxy deployment needs anything else (`references/remote-proxy.md`).

**4. Look at the pins and analyze.** Read every downloaded image with its paired
   metadata, bucketing pins into the design-system layers from step 2 yourself
   when `section_name` is `null`. For each layer, extract concrete, specific
   observations
   — not "nice colors" but "a warm off-white background (#FAF8F3-ish) with a single
   saturated accent used only on primary CTAs." Cite the source pin (its link, or
   local filename if no link) for every claim. Pin descriptions/alt text are your
   only signal for *motion* in a static image — when a pin's text mentions hover,
   scroll, transition, or micro-interaction, flag it in the brief and tell the user
   to check the live link if the exact motion detail matters.

**5. Write the Design System Brief.** ALWAYS follow the exact structure in
   `references/design-system-output.md` — do not freelance the format. Every
   token or pattern claim needs at least one cited source pin. Save it to
   `design-system/<project-name>/brief.md` in the repo (plus `tokens.json` if the
   user wants machine-readable tokens too).

**6. Publish a live preview Artifact.** Right after `brief.md` (and `tokens.json`
   if written) are saved, build a Claude Artifact that applies the extracted
   tokens to real-looking UI — color swatches, type scale, spacing scale, and a
   few core components (buttons, cards, inputs, nav) assembled from the actual
   values in `tokens.json`, not generic placeholders. This is how the user sees
   the system *applied* instead of just reading numbers in a file. Follow
   `references/design-system-artifact.md` for the required sections, load the
   `artifact-design` skill first (environment requirement for any Artifact), and
   publish it with the Artifact tool. Do this for every brief unless the user
   says they don't want a preview — it isn't optional polish, it's the deliverable
   that makes the brief legible.

**7. Treat the board as ongoing.** The shared board grows constantly. Check
   `status` first (one cheap call: did the pin count or last-modified change
   since the last run?), then offer to re-run steps 3-5 when the user wants a
   refresh — `pull --ack` records the state you just analyzed, and `pull` skips
   images it already has, so only what's new costs anything.

## Reference files (read on demand, not all at once)

- `references/search-taxonomy.md` — the structured taxonomy of design-system
  layers × product archetypes, with ready-to-use search query templates. Read
  while mapping the brief to layers (step 2).
- `references/curation-rules.md` — the quality bar for what counts as evidence for
  a layer, the (optional) board/section naming conventions, and the refresh
  cadence the shared
  board follows. Read alongside the taxonomy.
- `references/design-system-output.md` — the exact Design System Brief template
  and the optional `tokens.json` schema. Read before writing the brief (step 5).
- `references/design-system-artifact.md` — what the live preview Artifact must
  contain and how it maps to `tokens.json`. Read before step 6.
- `references/remote-proxy.md` — owner/deployment docs for the Netlify proxy this
  skill talks to: env vars it needs, how tokens are seeded once, and the board
  allowlist that decides which boards the proxy exposes. Read only when deploying
  or maintaining the proxy — never as part of a normal brief.

## Script

- `scripts/pinterest_proxy_client.py` — a stdlib-only (no pip installs needed)
  client: `list-boards`, `pull` (pins + images + `manifest.json`, with
  `--limit`/`--sample` to avoid pulling the whole board every time) and `status`
  (cheap change detection). The proxy URL is built in, so it works the moment the
  plugin is installed — no credentials, no `.env`, and nothing auth-shaped ever
  reaches the conversation. Run `python3 scripts/pinterest_proxy_client.py -h`
  for subcommands; override the endpoint only with `PINTEREST_PROXY_URL`.

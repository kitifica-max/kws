---
name: pinterest-design-research
description: Turns the user's own Pinterest boards (via the Pinterest API v5) into a structured, citable Design System Brief — color tokens, type scale, spacing, component inventory, navigation patterns, motion/micro-interaction notes — for web apps, mobile apps, SaaS products, dashboards, landing pages and other digital products. Use this whenever the user mentions Pinterest, design inspiration, mood boards, UI/UX references, "design system from Pinterest", wants animation or interaction references, wants to turn visual references into a style guide or component library, or asks to organize/structure a Pinterest search or board for design work — even if they never say "design system" out loud. Also use it to set up Pinterest API OAuth credentials for this purpose.
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

- **The human** searches and curates on pinterest.com itself, where Pinterest's real
  visual search and recommendation engine runs. A human saving 10 great pins after
  scrolling through hundreds is a *better* filter than any API call would be.
- **Claude** turns that curated signal into something usable: pulls the pins
  (images + metadata) via the API, looks at them, and writes a structured,
  cited Design System Brief.

Treat this as the actual value of the skill, not a workaround — curated boards are
higher signal than raw search results precisely because a human already did the
filtering.

## Workflow

**1. Clarify the brief** (skip if the user already gave this). Ask for:
   - Product archetype (SaaS dashboard, marketing site, mobile app, e-commerce,
     fintech, AI/chat product, developer tool, marketplace...)
   - Style/vibe adjectives (minimal, playful, enterprise, dark-mode-first...)
   - Which design-system layers matter most right now — just visual style, or also
     motion/interaction, data viz, etc.

**2. Build the curation plan.** Read `references/search-taxonomy.md` and
   `references/curation-rules.md`, then hand the user a concrete checklist: one
   Pinterest board for the project, one section per relevant design-system layer,
   and 6-10 search queries per section to run themselves on pinterest.com. Tell
   them the quality bar (from curation-rules.md) and to pin ~8-15 best examples per
   section, then come back. This step produces no API calls — it's pure planning.

**3. Make sure API access is set up.** If `.env` doesn't exist yet or the stored
   token looks expired/missing, walk the user through
   `references/api-reference.md` to create a Pinterest developer app and run the
   OAuth helper below. Never ask the user to paste `access_token`, `refresh_token`,
   `app_id` or `app_secret` into chat — those go straight into the local `.env`
   file, not into the conversation.

**4. Pull the curated data.** Use `scripts/pinterest_client.py` to list the
   project's board/sections, list pins per section, and download each pin's
   largest image + metadata into a local workspace folder (see script `-h` for
   exact commands). This produces a `manifest.json` (pin_id → title, description,
   alt_text, link, board/section, dominant_color, local image path) plus an
   `images/` folder.

**5. Look at the pins and analyze.** Read every downloaded image with its paired
   metadata. For each design-system layer, extract concrete, specific observations
   — not "nice colors" but "a warm off-white background (#FAF8F3-ish) with a single
   saturated accent used only on primary CTAs." Cite the source pin (its link, or
   local filename if no link) for every claim. Pin descriptions/alt text are your
   only signal for *motion* in a static image — when a pin's text mentions hover,
   scroll, transition, or micro-interaction, flag it in the brief and tell the user
   to check the live link if the exact motion detail matters.

**6. Write the Design System Brief.** ALWAYS follow the exact structure in
   `references/design-system-output.md` — do not freelance the format. Every
   token or pattern claim needs at least one cited source pin. Save it to
   `design-system/<project-name>/brief.md` in the repo (plus `tokens.json` if the
   user wants machine-readable tokens too).

**7. Treat curation as ongoing.** Boards aren't a one-shot input. Mention the
   refresh cadence from `curation-rules.md` and offer to re-run steps 4-6 whenever
   the user adds new pins.

## Reference files (read on demand, not all at once)

- `references/api-reference.md` — how to create a Pinterest app, which scopes to
  request, the OAuth flow, token lifetimes, the exact endpoints/fields this skill
  uses, and the partner-search beta caveat. Read before the first API call.
- `references/search-taxonomy.md` — the structured taxonomy of design-system
  layers × product archetypes, with ready-to-use search query templates. Read
  while building the curation plan (step 2).
- `references/curation-rules.md` — the quality bar for what to pin, board/section
  naming conventions, and suggested refresh cadence. Read alongside the taxonomy.
- `references/design-system-output.md` — the exact Design System Brief template
  and the optional `tokens.json` schema. Read before writing the brief (step 6).

## Script

- `scripts/pinterest_client.py` — a stdlib-only (no pip installs needed) Pinterest
  API v5 client: OAuth auth-url/exchange/refresh, list boards/sections/pins, and
  download pin images + write the manifest. Run `python3
  scripts/pinterest_client.py -h` for subcommands. It reads/writes credentials in
  the repo-root `.env` file directly — it never prints `access_token` or
  `refresh_token` to stdout, and nothing routes those values through the
  conversation.

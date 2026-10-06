# Curation rules

Two audiences: the **quality bar** applies to you when deciding whether a pulled
pin is worth citing in the brief (workflow step 4), and the naming/refresh
conventions describe how the shared `UI Reference` board is maintained.

## Quality bar — cite it if...

- It's a **real product screenshot or recording**, not a generic stock photo
  or a moodboard-only aesthetic shot. A gorgeous photo of a laptop on a desk
  tells you nothing about a UI.
- It shows **enough of the interface** to read actual spacing/hierarchy —
  skip crops so tight you can't tell what's a button vs. a label.
- It's **specific**, not generic. "Clean dashboard" matches thousands of
  pins; prefer ones you can point at and say *this exact thing* (e.g. "this
  sidebar collapses to icons only").
- For motion-sensitive layers, prefer pins that are **themselves a
  video/GIF**, or whose description/link clearly points to a live demo —
  a single static frame of an animation is weak evidence.

## Skip it if...

- It's a rebrand/logo concept with no real UI.
- It's a screenshot you can't trace to a real product (dead link, no
  attribution) — you won't be able to verify or follow up on it later.
- It duplicates a pin you already have from the same product — one example
  per product per layer is usually enough; diversity of sources matters more
  than volume.

## Naming conventions (shared board)

- Board: `UI Reference` — the one board the plugin is configured to expose.
- Sections: exact layer names from `search-taxonomy.md` (`Color & mood`,
  `Navigation`, `Motion & micro-interactions`, ...) so the manifest the script
  produces lines up directly with the brief's section headings.
- A one-line note on a pin where the *reason* it was saved isn't obvious from
  the pin itself is free signal — it shows up in `description`/`alt_text` in
  the manifest.

## Refresh cadence

The shared board grows constantly, so a brief is a snapshot of a moving corpus.
Suggest:

- **Early exploration**: re-run the pull/analyze steps whenever the user wants a
  fresher read — `pull` skips images it already downloaded, so only new pins
  cost anything (no fixed schedule — board-driven).
- **Active design phase**: revisit the brief when a section's pin count grows
  by ~30% or more, since that's usually a sign the corpus converged on
  something the old brief doesn't capture yet. `status` tells you cheaply
  whether anything changed.
- **Maintenance**: once a design system is shipped, treat the brief as an
  archive of *why* decisions were made, not something to keep re-pulling.

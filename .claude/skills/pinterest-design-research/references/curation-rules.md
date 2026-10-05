# Curation rules

These are the rules to pass on to the user when you hand them the curation
checklist (workflow step 2), and the rules to apply yourself when deciding
whether a pulled pin is worth citing in the brief (step 5).

## Quality bar — pin it if...

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
- It duplicates a pin you already saved from the same product — one example
  per product per layer is usually enough; diversity of sources matters more
  than volume.

## Naming conventions

- Board: `design-ref · <project-name>` — keeps all research boards grouped
  and searchable in the user's own Pinterest account.
- Sections: exact layer names from `search-taxonomy.md` (`Color & mood`,
  `Navigation`, `Motion & micro-interactions`, ...) so the manifest the script
  produces lines up directly with the brief's section headings.
- Encourage the user to leave a one-line note on pins where the *reason* they
  saved it isn't obvious from the pin itself (Pinterest lets you add a note
  when you save) — that note becomes free signal for step 5.

## Refresh cadence

Boards aren't a one-shot input — design references go stale and taste
sharpens as a project develops. Suggest:

- **Early exploration**: re-run the pull/analyze steps every time the user
  adds a meaningful batch of new pins (no fixed schedule — curation-driven).
- **Active design phase**: revisit the brief when a section's pin count
  grows by ~30% or more, since that's usually a sign the user's taste
  converged on something the old brief doesn't capture yet.
- **Maintenance**: once a design system is shipped, treat the board as an
  archive of *why* decisions were made, not something to keep re-pulling.

# Live preview Artifact — what step 6 must produce

This is the piece the user actually *sees*: a single Claude Artifact (one
self-contained HTML page) that applies the tokens from `tokens.json` (and the
patterns described in `brief.md`) to real-looking UI, instead of leaving the
design system as numbers in a file. Build it right after the brief and tokens
are saved, every time, unless the user explicitly says they don't want one.

Before writing it, load the `artifact-design` skill (required for any
Artifact in this environment) and follow its page contract — theme-aware CSS
variables, phone-width layout, no external scripts beyond its allowed hosts.
On top of that baseline contract, this Artifact specifically needs:

## Required sections

1. **Header** — project name (from the brief's title) and a one-line summary
   of the overall direction (from the brief's Summary section).
2. **Color** — a swatch for every role in `tokens.json["color"]` (background,
   surface, text, primary, secondary/accent, semantic success/warning/danger),
   each labeled with its hex value and role name. If the brief documents
   light/dark variants, show both — a real toggle if it's cheap, otherwise two
   labeled rows.
3. **Typography** — render actual sample text ("Aa", a short heading, a line of
   body copy) at each step of `tokens.json["typography"]["scale"]`, in the
   families the brief observed, so the ratio between steps is visible, not just
   listed as numbers.
4. **Spacing & radius** — a row of boxes sized to `tokens.json["spacing"]["scale"]`
   so the unit is visible, plus a couple of cards/buttons rendered at the
   `radius` values from the brief.
5. **Core components** — pick 3-5 components the brief's "Core components"
   section actually covers (not invented ones) and build small working
   examples with the real tokens: e.g. a primary + secondary button pair, a
   card, a nav bar, a form input, a stat tile. Reuse the component names and
   states (hover/disabled/loading if the brief documents them) instead of
   generic placeholders.
6. **Motion** (only if the brief's "Motion & micro-interactions" section has
   confirmed, non-"unconfirmed" findings) — a couple of CSS transitions on the
   components above (hover/press states, a loading indicator) that match what
   was actually observed, so the static brief gets at least a taste of motion.
7. **Footer** — a line noting this is a generated preview from `brief.md`,
   with the pin count and project name, so it's never mistaken for the user's
   real product UI.

## Rules

- Every value on the page must trace back to `tokens.json` or a cited claim in
  `brief.md` — don't invent colors, type sizes, or component states that
  aren't in either file. If a role is missing from `tokens.json` (e.g. no
  dark mode), leave that part out rather than guessing a value.
- This is a demonstration of the *system*, not a mockup of the user's actual
  product screens — don't invent application-specific content (fake company
  names, fake data) beyond what's needed to show a component working (e.g. a
  stat tile needs *some* number; keep it generic, like "128" or "+12%").
- Keep it to one page. If the brief is large, prioritize the sections above in
  order — color and typography are never optional, components can be trimmed
  to the 3 most-evidenced ones if space is tight.

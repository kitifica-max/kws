# Design System Brief — output template

ALWAYS use this exact structure for the final brief (step 6 of the workflow).
Omit a section only if the user explicitly said that layer doesn't matter for
this project — don't pad it with generic filler if there's weak evidence;
say the evidence is thin instead of inventing confidence.

Every bullet that makes a concrete claim (a color, a spacing rule, a pattern)
must end with a citation: `([source](pin link))` or `(source: <local image
filename>)` when the pin has no outbound link.

```markdown
# Design System Brief — <project name>

Generated from <N> curated pins across <N> board sections.

## Summary
2-4 sentences: the overall visual direction these references converge on,
and anywhere they genuinely disagree (name both directions rather than
averaging them into mush).

## Color
- Palette role breakdown (background / surface / text / primary accent /
  secondary accent / semantic colors) with approximate hex values *inferred*
  from the images — label them as inferred, not measured.
- Light/dark mode notes if relevant.
- Cited examples.

## Typography
- Font pairing pattern observed (display vs. UI font, or single family).
- Approximate type scale (how many size steps, ratio between them).
- Weight usage pattern (e.g. bold only for numbers/headings).
- Cited examples.

## Layout & spacing
- Grid/column pattern, spacing unit if inferable, card/container sizing.
- Breakpoint behavior if any pin shows responsive states.
- Cited examples.

## Navigation
- Primary nav pattern (sidebar/top bar/tab bar/command palette) and when
  each shows up across the references.
- Cited examples.

## Core components
- One subsection per component type the pins actually cover (cards, tables,
  forms, buttons, modals, pricing tables...) — don't invent a component type
  with zero source pins.
- Cited examples.

## States
- Empty/loading/error/success patterns observed.
- Cited examples.

## Onboarding & flows (if relevant)
- Structure of first-run/signup flows observed.
- Cited examples.

## Motion & micro-interactions
- What's directly observable (from video/GIF pins).
- What's only inferable from descriptions/alt text/links — flag these as
  "unconfirmed, check source" rather than asserting them as fact.
- Cited examples.

## Data visualization (if relevant)
- Chart types, density, stat-tile patterns observed.
- Cited examples.

## Open questions / gaps
Call out layers where the curated pins gave weak or contradictory signal —
this is more useful to the user than silently picking one direction.

## Sources
A flat list of every pin cited above: title, link (or local filename), board
section.
```

## Optional `tokens.json`

If the user wants machine-readable tokens alongside the narrative brief,
write `design-system/<project-name>/tokens.json` with this shape — only
include keys you actually have evidence for:

```json
{
  "color": {
    "background": "#...",
    "surface": "#...",
    "text": "#...",
    "primary": "#...",
    "secondary": "#...",
    "semantic": { "success": "#...", "warning": "#...", "danger": "#..." }
  },
  "typography": {
    "families": { "display": "...", "ui": "..." },
    "scale": ["12", "14", "16", "20", "24", "32", "40"]
  },
  "spacing": { "unit": "4px|8px", "scale": ["4", "8", "12", "16", "24", "32"] },
  "radius": { "sm": "...", "md": "...", "lg": "..." }
}
```

Every value here should trace back to a claim already made (with citation)
in `brief.md` — `tokens.json` is a machine-readable summary of the brief, not
a second, independent source of truth.

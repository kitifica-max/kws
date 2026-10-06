# Design System Brief — Kitifica SaaS Dashboard

Generated from 294 curated pins in the Pinterest board "UI Reference" (account
`idealandidl`, board id `1115063257681091512`), no sub-sections used — 136
from the original pull, 28 added 2026-10-06 (morning refresh), and 130 more
added 2026-10-06 (afternoon refresh, mostly motion/interaction references
plus a large retro-hardware icon cluster — see Open questions / gaps). Brief
scoped for a **SaaS / dashboard product** with an **Enterprise/Corporate +
Playful/Bold** vibe, per the user's brief.

## Summary

The board converges on two visual directions that keep recurring together,
which this brief treats as two modes of one system rather than averaging them
away: a **light, structured "enterprise" mode** (soft lavender/off-white
surfaces, indigo-blue primary, rounded bento-grid cards — DealDeck Sales
Report, Cardiology) and a **dark, high-contrast "bold" mode** (near-black
backgrounds with a saturated chartreuse/lime accent, often paired with
violet and coral blocks — Your Sales Analysis, Your Saving Goal, Financial
Roadmap, Financial Match, Paytin). Both share the same component grammar:
rounded stat cards, oversized numerals as the dominant typographic element,
and pill-shaped buttons/tabs. Where they diverge is surface color and accent
saturation, not structure — so the practical read is "one component system,
switchable between a quiet light theme and a loud dark theme," not two
unrelated styles.

A large share of the 164 pins (editorial magazine layouts, fashion
e-commerce, furniture/product sites, personal iOS lock-screen widgets) are
outside the SaaS-dashboard scope and were set aside for this brief — see
**Open questions / gaps**. The 2026-10-06 batch added a third, softer
direction worth tracking alongside the two above: a **pastel "consumer
health/finance" mode** (muted mint/coral/lavender full-screen backgrounds,
mascot illustrations, rounded pill charts) seen in mobile wallet and
wellness-tracker pins — see Color and Navigation below for what's new.

## Color

- **Light/enterprise surfaces**: off-white to pale lavender background
  (`#ECEDF8`-ish), white card surface, dark grey/near-black text
  (source: local `1115063189023186145.jpg`, "DealDeck Sales Report").
- **Dark/bold surfaces**: near-black background (`#0A0A0A`–`#141414`) used as
  the dominant surface in the playful cluster, not just for accents
  (sources: local `1115063189023186122.jpg` "Your Sales Analysis";
  [Financial Match](https://www.theworldaccordingtome.org/2930470_ultimate-creative-web-ui-kits-twitch-stream-overlay-collection/?step-by-step-token-fintech-landing-pagebuilder-guide)).
- **Primary accent, bold mode**: saturated chartreuse/lime green
  (approx. `#C6FF3D`–`#D4FF2E`), used for CTAs, chart bars, and the single
  loudest stat card on a page (sources: "Your Sales Analysis" bar chart;
  local `1115063189023186010.jpg` "Financial Roadmap" — bright green
  `#39FF6E`-ish; [Paytin](local `1115063189023185526.jpg`) — lime
  `#C6FF3D`-ish on light-green screens; Financial Match above).
- **Primary accent, light/enterprise mode**: indigo/blue-violet
  (approx. `#4B3FE4`) for primary buttons and selected nav state (source:
  local `1115063189023186145.jpg` "DealDeck").
- **Secondary accent, bold mode**: violet/purple (`#7C5CFC`-ish) and
  coral/orange-red (`#FF5A3C`-ish), both used as flat color-blocked card
  backgrounds alongside the lime accent, never gradients (sources: local
  `1115063189023185946.jpg` "Your Saving Goal" — olive, lavender-purple and
  orange-red tri-color card grid; Financial Match above — purple blocks on
  black).
- **Semantic colors**: green for positive deltas, red for negative, used as
  small pill badges next to numbers, not as full card fills (sources:
  local `1115063189023186145.jpg`; local `1115063189023186140.jpg`
  "Influency").
- **Neutrals / off-white**: warm off-white (`#FAF8F3`–`#F4F5F0`) appears
  repeatedly as a light "paper" background distinct from pure white,
  mostly in the marketing/landing pins rather than the dashboard pins
  (sources: local `1115063189023186368.jpg` "Play & Public"; local
  `1115063189023186360.jpg` "Laurits").
- **Secondary accent, light/enterprise mode — orange/coral** (approx.
  `#F2622E`–`#F5803D`): a second viable accent for the light mode alongside
  indigo, used for progress rings, delta badges, and one primary CTA pill,
  always on white card surfaces rather than color-blocked (source: local
  `1115063189023198346.jpg` "Neura — Sales Dashboard Widget", added
  2026-10-06).
- **Bold mode, third background option — vivid saturated blue**
  (approx. `#1465FF`): a full-bleed brand-color background used the same
  structural way as the near-black bold mode (white/dark floating cards on
  top, one lime-green accent circle reused from the existing lime token) —
  treat as a brand-color swap on the same bold-mode skeleton, not a new
  mode (source: local `1115063189023198334.jpg` "Katana — SaaS & UX UI
  Design", added 2026-10-06).
- **New third mode — pastel "consumer health/finance"**: muted,
  desaturated full-screen backgrounds (mint `#9BCDAE`-ish, coral-pink
  `#E8897E`-ish, lavender `#B9A7D9`-ish) used per-context (one color per
  screen/category) rather than as a single app-wide palette, paired with a
  warm mustard-yellow (`#F0B429`-ish) bottom nav bar and white content
  cards — distinct from both the light/enterprise off-white and the
  dark/bold near-black-or-blue modes (source: local
  `1115063189023198172.jpg` "Faith Rosenberg" wellness tracker, added
  2026-10-06). A related mascot-illustration variant uses flat saturated
  marigold/orange (`#F5B22C`-ish) and periwinkle-blue (`#8690E0`-ish)
  block backgrounds with semantic-shaped category badges — hexagon for
  expense, gear for income, circle for savings (source: local
  `1115063189023198264.jpg` "MyWallet Mobile App Concept", added
  2026-10-06).

Both modes read as intentional, not contradictory — the bold/dark mode
belongs to fintech-flavored product moments (banking, savings, revenue), the
light/enterprise mode to data-dense admin/report moments (sales reports,
clinical/ops dashboards).

## Typography

- Two registers observed, consistently paired with the two color modes:
  - **UI/dashboard register**: a clean geometric/grotesk sans (Inter- or
    Satoshi-like), regular weight for labels, bold weight reserved almost
    entirely for the number itself (source: local `1115063189023186145.jpg`
    "DealDeck" — "$612.917" is the only bold-weight, large-size text on the
    card; label "Total Sales" is small and regular).
  - **Marketing/display register**: bold condensed or grotesk display type
    used oversized, often as the single dominant element on a screen —
    numerals treated as hero graphics rather than data (sources: local
    `1115063189023185145.jpg` "Financial Match" — "$26,000+" set at a size
    larger than any other element on the page; local
    `1115063189023185946.jpg` "Your Saving Goal" — "+18.4%" fills roughly a
    third of the card width).
- Approximate type scale (inferred, not measured): a wide jump between a
  small label/caption size (~12–13px equivalent) and a very large stat/number
  size (~32–48px+ equivalent), with comparatively little use of a
  mid-range heading size in the dashboard pins specifically — the "number as
  hero" pattern skips the usual H2/H3 step (sources: same as above).
- Weight usage: bold is used sparingly and specifically — almost always on
  numbers/stat values and on display headlines, rarely on body copy or
  labels (consistent across all cited pins above).
- ⚠️ Two pins (local `1115063189023186103.jpg` and
  `1115063189023186095.jpg`, both labeled as "styleguide"/"UI kit
  foundations" pins) are AI-generated concept renders with garbled,
  non-real label text ("Hister", "Pastin", "Tupgle", invalid hex values
  like `#9EBCEEC`). They're kept here only as a reference for **shape
  language** (soft rounded pill buttons, neumorphic soft-shadow cards,
  mint/sage accent on light grey) — treat any literal number, label, or hex
  value from these two pins as unreliable, not as a real spec.

## Layout & spacing

- **Dashboard pins**: asymmetric bento-grid of rounded cards — one wide
  "hero" card (biggest number, often the primary accent color) alongside a
  grid of 2–4 smaller stat tiles, consistent ~12–16px gap between cards,
  card corner radius visibly large (~16–24px) across every dashboard pin
  cited above (sources: local `1115063189023186145.jpg`,
  `1115063189023186122.jpg`, `1115063189023186140.jpg`).
- **Landing/marketing pins**: generous whitespace on light sections,
  full-bleed flat-color rectangular blocks (no gradients, no soft shadows)
  for section breaks — high contrast between adjacent sections rather than
  gradual transitions (sources: local `1115063189023185145.jpg` "Financial
  Match"; local `1115063189023185149.jpg` financial/banking landing page).
- **Mobile UI-kit pins**: single-column stacked cards with consistent
  ~16–20px side padding; card stacks sometimes overlap slightly (peek of
  next card) to hint scrollability (source: local `1115063189023185526.jpg`
  "Paytin").
- **Hero mockup presentation**: on marketing/landing hero sections, product
  screenshots are shown as small floating cards tilted at a slight angle
  (not axis-aligned), each with four small corner dots like a selection/
  annotation marker — a presentation convention, not a product UI pattern
  itself (source: local `1115063189023198383.jpg` "Miros — About Us Page",
  added 2026-10-06).

## Navigation

- **Desktop dashboards**: persistent left sidebar with icon + text label
  nav items, logo top-left of the sidebar, search/notification icons +
  user avatar top-right of the content area (sources: local
  `1115063189023186145.jpg` "DealDeck"; local `1115063189023186140.jpg`
  "Influency").
- **Landing pages**: simple top navbar — logo left, text links center or
  right, single filled pill CTA button far right (source: local
  `1115063189023185145.jpg` "Financial Match").
- **Mobile**: the original 136-pin pull showed no persistent bottom tab
  bar; navigation was scroll- and card-based, with horizontal pill tabs for
  time-range switching (e.g. "Today / Weekly / Monthly / Yearly") appearing
  inside the content area rather than as global nav (source: local
  `1115063189023186110.jpg` "Cardiology" top pill-tab row). **Update
  2026-10-06**: one pin does show a persistent bottom tab bar — a full-width
  pill/rounded-rectangle bar in the screen's accent color (not neutral),
  holding 5 icon-only items, present identically across all 3 screens of
  the flow (source: local `1115063189023198172.jpg` "Faith Rosenberg"
  wellness tracker). Treat this as a real but still minority pattern (1 of
  28 new pins, 0 of the original 136) — not yet strong enough evidence to
  recommend bottom-tab nav as the default, but no longer accurate to say
  it's unobserved.

## Core components

### Stat / metric cards
Rounded, flat-color-filled cards holding one large number, a small label
above it, and a small colored delta badge (▲/▼ percentage) — the single most
repeated component across the dashboard pins (sources: local
`1115063189023186145.jpg`, `1115063189023186140.jpg`,
`1115063189023185946.jpg`, `1115063189023186010.jpg`).

### Charts
Vertical bar charts with two alternating colors per category (e.g. lime vs.
blue), minimal/no gridlines, value shown in a floating tooltip-style pill
above the active bar; radial/donut rings for single-metric progress; a
packed-bubble chart used once for category-share breakdown (sources: local
`1115063189023186140.jpg` "Influency" bar chart + bubble chart; local
`1115063189023186145.jpg` "DealDeck" radial ring).

### Buttons & pills
Fully-rounded (pill) buttons, solid fill (black-on-light or
lime-on-dark), no outline/ghost buttons observed as primary actions; the
same pill shape reused for status badges, filter chips, and tab switchers
(sources: local `1115063189023186140.jpg`; local
`1115063189023186103.jpg`, shape-language only per the caveat above).

**Two-part variant (added 2026-10-06)**: a pill (label + fill color) with a
separate, slightly darker circular badge overlapping its trailing edge,
holding only a direction icon — seen specifically on upload/download
actions. Reads as "the button and its icon are two layered shapes," not one
flat pill with an icon inside it (source: local
`1115063189023266773.jpg`).

### Greeting / identity header
"Welcome back, [Name]" or first-name greeting paired with a small circular
avatar, consistently placed top-right of the dashboard header (sources:
local `1115063189023186140.jpg`; local `1115063189023185526.jpg`).

### Pricing tables (added 2026-10-06)
Previously an open gap (no pin showed pricing) — now covered: a row of 3
flat-white cards (Starter / Pro / Business), the middle "most popular" tier
visually promoted by inverting it to a dark card with a small pill badge,
while the two side tiers stay light — same light-vs-bold contrast language
as the rest of the system, applied to a single component instead of two
whole screens. Each tier: price as the dominant large numeral, a solid
pill CTA button, and a short checklist with checkmark icons (source: local
`1115063189023198367.jpg` "Saasify — SaaS UI Kit landing page").

### Calendar / day-picker row (added 2026-10-06)
A horizontal Mon–Sun strip of day labels + numbers, the current/selected
day shown as a filled circle (inverted color) against the other six days
shown as plain text — used as a time-range selector above a chart, distinct
from the pill-tab time switcher already documented above (source: local
`1115063189023198172.jpg` "Faith Rosenberg" wellness tracker).

### Loading & progress indicators (added 2026-10-06)
Previously undocumented — the first curated reference for this component.
One pin catalogs the family directly: partial-fill radial rings at several
arc lengths (not full laps, i.e. a determinate spinner), a concentric
double-ring variant, 3-dot sequences in bouncing/fading/growing weights, a
single pulsing dot, and clock/hourglass iconography reused as a "waiting"
motif rather than a literal time display. No single style dominates — treat
this as a menu of options sharing one rule: always monochrome (black/grey on
white), never tinted with the product's accent color (source: local
`1115063189023266735.jpg`).

## States

Weak signal — only the two AI-generated "styleguide" pins show explicit
default/hover/pressed/disabled button states, and their text labels are
unreliable (see Typography caveat). Treat the *existence* of a visible focus
ring and a reduced-contrast disabled state as a reasonable inference, but
not any specific value from those two pins (source: local
`1115063189023186103.jpg`).

## Motion & micro-interactions

**Update 2026-10-06 (afternoon refresh)**: the user curated a batch of 130
pins specifically for this layer. All are still static images (no video/GIF
pins), so exact timing/easing stays unconfirmed, but several pins show
*designed* interaction states directly, which the original pull had none of:

- **Button/control hover state, shown via cursor position**: five separate
  pins place a visible cursor next to a control to indicate its interactive
  state — a pill CTA ("Learn More"), a nav tab row, a "Submit" pill, a
  rounded "Play" pill, and a duration field with a small edit-pencil icon
  all show the cursor resting on or just past the target, implying a
  hover/press moment rather than documenting its visual change (no
  before/after pair in any of them) (sources: local
  `1115063189023266757.jpg` "Buttons interactions"; local
  `1115063189023266753.jpg` "Button Hover"; local
  `1115063189023266810.jpg`; local `1115063189023266764.jpg`; local
  `1115063189023266782.jpg`).
- **Upload/download button, two-part composition**: a pill button (label +
  fill color) with a separate circular icon badge overlapping its trailing
  edge, holding just the direction arrow — a distinct button-building
  pattern from the single-fill pills documented elsewhere in this brief,
  built for a click target that's visually two affordances in one (source:
  local `1115063189023266773.jpg` "Download buttons #2 — Micro-interactions
  for different styles of rounded download/upload buttons").
- **Loading / progress indicator library** (added to Core components below
  too): a single pin catalogs ~20 loading-state variants — partial-fill
  radial rings (multiple arc lengths), concentric double-rings, pulsing/
  bouncing 3-dot sequences in several weights, a single pulsing dot, and
  clock/hourglass/cuckoo-clock iconography used as waiting metaphors (source:
  local `1115063189023266735.jpg`).
- **Logo reveal animations**: two pins are explicitly animated logo intros
  ("HEVOLTZ LOGO motion"; "Minimal logo animation forming from dots — a
  minimalist logo reveal") — both static frames of a presumably GIF/video
  source, so only the *existence* of a dot-formation reveal style is
  confirmed, not its timing (sources: local `1115063189023267079.jpg`; local
  `1115063189023266993.jpg`).

Net effect: treat "a button has a visible pressed/hover state" and "loading
states use radial-ring, multi-dot, and pulsing-dot patterns" as confirmed
design intent; treat any specific duration, easing curve, or transform (how
fast, how far, what curve) as still unconfirmed — check the live link if
that detail matters.

## Data visualization

- Bar charts: 2-series alternating color, no gridlines, tooltip-on-bar for
  the active/selected value (source: local `1115063189023186140.jpg`).
- Radial/donut progress rings for single-metric completion or comparison
  (source: local `1115063189023186145.jpg`).
- Packed-bubble chart for category share, sized by value, color per category
  (source: local `1115063189023186140.jpg`).
- Numbers-as-hero pattern described under Typography also applies here:
  the single most important metric on a dashboard pin is almost always
  rendered as oversized text rather than as a chart.
- **Pill-top bar chart** (added 2026-10-06): vertical bars with fully
  rounded tops and bottoms (capsule shape, not a rectangle), value label
  floating directly above each bar, one color per chart tinted to the
  screen's accent (green/coral/purple across 3 screens of one flow) —
  reinforces the "no gridlines, label-on-value" pattern already documented
  but with a softer, more rounded bar silhouette than the existing
  bar-chart citation (source: local `1115063189023198172.jpg` "Faith
  Rosenberg").
- **Orange-accent radial ring + stacked horizontal bars** (added
  2026-10-06): same donut/radial-progress pattern already documented, now
  also seen in orange on a white card (not just the lime/indigo examples);
  same pin also shows a horizontal "value by category" bar row (4
  categories, one bar highlighted/promoted in the accent color, others
  muted grey) as a new chart type for category comparison (source: local
  `1115063189023198346.jpg` "Neura — Sales Dashboard Widget").
- **Multi-color category bar chart** (added 2026-10-06): 4 short vertical
  bars, one flat color per category rather than one consistent chart
  color, each bar directly labeled with a percentage — used for an
  expense/income breakdown rather than a dashboard metric, but the same
  "label-on-bar, no axis" convention as the dashboard bar charts above
  (source: local `1115063189023198264.jpg` "MyWallet Mobile App Concept").
- **Extruded/"clay" 3D donut chart** (added 2026-10-06): a different
  rendering of the same donut/radial pattern already documented — modeled
  with soft 3D shading (rounded, physically-lit, drop-shadowed) in a
  pastel orange/teal/cream palette, rather than the flat-fill rings seen
  elsewhere in this brief. Appears alongside tactile 3D buttons/knobs in
  the same pin, so treat it as part of a broader "soft 3D" surface
  treatment, not a standalone chart variant (source: local
  `1115063189023236465.jpg` "Soft 3D UI Kit for Human-Centered SaaS
  Products" — thin coverage, one pin only, flagged in Open questions /
  gaps rather than written up as a confirmed pattern).

## Open questions / gaps

- **Scope dilution**: of 294 pins, a majority are outside SaaS-dashboard
  scope (magazine/editorial layouts, fashion e-commerce, furniture/product
  sites, personal iOS lock-screen widgets, portfolio sites, food/product
  packaging, and — as of the 2026-10-06 afternoon batch — a large
  retro-hardware icon cluster, see below). This brief only drew on the
  subset that matched "SaaS/dashboard + enterprise/playful." If more
  precision is wanted, recommend a follow-up curation pass scoped tightly to
  admin dashboards and fintech product UI (the skill's
  `references/search-taxonomy.md` has ready query templates for this). Of
  the first 28 pins added 2026-10-06, 7 were cited above and the remaining
  21 were out of scope and set aside the same way.
- **Retro-hardware / Dieter Rams icon cluster (new, 2026-10-06 afternoon
  batch, ~35 of 130 new pins)**: a large, coherent set of skeuomorphic
  icons and renders modeled on Braun consumer electronics — cream/white
  device bodies, a single orange accent (knobs, buttons, highlight
  elements), dot-matrix speaker-grille textures, and 7-segment LCD digit
  displays (clocks, radios, calculators, alarm/tuner UIs), explicitly
  credited as a Dieter Rams tribute in two of the pins' own titles/
  descriptions (sources: local `1115063189023240929.jpg` "Rams System
  Icons"; local `1115063189023237140.jpg` "Braun KLWP theme — A tribute to
  Dieter Rams"). This is fully outside the SaaS-dashboard scope — it's
  physical-product iconography, not app UI — but it's too large a share of
  this batch (over a quarter of the new pins) to silently drop. Flagging it
  explicitly in case it signals a direction the user actually wants pursued
  (e.g. a retro/skeuomorphic icon set or onboarding illustration style) —
  if so, it needs its own scoped brief, not folding into this one.
- **Generative/particle background textures (new, thin coverage)**: a
  handful of pins (dot-grid fields, flow-field noise, halftone blobs) read
  as frames from animated or shader-driven backgrounds, likely meant for
  marketing/landing hero sections rather than dashboard UI. Noted as a
  possible texture layer for marketing surfaces, not analyzed in depth —
  too few pins and no two share a clear common style to write up as a
  pattern (sources: local `1115063189023267085.jpg` "Free Motion
  Background"; local `1115063189023266945.jpg` "Reacting grid animation").
- **"Liquid glass" and soft-3D/claymorphism surfaces (new, thin coverage)**:
  one generic stock "Liquid Glass Interface" vector kit (frosted/translucent
  panels, local `1115063189023241172.jpg`) and one "Soft 3D UI Kit for
  Human-Centered SaaS Products" pin (extruded, physically-lit controls and a
  3D donut chart, local `1115063189023236465.jpg`, also cited under Data
  visualization). Both are single-pin signals — real alternate surface
  treatments to the two modes this brief documents, but not enough evidence
  yet to write up as confirmed patterns.
- **Pricing tables**: was an open gap as of the first pull — now resolved,
  see Core components above.
- **Light vs. dark as one system or two**: the pins don't show a single
  product switching between both modes — they're two different products
  each committing fully to one mode. Whether the target product should
  offer both as a light/dark toggle of the *same* component system, or pick
  one, is a product decision this brief can't settle from the references
  alone.
- **Two AI-generated concept pins** (noted above) inflate apparent
  "component coverage" (toggles, chips, tabs, alerts) without real
  underlying values — don't treat their presence as strong evidence of a
  component spec, only of a shape/material direction.
- **Motion**: no evidence at all (see above) — flagged, not guessed.
- **Forms / onboarding flows**: no pin in this pull showed a multi-step
  signup, empty state, or error state clearly enough to extract a pattern —
  this section was effectively empty and is omitted from the brief above
  rather than padded.

## Sources

| Pin | Title | Link | Local file |
|---|---|---|---|
| DealDeck Sales Report | (untitled) | [dribbble](https://cdn.dribbble.com/userupload/11950747/file/original-6d7ca8d9bf335f314dba9f5be17b7042.png?resize=752x) | `images/1115063189023186145.jpg` |
| Influency | Infleuncy | — | `images/1115063189023186140.jpg` |
| Your Sales Analysis | Mastering Dashboard Design Principles and Best Practices | [skyryedesign.com](https://skyryedesign.com/design/ux-ui/dashboard-design/) | `images/1115063189023186122.jpg` |
| Crypto/portfolio overview | (untitled) | — | `images/1115063189023186116.jpg` |
| Cardiology | (untitled) | — | `images/1115063189023186110.jpg` |
| "Styleguide" AI concept #1 (shape-language only) | Styleguides AI inspiration | [behance](https://www.behance.net/gallery/251601621/Where-Design-Meets-Function/?styleguides-ai-inspiration-build-patterns-not-only) | `images/1115063189023186103.jpg` |
| "Styleguide" AI concept #2 (shape-language only) | UI kit foundations: Motion tokens for UI feedback | [behance](https://www.behance.net/gallery/251362231/Premium-Interface-Concepts/?ui-kit-foundations-motion-tokens-for-ui-feedback) | `images/1115063189023186095.jpg` |
| Financial Roadmap | (untitled) | [dribbble](https://cdn.dribbble.com/userupload/7181275/file/original-0195c435e3220921f159c513731c69ae.png?resize=752x&utm_source=Pinterest&utm_medium=organic) | `images/1115063189023186010.jpg` |
| Your Saving Goal | (untitled) | [cloudfront](https://d2w9rnfcy7mm78.cloudfront.net/28919004/original_15dc84f92f1445c9662de2a354da8cdf.jpg) | `images/1115063189023185946.jpg` |
| Banking App Exploration (brand/shape system, not screens) | Banking App Exploration | [behance](https://www.behance.net/gallery/167025853/Banking-App-Exploration) | `images/1115063189023185902.jpg` |
| Paytin | (untitled) | — | `images/1115063189023185526.jpg` |
| "Your Partner in Smarter Financial Decisions" landing | Diseño de Landing Page Impactante para Resultados Efectivas | [payhip](https://payhip.com/SaaSPitchStudioSaaSPresentation/...) | `images/1115063189023185149.jpg` |
| Financial Match | Step-by-Step Token Fintech landing page Builder Guide | [theworldaccordingtome.org](https://www.theworldaccordingtome.org/2930470_ultimate-creative-web-ui-kits-twitch-stream-overlay-collection/?step-by-step-token-fintech-landing-pagebuilder-guide) | `images/1115063189023185145.jpg` |
| Neura — Sales Dashboard Widget (added 2026-10-06) | Pixels With Purpose | [behance](https://www.behance.net/gallery/251345533/Pixels-With-Purpose/?neura-sales-dashboard-widget) | `images/1115063189023198346.jpg` |
| Katana — SaaS & UX UI Design (added 2026-10-06) | Katana Branding UX/UI Trial Period | [behance](https://www.behance.net/gallery/175324957/Katana-Branding-UXUI-Trial-Period) | `images/1115063189023198334.jpg` |
| MyWallet Mobile App Concept (added 2026-10-06) | (untitled) | [dribbble](https://dribbble.com/shots/22556370-MyWallet-Mobile-App-Concept) | `images/1115063189023198264.jpg` |
| Faith Rosenberg wellness tracker (added 2026-10-06) | Faith Rosenberg | [dribbble](https://dribbble.com/faith_in_web) | `images/1115063189023198172.jpg` |
| Miros — About Us Page (added 2026-10-06) | Miros SaaS Website Template | [temlis.com](https://www.temlis.com/templates/miros) | `images/1115063189023198383.jpg` |
| Saasify — SaaS UI Kit landing page (added 2026-10-06) | Premium Dashboard UI Kits | [behance](https://www.behance.net/gallery/228846877/Premium-Dashboard-UI-Kits?saas-ui-kit-modern-landing-page-for-conversions) | `images/1115063189023198367.jpg` |
| Buttons interactions (added 2026-10-06 pm) | Buttons interactions | [codepen](https://codepen.io/coopergoeke/pen/wvaYMbJ) | `images/1115063189023266757.jpg` |
| Button Hover (added 2026-10-06 pm) | Button Hover | [codepen](https://codepen.io/kathykato/pen/rZRaNe) | `images/1115063189023266753.jpg` |
| "Play" pill, cursor state (added 2026-10-06 pm) | (untitled) | — | `images/1115063189023266810.jpg` |
| Nav tab row, cursor state (added 2026-10-06 pm) | (untitled) | [qclay.design](https://qclay.design/) | `images/1115063189023266764.jpg` |
| Duration field, edit-pencil cursor (added 2026-10-06 pm) | (untitled) | — | `images/1115063189023266782.jpg` |
| Download buttons #2 (added 2026-10-06 pm) | Download buttons #2 | [uimovement.com](https://uimovement.com/design/upload-buttons/) | `images/1115063189023266773.jpg` |
| Loading indicator library (added 2026-10-06 pm) | (untitled) | — | `images/1115063189023266735.jpg` |
| HEVOLTZ LOGO motion (added 2026-10-06 pm) | HEVOLTZ LOGO motion | [behance](https://www.behance.net/gallery/209300795/Hevoltz) | `images/1115063189023267079.jpg` |
| CyberMind logo animation (added 2026-10-06 pm) | Minimal logo animation forming from dots | [behance](https://www.behance.net/gallery/237381611/CyberMind) | `images/1115063189023266993.jpg` |
| Rams System Icons (added 2026-10-06 pm, off-scope) | 超拟物图标 \| Rams System Icons | [behance](https://www.behance.net/gallery/242098083/-Rams-System-Icons) | `images/1115063189023240929.jpg` |
| Braun KLWP theme (added 2026-10-06 pm, off-scope) | Braun KLWP theme | [dribbble](https://dribbble.com/shots/597337-Braun-UI) | `images/1115063189023237140.jpg` |
| Soft 3D UI Kit (added 2026-10-06 pm) | Soft 3D UI Kit for Human-Centered SaaS Products | [untitledui.com](https://www.untitledui.com/?atp=IYtByr) | `images/1115063189023236465.jpg` |
| "Liquid Glass Interface" stock kit (added 2026-10-06 pm) | (Adobe Stock contributor page, not descriptive) | — | `images/1115063189023241172.jpg` |
| Free Motion Background (added 2026-10-06 pm) | Free Motion Background | — | `images/1115063189023267085.jpg` |
| Reacting grid animation (added 2026-10-06 pm) | Reacting grid animation | — | `images/1115063189023266945.jpg` |

All 136 pins from the original pull were reviewed via contact-sheet
thumbnails to select the first cited subset (12 pins received
full-resolution review). The 28 pins added 2026-10-06 (morning) were all
reviewed via a labeled contact sheet plus full-resolution review of the 6
cited above; the remaining 21 were out of SaaS-dashboard scope. The 130
pins added 2026-10-06 (afternoon) were reviewed via 3 labeled contact
sheets plus full-resolution review of the 15 cited above; the retro-hardware
cluster (~35 pins) and most of the remaining pins were out of scope or too
thin a signal to cite individually (see Open questions / gaps).

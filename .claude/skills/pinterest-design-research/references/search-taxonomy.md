# Search & board taxonomy

Two jobs: it decides **which design-system layers a given brief actually needs**
(workflow step 2), and its layer names are exactly the **section names on the
shared board** — so the sections that come back in `manifest.json` line up with
the headings in `design-system-output.md` with no manual sorting.

## Board structure

The plugin reads one shared board: `UI Reference`, one **section per
design-system layer** (`Color & mood`, `Navigation`, `Motion &
micro-interactions`, ...). Sections matter, not just a flat board: the proxy can
list pins per-section (`GET /boards/{id}/sections/{section_id}/pins`), which is
what turns a 160+ pin board into a brief organized by layer instead of one flat
pile Claude has to re-sort by eye.

Nobody curates a board to use the skill — the corpus is already curated. The
taxonomy is used to *read* it, not to build it.

## Design-system layers × search query templates

Replace `{archetype}` with the product type and `{vibe}` with the user's style
adjectives (minimal, playful, enterprise, brutalist, warm, dense...).

| Layer | What to look for | Query templates |
|---|---|---|
| Color & mood | Palette logic, how many accent colors, light vs dark default | `{archetype} UI color palette {vibe}`, `{vibe} web app color scheme`, `SaaS dark mode palette inspiration` |
| Typography | Type pairing, scale, weight contrast, display vs UI font split | `{archetype} typography UI design`, `web app heading font pairing {vibe}`, `SaaS type scale design system` |
| Layout & grid / spacing | Grid density, whitespace, card sizing, breakpoints | `{archetype} layout grid UI`, `{vibe} dashboard layout design`, `web app spacing system UI` |
| Navigation | Sidebars, top nav, mobile tab bars, breadcrumbs, command palettes | `SaaS sidebar navigation UI`, `mobile app tab bar design`, `web app command palette UI` |
| Core components | Cards, tables, forms, buttons, modals, pricing tables | `{archetype} card component UI design`, `pricing table design UI`, `SaaS settings page UI design` |
| States | Empty states, loading, error, success, zero-data | `empty state illustration UI`, `web app loading state design`, `SaaS onboarding checklist UI` |
| Onboarding & flows | First-run, signup, multi-step wizards | `mobile app onboarding flow UI`, `SaaS signup flow design`, `product tour UI design` |
| Motion & micro-interactions | Hover states, transitions, button feedback, scroll effects | `UI micro interaction`, `button hover animation UI`, `web app scroll animation design`, `app interaction gif` |
| Data visualization | Charts, dashboards, stat tiles, sparklines | `dashboard data visualization UI`, `SaaS analytics chart design`, `KPI card design UI` |
| Dark mode / theming | Full theme pairs, not just one dark screenshot | `{archetype} dark mode UI design`, `web app theme switcher design` |

## By product archetype (which layers usually matter most)

- **SaaS dashboard / admin**: layout & grid, navigation, data viz, core
  components, states, dark mode.
- **Marketing / landing page**: color & mood, typography, motion
  (scroll-triggered), layout & grid (hero sections).
- **Mobile app**: navigation (tab bars/gestures), onboarding, motion
  (micro-interactions are a bigger share of the experience), states.
- **E-commerce (PDP/checkout)**: core components (product cards, cart,
  checkout steps), typography (pricing emphasis), motion (add-to-cart
  feedback).
- **Fintech**: color & mood (trust signals), data viz, states (error/empty
  handling is high-stakes here), typography (numeric legibility).
- **AI / chat product**: core components (message bubbles, streaming states),
  motion (typing/streaming indicators), states (loading/empty).
- **Developer tool / docs**: typography (code vs prose), navigation (sidebar +
  search), dark mode (often default, not optional).
- **Marketplace**: core components (listing cards, filters), navigation
  (faceted search/filters), states (empty search results).

## Picking layers for a brief

For the user's archetype, name the 3-5 layers that usually matter most, confirm
against what they said they need, and only then pull the board — a brief that
tries to cover all ten layers at once reads like a summary of the board instead
of a decision document for *their* product.

The query templates stay useful even without an API: if the user wants to see
what else exists in a layer, hand them the filled-in queries to run on
pinterest.com themselves (visual search is still better than any API call — see
`SKILL.md`), then have them paste or link what they find for Claude to fold in.

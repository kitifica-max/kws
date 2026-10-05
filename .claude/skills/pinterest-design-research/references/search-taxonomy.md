# Search & board taxonomy

This is the structure to hand the user in step 2 of the workflow. Don't just
dump the whole table at them — pick the rows that match their product
archetype and the layers they said matter, then present a short, concrete
checklist.

## Board structure

One Pinterest **board per project** (e.g. `design-ref · acme-dashboard`), one
**section per design-system layer** that's actually relevant to that project.
Sections matter, not just flat boards: the API can list pins per-section
(`GET /boards/{id}/sections/{section_id}/pins`), so a well-sectioned board
turns directly into a well-organized `manifest.json` later — no manual sorting
needed on the Claude side.

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

## Turning this into a checklist for the user

For each chosen layer: give 1 section name to create, 4-6 query templates
filled in with their actual archetype/vibe, and the curation quality bar from
`curation-rules.md`. Keep the ask achievable — 8-15 pins per section, not 100.

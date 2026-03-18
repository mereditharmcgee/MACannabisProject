# Phase 4: Homepage and Card Layout - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Responsive homepage with hero section, stats banner, descriptive subtitle, and browsable card grid of all 525 dispensaries. Cards link to detail pages. No search, no filters — those are Phase 5 and 6. This phase replaces the placeholder homepage with the real thing.

</domain>

<decisions>
## Implementation Decisions

### Card design and info density
- Each card shows: dispensary name, town, owner, ownership badge tags, and license type (as small "Storefront" or "Delivery" text label)
- Consistent card height — badgeless cards (319 of 525) have empty badge area, same layout as cards with badges
- Owner name truncation: Claude's discretion (balance readability and uniformity)
- Badge style: Claude's discretion (reuse OwnershipBadge.astro from Phase 3 or create compact variant for cards)
- Subtle hover effect on cards (shadow lift or slight scale) to signal clickability
- Clicking a card navigates to `/dispensary/[slug]/`

### Hero section and stats banner
- Headline: "Who Owns Your Dispensary?" (unchanged from Phase 1)
- Descriptive subtitle below headline explaining what the site does (e.g., "A transparent directory of every licensed cannabis dispensary in Massachusetts and who owns them")
- Reserve visual space for future search bar (Phase 5) — gap or placeholder area below headline
- Stats sourced dynamically from stats.json for totalLicenses and totalTowns; 92% independently owned hardcoded until Independent column is added to XLSX
- Hero background style: Claude's discretion (subtle green accent or clean white — whatever creates best contrast with card grid)

### Card grid ordering and pagination
- Show all 525 cards, lazy-render for performance (virtual scrolling or intersection observer)
- Default sort: alphabetical by trade name (A-Z)
- Visible count above grid: "Showing 525 dispensaries" (becomes dynamic in Phase 5-6 with search/filters)
- No pagination — single scrollable page

### Overall page structure
- Hero section scrolls away naturally (not sticky)
- Grid layout: 1 column mobile, 2 columns tablet, 3 columns desktop
- Footer slightly expanded: "A project by Meredith McGee" plus brief about/data source line (Phase 7 adds Terms of Service link)
- No sticky header for now — Phase 5 search bar could later become sticky

### Claude's Discretion
- Hero background treatment (green accent vs white)
- Card hover animation specifics
- Badge style on cards (reuse or compact)
- Owner name truncation strategy
- Subtitle exact wording
- Footer about/attribution wording
- Responsive breakpoint specifics
- Virtual scrolling implementation approach

</decisions>

<specifics>
## Specific Ideas

- "Polished restaurant guide, not a database query tool" (Phase 1) — applies strongly to homepage
- Stats boxes already exist in placeholder with green-700 accent and shadow — could carry forward or evolve
- Phase 5 will add a search bar to the hero area — layout must accommodate this without major redesign
- The "Showing X dispensaries" count will become "Showing X of 525" when filters are active (Phase 6)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/pages/index.astro` — current placeholder with headline, stats boxes, footer (will be replaced)
- `src/layouts/BaseLayout.astro` — base layout with title/description props, Tailwind CSS
- `src/components/OwnershipBadge.astro` — colored pill badges for 8 tag types (from Phase 3)
- `src/content.config.ts` — dispensaries and stats collections via file() loader
- `src/data/dispensaries.json` — 525 records with slug, tradeName, town, owner, specialStatusTags, licenseType
- `src/data/stats.json` — totalLicenses: 525, totalTowns: 156, percentIndependent: 0

### Established Patterns
- Astro Content Collections: getCollection('dispensaries'), getCollection('stats')
- Tailwind CSS v4 for styling
- Component pattern: .astro files in src/components/

### Integration Points
- Cards link to `/dispensary/[slug]/` (Phase 3 routes already exist)
- Stats from stats.json consumed via getCollection('stats')
- OwnershipBadge.astro importable for card badges
- Future: Phase 5 search bar goes in hero section, Phase 6 filter pills go above card grid

</code_context>

<deferred>
## Deferred Ideas

- Search bar in hero section — Phase 5 (Search System)
- Filter pills above card grid — Phase 6 (Filter System)
- Sticky header with search — possible future enhancement
- Map view — v2 scope (explicitly out of scope per PROJECT.md)

</deferred>

---

*Phase: 04-homepage-and-card-layout*
*Context gathered: 2026-03-18*

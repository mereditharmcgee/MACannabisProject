# Phase 5: Search System - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Instant typeahead search across dispensary names, towns, and owners. Pre-built Fuse.js search index served as static JSON. Filters the existing card grid in real time. No filters (Phase 6), no server-side search — client-side only with a pre-built index.

</domain>

<decisions>
## Implementation Decisions

### Search results display
- Filter the existing card grid in-place — matching cards remain, non-matching cards disappear
- "Showing X of 525 dispensaries" count updates in real time as user types
- Instant filter — no fade animation, cards appear/disappear immediately
- No text highlighting within cards — cards look the same, just filtered
- Clearing the search bar (backspace or X button) restores the full 525-card grid
- Results ranked by relevance (best match first), not alphabetical

### Search bar placement and style
- Large and central in the hero section — this is the primary action on the page
- Replaces the `<!-- Phase 5: search bar goes here -->` placeholder
- Placeholder text: "Search by name, town, or owner"
- Magnifying glass icon on the left side of the input
- Clear (X) button appears on the right when text is entered
- Must work well on both mobile and desktop

### Search behavior and matching
- Moderate fuzzy matching: prefix matching plus minor typo tolerance (1-2 character errors)
- Search activates from the first character typed — no minimum character threshold
- Searches across dispensary name, town, and owner fields
- Name matches weighted higher than town/owner matches
- Search index pre-built at build time and served as static JSON (DATA-03)
- URL updates with search query (?q=worcester) for shareable/bookmarkable results
- Back button undoes search

### Loading and empty states
- Search bar loading behavior: Claude's discretion (disabled with hint, hidden until ready, or optimistic)
- Card grid remains fully usable for browsing while search index loads
- Zero results: friendly empty state message — "No dispensaries match '[query]'. Try a different name, town, or owner."
- The "Showing X of 525" count shows 0 when no results match

### Claude's Discretion
- Search bar loading state approach
- Fuse.js configuration (threshold, distance, keys, weights)
- Search index format and pre-build script details
- Debounce timing for search input
- Search bar exact dimensions and styling
- Mobile search bar behavior (full-width, keyboard handling)

</decisions>

<specifics>
## Specific Ideas

- Search should feel like Google's search bar — large, central, immediate feedback
- The card grid already has content-visibility: auto for lazy rendering — search filter needs to work with this
- Phase 6 filters will compose with search (searching "Boston" then filtering "Women-Owned" shows only women-owned dispensaries in Boston results) — architecture should support this

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/pages/index.astro` — homepage with `<!-- Phase 5: search bar goes here -->` placeholder, card grid, "Showing X dispensaries" count
- `src/components/DispensaryGridCard.astro` — compact card component for the grid
- `src/data/dispensaries.json` — 525 records with tradeName, town, owner, slug, specialStatusTags, licenseType
- `src/content.config.ts` — dispensaries collection via file() loader
- `src/lib/format.ts` — toTitleCase, getLicenseLabel helpers

### Established Patterns
- Astro Content Collections for data at build time
- Tailwind CSS v4 for styling
- Static site on Cloudflare Pages — all client-side interactivity must be vanilla JS or lightweight library
- No existing client-side JavaScript (all server-rendered)

### Integration Points
- Search bar goes in hero section of index.astro (placeholder exists)
- Card grid is server-rendered as static HTML — search needs to show/hide existing cards or re-render with client JS
- Phase 6 filters will compose with search — search state and filter state need to coexist
- DATA-03: search index pre-built at build time, served as static JSON

</code_context>

<deferred>
## Deferred Ideas

- Filter pills composing with search — Phase 6
- Search suggestions/autocomplete dropdown — future enhancement
- Search analytics (popular queries) — v2 scope
- Voice search — out of scope

</deferred>

---

*Phase: 05-search-system*
*Context gathered: 2026-03-19*

# Phase 3: Detail Pages - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

525 pre-rendered dispensary pages at `/dispensary/[slug]/` with SEO-friendly URLs, ownership information, structured data (JSON-LD), ownership narratives, and cross-links to sibling locations. No homepage, no search, no filters — just the individual detail pages.

</domain>

<decisions>
## Implementation Decisions

### Ownership narrative strategy
- Hybrid approach: build-time auto-generates narratives from structured data, but an optional "Custom Narrative" XLSX column can override with hand-written text
- For 417 records with ownershipDetails: transform research notes into readable 2-3 sentence prose at build time using a template function combining tradeName, owner, town, and ownershipDetails
- For 108 records with empty ownershipDetails (needsNarrative): show "Ownership details for this dispensary are being researched" notice
- Unique data with shared sentence structure is acceptable — no need for varied prose styles
- User can progressively replace auto-generated narratives by filling in the Custom Narrative column

### Page layout and information hierarchy
- Clean profile card style: centered card with clear sections on subtle background
- Hierarchy: dispensary name + ownership badges most prominent at top
- Owner/parent company name below the name/badges
- Ownership narrative as readable paragraph
- Structured facts: address (tappable — opens Google Maps), phone (tap-to-call), license type
- Sibling location links at bottom
- Navigation: Claude's discretion (back link or breadcrumb, whatever fits the card style)
- Visual feel: "polished restaurant guide" per Phase 1 direction

### URL slug format
- URL pattern: `/dispensary/[slug]/`
- Strip legal suffixes (Inc, LLC, Corp, etc.) from slugs for cleaner URLs
- 5 slug collisions after stripping: disambiguate by appending town (e.g., `in-good-health-sandwich`, `in-good-health-brockton`)
- Slug generation happens in the data pipeline (Phase 2 already generates slugs — this phase updates the logic)

### Sibling location cross-links
- Group siblings by parentCompany field (already populated for all 525 records)
- When Brand/Company column is added to XLSX later, switch grouping to that field
- Sibling display style: Claude's discretion (simple linked list or mini cards, whatever fits the card style)
- 11 researchInconclusive records: show page with name, address, phone, license, badges — but hide owner section, narrative, and sibling links. Show "Ownership information is being researched" notice.

### SEO and structured data
- Each page gets unique meta title: "Who Owns [Dispensary Name]? | MA Cannabis Directory"
- Each page gets unique meta description optimized for "who owns [dispensary]" queries
- JSON-LD structured data (schema.org LocalBusiness) on every page
- Must pass Google Rich Results Test validation

### Claude's Discretion
- Exact narrative template sentence structures
- Badge color scheme and styling
- Card spacing, typography, responsive breakpoints
- JSON-LD field mapping details
- Navigation style (back link vs breadcrumb)
- Sibling display format (list vs mini cards)

</decisions>

<specifics>
## Specific Ideas

- "Polished restaurant guide, not a database query tool" (Phase 1)
- Badges should be visually prominent — they're the identity of the dispensary alongside its name
- Tappable address (Google Maps) and phone (tel: link) for mobile users finding a dispensary

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/content.config.ts` — dispensaries collection with file() loader, schema defined
- `src/layouts/BaseLayout.astro` — base layout with title/description props, Tailwind CSS
- `src/data/dispensaries.json` — 525 records with slug, tradeName, owner, parentCompany, address, town, county, phone, licenseType, ownershipDetails, specialStatusTags, needsNarrative, researchInconclusive
- `src/data/stats.json` — totalLicenses, percentIndependent, totalTowns

### Established Patterns
- Astro Content Collections via getCollection()/getEntry() for data access
- Tailwind CSS v4 via @tailwindcss/vite plugin
- Build pipeline: XLSX → JSON → Astro (npm run build:data && astro build)

### Integration Points
- Detail pages consume dispensaries collection via getCollection('dispensaries')
- Astro dynamic routes: `src/pages/dispensary/[slug].astro` with getStaticPaths()
- Slug field already exists in dispensary records (needs legal suffix stripping update in Phase 2 pipeline)
- parentCompany field available for sibling grouping (23 multi-location groups detected)

</code_context>

<deferred>
## Deferred Ideas

- Brand/Company column for more accurate sibling grouping — user adds to XLSX later
- Custom Narrative XLSX column — user adds progressively over time
- "Suggest a Correction" form on detail pages — Phase 7 (Trust and Legal)
- Owner profile/aggregate pages — not in current roadmap, could be future phase

</deferred>

---

*Phase: 03-detail-pages*
*Context gathered: 2026-03-18*

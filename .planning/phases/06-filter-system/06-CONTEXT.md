# Phase 6: Filter System - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual filter controls that narrow the dispensary card grid by ownership tags and county. Filters compose with the existing search system. MSO/Independent toggle is deferred (data not populated). This phase adds filter pills, a county dropdown, and integrates them with the existing search + card grid.

</domain>

<decisions>
## Implementation Decisions

### Filter pill scope
- Show pills only for tags that exist in the data: MTC Priority, Economic Empowerment, Social Equity (3 pills)
- Do NOT show pills for tags with zero records (Woman-Owned, Veteran-Owned, etc.) — add pills later as data grows
- Multiple active pills use OR logic (Social Equity + Economic Empowerment = dispensaries with either tag)
- Each pill shows a count of matching dispensaries (e.g., "Social Equity (142)")
- Counts update dynamically when combined with search or county filter
- No "Any Tag" convenience pill — just the 3 specific tags

### MSO/Independent toggle
- Skipped for this phase — the `independent` field has zero populated records
- Can be added in a future data update phase when the field is populated
- The "92% Independently Owned" stat on the homepage remains hardcoded as-is

### Filter UI and layout
- Filters sit below the hero/search area and above the "Showing X of 525" result count
- Always visible on mobile (no collapsible drawer) — 3 pills + 1 dropdown fit without crowding
- Pills wrap to second line on narrow screens if needed
- Active pills visually distinct (filled/highlighted state vs outline/inactive state)
- Individual toggle: tap a pill to activate/deactivate
- "Clear all" link/button appears only when any filter is active — resets pills + county
- Filter state persists in URL params (e.g., ?tags=social-equity,economic-empowerment&county=suffolk) — consistent with existing ?q= search pattern
- Back button undoes filter changes (same as search behavior)

### County dropdown
- Standard single-select dropdown with 14 counties + "All Counties" default
- Each option shows count: "Suffolk County (89)"
- Counts update dynamically based on current search + tag filter state
- Single county selection only (no multi-select)

### Claude's Discretion
- Pill active/inactive color treatment (can reuse OwnershipBadge color scheme or create filter-specific style)
- County dropdown styling (native select vs custom dropdown)
- "Clear all" button/link styling and position
- Filter animation/transition details
- URL param encoding format for tags
- Debounce strategy for filter changes
- How filter state composes with searchMatchSlugs internally

</decisions>

<specifics>
## Specific Ideas

- OwnershipBadge.astro already has color mapping for all 8 tag types — pill colors could match badge colors for visual consistency
- The `<!-- Phase 6: filter pills go here -->` placeholder exists in index.astro at line 67
- searchMatchSlugs (Set|null) pattern from Phase 5 was designed for filter composition — filters should integrate with this pattern
- Phase 5 context explicitly noted: "Phase 6 filters will compose with search (searching 'Boston' then filtering 'Women-Owned' shows only women-owned dispensaries in Boston results)"

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/OwnershipBadge.astro` — colored pill badges with color mapping for all 8 tag types (pink, teal, blue, green, rose, indigo, purple, amber)
- `src/schemas/dispensary.ts` — specialStatusTags enum with all 8 tags, `county` field, `independent` field
- `src/pages/index.astro` — search script with `searchMatchSlugs` Set|null pattern, `applyVisibility()` function, result count updates
- `src/data/dispensaries.json` — 525 records; 206 have tags, 524 have county data, 14 unique counties

### Established Patterns
- Client-side filtering via DOM show/hide (`data-slug` attributes on card wrappers)
- `searchMatchSlugs` Set|null state: null = show all, Set = show only matching slugs
- URL state management via `history.replaceState` and `URLSearchParams`
- Fuse.js for search, vanilla JS for DOM manipulation
- Tailwind CSS v4 for styling, no component framework

### Integration Points
- `<!-- Phase 6: filter pills go here -->` placeholder at index.astro:67
- `applyVisibility()` function must be extended to consider filter state alongside search state
- `performSearch()` and filter logic need shared visibility resolution
- Card DOM elements have `data-slug` but will need `data-tags` and `data-county` attributes for client-side filtering
- Result count element (`#result-count`) already updates dynamically

</code_context>

<deferred>
## Deferred Ideas

- MSO/Independent toggle — deferred until `independent` field is populated in the dataset
- Woman-Owned, Veteran-Owned, LGBTQ+-Owned, Minority-Owned, Disability-Owned filter pills — deferred until those tags appear in data
- Multi-county selection — keep single-select for now, revisit if users request
- Filter presets / saved filter combinations — future enhancement

</deferred>

---

*Phase: 06-filter-system*
*Context gathered: 2026-03-19*

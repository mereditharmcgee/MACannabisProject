# Phase 6: Filter System - Research

**Researched:** 2026-03-19
**Domain:** Client-side filtering with URL state, Astro static site, vanilla JS, Tailwind CSS v4
**Confidence:** HIGH

## Summary

Phase 6 adds filter controls (3 tag pills + 1 county dropdown) to the existing dispensary grid. The project uses a well-established pattern: Astro renders data attributes on DOM elements at build time, and vanilla JS toggles visibility client-side. Phase 5 already built the `searchMatchSlugs` Set|null pattern and `applyVisibility()` function specifically designed for filter composition.

The implementation is straightforward because: (1) all filtering is client-side against 525 static DOM elements, (2) the existing search system was explicitly designed with filter composition in mind, (3) data attributes (`data-tags`, `data-county`) can be added to card wrappers at build time, and (4) URL state management via `URLSearchParams` + `history.replaceState` is already in place for search.

**Primary recommendation:** Extend the existing `applyVisibility()` function to compose search results with tag/county filter state, adding `data-tags` and `data-county` attributes to card wrappers for client-side filtering. Keep all logic in the existing inline `<script>` block on index.astro.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Show pills only for tags that exist in the data: MTC Priority, Economic Empowerment, Social Equity (3 pills)
- Do NOT show pills for tags with zero records (Woman-Owned, Veteran-Owned, etc.)
- Multiple active pills use OR logic (Social Equity + Economic Empowerment = dispensaries with either tag)
- Each pill shows a count of matching dispensaries (e.g., "Social Equity (142)")
- Counts update dynamically when combined with search or county filter
- No "Any Tag" convenience pill
- MSO/Independent toggle skipped (independent field has zero populated records)
- Filters sit below the hero/search area and above the "Showing X of 525" result count
- Always visible on mobile (no collapsible drawer) — 3 pills + 1 dropdown fit without crowding
- Active pills visually distinct (filled/highlighted state vs outline/inactive state)
- Individual toggle: tap a pill to activate/deactivate
- "Clear all" link/button appears only when any filter is active — resets pills + county
- Filter state persists in URL params (e.g., ?tags=social-equity,economic-empowerment&county=suffolk) — consistent with existing ?q= search pattern
- Back button undoes filter changes
- County dropdown: standard single-select with 14 counties + "All Counties" default
- Each county option shows count: "Suffolk County (89)"
- County counts update dynamically based on current search + tag filter state
- Single county selection only (no multi-select)

### Claude's Discretion
- Pill active/inactive color treatment (can reuse OwnershipBadge color scheme or create filter-specific style)
- County dropdown styling (native select vs custom dropdown)
- "Clear all" button/link styling and position
- Filter animation/transition details
- URL param encoding format for tags
- Debounce strategy for filter changes
- How filter state composes with searchMatchSlugs internally

### Deferred Ideas (OUT OF SCOPE)
- MSO/Independent toggle — deferred until `independent` field is populated in the dataset
- Woman-Owned, Veteran-Owned, LGBTQ+-Owned, Minority-Owned, Disability-Owned filter pills — deferred until those tags appear in data
- Multi-county selection
- Filter presets / saved filter combinations

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRCH-04 | User can tap ownership filter pills to filter the card grid | 3 tag pills (MTC Priority, Economic Empowerment, Social Equity) with data-tags attributes on card wrappers; user decision narrows original 5 pill types to the 3 that exist in data |
| SRCH-05 | User can combine multiple filter pills to narrow results | OR logic across pills; composes with search via intersection; currently 0 records have 2+ tags so OR produces union |
| SRCH-06 | User can toggle between Independent and MSO Corporate | DEFERRED per user decision — independent field has 0 populated records |
| SRCH-07 | User can filter dispensaries by county using a dropdown | 14 counties with counts; 524 of 525 records have county data; native select element |

</phase_requirements>

## Standard Stack

### Core (already in project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.18.1 | Static site generator, builds data attributes at render time | Already in use |
| Tailwind CSS | 4.2.1 | Styling for pills, dropdown, active states | Already in use |
| Vanilla JS | N/A | Client-side filter logic, DOM manipulation | Established project pattern — no framework |
| Fuse.js | 7.1.0 | Search (composes WITH filters, not replaced by them) | Already in use from Phase 5 |

### Supporting
No additional libraries needed. This phase is pure HTML + vanilla JS + Tailwind, extending existing patterns.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vanilla JS filtering | Alpine.js or Preact | Overkill for 3 pills + 1 dropdown; adds bundle size for no benefit |
| Native `<select>` | Custom dropdown component | Custom requires accessibility work (ARIA, keyboard nav); native is free |
| Data attributes for filtering | In-memory JS data lookup | Data attributes keep filtering aligned with existing search pattern |

## Architecture Patterns

### Data Flow
```
Build Time (Astro):
  dispensaries.json → card wrappers with data-slug, data-tags, data-county

Client Side (JS):
  User action → update filter state → compute visible set → applyVisibility()

  Visibility resolution:
    1. searchMatchSlugs: Set<string> | null  (from Fuse.js)
    2. filterMatchSlugs: Set<string> | null  (from tag + county filters)
    3. visible = intersection(searchMatchSlugs, filterMatchSlugs)
       - null means "no constraint" (show all from that dimension)
       - Set means "show only these"
       - intersection: if both Sets, intersect; if one null, use the other; if both null, show all
```

### Recommended Implementation Structure

All code stays in `src/pages/index.astro`:

1. **Build-time HTML** (Astro frontmatter + template):
   - Add `data-tags` and `data-county` to each card wrapper
   - Render filter pill buttons and county dropdown above result count
   - Compute tag counts and county counts at build time for initial display

2. **Client-side script** (extend existing `<script>` block):
   - Add `filterMatchSlugs: Set<string> | null` state alongside `searchMatchSlugs`
   - Add tag and county filter state variables
   - Extend `applyVisibility()` to intersect search + filter sets
   - Add pill click handlers and county change handler
   - Extend `updateURL()` and URL restoration for filter params
   - Add dynamic count update logic

### Pattern 1: Filter State Composition
**What:** Intersect independent filter dimensions (search, tags, county) into a single visible set
**When to use:** When multiple filter sources must compose
**Example:**
```typescript
// Filter state (mirrors searchMatchSlugs pattern)
let activeTagSlugs: Set<string> | null = null;   // null = no tag filter
let activeCountySlugs: Set<string> | null = null; // null = no county filter

function computeVisibleSlugs(): Set<string> | null {
  const sets = [searchMatchSlugs, activeTagSlugs, activeCountySlugs]
    .filter((s): s is Set<string> => s !== null);

  if (sets.length === 0) return null; // no constraints, show all

  // Intersect all non-null sets
  let result = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    result = new Set([...result].filter(slug => sets[i].has(slug)));
  }
  return result;
}
```

### Pattern 2: Data Attribute Filtering
**What:** Read filter criteria from DOM data attributes to build match sets
**When to use:** Client-side filtering on static site with pre-rendered cards
**Example:**
```typescript
// Card wrapper at build time:
// <div data-slug="green-leaf-boston" data-tags="social-equity,economic-empowerment" data-county="suffolk">

function getSlugsByTag(tag: string): Set<string> {
  const cards = document.querySelectorAll<HTMLElement>('[data-slug]');
  const slugs = new Set<string>();
  for (const card of cards) {
    const tags = card.getAttribute('data-tags') || '';
    if (tags.split(',').includes(tag)) {
      slugs.add(card.getAttribute('data-slug')!);
    }
  }
  return slugs;
}

function getSlugsByCounty(county: string): Set<string> {
  const cards = document.querySelectorAll<HTMLElement>('[data-slug]');
  const slugs = new Set<string>();
  for (const card of cards) {
    if (card.getAttribute('data-county') === county) {
      slugs.add(card.getAttribute('data-slug')!);
    }
  }
  return slugs;
}
```

### Pattern 3: OR Logic for Tag Pills
**What:** Multiple active tags produce union (OR), not intersection (AND)
**When to use:** User wants "Social Equity OR Economic Empowerment"
**Example:**
```typescript
let activeTags: Set<string> = new Set();

function computeActiveTagSlugs(): Set<string> | null {
  if (activeTags.size === 0) return null; // no tag filter active

  const union = new Set<string>();
  for (const tag of activeTags) {
    for (const slug of getSlugsByTag(tag)) {
      union.add(slug);
    }
  }
  return union;
}
```

### Pattern 4: Dynamic Count Updates
**What:** Pill and county counts reflect current visible set from other filters
**When to use:** After any filter or search change
**Example:**
```typescript
function updateFilterCounts() {
  // For each tag pill, count how many dispensaries would show
  // if that tag were the ONLY tag filter (respecting search + county)
  const baseSet = intersect(searchMatchSlugs, activeCountySlugs);

  for (const tag of ALL_TAGS) {
    const tagSlugs = getSlugsByTag(tag);
    const count = baseSet === null
      ? tagSlugs.size
      : new Set([...tagSlugs].filter(s => baseSet.has(s))).size;
    // Update pill count display
    document.querySelector(`[data-filter-tag="${tag}"] .count`)!.textContent = `(${count})`;
  }

  // Similar for county dropdown options
}
```

### Pattern 5: URL State Persistence
**What:** Encode filter state in URL params alongside existing ?q= search param
**When to use:** Every filter change
**Example:**
```typescript
function updateURL(query: string, tags: Set<string>, county: string) {
  const url = new URL(window.location.href);

  // Search
  if (query) url.searchParams.set('q', query);
  else url.searchParams.delete('q');

  // Tags — use slugified tag names
  if (tags.size > 0) {
    const tagParam = [...tags].map(t => slugifyTag(t)).join(',');
    url.searchParams.set('tags', tagParam);
  } else {
    url.searchParams.delete('tags');
  }

  // County
  if (county) url.searchParams.set('county', county);
  else url.searchParams.delete('county');

  history.replaceState({ q: query, tags: [...tags], county }, '', url.toString());
}

function slugifyTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}
```

### Anti-Patterns to Avoid
- **Re-querying Fuse.js with filter params:** Filters are orthogonal to search. Don't try to merge filter criteria into the Fuse.js query. Keep them as separate dimensions that intersect.
- **Hiding pills when count is 0:** User decided pills are always visible. A pill with "(0)" is informative — it tells the user no dispensaries match that tag in the current search/county context.
- **AND logic for tags:** User explicitly chose OR logic. Multiple pills = union, not intersection.
- **Custom dropdown for county:** Use native `<select>`. Accessible by default, works on all devices, no extra JS needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown accessibility | Custom dropdown with ARIA | Native `<select>` element | Free keyboard nav, screen reader support, mobile optimization |
| URL encoding/decoding | Manual string manipulation | `URLSearchParams` API | Handles encoding, multi-value, edge cases automatically |
| Debouncing | Custom timer management | Existing `debounce()` function in script | Already implemented in Phase 5 |

## Common Pitfalls

### Pitfall 1: Filter State Not Restored on Page Load
**What goes wrong:** User bookmarks a filtered URL, opens it, and sees unfiltered results
**Why it happens:** Filter state initialization runs before DOM is ready, or only search ?q= is restored
**How to avoid:** In `initSearch()` (or a new `initFilters()`), parse ALL URL params (?q=, ?tags=, ?county=) and apply them. Ensure filter UI (active pill states, county dropdown selection) matches the URL state.
**Warning signs:** Back button works for search but not filters

### Pitfall 2: Count Updates Create Stale State
**What goes wrong:** Pill shows "Social Equity (67)" even when county filter limits it to 5
**Why it happens:** Counts are computed at build time and never updated
**How to avoid:** Recompute counts dynamically after every filter/search change. Build-time counts are initial values only.
**Warning signs:** Counts don't change when other filters are applied

### Pitfall 3: applyVisibility Ordering Conflict
**What goes wrong:** Search reorders cards by relevance, then filter hides some, leaving gaps or wrong order
**Why it happens:** `applyVisibility()` currently handles reordering AND visibility in one function; adding filter logic incorrectly could break ordering
**How to avoid:** The visibility function should: (1) compute final visible set from all dimensions, (2) apply ordering (alphabetical if no search, relevance if search active), (3) show/hide. Keep this as one atomic operation.
**Warning signs:** Cards jump around when toggling filters

### Pitfall 4: popstate Handler Missing Filter State
**What goes wrong:** Back button restores search but not filter pills/county
**Why it happens:** `history.replaceState` doesn't include filter state, or `popstate` handler only reads `q`
**How to avoid:** Store all state in `replaceState` data AND read it all back in `popstate` handler. Also update the filter UI elements (pill active states, dropdown value).

### Pitfall 5: Phase 6 Placeholder Location
**What goes wrong:** Filter pills render below the result count instead of above it
**Why it happens:** The `<!-- Phase 6: filter pills go here -->` placeholder is AFTER the result count on line 67, but the user decision says filters should be ABOVE the result count
**How to avoid:** Move the filter HTML to appear between the hero section and the result count. The placeholder comment's position needs adjustment.

## Code Examples

### Card Wrapper with Data Attributes (Build Time)
```astro
{sorted.map((dispensary) => (
  <div
    data-slug={dispensary.slug}
    data-tags={dispensary.specialStatusTags.map(t => t.toLowerCase().replace(/\s+/g, '-')).join(',')}
    data-county={dispensary.county?.replace(' County', '').toLowerCase().replace(/\s+/g, '-') || ''}
  >
    <DispensaryGridCard dispensary={dispensary} />
  </div>
))}
```

### Filter Pill HTML
```astro
---
// Compute initial counts in frontmatter
const tagCounts: Record<string, number> = {};
for (const d of sorted) {
  for (const tag of d.specialStatusTags) {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }
}

const countyCounts: Record<string, number> = {};
for (const d of sorted) {
  if (d.county) countyCounts[d.county] = (countyCounts[d.county] || 0) + 1;
}

const filterTags = ['MTC Priority', 'Economic Empowerment', 'Social Equity'];
const counties = Object.keys(countyCounts).sort();
---

<div id="filter-bar" class="flex flex-wrap items-center gap-2 mb-4">
  {filterTags.map((tag) => (
    <button
      type="button"
      data-filter-tag={tag.toLowerCase().replace(/\s+/g, '-')}
      class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border
             border-gray-300 text-gray-700 bg-white hover:bg-gray-50
             transition-colors duration-150 cursor-pointer"
    >
      {tag} <span class="count ml-1 text-gray-400">({tagCounts[tag] || 0})</span>
    </button>
  ))}

  <select id="county-filter" class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 bg-white">
    <option value="">All Counties ({sorted.length})</option>
    {counties.map((county) => (
      <option value={county.replace(' County', '').toLowerCase().replace(/\s+/g, '-')}>
        {county} ({countyCounts[county]})
      </option>
    ))}
  </select>

  <button type="button" id="clear-filters" class="text-sm text-green-700 hover:text-green-900 hidden">
    Clear all
  </button>
</div>
```

### Pill Active State Colors (Reusing OwnershipBadge Palette)
```typescript
// Recommendation: reuse OwnershipBadge color scheme for consistency
const PILL_ACTIVE_COLORS: Record<string, string> = {
  'mtc-priority':          'bg-amber-100 text-amber-800 border-amber-300',
  'economic-empowerment':  'bg-purple-100 text-purple-800 border-purple-300',
  'social-equity':         'bg-blue-100 text-blue-800 border-blue-300',
};

const PILL_INACTIVE = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
```

## Data Characteristics

Important facts from the actual dataset that affect implementation:

| Fact | Value | Impact |
|------|-------|--------|
| Total records | 525 | Client-side filtering is fast enough |
| Records with any tag | 206 (39%) | 319 records have no tags — filtering by tag always reduces substantially |
| Records with 2+ tags | 0 | OR logic currently produces same result as AND; but OR is future-proof |
| MTC Priority count | 101 | |
| Social Equity count | 67 | |
| Economic Empowerment count | 38 | |
| Records with county | 524 (99.8%) | 1 record missing county — handle gracefully |
| Unique counties | 14 | All fit comfortably in a dropdown |
| Smallest county | Nantucket (2) | Counts will go very low with combined filters |
| Largest county | Middlesex (89) | |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side filtering with page reload | Client-side filtering with URL state | Standard for static sites | No server needed, instant response |
| Custom dropdown components | Native `<select>` with dynamic options | Accessibility-first trend | Free a11y, better mobile UX |
| `display: none` toggling | `display: none` + DocumentFragment reordering | Phase 5 pattern | Maintains sort order through filter changes |

## Open Questions

1. **Should filter changes use replaceState or pushState?**
   - What we know: Search uses `replaceState` (typing updates URL without history entries)
   - What's unclear: Filters are discrete clicks — user might expect each click to be a back-button step
   - Recommendation: Use `pushState` for filter clicks (discrete actions) so back button undoes each filter change. This matches the user requirement "Back button undoes filter changes." Keep `replaceState` for search typing.

2. **Should "no results" message mention active filters?**
   - What we know: Current message says "No dispensaries match 'X'"
   - Recommendation: When filters are active with no results, mention both search and filters: "No dispensaries match your current search and filters."

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-04 | Tag pill filtering narrows card grid | unit | `npx vitest run tests/filter.test.ts -t "tag filter"` | No — Wave 0 |
| SRCH-05 | Multiple pills compose with OR logic | unit | `npx vitest run tests/filter.test.ts -t "OR logic"` | No — Wave 0 |
| SRCH-06 | MSO/Independent toggle | N/A | N/A — DEFERRED | N/A |
| SRCH-07 | County dropdown filters by county | unit | `npx vitest run tests/filter.test.ts -t "county filter"` | No — Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/filter.test.ts` — covers SRCH-04, SRCH-05, SRCH-07 (pure logic functions: set intersection, OR union, county matching, count computation)
- [ ] Filter logic should be extracted into testable pure functions (e.g., `computeVisibleSlugs`, `computeTagSlugs`, `computeCountySlugs`, `updateCounts`) even though they live in the inline script — test the logic, not the DOM

Note: Most filter behavior is DOM-based (click handlers, visibility toggling). The testable parts are the pure set logic functions. Full DOM testing would require a browser test runner (Playwright), which is out of scope for this project's test infrastructure.

## Sources

### Primary (HIGH confidence)
- **Project source code** — index.astro (Phase 5 search implementation), OwnershipBadge.astro, dispensary.ts schema, dispensaries.json data
- **CONTEXT.md** — User decisions from discuss-phase
- **Actual data analysis** — Tag counts (MTC Priority: 101, Social Equity: 67, Economic Empowerment: 38), county distribution (14 counties, 524/525 with county data), 0 records with 2+ tags

### Secondary (MEDIUM confidence)
- URLSearchParams API — well-documented Web API, stable
- Native `<select>` element — HTML standard

### Tertiary (LOW confidence)
- None — this phase uses established web standards and project-specific patterns only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, extending existing patterns
- Architecture: HIGH — Phase 5 was explicitly designed for this composition
- Pitfalls: HIGH — identified from reading actual code and data characteristics
- Data characteristics: HIGH — computed directly from dispensaries.json

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable — no external dependencies changing)

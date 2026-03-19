# Phase 5: Search System - Research

**Researched:** 2026-03-19
**Domain:** Client-side fuzzy search for static Astro site (Fuse.js, vanilla JS, URL state)
**Confidence:** HIGH

## Summary

Phase 5 adds instant client-side search to the existing static homepage. The locked decision is Fuse.js with a pre-built index served as static JSON. The 525-record dataset is small enough that Fuse.js handles it trivially -- the search index (tradeName, town, owner only) will be under 50KB, and Fuse.js itself is ~5KB gzipped. The architecture is: a build-time script generates `search-index.json` using `Fuse.createIndex()`, the client fetches it asynchronously, and search filters the existing server-rendered card grid by toggling CSS display.

The main technical decisions are: (1) show/hide existing DOM cards rather than re-rendering, (2) use `data-*` attributes on cards for identification and sorting, (3) use `history.replaceState` for URL sync with debounce, and (4) lazy-load the Fuse.js library + index so the card grid is immediately browsable. Phase 6 filter composition must be planned for -- search state should be isolated so filters can intersect with it.

**Primary recommendation:** Use Fuse.js 7.x with a pre-built serialized index, vanilla JS client script in a `<script>` tag, and DOM show/hide on existing server-rendered cards.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Search results display: Filter the existing card grid in-place -- matching cards remain, non-matching cards disappear
- "Showing X of 525 dispensaries" count updates in real time as user types
- Instant filter -- no fade animation, cards appear/disappear immediately
- No text highlighting within cards -- cards look the same, just filtered
- Clearing the search bar (backspace or X button) restores the full 525-card grid
- Results ranked by relevance (best match first), not alphabetical
- Search bar: Large and central in the hero section, replaces `<!-- Phase 5: search bar goes here -->` placeholder
- Placeholder text: "Search by name, town, or owner"
- Magnifying glass icon on the left side of the input
- Clear (X) button appears on the right when text is entered
- Must work well on both mobile and desktop
- Moderate fuzzy matching: prefix matching plus minor typo tolerance (1-2 character errors)
- Search activates from the first character typed -- no minimum character threshold
- Searches across dispensary name, town, and owner fields
- Name matches weighted higher than town/owner matches
- Search index pre-built at build time and served as static JSON (DATA-03)
- URL updates with search query (?q=worcester) for shareable/bookmarkable results
- Back button undoes search
- Card grid remains fully usable for browsing while search index loads
- Zero results: friendly empty state message -- "No dispensaries match '[query]'. Try a different name, town, or owner."
- The "Showing X of 525" count shows 0 when no results match

### Claude's Discretion
- Search bar loading state approach
- Fuse.js configuration (threshold, distance, keys, weights)
- Search index format and pre-build script details
- Debounce timing for search input
- Search bar exact dimensions and styling
- Mobile search bar behavior (full-width, keyboard handling)

### Deferred Ideas (OUT OF SCOPE)
- Filter pills composing with search -- Phase 6
- Search suggestions/autocomplete dropdown -- future enhancement
- Search analytics (popular queries) -- v2 scope
- Voice search -- out of scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRCH-01 | User can type a dispensary name into a search bar and see matching results instantly as they type (no submit button) | Fuse.js with `input` event listener, debounced at 150ms, filtering DOM cards in real time |
| SRCH-02 | User can search by town name and see all dispensaries in that town | Fuse.js `keys` config includes `town` field with weight |
| SRCH-03 | User can search by owner name and see all dispensaries they own | Fuse.js `keys` config includes `owner` field with weight |
| DATA-03 | Search index is pre-built at build time and served as static JSON | `Fuse.createIndex()` in build script, serialized to `search-index.json`, loaded via `fetch()` |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Fuse.js | 7.1.0 | Client-side fuzzy search | Zero dependencies, ~5KB gzipped, pre-built index support, standard for static sites |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | - | - | Vanilla JS handles DOM manipulation, URL state, and event handling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Fuse.js | Lunr.js | Lunr is faster per-search but heavier (~8KB), no fuzzy by default, requires stemmer config. Fuse is simpler and user locked it. |
| Fuse.js | FlexSearch | Faster for large datasets but more complex API. 525 records is trivial for Fuse. |
| Fuse.js | Simple string matching | No fuzzy/typo tolerance, would need hand-rolled ranking. |

**Installation:**
```bash
npm install fuse.js
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  pages/
    index.astro          # Search bar HTML + inline <script> for search logic
  data/
    dispensaries.json     # Source data (existing, 426KB)
    search-index.json     # NEW: Pre-built Fuse index (~30-50KB)
    search-data.json      # NEW: Minimal search records (slug, tradeName, town, owner) (~25KB)
scripts/
  build-data.ts          # MODIFY: Add search index generation step
  build-search-index.ts  # OR: Separate script for search index
```

### Pattern 1: Pre-built Index with Async Load
**What:** Generate search index at build time, load it lazily on the client
**When to use:** Always for this phase -- it is a locked decision
**Example:**
```typescript
// scripts/build-search-index.ts (build time)
import Fuse from 'fuse.js';
import fs from 'node:fs';

const dispensaries = JSON.parse(fs.readFileSync('src/data/dispensaries.json', 'utf-8'));

// Extract only searchable fields + slug for matching back to DOM
const searchRecords = dispensaries.map((d: any) => ({
  slug: d.slug,
  tradeName: d.tradeName,
  town: d.town ?? '',
  owner: d.owner?.replace(/\s*\(.*?\)\s*/g, '').trim() ?? '',
}));

const keys = [
  { name: 'tradeName', weight: 2 },
  { name: 'town', weight: 1 },
  { name: 'owner', weight: 1 },
];

const index = Fuse.createIndex(keys.map(k => k.name), searchRecords);

fs.writeFileSync('src/data/search-data.json', JSON.stringify(searchRecords));
fs.writeFileSync('src/data/search-index.json', JSON.stringify(index.toJSON()));
```

### Pattern 2: DOM Show/Hide with Data Attributes
**What:** Server-rendered cards get `data-slug` attributes; search hides/shows by toggling display
**When to use:** When filtering an existing static grid (this phase)
**Example:**
```html
<!-- In index.astro, each card gets a data attribute -->
<div data-slug={dispensary.slug} class="dispensary-card">
  <DispensaryGridCard dispensary={dispensary} />
</div>
```
```javascript
// Client-side: show matching cards, hide others
function applySearchResults(results) {
  const allCards = document.querySelectorAll('[data-slug]');
  const matchingSlugs = new Set(results.map(r => r.item.slug));

  allCards.forEach(card => {
    card.style.display = matchingSlugs.has(card.dataset.slug) ? '' : 'none';
  });

  // Reorder: move matching cards to top in relevance order
  const grid = document.querySelector('.dispensary-grid');
  results.forEach(r => {
    const card = document.querySelector(`[data-slug="${r.item.slug}"]`);
    if (card) grid.appendChild(card); // moves to end = relevance order
  });
}
```

### Pattern 3: URL State with replaceState + popstate
**What:** Sync search query to `?q=` parameter for shareable URLs and back-button support
**When to use:** Required -- locked decision
**Example:**
```javascript
// Source: MDN History API docs
function updateURL(query) {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set('q', query);
  } else {
    url.searchParams.delete('q');
  }
  history.replaceState({ q: query }, '', url);
}

// On page load, check for ?q= and pre-fill search
const initialQuery = new URLSearchParams(window.location.search).get('q');
if (initialQuery) {
  searchInput.value = initialQuery;
  performSearch(initialQuery);
}

// Back button support
window.addEventListener('popstate', (e) => {
  const q = e.state?.q ?? '';
  searchInput.value = q;
  performSearch(q);
});
```

### Pattern 4: Phase 6 Composition Architecture
**What:** Structure search state so filters can compose with it
**When to use:** Must plan for now even though Phase 6 implements filters
**Example:**
```javascript
// Search produces a Set of matching slugs (or null = "all match")
// Phase 6 filters will produce another Set of matching slugs
// Final visible set = intersection of both Sets
// For now, search is the only filter source

let searchMatchSlugs = null; // null = no search active (show all)

function applyVisibility() {
  const allCards = document.querySelectorAll('[data-slug]');
  allCards.forEach(card => {
    const slug = card.dataset.slug;
    const visible = searchMatchSlugs === null || searchMatchSlugs.has(slug);
    card.style.display = visible ? '' : 'none';
  });
}
```

### Anti-Patterns to Avoid
- **Re-rendering cards with innerHTML:** Server-rendered cards have correct Tailwind classes and event handlers. Rebuilding them loses SSR benefits and risks XSS. Show/hide existing DOM instead.
- **Loading full dispensaries.json for search:** The 426KB file has 20+ fields per record. Build a minimal search-data.json with only slug + searchable fields.
- **pushState on every keystroke:** Creates hundreds of history entries. Use `replaceState` during typing, only `pushState` on distinct search transitions (or just replaceState always).
- **Blocking page render on search load:** Fuse.js + index must load async. The card grid is already visible and browsable from SSR.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fuzzy matching | Custom string distance algorithm | Fuse.js | Handles Unicode, typo tolerance, prefix matching, weighted fields |
| Search index | Runtime indexing on page load | `Fuse.createIndex()` at build time | 525 records index in <100ms but pre-building eliminates even that delay |
| Debounce | Manual setTimeout tracking | Simple 4-line debounce utility | Easy to get wrong with rapid input |
| URL encoding | Manual query string building | `URLSearchParams` API | Handles encoding edge cases (spaces, special chars) |

**Key insight:** The dataset is small (525 records), so Fuse.js is more than sufficient. Do not over-engineer with web workers, virtual scrolling, or pagination -- those are for 10K+ datasets.

## Common Pitfalls

### Pitfall 1: content-visibility: auto Breaks Search Visibility Toggle
**What goes wrong:** Cards use `content-visibility: auto` (already in DispensaryGridCard). When you set `display: none` and then restore `display: ''`, the browser may not correctly calculate the card's intrinsic size, causing layout jumps.
**Why it happens:** `content-visibility: auto` skips rendering for off-screen elements; toggling display interacts poorly with this optimization.
**How to avoid:** Test thoroughly. If layout issues appear, consider using `visibility: hidden` + `height: 0` + `overflow: hidden` instead of `display: none`, or temporarily remove `content-visibility` during active search.
**Warning signs:** Cards have incorrect height after search is cleared, or grid has blank gaps.

### Pitfall 2: Card Reordering Performance
**What goes wrong:** Moving 525 DOM nodes for relevance sorting on every keystroke causes jank.
**Why it happens:** `appendChild` triggers reflow for each moved element.
**How to avoid:** Only reorder when search results stabilize (debounce handles this). For 525 cards, batch reordering using `DocumentFragment` or simply toggling display without reordering (show matching cards in their original order). Relevance ordering is a "nice to have" -- cards are already alphabetical, and showing matching cards in alpha order is acceptable if reorder causes perf issues.
**Warning signs:** Typing feels laggy, FPS drops below 30 during search.

### Pitfall 3: Owner Field Contains Parenthetical Roles
**What goes wrong:** Searching for "Christopher" matches the raw owner "Christopher Taloumis (Founder/CEO)" but the parenthetical noise degrades fuzzy matching quality.
**Why it happens:** Owner field in dispensaries.json includes role info in parentheses.
**How to avoid:** Strip parenthetical content from owner field when building search records (already done in card display: `.replace(/\s*\(.*?\)\s*/g, '').trim()`).
**Warning signs:** Irrelevant results when searching owner names.

### Pitfall 4: Empty Search vs No Search
**What goes wrong:** Treating an empty search input the same as "no results" -- showing zero cards instead of all cards.
**Why it happens:** `fuse.search('')` returns an empty array in Fuse.js.
**How to avoid:** Check for empty/whitespace query before calling `fuse.search()`. Empty query = show all cards (null search state).
**Warning signs:** All cards disappear when search bar is focused but empty.

### Pitfall 5: URL State Race Condition on Page Load
**What goes wrong:** Page loads with `?q=worcester` but search index hasn't loaded yet, so initial search doesn't work.
**Why it happens:** Index loads async; URL is parsed immediately.
**How to avoid:** Queue the initial search query and execute it once the index finishes loading. Disable search input until ready (or show loading hint).
**Warning signs:** Shared search URLs don't show filtered results on first load.

## Code Examples

### Fuse.js Configuration (Recommended)
```javascript
// Source: https://www.fusejs.io/api/options.html
const fuseOptions = {
  keys: [
    { name: 'tradeName', weight: 2 },   // Name matches rank highest
    { name: 'town', weight: 1 },
    { name: 'owner', weight: 1 },
  ],
  threshold: 0.3,          // Moderate fuzzy: allows 1-2 char typos, not too loose
  distance: 100,           // Default; how far from expected location to search
  ignoreLocation: true,    // Match anywhere in the string, not biased to start
  includeScore: true,      // For debugging/tuning; can remove in production
  minMatchCharLength: 1,   // Activate from first character (locked decision)
  shouldSort: true,        // Results sorted by relevance score
};
```

### Debounce Utility
```javascript
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```

### Search Bar HTML (Tailwind v4)
```html
<div class="relative mt-6 max-w-xl mx-auto">
  <!-- Magnifying glass icon (left) -->
  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
       fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>

  <input
    type="search"
    id="search-input"
    placeholder="Search by name, town, or owner"
    autocomplete="off"
    class="w-full pl-12 pr-12 py-4 text-lg rounded-xl border border-gray-300
           shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500
           outline-none transition-shadow"
  />

  <!-- Clear button (right, shown when input has text) -->
  <button
    id="search-clear"
    type="button"
    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden"
    aria-label="Clear search"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M6 18L18 6M6 6l12 12"/>
    </svg>
  </button>
</div>
```

### Async Index Loading Pattern
```javascript
// Load Fuse.js and search index after page is interactive
async function initSearch() {
  const [{ default: Fuse }, searchData, indexData] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.mjs'),
    fetch('/data/search-data.json').then(r => r.json()),
    fetch('/data/search-index.json').then(r => r.json()),
  ]);

  const index = Fuse.parseIndex(indexData);
  const fuse = new Fuse(searchData, fuseOptions, index);

  // Enable search input
  searchInput.disabled = false;
  searchInput.placeholder = 'Search by name, town, or owner';

  // Execute queued search from URL if present
  const q = new URLSearchParams(window.location.search).get('q');
  if (q) {
    searchInput.value = q;
    performSearch(q);
  }
}
```

**Note on loading approach:** Fuse.js can be loaded via CDN ESM import (zero build config) or installed as npm dependency and bundled by Astro/Vite. CDN is simpler for a static site with no existing client-side JS; npm install is cleaner if Astro's build handles it. Recommendation: install via npm and let Vite tree-shake it, since the project already uses Vite via Astro.

### Vite Client Script in Astro
```astro
<!-- In index.astro, at the bottom -->
<script>
  import Fuse from 'fuse.js';

  // This runs client-side; Vite bundles fuse.js automatically
  const searchInput = document.getElementById('search-input');
  // ... rest of search logic
</script>
```

Astro `<script>` tags are processed by Vite -- imports are resolved, bundled, and tree-shaken automatically. This is the idiomatic Astro approach for client-side interactivity.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fuse.js v6 (CommonJS) | Fuse.js v7.1.0 (ESM native) | 2024 | Direct ESM import works with Vite/Astro without config |
| Runtime index creation | Pre-built index with `createIndex()` + `parseIndex()` | Fuse.js v6+ | Eliminates client-side indexing delay |
| jQuery-based DOM manipulation | Vanilla JS with `querySelectorAll`, `URLSearchParams`, `history` | 2020+ | No framework needed for 525-element show/hide |

**Deprecated/outdated:**
- Fuse.js v5 `tokenize` option: replaced by `useExtendedSearch` in v6+
- `location` option importance: use `ignoreLocation: true` for content search (vs. searching at specific position)

## Open Questions

1. **Card reordering by relevance vs. keeping alphabetical order**
   - What we know: User wants "results ranked by relevance (best match first)". DOM reordering 525 nodes is doable but has performance cost.
   - What's unclear: Whether the perf cost is noticeable on target devices. 525 `appendChild` calls in a debounced handler should be fine.
   - Recommendation: Implement relevance reordering with DocumentFragment. If laggy, fall back to showing matches in original alphabetical order (still filtered, just not reordered).

2. **Search data served from /data/ vs public/ directory**
   - What we know: Astro serves files in `public/` as static assets. Files in `src/data/` are for build-time content collections.
   - What's unclear: Best practice for runtime-fetched JSON in Astro.
   - Recommendation: Write `search-data.json` and `search-index.json` to `public/data/` so they're served as static files at `/data/search-data.json`. Or use an Astro API endpoint to serve them (but that requires SSR). Static files in `public/` is simpler and matches the static-site constraint.

3. **Fuse.js via npm install vs CDN**
   - What we know: Astro `<script>` tags are Vite-processed; `import Fuse from 'fuse.js'` will be bundled automatically if installed via npm.
   - Recommendation: npm install. Vite handles bundling, tree-shaking, and cache-busting. CDN adds external dependency risk.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | Inferred from package.json (no vitest.config.ts -- uses Vite config) |
| Quick run command | `npm test` (vitest run --reporter=verbose) |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-01 | Typing in search bar produces matching results instantly | integration (manual) | Manual browser test -- DOM interaction not testable in vitest alone | No -- manual |
| SRCH-02 | Searching by town shows all dispensaries in that town | unit | `npx vitest run tests/search.test.ts -t "town"` | No -- Wave 0 |
| SRCH-03 | Searching by owner shows all dispensaries they own | unit | `npx vitest run tests/search.test.ts -t "owner"` | No -- Wave 0 |
| DATA-03 | Search index pre-built at build time as static JSON | unit | `npx vitest run tests/search-index.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/search.test.ts` -- unit tests for Fuse.js search configuration (correct results for name, town, owner queries; fuzzy matching behavior; empty query handling)
- [ ] `tests/search-index.test.ts` -- validates build script produces valid search-data.json and search-index.json (correct fields, parseable by Fuse.parseIndex)
- [ ] `fuse.js` npm dependency -- `npm install fuse.js`

## Sources

### Primary (HIGH confidence)
- [Fuse.js official docs - Options](https://www.fusejs.io/api/options.html) -- configuration options, defaults, threshold/distance behavior
- [Fuse.js official docs - Indexing](https://www.fusejs.io/api/indexing.html) -- createIndex(), parseIndex(), serialization API
- [Fuse.js official docs - Installation](https://www.fusejs.io/getting-started/installation.html) -- v7.1.0, ESM support, CDN URLs
- [MDN History API - pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) -- URL state management

### Secondary (MEDIUM confidence)
- [Astro + Fuse.js integration blog](https://alejandrocelaya.blog/2023/11/05/build-a-search-page-for-your-astro-static-blog-with-fuse-js/) -- confirmed Astro script tag + Fuse.js pattern works
- [Static search with Fuse.js](https://gummibeer.dev/blog/2021/static-search-with-fusejs/) -- pre-built index pattern for static sites
- [Bundlephobia fuse.js](https://bundlephobia.com/package/fuse.js@6.6.2) -- bundle size verification (~5KB gzipped for v6; v7 similar)

### Tertiary (LOW confidence)
- Card reordering performance with 525 elements -- no benchmarks found; estimate based on general DOM manipulation knowledge. Needs validation during implementation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Fuse.js is the de facto client-side fuzzy search for static sites, well-documented, user locked it
- Architecture: HIGH -- Pre-built index + DOM show/hide is a well-established pattern for Astro/static sites
- Pitfalls: MEDIUM -- content-visibility interaction and reordering perf are based on general knowledge, not tested with this specific codebase
- Fuse.js config (threshold/weights): MEDIUM -- recommended values are starting points that may need tuning with actual data

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable domain, Fuse.js 7.x is mature)

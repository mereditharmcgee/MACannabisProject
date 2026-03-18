# Architecture Research

**Domain:** Static directory site with client-side search (cannabis dispensary ownership)
**Researched:** 2026-03-17
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
BUILD TIME (Node.js / Astro)
================================================================

  ┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
  │ Spreadsheet  │───>│  Data Pipeline   │───>│ Validated    │
  │ (CSV/Excel)  │    │  (parse + clean) │    │ JSON Data    │
  └──────────────┘    └──────────────────┘    └──────┬───────┘
                                                     │
                       ┌─────────────────────────────┤
                       │                             │
                       v                             v
              ┌─────────────────┐        ┌───────────────────┐
              │ Page Generator  │        │ Search Index      │
              │ (Astro SSG)     │        │ Builder           │
              │                 │        │ (Fuse.createIndex) │
              └────────┬────────┘        └────────┬──────────┘
                       │                          │
                       v                          v
              ┌─────────────────┐        ┌───────────────────┐
              │ 525+ HTML pages │        │ search-index.json │
              │ (detail pages)  │        │ search-data.json  │
              └────────┬────────┘        └────────┬──────────┘
                       │                          │
================================================================
                       v                          v
DEPLOY (Cloudflare Pages CDN)
================================================================

  ┌──────────────────────────────────────────────────────────┐
  │                    Static Assets                          │
  │  /index.html           (search-first homepage)           │
  │  /dispensary/[slug]/   (525 detail pages)                │
  │  /owner/[slug]/        (owner group pages)               │
  │  /search-index.json    (pre-built Fuse.js index)         │
  │  /search-data.json     (lightweight search records)      │
  │  /assets/              (CSS, JS, images)                 │
  └──────────────────────────────────────────────────────────┘

================================================================

RUNTIME (Browser)
================================================================

  ┌────────────────────────────────────────────────────────┐
  │  Homepage loads → fetches search-data.json +           │
  │  search-index.json → initializes Fuse.js instance      │
  │  → user types → instant fuzzy search → results render  │
  │  → click result → navigates to pre-rendered HTML page  │
  └────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Data Pipeline | Convert spreadsheet to validated, typed JSON | Node.js script: read CSV/Excel, validate with Zod, output JSON |
| Content Collection | Make JSON data queryable by Astro at build time | Astro content collection with `file()` loader + CSV parser |
| Page Generator | Produce one HTML page per dispensary + owner pages | Astro `getStaticPaths()` in `[slug].astro` dynamic route files |
| Search Index Builder | Pre-compute Fuse.js index at build time | Build script using `Fuse.createIndex()`, writes JSON to public/ |
| Search UI | Instant typeahead search with filter pills | Lightweight client-side JS (vanilla or Preact island) |
| Detail Page Template | Render dispensary info, ownership narrative, structured data | Astro component with JSON-LD schema markup |
| Filter System | County dropdown, ownership tags, MSO/Independent toggle | Client-side JS filtering on the search-data.json dataset |

## Recommended Project Structure

```
src/
├── content/
│   └── config.ts              # Content collection definitions + Zod schemas
├── data/
│   └── dispensaries.csv       # Source spreadsheet data (or .json after pipeline)
├── layouts/
│   └── BaseLayout.astro       # HTML shell: head, nav, footer
├── pages/
│   ├── index.astro            # Search-first homepage
│   ├── dispensary/
│   │   └── [slug].astro       # Dynamic route: one page per dispensary
│   └── owner/
│       └── [slug].astro       # Dynamic route: one page per owner/company
├── components/
│   ├── SearchBox.astro        # Search input + typeahead container
│   ├── SearchResults.astro    # Card grid for results
│   ├── FilterBar.astro        # Tag pills, county dropdown, MSO toggle
│   ├── DispensaryCard.astro   # Card component for search results
│   └── OwnershipBadge.astro   # Badge component for ownership tags
├── scripts/
│   ├── search.ts              # Client-side: Fuse.js init, typeahead logic
│   └── filters.ts             # Client-side: filter state management
├── styles/
│   └── global.css             # Global styles + design tokens
└── utils/
    └── slugify.ts             # Shared slug generation for consistent URLs
scripts/
├── build-search-index.ts      # Build-time: generate Fuse.js index + search data
└── validate-data.ts           # Build-time: validate CSV data against schema
public/
├── favicon.svg
└── (search-index.json)        # Generated at build time, not checked in
```

### Structure Rationale

- **content/ + data/:** Astro content collections give you typed, validated data access at build time. The CSV lives in `src/data/` and is loaded via a custom parser in the collection config. This keeps the data pipeline inside Astro's build rather than requiring a separate pre-processing step.
- **pages/dispensary/[slug].astro:** Astro's file-based routing with `getStaticPaths()` generates one HTML page per dispensary at build time. Each page is fully pre-rendered for SEO -- crawlers see complete HTML with structured data, no JavaScript required to render content.
- **pages/owner/[slug].astro:** Groups dispensaries by owner/parent company. Creates "Curaleaf Massachusetts locations" style pages that capture ownership-related search queries.
- **scripts/ (root):** Build-time scripts that run before or during `astro build`. Separated from `src/scripts/` (client-side code) to make the build-time vs. runtime boundary explicit.
- **components/:** All Astro components are server-rendered by default (zero JS shipped). Only the search and filter components need client-side interactivity.

## Architectural Patterns

### Pattern 1: Build-Time Data Pipeline (Spreadsheet to Static Pages)

**What:** Transform the source spreadsheet into validated JSON at build time, then use Astro's content collections to generate static pages from that data.
**When to use:** When your data source is a flat file (CSV, Excel) that changes infrequently (monthly updates).
**Trade-offs:** Simple, no runtime cost, excellent SEO. But every data change requires a rebuild and redeploy (trivially automated via git push to Cloudflare Pages).

```typescript
// src/content/config.ts
import { defineCollection, z } from "astro:content";
import { file } from "astro/loaders";
import { parse as parseCsv } from "csv-parse/sync";

const dispensaries = defineCollection({
  loader: file("src/data/dispensaries.csv", {
    parser: (text) => parseCsv(text, { columns: true, skip_empty_lines: true })
  }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    town: z.string(),
    county: z.string(),
    address: z.string(),
    phone: z.string().optional(),
    license_type: z.enum(["Retail", "Delivery", "Medical"]),
    owner_name: z.string(),
    parent_company: z.string().optional(),
    is_mso: z.boolean(),
    tags: z.array(z.string()),  // ["women-owned", "social-equity", ...]
    narrative: z.string(),       // 2-3 sentence ownership description
  }),
});

export const collections = { dispensaries };
```

### Pattern 2: Pre-Built Search Index

**What:** Generate the Fuse.js search index at build time rather than computing it in the browser. Ship a lightweight `search-data.json` (only searchable fields) and a `search-index.json` (pre-computed index) as static assets.
**When to use:** Always for static sites with client-side search. Avoids making the user's browser do index computation on page load.
**Trade-offs:** Two extra static files to serve (~50-80KB total for 525 records). Negligible cost for instant search initialization.

```typescript
// scripts/build-search-index.ts
import Fuse from "fuse.js";
import data from "../src/data/dispensaries.json";

// Only include fields needed for search + display in results
const searchData = data.map((d) => ({
  slug: d.slug,
  name: d.name,
  town: d.town,
  county: d.county,
  owner_name: d.owner_name,
  parent_company: d.parent_company,
  tags: d.tags,
  license_type: d.license_type,
  is_mso: d.is_mso,
}));

const fuseOptions = {
  keys: [
    { name: "name", weight: 0.4 },
    { name: "owner_name", weight: 0.3 },
    { name: "town", weight: 0.2 },
    { name: "parent_company", weight: 0.1 },
  ],
  threshold: 0.3,
  includeScore: true,
};

const index = Fuse.createIndex(fuseOptions.keys, searchData);

// Write both files to public/ for static serving
writeFileSync("public/search-data.json", JSON.stringify(searchData));
writeFileSync("public/search-index.json", JSON.stringify(index.toJSON()));
```

### Pattern 3: Astro Islands for Interactive Search

**What:** The homepage is server-rendered HTML by default (zero JS). The search box and results area are an "island" of interactivity -- a small client-side component that hydrates on page load to enable typeahead search and filtering.
**When to use:** When most of the page is static content but one section needs interactivity. Astro's islands architecture is designed exactly for this.
**Trade-offs:** Keeps the JS payload minimal. The search island is the only JavaScript shipped on the homepage. Detail pages ship zero JS (pure HTML/CSS).

```astro
---
// src/pages/index.astro -- server-rendered shell
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout title="MA Cannabis Dispensary Ownership Directory">
  <h1>Who Owns Your Dispensary?</h1>

  <!-- This is the interactive island: hydrates on load -->
  <div id="search-app">
    <input type="search" id="search-input" placeholder="Search by dispensary, town, or owner..." />
    <div id="filter-bar"><!-- filter pills rendered here --></div>
    <div id="results"><!-- cards rendered here --></div>
  </div>

  <!-- Vanilla JS island — no framework needed for this scope -->
  <script src="../scripts/search.ts"></script>
</BaseLayout>
```

## Data Flow

### Build-Time Data Flow

```
Spreadsheet (CSV)
    |
    v
Astro Content Collection (file loader + CSV parser)
    |
    ├──> Zod validation (reject bad rows, log warnings)
    |
    ├──> getStaticPaths() in [slug].astro
    |       |
    |       v
    |    525 pre-rendered HTML detail pages
    |    (each with JSON-LD structured data)
    |
    ├──> getStaticPaths() in owner/[slug].astro
    |       |
    |       v
    |    ~200 owner group pages
    |
    └──> build-search-index.ts
            |
            v
         search-data.json (~40KB)
         search-index.json (~30KB)
```

### Runtime Search Flow

```
User lands on homepage
    |
    v
Browser fetches search-data.json + search-index.json (cached by CDN)
    |
    v
Fuse.js initializes with pre-built index (instant, no computation)
    |
    v
User types in search box
    |
    v
Fuse.search() returns ranked results (< 5ms for 525 records)
    |
    ├──> Filter engine applies active filters (tags, county, MSO toggle)
    |
    v
DOM updates: render matching DispensaryCard elements
    |
    v
User clicks a card → browser navigates to /dispensary/[slug]/ (full page load, pre-rendered HTML)
```

### Monthly Data Update Flow

```
Researcher updates spreadsheet
    |
    v
Export/save CSV to src/data/dispensaries.csv
    |
    v
git commit + push to main branch
    |
    v
Cloudflare Pages auto-builds (runs astro build + search index script)
    |
    v
New static files deployed to CDN edge (~1-2 min)
```

### Key Data Flows

1. **Spreadsheet to Pages:** CSV is parsed at build time by Astro's content collection loader, validated against a Zod schema, and used to generate static HTML pages via `getStaticPaths()`. Each page is a complete, standalone HTML document with no runtime data fetching.

2. **Search Index Delivery:** The pre-built Fuse.js index and a stripped-down search dataset are served as static JSON files from the CDN. The browser fetches both on homepage load, initializes Fuse.js with the pre-parsed index (skipping expensive index computation), and provides instant fuzzy search.

3. **Filter + Search Interaction:** Filters and search work together client-side. Search narrows by text match (Fuse.js), filters narrow by attribute (tag, county, MSO status). Both operate on the same in-memory dataset. No server round-trips.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 525 records (current) | No concerns. ~40KB search data, ~30KB index. Full dataset in memory is trivial. All pages pre-rendered. |
| 2,000 records | Still fine. Search data ~150KB. Consider lazy-loading search assets (fetch on first input focus instead of page load). |
| 10,000+ records | Consider pagefind (static search engine) instead of Fuse.js. It builds a chunked index that loads only relevant segments. Or add Cloudflare Workers for server-side search. |

### Scaling Priorities

1. **First bottleneck (won't happen at 525):** Search data JSON size. At current scale, the entire dataset is smaller than a single hero image. Not a concern.
2. **Second bottleneck (won't happen at 525):** Build time. Astro generates 525+ static pages in seconds. Would only matter at tens of thousands of pages.

The honest reality: this project will never need to scale beyond its current architecture. Massachusetts has a fixed number of cannabis licenses. Even if every license type is included, the ceiling is low hundreds more records.

## Anti-Patterns

### Anti-Pattern 1: Client-Side Data Fetching for Page Content

**What people do:** Render detail pages as empty shells that fetch dispensary data from a JSON API at runtime.
**Why it's wrong:** Destroys SEO. Search engines see empty pages. Adds loading spinners. Increases time-to-content. The whole point of SSG is pre-rendered HTML.
**Do this instead:** Generate complete HTML pages at build time. Every dispensary detail page should be fully rendered with all content in the HTML source. Zero JavaScript needed on detail pages.

### Anti-Pattern 2: Using a Full UI Framework for Search

**What people do:** Add React or Vue just for the search/filter UI on the homepage.
**Why it's wrong:** Ships 30-80KB of framework JavaScript for what amounts to an input handler, a filter function, and some DOM updates. Overkill for the interaction complexity.
**Do this instead:** Use vanilla TypeScript for the search island. Fuse.js handles the hard part (fuzzy matching). The rest is event listeners, DOM manipulation for rendering cards, and filter state. A Preact island (3KB) is acceptable if you strongly prefer JSX, but vanilla TS is the right call for this scope.

### Anti-Pattern 3: Rebuilding the Search Index in the Browser

**What people do:** Ship the raw data and let Fuse.js build the index on page load.
**Why it's wrong:** Wastes user's CPU cycles on work that could be done once at build time. Adds 100-300ms of initialization delay on mobile devices.
**Do this instead:** Use `Fuse.createIndex()` at build time, serialize to JSON, and ship the pre-built index. Runtime initialization becomes a JSON parse (fast) instead of index computation.

### Anti-Pattern 4: One Giant Page Instead of Individual Routes

**What people do:** Build a single-page app where search results expand inline instead of linking to individual dispensary pages.
**Why it's wrong:** Kills the core SEO value proposition. The goal is that "who owns [dispensary name]" queries land on a dedicated, indexable page. SPAs don't get individual page rankings.
**Do this instead:** Generate 525 individual `/dispensary/[slug]/` pages. Each is a unique URL that Google can index. The homepage search links to these pages.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Cloudflare Pages | Git-triggered builds, static hosting | Push to main = auto-deploy. Free tier handles this easily. |
| Cloudflare CDN | Automatic edge caching of all static assets | Search JSON files cached at edge, fast globally. Set `Cache-Control` headers. |
| Google Search Console | Submit sitemap.xml generated at build time | Astro has sitemap integration (`@astrojs/sitemap`). Critical for SEO. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Data Pipeline --> Content Collection | CSV file on disk, read by Astro loader | The CSV is the contract. Schema validation catches issues at build time. |
| Content Collection --> Page Generator | `getCollection()` API | Astro's built-in typed API. Pages never read CSV directly. |
| Build Script --> Search Assets | JSON files written to `public/` | Search index builder reads the same validated data, writes static JSON. |
| Homepage JS --> Search Assets | HTTP fetch of static JSON files | Browser fetches from CDN. No API server. Cache-friendly. |
| Search UI --> Detail Pages | HTML anchor links (`<a href="/dispensary/slug/">`) | Standard navigation. No client-side routing needed. |

## Build Order (Dependencies)

The following build order reflects true dependencies between components:

```
Phase 1: Data Foundation
  └── Data pipeline (CSV parsing, Zod schema, validation)
      This blocks everything else. No validated data = nothing to build.

Phase 2: Core Static Site
  ├── Base layout + global styles (no data dependency, can parallel)
  └── Dispensary detail pages (requires Phase 1 data)
      These are the SEO core -- each page must be a complete,
      indexable HTML document.

Phase 3: Search System
  ├── Search index builder (requires Phase 1 data)
  └── Search UI on homepage (requires index + data JSON)
      Search depends on having the data pipeline working and
      page slugs established.

Phase 4: Filters + Owner Pages
  ├── Filter system (requires search UI from Phase 3)
  ├── Owner group pages (requires Phase 1 data)
  └── Cross-linking (dispensary <-> owner pages)

Phase 5: Polish + SEO
  ├── JSON-LD structured data on detail pages
  ├── Sitemap generation
  ├── Meta tags + Open Graph
  └── "Suggest a correction" form
```

**Why this order:**
- Data pipeline is foundational -- every other component depends on clean, validated data
- Detail pages deliver SEO value even without search (Google indexes them directly)
- Search is high-value but depends on stable data schema and page slugs
- Filters build on top of search infrastructure
- Polish and SEO metadata can be layered on after core functionality works

## Sources

- [Astro Content Collections docs](https://docs.astro.build/en/guides/content-collections/) -- Official documentation on loaders, file() loader, CSV parsing, getStaticPaths
- [Fuse.js Indexing API](https://www.fusejs.io/api/indexing.html) -- Pre-built index pattern with createIndex/parseIndex
- [Astro Project Structure](https://docs.astro.build/en/basics/project-structure/) -- Official folder conventions
- [Fuse.js vs FlexSearch vs Lunr npm trends](https://npmtrends.com/flexsearch-vs-fuse.js-vs-lunr) -- Download/popularity comparison
- [Static site search with Fuse.js and Cloudflare](https://strapi.io/blog/client-side-search-for-static-sites-with-strapi-nextjs-fusejs-and-cloudflare) -- Pattern for pre-built search index on static hosting
- [Building static sites from JSON with Astro](https://dev.solita.fi/2024/12/02/building-static-websites-with-astro.html) -- Data-driven Astro site pattern

---
*Architecture research for: MA Cannabis Dispensary Ownership Directory*
*Researched: 2026-03-17*

# Stack Research

**Domain:** Search-first, SEO-optimized static directory site (~525 records)
**Researched:** 2026-03-17
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | 5.x (latest 5.17) | Static site generator / SSG framework | Purpose-built for content-heavy static sites. Content Collections with the `file()` loader natively ingests JSON arrays -- exactly what a spreadsheet-to-site pipeline needs. Generates one HTML page per dispensary at build time for SEO. First-class Cloudflare Pages support. Astro 5 is battle-tested (15+ months stable) vs. Astro 6 which dropped 7 days ago. |
| Tailwind CSS | 4.2 | Utility-first CSS framework | v4 engine is 5x faster builds, CSS-first config (no tailwind.config.js needed). Ideal for a card-based results grid and responsive filter UI without writing custom CSS. Ships zero unused CSS in production. |
| Fuse.js | 7.1 | Client-side fuzzy search | Zero dependencies, ~6KB gzipped. Fuzzy matching handles typos in dispensary names and town searches. Searches over an in-memory JSON array -- perfect for 525 records (trivial dataset size for client-side). Configurable scoring weights let us boost name matches over town matches. |
| TypeScript | 5.x | Type safety | Astro has first-class TS support. Typed dispensary records catch schema drift when updating from spreadsheet. Low overhead since Astro handles compilation. |

### Data Pipeline

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| PapaParse | 5.x | CSV parsing | 1M+ weekly npm downloads, handles Excel-exported CSV edge cases (quoted fields, BOM, encoding). Used in a Node build script to convert the spreadsheet export to JSON for Astro's content collections. |
| Node.js script (custom) | -- | Spreadsheet-to-JSON pipeline | A simple ~50-line script: read CSV, validate fields, output `src/content/dispensaries.json`. Runs before `astro build`. No need for a full ETL framework for 525 records. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @astrojs/sitemap | latest | XML sitemap generation | Always -- generates sitemap.xml with all 525+ dispensary pages for Google indexing. Built-in Astro integration. |
| astro-seo | latest | SEO meta tags | On every page -- sets title, description, Open Graph, and JSON-LD structured data per dispensary. |
| schema-dts | latest | TypeScript types for Schema.org | During development -- provides autocomplete for LocalBusiness JSON-LD structured data on dispensary pages. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Wrangler CLI | Cloudflare Pages local preview and deployment | `npx wrangler pages dev` for local testing against Cloudflare's environment. Also handles `wrangler pages deploy`. |
| Prettier + prettier-plugin-astro | Code formatting | Formats `.astro` files correctly. Configure once, forget. |
| ESLint | Linting | Standard JS/TS linting. Use flat config (eslint.config.js). |

## Architecture Rationale

### Why Astro 5 and not Astro 6

Astro 6.0 released March 10, 2026 (7 days ago). It requires Node.js 22+, Vite 7, and Zod 4 -- all major version bumps. For a greenfield project shipping in weeks, Astro 5.17 is the pragmatic choice:
- 15+ months of community usage and bug fixes
- All tutorials and Stack Overflow answers target v5
- Content Collections with `file()` loader works identically in both
- Upgrade path to v6 later is straightforward via `@astrojs/upgrade`

**Revisit this decision if the project hasn't started builds within 2 months** -- by then Astro 6 ecosystem will have matured.

### Why Fuse.js and not Pagefind

Pagefind (v1.4) is excellent for full-text search over rendered page content (blogs, docs). But this project needs **structured field search** -- searching dispensary name, town, owner name, and filtering by ownership tags. Fuse.js searches over JSON objects with configurable field weights, which maps directly to the data model. Pagefind would require indexing rendered HTML and loses the ability to filter on structured metadata fields natively.

For 525 records, the entire JSON dataset is ~80-150KB. Loading it all client-side is trivial. Pagefind's chunked loading optimization (designed for 10K+ page sites) adds complexity with no benefit at this scale.

### Why Tailwind 4 and not plain CSS or other frameworks

The site has a well-defined design vocabulary: filter pills, card grids, badge tags, responsive layouts. Tailwind's utility classes map 1:1 to these patterns. v4's CSS-first configuration means no JavaScript config file -- just a CSS `@import "tailwindcss"` and go. The new `@theme` directive in v4 makes setting brand colors clean.

### Why not Next.js, Gatsby, Hugo, or Eleventy

| Framework | Why Not for This Project |
|-----------|--------------------------|
| **Next.js** | Overkill. App Router adds React runtime (~80KB+) to every page for zero interactivity benefit. SSG mode exists but Astro's content pipeline is purpose-built for this exact use case. Cloudflare Pages deployment is simpler with Astro. |
| **Gatsby** | Effectively abandoned. GraphQL data layer adds unnecessary complexity for a single JSON file. Build times are slow. |
| **Hugo** | Fast builds but Go templating is harder to work with than Astro components. No npm ecosystem for search integration. Content Collections equivalent requires manual wiring. |
| **Eleventy** | Viable alternative but less ergonomic. No built-in component model -- would need Nunjucks or Liquid templates. Astro's `.astro` component syntax is cleaner for mixing HTML structure with data. Smaller ecosystem of integrations. |

## Installation

```bash
# Create Astro project
npm create astro@latest ma-cannabis-directory -- --template minimal

# Core dependencies
npm install fuse.js

# SEO
npm install astro-seo schema-dts

# Astro integrations
npx astro add tailwind sitemap

# Data pipeline
npm install papaparse
npm install -D @types/papaparse

# Dev tools
npm install -D prettier prettier-plugin-astro wrangler
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Astro 5.x | Astro 6.x | If starting after May 2026 when ecosystem has stabilized, or if you need the Fonts API or CSP features |
| Fuse.js | Pagefind 1.4 | If the site grows to 5,000+ pages and full-text search over page content becomes more important than structured field search |
| Fuse.js | FlexSearch | If search performance on larger datasets (10K+) becomes an issue -- FlexSearch is faster but has a less intuitive API and larger bundle |
| Tailwind CSS 4 | Plain CSS with CSS Grid/Flexbox | If you want zero build dependencies and the design is simple enough -- but filter pills + badges + responsive cards = lots of repetitive CSS |
| PapaParse | SheetJS (xlsx) | If the source data stays in .xlsx format and you need to read Excel files directly without CSV export step |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Gatsby** | Effectively unmaintained. GraphQL data layer is unnecessary complexity. Long build times. | Astro |
| **Lunr.js** | Unmaintained (last release 2020). No fuzzy matching. Designed for full-text, not structured field search. | Fuse.js |
| **Algolia / Typesense** | External search services add cost, complexity, and a runtime dependency for 525 records that trivially fit in client memory. | Fuse.js (client-side) |
| **React / Vue / Svelte (full SPA)** | Shipping a JS framework runtime for a mostly-static directory site kills SEO and page load. Astro islands handle the small interactive bits (search box, filters). | Astro with vanilla JS islands |
| **WordPress / headless CMS** | Adds hosting cost, security surface, and deployment complexity. Data comes from a spreadsheet -- a JSON file in the repo is simpler and more reliable. | JSON in Astro Content Collections |
| **Bootstrap** | Heavier than needed, opinionated component styles fight against custom design, utility coverage is weaker than Tailwind. | Tailwind CSS 4 |

## Stack Patterns by Variant

**If search needs grow beyond fuzzy name/town/owner matching:**
- Add Pagefind alongside Fuse.js for full-text search of ownership narratives
- Pagefind indexes rendered HTML at build time, Fuse.js handles structured filters
- Because they serve different purposes and can coexist

**If Cloudflare Pages causes issues (unlikely):**
- Deploy to GitHub Pages instead -- Astro supports both with identical static output
- Change only the deploy target, not the stack
- Because Astro generates plain static HTML/CSS/JS with no platform lock-in

**If data updates need to happen more than monthly:**
- Add a GitHub Action that pulls from Google Sheets API, runs PapaParse, commits JSON, and triggers Cloudflare Pages rebuild
- Because the same pipeline works whether triggered manually or by CI

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| astro@5.17 | Node.js 18, 20, 22 | v5 supports Node 18+ (unlike v6 which requires 22+) |
| tailwindcss@4.2 | Astro 5.x via @astrojs/tailwind or Vite plugin | v4 uses CSS-based config, no tailwind.config.js |
| fuse.js@7.1 | Any modern browser, ESM or CJS | Zero dependencies, no compatibility concerns |
| papaparse@5.x | Node.js 18+ | Used at build time only, not shipped to browser |
| wrangler@3.x | Cloudflare Pages | CLI for local dev and deployment |

## Sources

- [Astro official docs: Deploy to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/) -- deployment guide, verified Astro 5 static output compatibility (HIGH confidence)
- [Astro official docs: Content Collections](https://docs.astro.build/en/guides/content-collections/) -- `file()` loader for JSON arrays, config location in v5 (HIGH confidence)
- [Astro 6.0 release blog](https://astro.build/blog/astro-6/) -- confirmed Node 22 requirement, 7-day-old release (HIGH confidence)
- [Cloudflare Pages Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) -- build config, free tier details (HIGH confidence)
- [Fuse.js official site](https://www.fusejs.io/) -- v7.1, API docs, fuzzy search configuration (HIGH confidence)
- [Pagefind official site](https://pagefind.app/) -- v1.4, chunked index architecture, designed for 10K+ pages (HIGH confidence)
- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, performance improvements (HIGH confidence)
- [PapaParse npm](https://www.npmjs.com/package/papaparse) -- 1M+ weekly downloads, CSV parsing (HIGH confidence)
- [Astro 6 InfoQ coverage](https://www.infoq.com/news/2026/02/astro-v6-beta-cloudflare/) -- breaking changes, Node 22 requirement (MEDIUM confidence -- third-party reporting)

---
*Stack research for: MA Cannabis Dispensary Ownership Directory*
*Researched: 2026-03-17*

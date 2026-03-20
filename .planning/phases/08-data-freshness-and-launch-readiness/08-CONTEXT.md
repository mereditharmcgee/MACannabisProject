# Phase 8: Data Freshness and Launch Readiness - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Monthly data update workflow documentation, sitemap generation, performance optimization (best-effort), and launch checklist. This phase makes the site production-ready and maintainable. No new features — just polish, documentation, and SEO infrastructure.

</domain>

<decisions>
## Implementation Decisions

### Performance targets (DSGN-02)
- Best-effort optimization — no heroic measures for a text-only static site
- Optimize what's easy: minify, compress, lazy-load search index
- If homepage is close to 2s on simulated 3G, that's good enough
- Site has no images (only text, badges, SVG icons) — main payload is HTML + Fuse.js search index + filter JS

### Launch checklist
- Site is already deployed and accessible on Cloudflare Pages
- Soft launch — no specific announcement date, share link when ready, let Google index organically
- Pre-launch manual tasks (documented, not automated):
  - Create Formspree form and replace FORMSPREE_ID_PLACEHOLDER in src/pages/correct.astro
  - Final review of 525 records for obvious errors before sharing publicly
- No Google Search Console submission in scope — user handles separately

### Sitemap generation
- Install @astrojs/sitemap integration (robots.txt already references sitemap-index.xml but no sitemap is generated)
- Priority configuration: Claude's discretion (detail pages are the main SEO value)
- Must include all dispensary pages, homepage, terms, and correct pages

### Data update workflow (DATA-04)
- Document in README.md as an "Updating Data" section
- Document the current flow as-is: update XLSX → run build-data.ts → review output → commit and push → auto-deploy
- Honest about manual steps — no automation changes to the pipeline
- Include what to check after a data update (build success, record count, any validation errors)

### Claude's Discretion
- Sitemap priority values for different page types
- Performance optimization specifics (which optimizations to apply)
- README structure and exact wording
- Launch checklist format and level of detail
- Whether to add meta tags for social sharing (og:image, etc.)
- Any Astro build configuration optimizations

</decisions>

<specifics>
## Specific Ideas

- robots.txt already exists in public/ with correct sitemap reference — just needs the actual sitemap generated
- astro.config.mjs already has `site: "https://dispensaries.meredithmcgee.org"` — sitemap plugin can use this
- Build produces 528 pages in ~2.5s — already fast for a static site
- Fuse.js search index and filter JS are the main client-side payload to optimize

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `astro.config.mjs` — site URL configured, trailingSlash: always
- `public/robots.txt` — references sitemap-index.xml
- `scripts/build-data.ts` — XLSX → JSON pipeline
- `src/data/dispensaries.json` — 525 records
- `src/data/stats.json` — aggregate stats

### Established Patterns
- Cloudflare Pages auto-deploy on git push
- Astro static site generation (SSG)
- Build-time data transformation (XLSX → JSON → Content Collections)
- Tailwind CSS v4 with @tailwindcss/vite plugin

### Integration Points
- @astrojs/sitemap needs to be added to astro.config.mjs integrations array
- README.md needs to be created or updated with data workflow docs
- Build pipeline: scripts/build-data.ts → src/data/*.json → Astro build → dist/

</code_context>

<deferred>
## Deferred Ideas

- Automated data pipeline (API/scraper integration with MCC) — v2 scope
- Google Search Console setup and sitemap submission — user handles post-launch
- OpenGraph meta tags / social sharing images — v2 scope (VDSC-03)
- Email newsletter for data update notifications — v2 scope (PLAT-05)

</deferred>

---

*Phase: 08-data-freshness-and-launch-readiness*
*Context gathered: 2026-03-20*

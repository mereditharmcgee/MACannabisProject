# Phase 8: Data Freshness and Launch Readiness - Research

**Researched:** 2026-03-20
**Domain:** Astro sitemap integration, static site performance, documentation, launch readiness
**Confidence:** HIGH

## Summary

Phase 8 is a polish-and-ship phase with no new features. The four deliverables are: (1) install @astrojs/sitemap to generate the sitemap already referenced in robots.txt, (2) document the data update workflow in README.md, (3) verify performance meets the 2-second 3G target (likely already met for a text-only static site), and (4) validate all 525 detail pages return 200 on production. A launch checklist documents the two manual pre-launch tasks (Formspree setup, data review).

The technical risk is very low. The site is already deployed on Cloudflare Pages with auto-deploy on push. The @astrojs/sitemap integration is a drop-in with zero configuration beyond what already exists (site URL is set, trailingSlash is configured). Performance optimization is best-effort -- the main payload is HTML + Fuse.js search index + filter JS with no images.

**Primary recommendation:** This phase is almost entirely documentation and configuration. The sitemap integration is the only code change. Everything else is README content, a build verification script, and a checklist.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Best-effort performance optimization -- no heroic measures for a text-only static site
- Site is already deployed and accessible on Cloudflare Pages
- Soft launch -- no specific announcement date
- Document the current data update workflow as-is in README.md (XLSX -> build-data.ts -> review -> commit -> auto-deploy)
- Install @astrojs/sitemap; Claude configures priority values
- Pre-launch manual tasks documented, not automated: Formspree setup + final data review
- No Google Search Console submission in scope

### Claude's Discretion
- Sitemap priority values for different page types
- Performance optimization specifics (which optimizations to apply)
- README structure and exact wording
- Launch checklist format and level of detail
- Whether to add meta tags for social sharing (og:image, etc.)
- Any Astro build configuration optimizations

### Deferred Ideas (OUT OF SCOPE)
- Automated data pipeline (API/scraper integration with MCC) -- v2 scope
- Google Search Console setup and sitemap submission -- user handles post-launch
- OpenGraph meta tags / social sharing images -- v2 scope (VDSC-03)
- Email newsletter for data update notifications -- v2 scope (PLAT-05)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-04 | Monthly update workflow is documented: update CSV, push to git, site auto-rebuilds | README.md "Updating Data" section documenting XLSX -> build-data.ts -> review -> commit -> deploy pipeline |
| DSGN-02 | Homepage loads in under 2 seconds on a 3G mobile connection | Best-effort performance verification; Lighthouse audit on simulated 3G; text-only site likely already meets target |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @astrojs/sitemap | ^3.7.1 | Automatic sitemap generation at build time | Official Astro integration, referenced in robots.txt already |

### Supporting
No additional libraries needed. This phase uses only what is already installed.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @astrojs/sitemap | Manual sitemap.xml | No reason to hand-roll -- integration handles index + pagination automatically |

**Installation:**
```bash
npm install @astrojs/sitemap
```

## Architecture Patterns

### Sitemap Integration Configuration

The `astro.config.mjs` already has `site` and `trailingSlash` configured, which is all @astrojs/sitemap needs. Add it to the integrations array with a `serialize` function to set per-page priorities.

**Recommended priority values (Claude's discretion):**
- Homepage (`/`): 1.0 -- entry point for all users
- Dispensary detail pages (`/dispensary/*/`): 0.8 -- primary SEO value, the pages people search for
- Terms page (`/terms/`): 0.3 -- low SEO value, legal boilerplate
- Correction page (`/correct/`): 0.3 -- utility page, not search target

**Configuration pattern:**
```typescript
// Source: https://docs.astro.build/en/guides/integrations-guide/sitemap/
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: "https://dispensaries.meredithmcgee.org",
  trailingSlash: "always",
  integrations: [
    sitemap({
      serialize(item) {
        if (item.url === 'https://dispensaries.meredithmcgee.org/') {
          item.priority = 1.0;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/dispensary/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.3;
          item.changefreq = 'yearly';
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### README Data Update Documentation Structure

```
README.md
  ## MA Cannabis Dispensary Ownership Directory
  [Brief project description]

  ## Development
  [How to run locally]

  ## Updating Data
  [Step-by-step workflow: XLSX -> build-data.ts -> review -> commit -> deploy]

  ## Pre-Launch Checklist
  [Manual tasks before sharing publicly]
```

### Anti-Patterns to Avoid
- **Over-engineering the update workflow:** The user explicitly wants the current flow documented as-is. Do not add automation, validation scripts, or CI checks that do not already exist.
- **Performance optimization rabbit holes:** This is a text-only static site on Cloudflare CDN. Do not add service workers, critical CSS extraction, or complex optimization tooling. If it is close to 2s on 3G, that is good enough.
- **Adding og:image without images:** The site has no images. Adding OpenGraph image meta tags is deferred to v2 (VDSC-03). Basic og:title and og:description are fine if they do not already exist, but social sharing images are out of scope.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sitemap generation | Custom XML generation script | @astrojs/sitemap | Handles sitemap index, pagination, proper XML formatting, integration with Astro's page list |
| Performance testing | Custom timing scripts | Lighthouse CLI or browser DevTools | Industry standard, simulates 3G throttling, gives actionable metrics |
| URL validation | Manual browser checks | Simple curl/fetch script or `astro build` output | Build output already lists all generated pages with status |

## Common Pitfalls

### Pitfall 1: Sitemap Not Generated Because of Missing `site` Config
**What goes wrong:** @astrojs/sitemap silently produces nothing if `site` is not set in astro.config.mjs.
**Why it happens:** The integration needs the full URL to generate absolute URLs in the sitemap.
**How to avoid:** Already avoided -- `site: "https://dispensaries.meredithmcgee.org"` is set.
**Warning signs:** Build completes but no sitemap-index.xml in dist/.

### Pitfall 2: robots.txt Sitemap URL Mismatch
**What goes wrong:** robots.txt references one URL but the sitemap is generated at a different path.
**Why it happens:** Default sitemap output is `sitemap-index.xml`, which matches what robots.txt already references.
**How to avoid:** Already handled -- robots.txt references `sitemap-index.xml` and that is the default output filename.
**Warning signs:** Google Search Console reports sitemap not found.

### Pitfall 3: trailingSlash Inconsistency in Sitemap
**What goes wrong:** Sitemap URLs do not match actual page URLs (with or without trailing slash).
**Why it happens:** @astrojs/sitemap respects the `trailingSlash` config, so this should be consistent.
**How to avoid:** Already configured with `trailingSlash: "always"`.
**Warning signs:** 301 redirects when following sitemap URLs.

### Pitfall 4: Forgetting to Verify Formspree FORMSPREE_ID_PLACEHOLDER
**What goes wrong:** Correction form silently fails or shows an error because the placeholder was never replaced.
**Why it happens:** This is a manual step documented in the launch checklist that is easy to forget.
**How to avoid:** Launch checklist explicitly calls this out as step 1.
**Warning signs:** Form submissions go nowhere.

## Code Examples

### Adding @astrojs/sitemap to Existing Config
```typescript
// Source: https://docs.astro.build/en/guides/integrations-guide/sitemap/
// astro.config.mjs - add sitemap to existing config
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://dispensaries.meredithmcgee.org",
  trailingSlash: "always",
  integrations: [
    sitemap({
      serialize(item) {
        if (item.url === 'https://dispensaries.meredithmcgee.org/') {
          item.priority = 1.0;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/dispensary/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.3;
          item.changefreq = 'yearly';
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### URL Validation Script Pattern
```bash
# After deploying, verify all pages return 200
# Build outputs all generated pages -- check dist/ for page count
find dist -name "index.html" | wc -l
# Expected: 528+ (525 dispensary + homepage + terms + correct + any others)

# For production URL validation:
# curl -s -o /dev/null -w "%{http_code}" https://dispensaries.meredithmcgee.org/dispensary/some-slug/
```

### Lighthouse CLI for Performance Check
```bash
# Install globally if needed
npm install -g lighthouse

# Run against production URL with simulated 3G
lighthouse https://dispensaries.meredithmcgee.org/ \
  --only-categories=performance \
  --throttling-method=simulate \
  --output=json --output-path=./lighthouse-report.json

# Or simply use Chrome DevTools -> Lighthouse tab with "Slow 3G" preset
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual sitemap.xml | @astrojs/sitemap auto-generation | Stable since Astro 3.x | Zero maintenance sitemap |
| Complex perf optimization | Cloudflare CDN handles compression, caching | Always | Static sites on CF are fast by default |

**Notes on Cloudflare Pages performance:**
- Cloudflare Pages automatically applies Brotli compression, HTTP/2, and edge caching
- For a text-only static site with no images, the main performance concern is JavaScript payload (Fuse.js search index)
- The search index is already built at build time as static JSON -- lazy-loading it (defer/async) is the main optimization lever

## Discretion Recommendations

Based on Claude's discretion areas from CONTEXT.md:

1. **Sitemap priorities:** Homepage 1.0, dispensary pages 0.8, utility pages 0.3. Monthly changefreq for content pages, yearly for static pages.

2. **Performance optimizations:** Focus on (a) ensuring search index JS loads with `defer` attribute, (b) verifying Astro's built-in minification is active (it is by default for production builds). No need for service workers, critical CSS, or image optimization (no images).

3. **Social sharing meta tags:** Skip for now. OpenGraph images are deferred to v2 (VDSC-03). Basic og:title/og:description may already be covered by existing meta tags from DETL-07. Not worth adding partial OG support without images.

4. **Astro build optimizations:** None needed. Build already produces 528 pages in ~2.5s. Astro 5.x has minification and tree-shaking by default.

5. **Launch checklist format:** Simple markdown checklist in README.md with clear steps. Not a separate document.

## Open Questions

1. **Exact Fuse.js index size**
   - What we know: Search index is pre-built as static JSON, loaded client-side
   - What's unclear: Exact file size in KB -- affects 3G load time calculation
   - Recommendation: Check dist/ output after build; if over 100KB, consider lazy-loading

2. **Existing meta tags coverage**
   - What we know: DETL-07 added unique meta title/description per detail page
   - What's unclear: Whether homepage has adequate meta tags
   - Recommendation: Quick check during implementation; add basic meta if missing

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-04 | Data update workflow documented in README | manual-only | N/A -- documentation content | N/A |
| DSGN-02 | Homepage loads under 2s on 3G | manual-only | Lighthouse audit (browser DevTools) | N/A |
| -- | Sitemap generated with all pages | smoke | `npm run build && find dist -name "sitemap*" -exec echo {} \;` | No -- Wave 0 |
| -- | All 525 detail pages built | smoke | `npm run build && find dist/dispensary -name "index.html" \| wc -l` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test` (existing unit tests still pass)
- **Per wave merge:** `npm run build` (full build produces all pages + sitemap)
- **Phase gate:** Full build + Lighthouse performance check + manual URL spot-check

### Wave 0 Gaps
- [ ] No new test files needed -- this phase is configuration + documentation
- [ ] Verification is via build output inspection and Lighthouse, not unit tests
- [ ] Existing test suite (`npm test`) should continue passing with no changes

## Sources

### Primary (HIGH confidence)
- [Astro Sitemap Integration Docs](https://docs.astro.build/en/guides/integrations-guide/sitemap/) -- full API reference, v3.7.1
- Project source code: astro.config.mjs, package.json, robots.txt, page structure

### Secondary (MEDIUM confidence)
- Cloudflare Pages performance characteristics (well-documented, stable platform)

### Tertiary (LOW confidence)
- None -- this phase requires no novel research

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- @astrojs/sitemap is the official integration, well-documented
- Architecture: HIGH -- configuration is straightforward, project already has all prerequisites
- Pitfalls: HIGH -- pitfalls are well-known and most are already mitigated by existing config

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable -- no fast-moving dependencies)

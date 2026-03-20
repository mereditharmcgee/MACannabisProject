# Roadmap: MA Cannabis Dispensary Ownership Directory

## Overview

This roadmap delivers a search-first, SEO-optimized static directory that answers "who owns this dispensary?" for every licensed cannabis dispensary in Massachusetts. The build order follows the architecture's natural dependency chain: data foundation first (everything depends on clean data), then page generation (SEO value accrues immediately), then search and filters (primary interaction model), then trust/legal features (non-negotiable for launch), and finally performance tuning and launch readiness. Eight phases, each delivering a coherent, independently verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Scaffold and Deploy Pipeline** - Astro project with Tailwind CSS, Cloudflare Pages deployment from git push (completed 2026-03-18)
- [x] **Phase 2: Data Pipeline** - CSV-to-JSON transformation with Zod schema validation that fails the build on bad data (completed 2026-03-18)
- [x] **Phase 3: Detail Pages** - 525 pre-rendered dispensary pages with SEO-friendly URLs, structured data, and ownership narratives (completed 2026-03-18)
- [x] **Phase 4: Homepage and Card Layout** - Responsive homepage with hero section, stats banner, and browsable card grid (completed 2026-03-18)
- [x] **Phase 5: Search System** - Instant typeahead search across dispensary names, towns, and owners with pre-built Fuse.js index (completed 2026-03-19)
- [x] **Phase 6: Filter System** - Ownership tag filter pills, county dropdown, composing with search (MSO/Independent toggle deferred) (completed 2026-03-20)
- [ ] **Phase 7: Trust and Legal** - Correction form, data disclaimer, last-verified dates, and Terms of Service
- [ ] **Phase 8: Data Freshness and Launch Readiness** - Monthly update workflow, performance optimization, and launch checklist completion

## Phase Details

### Phase 1: Project Scaffold and Deploy Pipeline
**Goal**: A working Astro project deploys to Cloudflare Pages on every git push with zero manual steps
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-04
**Success Criteria** (what must be TRUE):
  1. Running `git push` to main triggers an automatic build and deploy on Cloudflare Pages
  2. The deployed site loads a placeholder page at the production URL on meredithmcgee.org
  3. Tailwind CSS utility classes render correctly on the deployed site
**Plans:** 1/1 plans complete

Plans:
- [ ] 01-01-PLAN.md — Scaffold Astro 5 + Tailwind CSS v4, push to GitHub, connect Cloudflare Pages deploy pipeline

### Phase 2: Data Pipeline
**Goal**: The 525-record spreadsheet transforms into validated, structured JSON at build time, and the build fails loudly on invalid data
**Depends on**: Phase 1
**Requirements**: DATA-01, DATA-02
**Success Criteria** (what must be TRUE):
  1. Running the build converts the CSV spreadsheet into structured JSON files consumable by Astro Content Collections
  2. Removing a required field from a CSV row causes the build to fail with a clear error message identifying the problem row and field
  3. All 525 records pass schema validation including dispensary name, owner, town, address, license type, and ownership tags
  4. Owner/parent company names are normalized so the same entity is not represented multiple ways
**Plans:** 3/3 plans complete

Plans:
- [x] 02-01-PLAN.md — Zod schema, XLSX parser, test infrastructure (Wave 1) (completed 2026-03-18)
- [x] 02-02-PLAN.md — Build pipeline script, Content Collections, reports (Wave 2) (completed 2026-03-18)
- [x] 02-03-PLAN.md — Gap closure: fix headerMap mismatch (Owner/Parent), compute derived stats (completed 2026-03-18)

### Phase 3: Detail Pages
**Goal**: Every dispensary has its own pre-rendered page that Google can index, with ownership information, structured data, and cross-links to sibling locations
**Depends on**: Phase 2
**Requirements**: DETL-01, DETL-02, DETL-03, DETL-04, DETL-05, DETL-06, DETL-07
**Success Criteria** (what must be TRUE):
  1. Navigating to `/dispensary/[slug]/` loads a pre-rendered HTML page for each of the 525 dispensaries (no client-side rendering required)
  2. Each detail page displays the dispensary name, owner/parent company, address, phone number (tap-to-call on mobile), license type, and ownership characteristic badges
  3. Each detail page contains a unique 2-3 sentence ownership narrative (not a formulaic template)
  4. Each detail page includes JSON-LD structured data that passes Google Rich Results Test validation
  5. Each detail page links to other dispensaries owned by the same owner/parent company, and those links work
**Plans:** 3/3 plans complete

Plans:
- [x] 03-01-PLAN.md — Slug, narrative, JSON-LD, sibling lib modules with TDD tests + data pipeline update (completed 2026-03-18)
- [x] 03-02-PLAN.md — Astro components and dynamic route rendering 525 detail pages (completed 2026-03-18)
- [x] 03-03-PLAN.md — Visual and functional verification checkpoint (completed 2026-03-18)

### Phase 4: Homepage and Card Layout
**Goal**: Users land on a polished, responsive homepage with a "Who Owns Your Dispensary?" headline, key stats, and a browsable card grid of all dispensaries
**Depends on**: Phase 3
**Requirements**: DSGN-01, DSGN-03, SRCH-08
**Success Criteria** (what must be TRUE):
  1. The homepage displays a prominent "Who Owns Your Dispensary?" headline with key stats (525 Active Licenses, 92% Independently Owned, 156 Towns)
  2. Dispensaries appear as cards showing dispensary name, town, owner, and ownership badge tags
  3. The card grid adapts from a single-column layout on mobile to a multi-column grid on desktop without horizontal scrolling
  4. Clicking a card navigates to that dispensary's detail page
**Plans:** 2/2 plans complete

Plans:
- [x] 04-01-PLAN.md — DispensaryGridCard component with format helpers and TDD tests (Wave 1) (completed 2026-03-18)
- [x] 04-02-PLAN.md — Homepage assembly with hero, stats, card grid, footer, and visual checkpoint (Wave 2) (completed 2026-03-18)

### Phase 5: Search System
**Goal**: Users can find any dispensary instantly by typing a name, town, or owner into the search bar without waiting for a server response
**Depends on**: Phase 4
**Requirements**: SRCH-01, SRCH-02, SRCH-03, DATA-03
**Success Criteria** (what must be TRUE):
  1. Typing in the search bar produces matching results as the user types, with no page reload or submit button needed
  2. Searching for a town name (e.g., "Worcester") shows all dispensaries in that town
  3. Searching for an owner name (e.g., "Curaleaf") shows all dispensaries they own
  4. The search index is pre-built at build time and served as static JSON (no server-side search infrastructure)
  5. The card grid and browse experience remain visible and usable while the search index loads on slow connections
**Plans:** 2/2 plans complete

Plans:
- [x] 05-01-PLAN.md — Build-time Fuse.js search index generation, search bar UI, and client-side search logic (Wave 1) (completed 2026-03-19)
- [x] 05-02-PLAN.md — Visual and functional verification checkpoint (Wave 2) (completed 2026-03-19)

### Phase 6: Filter System
**Goal**: Users can narrow the dispensary grid by ownership tags and county using visual filter controls that compose with existing search
**Depends on**: Phase 5
**Requirements**: SRCH-04, SRCH-05, SRCH-06, SRCH-07
**Success Criteria** (what must be TRUE):
  1. Tapping an ownership filter pill (MTC Priority, Economic Empowerment, Social Equity) immediately filters the visible card grid
  2. Multiple filter pills can be active simultaneously and results reflect the OR union
  3. The MSO/Independent toggle is deferred (independent field has 0 populated records)
  4. The county dropdown filters dispensaries to only those in the selected county
  5. Filters compose with search (searching "Boston" then filtering "Social Equity" shows only Social Equity dispensaries in Boston results)
**Plans:** 2/2 plans complete

Plans:
- [ ] 06-01-PLAN.md — Filter logic module (TDD) + filter UI integration in index.astro (Wave 1)
- [ ] 06-02-PLAN.md — Visual and functional verification checkpoint (Wave 2)

### Phase 7: Trust and Legal
**Goal**: Every listing has a correction mechanism and the site communicates data accuracy context, protecting both users and the publisher
**Depends on**: Phase 3
**Requirements**: TRST-01, TRST-02, TRST-03, TRST-04
**Success Criteria** (what must be TRUE):
  1. Each dispensary detail page has a "Suggest a Correction" form that submits without requiring a login or account
  2. Each listing displays a "Last verified" date showing when the ownership data was last confirmed
  3. The site displays a prominent data accuracy disclaimer explaining data sources and limitations
  4. A Terms of Service / data usage notice page exists and is linked from the site footer
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: Data Freshness and Launch Readiness
**Goal**: The monthly data update process is documented and repeatable, the site meets performance targets, and all launch-blocking items are resolved
**Depends on**: Phase 7, Phase 6
**Requirements**: DATA-04, DSGN-02
**Success Criteria** (what must be TRUE):
  1. A documented workflow exists: update CSV, push to git, site automatically rebuilds and deploys with new data
  2. The homepage loads in under 2 seconds on a simulated 3G mobile connection
  3. All 525 detail page URLs return 200 status codes on the production deployment
  4. The sitemap.xml includes all dispensary and owner pages and is accessible to search engines
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
(Phase 7 depends on Phase 3, so it can potentially run in parallel with 4-6, but sequential execution is simpler.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffold and Deploy Pipeline | 1/1 | Complete    | 2026-03-18 |
| 2. Data Pipeline | 3/3 | Complete    | 2026-03-18 |
| 3. Detail Pages | 3/3 | Complete    | 2026-03-18 |
| 4. Homepage and Card Layout | 2/2 | Complete    | 2026-03-18 |
| 5. Search System | 2/2 | Complete    | 2026-03-19 |
| 6. Filter System | 2/2 | Complete   | 2026-03-20 |
| 7. Trust and Legal | 0/TBD | Not started | - |
| 8. Data Freshness and Launch Readiness | 0/TBD | Not started | - |

# Requirements: MA Cannabis Dispensary Ownership Directory

**Defined:** 2026-03-17
**Core Value:** When someone Googles "who owns [dispensary name]," this site is the answer — a transparent, searchable directory that lets Massachusetts cannabis consumers shop by their values.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Search & Discovery

- [ ] **SRCH-01**: User can type a dispensary name into a search bar and see matching results instantly as they type (no submit button)
- [ ] **SRCH-02**: User can search by town name and see all dispensaries in that town
- [ ] **SRCH-03**: User can search by owner name and see all dispensaries they own
- [ ] **SRCH-04**: User can tap ownership filter pills (Women-Owned, Black-Owned, Veteran-Owned, Social Equity, LGBTQ+-Owned) to filter the card grid
- [ ] **SRCH-05**: User can combine multiple filter pills (e.g., Women-Owned + Independent) to narrow results
- [ ] **SRCH-06**: User can toggle between Independent and MSO Corporate dispensaries
- [ ] **SRCH-07**: User can filter dispensaries by county using a dropdown
- [ ] **SRCH-08**: Search results display as cards showing dispensary name, town, owner, and ownership badge tags

### Detail Pages

- [x] **DETL-01**: Each of 525 dispensaries has its own pre-rendered page with a unique, SEO-friendly URL
- [x] **DETL-02**: Detail page shows dispensary name, owner/parent company, address, phone number (tap-to-call on mobile), and license type
- [x] **DETL-03**: Detail page displays ownership characteristic badges (Women-Owned, Black-Owned, etc.)
- [x] **DETL-04**: Detail page includes a 2-3 sentence ownership narrative unique to that listing
- [x] **DETL-05**: Detail page links to other locations owned by the same owner/parent company
- [x] **DETL-06**: Detail page includes schema.org structured data (JSON-LD) for rich Google search results
- [x] **DETL-07**: Each detail page has a unique meta title and description optimized for "who owns [dispensary name]" queries

### Data Pipeline

- [x] **DATA-01**: Spreadsheet (CSV) is transformed into structured JSON data at build time with schema validation
- [x] **DATA-02**: Build fails if data has missing required fields or invalid values (no silent failures)
- [ ] **DATA-03**: Search index is pre-built at build time and served as static JSON
- [ ] **DATA-04**: Monthly update workflow is documented: update CSV, push to git, site auto-rebuilds

### Trust & Legal

- [ ] **TRST-01**: Each listing has a "Suggest a Correction" form that submits without requiring user login
- [ ] **TRST-02**: Site displays a publisher disclaimer about data accuracy and sources
- [ ] **TRST-03**: Each listing shows a "last verified" date
- [ ] **TRST-04**: Site includes Terms of Service / data usage notice

### Design & Performance

- [ ] **DSGN-01**: Site is fully responsive — card grid adapts from mobile to desktop
- [ ] **DSGN-02**: Homepage loads in under 2 seconds on a 3G mobile connection
- [ ] **DSGN-03**: Homepage features a prominent search bar with "Who Owns Your Dispensary?" headline and key stats (525 Active Licenses, 92% Independently Owned, 157 Towns)
- [ ] **DSGN-04**: Site deploys to Cloudflare Pages from a git push with zero manual deploy steps

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Visual & Discovery

- **VDSC-01**: Map view showing dispensary locations with ownership badges
- **VDSC-02**: Aggregate statistics page ("X% independently owned," ownership breakdown charts)
- **VDSC-03**: OpenGraph meta tags optimized for social media sharing

### Platform

- **PLAT-01**: Dispensary owner claim/edit flow with verification
- **PLAT-02**: Multi-state expansion beyond Massachusetts
- **PLAT-03**: Automated MCC data pipeline (API/scraper integration)
- **PLAT-04**: Public API for third-party access to ownership data
- **PLAT-05**: Email newsletter for data update notifications

## Out of Scope

| Feature | Reason |
|---------|--------|
| Reviews and ratings | Ownership transparency tool, not a quality review site — Leafly/Google handle reviews |
| Product menus / inventory | Requires POS integration and real-time data — Leafly/Weedmaps' core business |
| Deals, ordering, e-commerce | Out of scope for a transparency tool |
| User accounts / authentication | Read-only public resource doesn't need them |
| Real-time data sync (v1) | Manual monthly updates are sufficient; value is in researched context, not raw MCC data |
| Age gate / interstitial | Not a retailer — publishing public records. Would block Googlebot from crawling 525 pages |
| AI-powered recommendations | Over-engineered for 525 listings; cross-links by tag serve the same purpose |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SRCH-01 | Phase 5: Search System | Pending |
| SRCH-02 | Phase 5: Search System | Pending |
| SRCH-03 | Phase 5: Search System | Pending |
| SRCH-04 | Phase 6: Filter System | Pending |
| SRCH-05 | Phase 6: Filter System | Pending |
| SRCH-06 | Phase 6: Filter System | Pending |
| SRCH-07 | Phase 6: Filter System | Pending |
| SRCH-08 | Phase 4: Homepage and Card Layout | Pending |
| DETL-01 | Phase 3: Detail Pages | Complete |
| DETL-02 | Phase 3: Detail Pages | Complete |
| DETL-03 | Phase 3: Detail Pages | Complete |
| DETL-04 | Phase 3: Detail Pages | Complete |
| DETL-05 | Phase 3: Detail Pages | Complete |
| DETL-06 | Phase 3: Detail Pages | Complete |
| DETL-07 | Phase 3: Detail Pages | Complete |
| DATA-01 | Phase 2: Data Pipeline | Complete |
| DATA-02 | Phase 2: Data Pipeline | Complete |
| DATA-03 | Phase 5: Search System | Pending |
| DATA-04 | Phase 8: Data Freshness and Launch Readiness | Pending |
| TRST-01 | Phase 7: Trust and Legal | Pending |
| TRST-02 | Phase 7: Trust and Legal | Pending |
| TRST-03 | Phase 7: Trust and Legal | Pending |
| TRST-04 | Phase 7: Trust and Legal | Pending |
| DSGN-01 | Phase 4: Homepage and Card Layout | Pending |
| DSGN-02 | Phase 8: Data Freshness and Launch Readiness | Pending |
| DSGN-03 | Phase 4: Homepage and Card Layout | Pending |
| DSGN-04 | Phase 1: Project Scaffold and Deploy Pipeline | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after roadmap creation*

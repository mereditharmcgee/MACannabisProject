# Feature Research

**Domain:** Consumer-facing cannabis dispensary ownership transparency directory
**Researched:** 2026-03-17
**Confidence:** HIGH (well-understood domain with clear competitive gap)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist on any directory/lookup site. Missing these and the site feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Instant search with typeahead** | Every modern directory (Leafly, Weedmaps, Yelp, Google Maps) has this. Users will not browse 525 listings manually. | MEDIUM | Client-side with Fuse.js is sufficient for 525 records. Load full JSON index on page load -- small enough to not need Pagefind. Fuzzy matching handles misspellings ("Curalief" finds "Curaleaf"). |
| **Mobile-responsive layout** | 60%+ of directory searches happen on mobile. Non-negotiable. | LOW | CSS-only concern with a card-based grid. No special mobile features needed beyond responsive breakpoints. |
| **Individual listing detail pages** | Users landing from Google expect a dedicated page per dispensary with complete info, not just a search result card. | MEDIUM | Pre-rendered static pages for each of 525 listings. Critical for SEO -- these pages are the primary Google landing targets for "who owns [dispensary name]" queries. |
| **Filter by location (town/county)** | Users want dispensaries near them. Location filtering is table stakes for any local business directory. | LOW | Dropdown or faceted filter. MA has 14 counties and ~200 towns with dispensaries -- county is the right default granularity. |
| **Dispensary name, address, phone on each listing** | Basic NAP (Name, Address, Phone) data is what every business directory shows. Users need it to visit or contact the dispensary. | LOW | Already in the dataset. Display as structured data with schema.org LocalBusiness markup for SEO. |
| **Fast page load** | Users bounce after 1-second delays. Static sites have a natural advantage here. | LOW | SSG inherently delivers this. Keep JS payload small (search index + Fuse.js). No heavy frameworks needed. |
| **Clear ownership information per listing** | This is the core value proposition. If a user arrives and can't immediately see who owns the dispensary, the site has failed. | LOW | Owner name and parent company prominently displayed. This is THE differentiator shown as table stakes because it's the reason the site exists. |
| **Working links/contact info** | Broken links or missing phone numbers erode trust instantly on a directory site. | LOW | Validate data during build pipeline. Flag entries with missing fields. |

### Differentiators (Competitive Advantage)

Features that no competitor offers or that set this site apart. These are where the unique value lives.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Ownership characteristic badges** (Women-Owned, Black-Owned, Veteran-Owned, Social Equity, LGBTQ+-Owned, Independent) | Nobody else offers this. Leafly/Weedmaps show menus and reviews but zero ownership context. The MCC publishes license data but not aggregated ownership tags. This lets consumers shop by values. | LOW | Visual badge/pill UI on cards and detail pages. Data already exists in the spreadsheet. The filtering UX is the key -- toggle pills that feel instant. |
| **MSO vs Independent toggle** | ~92% of MA licenses are independent. Consumers who want to support local/independent businesses can't distinguish them on Leafly or Weedmaps. This is a powerful filter unique to this site. | LOW | Binary toggle or filter pill. Data already categorized. |
| **"Who owns [dispensary]" SEO optimization** | The entire site is built to answer the question nobody else answers. Individual pages with ownership narratives, structured data, and descriptive URLs will capture long-tail search traffic that currently returns nothing useful. | MEDIUM | Requires thoughtful URL structure (/dispensary/curaleaf-hanover), meta descriptions mentioning ownership, and schema.org markup. 525 pages = 525 long-tail keyword opportunities. |
| **Ownership narrative (2-3 sentences per listing)** | Humanizes the data. "This dispensary is owned by Jane Smith, a social equity program participant who..." is far more compelling than a raw data table. Creates unique content Google values. | MEDIUM | Writing 525 short narratives is the bottleneck. Can be templated from data fields and manually refined. This is content other sites cannot replicate because they don't have the research. |
| **Cross-linking by owner** | "See all 4 dispensaries owned by Curaleaf" or "See all dispensaries owned by Jane Smith." No other site connects the ownership graph this way. | LOW | Group listings by parent company/owner in the data model. Link from detail page to a filtered view. |
| **"Suggest a correction" form** | Builds community trust and keeps data accurate. Also signals to users that the site cares about accuracy -- important for a transparency tool. | LOW | Simple form (no auth needed) that emails or posts to a Google Form/Sheet. No moderation system needed for MVP. |
| **Structured data / schema.org markup** | Rich snippets in Google search results increase click-through rates. LocalBusiness schema with ownership info gives this site an SEO edge. | MEDIUM | JSON-LD on each detail page. Use LocalBusiness type with additional Organization for parent company. Google validates structured data and may show enhanced results. |

### Anti-Features (Deliberately NOT Building)

Features that seem useful but would dilute the mission, add complexity, or create maintenance burden.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Reviews and ratings** | Every directory has them (Leafly, Yelp, Google). Users may expect them. | This is an ownership transparency tool, not a quality review site. Reviews require moderation, spam filtering, user accounts, and ongoing maintenance. They also shift focus from "who owns this?" to "is this place good?" -- a different value proposition already served by Leafly/Google. | Link out to Google/Leafly reviews from each listing. Let existing platforms handle quality reviews. |
| **Product menus / inventory** | Leafly and Weedmaps are built around this. Some users may look for it. | Requires POS integration, real-time data feeds, and constant updates. Massive complexity for a static site. This is Leafly/Weedmaps' core business -- don't compete with them. | Link to dispensary's Leafly/Weedmaps page for menu info. |
| **Map view** | Visual way to find nearby dispensaries. Feels natural for a directory. | Requires a mapping library (Leaflet/Google Maps), adds significant JS weight, needs geocoding of all addresses, and is a substantial UX project to do well. Cards-first with location filters serves the same need more simply for MVP. | Defer to v2. The core query is "who owns X?" not "what's near me?" -- and location filters handle the proximity use case adequately. |
| **User accounts / authentication** | Needed for reviews, saved favorites, personalization. | Read-only transparency tool does not benefit from accounts. Adds auth complexity, privacy obligations (GDPR-adjacent), and database requirements that break the static site model. | No accounts. Fully public, fully anonymous access. |
| **Dispensary owner claim/edit flow** | Lets owners update their own listings. Standard in Yelp/Google My Business. | Requires authentication, moderation workflow, abuse prevention, and shifts the site toward a platform model. Premature for 525 manually-curated listings. | "Suggest a correction" form for MVP. Owner claim/edit is a post-launch feature if there's demand. |
| **Real-time data from MCC** | Auto-sync license data from the Cannabis Control Commission. | MCC data is self-reported and doesn't include the ownership context/tags that make this site valuable. Building a scraper/API integration adds complexity without adding the differentiated data. | Monthly manual update workflow. The value is in the researched ownership context, not the raw license data. |
| **Deals, ordering, or e-commerce** | Users on Leafly/Weedmaps expect to see deals and order. | Completely out of scope for a transparency tool. Requires dispensary partnerships, POS integration, and regulatory compliance. | Not applicable. This site answers "who owns it?" not "what should I buy?" |
| **Multi-state expansion** | "Do this for all 50 states!" | Each state requires separate manual research of ownership data. Scaling to 50 states before validating the MA concept is premature optimization. | MA-only for v1. If the model works, expansion is a future project with its own research phase. |
| **AI-powered recommendations** | Trendy feature. "Dispensaries you might like based on your values." | Requires user behavior tracking, recommendation engine, and enough traffic to generate useful signals. Over-engineered for a 525-listing static site. | Simple cross-links by ownership tag serve the same purpose without complexity. |

## Feature Dependencies

```
[Data Pipeline from Spreadsheet]
    |
    |---> [Search Index JSON] ---> [Instant Search/Typeahead]
    |
    |---> [Individual Detail Pages] ---> [SEO Optimization]
    |          |                              |
    |          |---> [Ownership Narratives]   |---> [Schema.org Structured Data]
    |          |
    |          |---> [Cross-links by Owner]
    |          |
    |          |---> [Suggest a Correction Form]
    |
    |---> [Card Grid with Filters]
               |
               |---> [Ownership Badge Filters]
               |
               |---> [Location Filters (Town/County)]
               |
               |---> [MSO vs Independent Toggle]
```

### Dependency Notes

- **Everything requires Data Pipeline:** The spreadsheet-to-JSON/static-page pipeline is the foundation. No feature works without it.
- **Search requires Index:** The search JSON index is generated from the same pipeline that builds detail pages. They share a data source but are separate build outputs.
- **Detail Pages require Data Pipeline:** Each of the 525 pages is generated from the dataset. The ownership narrative is an additional field per record.
- **SEO features require Detail Pages:** Schema.org markup, meta descriptions, and URL structure are properties of the detail page template, not standalone features.
- **Filters are independent of each other:** Ownership badges, location filters, and MSO toggle can be built incrementally. They all operate on the same card grid.
- **Suggest a Correction is independent:** Simple form that can be added at any point. Only dependency is having a detail page to attach it to.
- **Cross-linking by owner enhances Detail Pages:** Adds a "see also" section. Requires grouping logic in the data pipeline but is an enhancement, not a blocker.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to capture "who owns [dispensary]" search traffic.

- [ ] **Data pipeline from spreadsheet to site** -- foundation for everything
- [ ] **Search-first homepage with instant typeahead** -- primary interaction model
- [ ] **Card-based results grid** -- displays dispensary name, town, owner, ownership badges
- [ ] **Ownership badge filter pills** -- Women-Owned, Black-Owned, Veteran-Owned, Social Equity, LGBTQ+-Owned, Independent
- [ ] **County/town location filter** -- basic geographic narrowing
- [ ] **MSO vs Independent toggle** -- unique differentiator, trivial to implement
- [ ] **525 individual SEO-optimized detail pages** -- each with ownership info, address, phone, license type, and ownership narrative
- [ ] **Schema.org LocalBusiness structured data** -- on every detail page for rich search results
- [ ] **Cross-links by owner** -- "See all locations by [owner/parent company]"
- [ ] **Suggest a correction form** -- builds trust, keeps data accurate
- [ ] **Responsive mobile/desktop design** -- CSS-only, card grid adapts

### Add After Validation (v1.x)

Features to add once the site has traffic and user feedback.

- [ ] **Map view** -- add when users specifically request it or analytics show geographic browsing patterns
- [ ] **Advanced analytics / ownership statistics page** -- "X% of MA dispensaries are independently owned" aggregate data visualization
- [ ] **Social sharing optimized cards** -- OpenGraph meta tags with ownership info for sharing on social media
- [ ] **Comparison feature** -- side-by-side ownership comparison of dispensaries
- [ ] **Email newsletter for data updates** -- notify interested users when ownership data changes

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Owner claim/edit flow** -- only if dispensary owners request it
- [ ] **Multi-state expansion** -- only after MA proves the model
- [ ] **Real-time MCC data integration** -- only when manual updates become unsustainable
- [ ] **API for third-party access** -- only if other developers/journalists want programmatic access
- [ ] **Embedded widgets** -- for news sites to embed ownership info in articles

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Data pipeline (spreadsheet to site) | HIGH | MEDIUM | P1 |
| Instant search with typeahead | HIGH | MEDIUM | P1 |
| Individual detail pages (525) | HIGH | MEDIUM | P1 |
| Ownership badge filter pills | HIGH | LOW | P1 |
| Card-based results grid | HIGH | LOW | P1 |
| County/town location filter | MEDIUM | LOW | P1 |
| MSO vs Independent toggle | MEDIUM | LOW | P1 |
| Schema.org structured data | HIGH | LOW | P1 |
| Ownership narratives (2-3 sentences) | HIGH | MEDIUM | P1 |
| Responsive mobile/desktop | HIGH | LOW | P1 |
| Cross-links by owner | MEDIUM | LOW | P1 |
| Suggest a correction form | MEDIUM | LOW | P1 |
| Map view | MEDIUM | HIGH | P3 |
| Aggregate statistics page | LOW | MEDIUM | P2 |
| OpenGraph / social sharing | MEDIUM | LOW | P2 |
| Owner claim/edit flow | LOW | HIGH | P3 |
| Real-time MCC data sync | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Leafly | Weedmaps | MCC License Search | This Site |
|---------|--------|----------|--------------------|-----------|
| Dispensary search | Yes -- by name, location, product | Yes -- by name, location | Yes -- by license number, name | Yes -- by name, town, owner |
| Who owns it? | No | No | Partial -- lists licensee entity name only | **Yes -- owner name, parent company, narrative** |
| Ownership tags (equity, women-owned, etc.) | No | No | No | **Yes -- filterable badges** |
| MSO vs Independent | No | No | No | **Yes -- toggle filter** |
| Product menus | Yes -- core feature | Yes -- core feature | No | No (links out) |
| Reviews/ratings | Yes -- 1.3M+ reviews | Yes | No | No (links out) |
| Map view | Yes | Yes | No | No (v2) |
| Deals/ordering | Yes | Yes | No | No (out of scope) |
| Structured data / SEO | Yes | Yes | Minimal | Yes -- LocalBusiness schema |
| Detail page per listing | Yes | Yes | No -- search results only | Yes -- SEO-optimized with ownership narrative |
| Mobile responsive | Yes | Yes | Partial | Yes |
| Data freshness | Real-time (POS sync) | Real-time (POS sync) | Periodic updates | Monthly manual updates |
| Suggest a correction | Claim your listing | Claim your listing | No | Simple form |

**Competitive gap this site fills:** Nobody answers "who owns this dispensary?" with context. The MCC shows licensee entity names but not parent companies, ownership characteristics, or narratives. Leafly and Weedmaps are product/menu platforms that treat dispensaries as storefronts, not as businesses with owners. This site is the only place a consumer can filter Massachusetts dispensaries by ownership values.

## Sources

- [Leafly Dispensary Directory](https://www.leafly.com/dispensaries) -- competitor feature analysis
- [Weedmaps](https://weedmaps.com/) -- competitor feature analysis
- [MCC Applicants and Licensees](https://masscannabiscontrol.com/applicants-licensees/) -- state data source
- [MCC Open Data](https://masscannabiscontrol.com/open-data/) -- state data availability
- [OpenCorporates](https://opencorporates.com/) -- corporate transparency directory model
- [Google LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business) -- schema.org implementation guide
- [Schema Markup for Dispensaries](https://www.thecannabismarketingagency.com/cannabis-seo/schema-markup) -- cannabis-specific SEO structured data
- [Algolia Search Filter UX Best Practices](https://www.algolia.com/blog/ux/search-filter-ux-best-practices) -- faceted search UX patterns
- [Jasmine Directory Design Ideas](https://www.jasminedirectory.com/blog/business-directory-website-design-ideas/) -- directory design patterns
- [Fuse.js Client-Side Search](https://yihui.org/en/2023/09/fuse-search/) -- static site search implementation
- [Weedmaps vs Leafly Comparison](https://cannaplanners.com/learn/weedmaps-vs-leafly) -- feature comparison

---
*Feature research for: MA Cannabis Dispensary Ownership Directory*
*Researched: 2026-03-17*

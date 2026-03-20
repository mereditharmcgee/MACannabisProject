# Phase 7: Trust and Legal - Context

**Gathered:** 2026-03-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Correction mechanism on every listing, data accuracy disclaimer, per-record last-verified dates, and a Terms of Service page. Protects both users (transparency about data accuracy) and the publisher (liability limitation). This phase does NOT add new data features or change the browsing/search/filter experience.

</domain>

<decisions>
## Implementation Decisions

### Correction form (TRST-01)
- Google Form embedded as an iframe at the bottom of each detail page (below all content, after sibling links)
- Pre-fill dispensary name via URL parameter so users don't have to type it
- Structured fields: pre-filled dispensary name (read-only), dropdown of fields to correct (owner, address, phone, license type, ownership tags, other), "correct value" text field (required), email (optional for follow-up)
- Submissions go to a Google Sheet that Meredith already monitors
- Form embedded on every detail page, not just linked

### Last verified dates (TRST-03)
- Add `lastVerified` column to the spreadsheet/data pipeline
- Optional field — build does NOT fail if missing; detail page simply omits the row when empty
- Display format: "Month Year" (e.g., "March 2026") — appropriate for monthly manual updates
- Placement: Claude's discretion (wherever fits best with existing detail page design)
- Data pipeline must parse and validate the new field through Zod schema

### Data disclaimer (TRST-02)
- Appears on BOTH homepage and detail pages
- Homepage: brief disclaimer in the footer area
- Detail pages: more specific disclaimer near the bottom of the card
- Tone: friendly and transparent, not legalistic — "This data is manually researched from public records and may not reflect recent changes"
- Explicitly name "Massachusetts Cannabis Control Commission (MCC)" as the primary data source
- Link to correction form from the disclaimer ("See something wrong? Suggest a correction.")

### Terms of Service page (TRST-04)
- Standalone page at `/terms/` (or similar) linked from the site footer
- Footer placeholder `<!-- Phase 7: Terms of Service link goes here -->` already exists
- Plain-language data usage notice, not formal legal boilerplate
- Topics covered:
  - Data sources and accuracy (MCC public records, manual research, update frequency)
  - Permitted use (free public resource, reference/share with attribution, not for commercial resale)
  - No warranty / liability (data provided as-is, publisher not liable for inaccuracies)
  - Contact / corrections (link to correction form, how to reach publisher)
- Contact info: "Published by Meredith McGee" + link to meredithmcgee.org
- No email address published — contact via correction form

### Claude's Discretion
- Google Form iframe dimensions and styling
- Exact disclaimer copy (within the friendly/transparent tone)
- Exact TOS copy (within the plain-language style)
- Last verified date placement on detail page
- Disclaimer visual treatment (background color, border, icon)
- Whether disclaimer on homepage is in footer or a separate section
- TOS page layout and styling

</decisions>

<specifics>
## Specific Ideas

- The footer already has "A project by Meredith McGee" + "Data sourced from Massachusetts Cannabis Control Commission public records" — the disclaimer can extend this existing language
- The `<!-- Phase 7: Terms of Service link goes here -->` placeholder in index.astro footer is ready
- DispensaryCard.astro has a clear section structure (header → owner → narrative → facts → siblings) — correction form goes after siblings
- Google Form URL params can pre-fill fields: `?entry.XXXXX=dispensary+name`

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/DispensaryCard.astro` — detail page card component; correction form and disclaimer go here
- `src/layouts/BaseLayout.astro` — base layout with title/description props; TOS page uses this
- `src/pages/index.astro` — homepage footer with Phase 7 placeholder
- `src/schemas/dispensary.ts` — Zod schema needs `lastVerified` field added
- `src/lib/xlsx-parser.ts` — data pipeline needs to parse the new column

### Established Patterns
- Astro Content Collections for data at build time
- Static pages in `src/pages/` directory
- Tailwind CSS v4 for styling
- Detail page route: `src/pages/dispensary/[slug].astro`
- Dispensary data flows: XLSX → build-data.ts → dispensaries.json → Content Collections → pages

### Integration Points
- DispensaryCard.astro: add correction form iframe + disclaimer after sibling links
- index.astro footer: add TOS link at placeholder + extend disclaimer
- dispensary.ts schema: add optional `lastVerified` field
- xlsx-parser.ts: parse new `lastVerified` column from spreadsheet
- [slug].astro: pass lastVerified to DispensaryCard
- New page: src/pages/terms.astro for TOS

</code_context>

<deferred>
## Deferred Ideas

- Email notifications when corrections are submitted — future enhancement
- Correction review/approval workflow — post-launch feature
- Privacy policy page — add if needed for compliance later
- Cookie notice — site doesn't use cookies, not needed

</deferred>

---

*Phase: 07-trust-and-legal*
*Context gathered: 2026-03-20*

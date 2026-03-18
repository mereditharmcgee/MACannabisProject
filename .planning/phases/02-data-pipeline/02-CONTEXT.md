# Phase 2: Data Pipeline - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the 525-record XLSX spreadsheet into validated, structured JSON at build time using Zod schema validation. Build fails loudly on invalid data. Also generate a normalization suggestion report and extract summary stats. No pages, no search, no UI — just the data pipeline and JSON output.

</domain>

<decisions>
## Implementation Decisions

### Ownership tag extraction
- All 8 MCC "Special Status" tags become visible badge tags: Woman-Owned, Minority-Owned, Social Equity, Veteran-Owned, LGBTQ+-Owned, Disability-Owned, Economic Empowerment, MTC Priority
- Use "Minority-Owned" as-is from MCC data — do NOT map it to "Black-Owned" (insufficient data to distinguish)
- Update REQUIREMENTS.md: replace "Black-Owned" filter pill with "Minority-Owned" in SRCH-04
- Tags come ONLY from the structured "Special Status" column — no free-text parsing of Ownership Details
- User will add a manual "Independent" column to the XLSX (boolean: Yes/No/blank) for the MSO/Independent distinction

### Owner normalization
- User will add two new columns to XLSX: "Normalized Owner" (clean person name) and "Brand/Company" (consumer-facing company name)
- Pipeline generates a "suggested normalization" report from existing Owner/Parent data that user reviews before adding columns
- Sibling locations (Phase 3) group by Brand/Company name, not by owner person name
- Owner Name displayed on detail pages but not used for grouping
- Both fields can be empty for inconclusive records

### Missing data handling
- Only Trade Name and License # are strictly required — build fails if either is missing
- All other fields are optional (Owner, Phone, Address, Ownership Details, Special Status, etc.)
- 108 records with empty Ownership Details: build succeeds, records flagged as "needs narrative"
- 11 records with "Research inconclusive" owner: include on site with all known fields but skip ownership section and sibling links
- Pipeline generates a full data quality report file (JSON/CSV) listing every record with issues and what's missing
- Console build output also shows summary counts

### XLSX-to-CSV workflow
- Build reads XLSX directly — no manual CSV export step needed
- Primary input file: `MA_Dispensary_Ownership_Directory.xlsx` in project root
- Read "Dispensary Directory" sheet for record data (headers on row 4, data starts row 5)
- Also read "Summary" sheet to extract key stats (avoids hardcoding 525 licenses, 92% independent, etc.)
- Skip "Data Sources" sheet (methodology content deferred to Phase 7)

### Claude's Discretion
- Header row detection strategy (skip to row 4 or auto-detect)
- XLSX parsing library choice (xlsx, exceljs, or other)
- Zod schema field types and validation rules for optional fields
- JSON output structure and file organization for Astro Content Collections
- Data quality report format and location
- Normalization suggestion report format

</decisions>

<specifics>
## Specific Ideas

- User wants owner name and brand/company as distinct fields — "I want to be able to see owner name if possible. But I understand people see Curaleaf and that is bigger than one name."
- Inconclusive records should be flagged in a way that's trackable (user mentioned "admin dashboard" — interpreted as the data quality report since this is a static site)
- Monthly update workflow: edit XLSX, commit, push, auto-rebuild — no CSV export step

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- Astro 5 project scaffold with Tailwind CSS v4 already deployed
- `data/` directory exists with `.gitkeep` (created in Phase 1)
- `astro.config.mjs` configured with site URL and Tailwind vite plugin

### Established Patterns
- Astro Content Collections is the expected data consumption pattern for downstream phases
- Build runs on Cloudflare Pages (Node.js environment)

### Integration Points
- XLSX file in project root: `MA_Dispensary_Ownership_Directory.xlsx` (525 rows, 16 columns + user will add 3 more)
- Two MCC CSV files also in root (`l_licenses_aumtc.csv`, `hmwt-yiqy (2).csv`) — reference data, not build inputs
- JSON output consumed by Phase 3 (detail pages) and Phase 4 (card grid)
- Summary stats consumed by Phase 4 (homepage stats banner)

</code_context>

<deferred>
## Deferred Ideas

- Data Sources methodology page — Phase 7 (Trust and Legal)
- Black-Owned as a distinct tag — future enhancement when more ownership research is complete
- Automated MCC data pipeline (API/scraper) — v2 scope (PLAT-03)

</deferred>

---

*Phase: 02-data-pipeline*
*Context gathered: 2026-03-18*

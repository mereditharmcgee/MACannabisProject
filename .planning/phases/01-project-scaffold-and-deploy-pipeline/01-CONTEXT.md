# Phase 1: Project Scaffold and Deploy Pipeline - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Working Astro 5 project with Tailwind CSS 4 deploys to Cloudflare Pages on every git push with zero manual steps. Placeholder page visible at production URL. No data pipeline, no pages, no search — just the scaffold and deploy pipeline.

</domain>

<decisions>
## Implementation Decisions

### Domain routing
- Subdomain: `dispensaries.meredithmcgee.org`
- Cloudflare Pages project with CNAME record in Cloudflare DNS pointing to `*.pages.dev`
- Separate deploy pipeline from any existing site on meredithmcgee.org

### Site identity
- Site name: "MA Cannabis Directory" (used in browser tabs, meta titles, Google results)
- Homepage headline remains: "Who Owns Your Dispensary?"
- Footer credit: "A project by Meredith McGee" — subtle, not prominent
- Claude's discretion on placeholder page design (just needs to confirm deploy works)

### Data file location
- Primary dataset: `MA_Dispensary_Ownership_Directory.xlsx` (in project root)
- Update workflow: export XLSX to CSV at `data/dispensaries.csv`, git push, auto-rebuild
- CSV is the build input; XLSX stays as the working source of truth
- `data/` directory created in this phase as part of scaffold, but actual pipeline is Phase 2

### Claude's Discretion
- Astro project structure and config details
- Tailwind configuration approach
- Placeholder page content and styling
- Git branch strategy (main only is fine)
- Cloudflare Pages build settings

</decisions>

<specifics>
## Specific Ideas

- The site should feel like a polished, well-designed restaurant guide — not a database query tool
- Key stats for the homepage: 525 Active Licenses, 92% Independently Owned, 157 Towns (these are real numbers from the dataset)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — greenfield project

### Established Patterns
- No existing patterns — this phase establishes them

### Integration Points
- Cloudflare DNS already configured for meredithmcgee.org (user has Cloudflare account)
- Multiple .xlsx files in project root contain research data (not code)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-project-scaffold-and-deploy-pipeline*
*Context gathered: 2026-03-17*

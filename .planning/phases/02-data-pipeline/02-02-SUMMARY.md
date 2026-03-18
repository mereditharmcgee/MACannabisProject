---
phase: 02-data-pipeline
plan: 02
subsystem: data
tags: [astro-content-collections, tsx, build-pipeline, normalization, data-quality, json]

# Dependency graph
requires:
  - phase: 02-data-pipeline
    provides: Zod dispensarySchema, XLSX parser (parseDispensarySheet, parseSummarySheet)
provides:
  - Build pipeline script (scripts/build-data.ts) converting XLSX to validated JSON
  - Astro Content Collections config with dispensaries and stats collections
  - Owner/company normalization suggestion report generation
  - Data quality report with missing field tracking and narrative flags
  - Generated src/data/dispensaries.json and src/data/stats.json consumed by Astro
  - npm run build end-to-end (XLSX -> JSON -> Astro static build)
affects: [03-detail-pages, 04-homepage, 05-search]

# Tech tracking
tech-stack:
  added: [tsx@4.21.0 (devDep)]
  patterns: [pre-build data pipeline via npm script chaining, file() loader for Astro Content Collections, tsconfig paths alias for astro/zod outside Astro context]

key-files:
  created:
    - scripts/build-data.ts
    - src/lib/normalization.ts
    - src/lib/reports.ts
    - src/content.config.ts
  modified:
    - package.json
    - .gitignore
    - tsconfig.json
    - tests/data-pipeline.test.ts

key-decisions:
  - "Used tsconfig paths to alias astro/zod -> zod for tsx script execution outside Astro context"
  - "Unblocked scripts/ directory in .gitignore (was legacy exclusion) to allow build-data.ts tracking"
  - "Dispensary JSON entries include 'id' field set to licenseNumber for Astro file() loader compatibility"
  - "Stats JSON wraps single object in array with id 'summary' for file() loader"
  - "Content Collections schema defined inline in content.config.ts using astro/zod for type generation"

patterns-established:
  - "Pre-build script pattern: npm run build:data runs before astro build via script chaining"
  - "Generated data files in src/data/ are gitignored and rebuilt from XLSX at build time"
  - "Reports output to data/reports/ directory (also gitignored)"
  - "Normalization comparison strips business suffixes (Inc, LLC, Corp, etc.) for entity matching"

requirements-completed: [DATA-01, DATA-02]

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 2 Plan 2: Build Pipeline and Content Collections Summary

**XLSX-to-JSON build pipeline producing 525 validated dispensary records consumed by Astro Content Collections with quality and normalization reports**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-18T17:53:32Z
- **Completed:** 2026-03-18T17:56:44Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Complete build pipeline: `npm run build` reads XLSX, validates 525 records, writes JSON, builds Astro site
- Astro Content Collections wired with dispensaries (525 records) and stats collections via file() loader
- Data quality report identifies 108 records needing narratives and tracks missing optional fields (635 total issues)
- Normalization engine ready for owner/company variant detection (0 suggestions on current clean data)
- 46 tests passing across 3 test files (schema, validation, pipeline integration)
- Build fails with row-level errors when required fields (Trade Name, License #) are missing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create normalization, reports, and build-data pipeline script** - `0865096` (feat)
2. **Task 2: Wire Astro Content Collections and verify full build** - `c089d2c` (feat)

## Files Created/Modified
- `scripts/build-data.ts` - Pre-build script reading XLSX, validating, writing JSON + reports
- `src/lib/normalization.ts` - Owner name normalization and suggestion generation
- `src/lib/reports.ts` - Data quality report generation with missing field tracking
- `src/content.config.ts` - Astro Content Collections config with dispensaries and stats
- `package.json` - Added tsx devDep, build:data script, wired into build and dev
- `.gitignore` - Added src/data/*.json and data/reports/ exclusions, unblocked scripts/
- `tsconfig.json` - Added paths alias mapping astro/zod to zod for tsx
- `tests/data-pipeline.test.ts` - Extended with 10 new tests for normalization, reports, and outputs

## Decisions Made
- Used tsconfig paths alias (`astro/zod` -> `./node_modules/zod`) for tsx script execution, complementing the vitest alias from Plan 01
- Unblocked `scripts/` from .gitignore legacy exclusion -- the directory now houses build tooling, not legacy files
- Content Collections schema defined inline in content.config.ts rather than importing from dispensary.ts -- Astro's type generation requires astro/zod, not standalone zod
- Each dispensary JSON entry gets an `id` field set to licenseNumber, required by Astro's file() loader
- Stats wrapped in array with `id: "summary"` since file() loader expects array format

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Unblocked scripts/ directory in .gitignore**
- **Found during:** Task 1 (creating scripts/build-data.ts)
- **Issue:** Legacy `.gitignore` rule excluded entire `scripts/` directory, which would prevent tracking build-data.ts
- **Fix:** Replaced blanket `scripts/` exclusion with specific legacy file type exclusions
- **Files modified:** .gitignore
- **Verification:** `git add scripts/build-data.ts` succeeded
- **Committed in:** 0865096 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to allow build tooling scripts to be tracked in git. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Content Collections fully wired: `getCollection('dispensaries')` and `getCollection('stats')` available in Astro pages
- All 525 dispensary records validated and available as typed data
- Quality report at data/reports/data-quality-report.json identifies 108 records needing narratives
- Phase 3 (detail pages) can now iterate over dispensary collection to generate individual pages
- Phase 4 (homepage) can use stats collection for summary banner

## Self-Check: PASSED

- scripts/build-data.ts: FOUND
- src/lib/normalization.ts: FOUND
- src/lib/reports.ts: FOUND
- src/content.config.ts: FOUND
- Commit 0865096: FOUND
- Commit c089d2c: FOUND
- 46/46 tests passing

---
*Phase: 02-data-pipeline*
*Completed: 2026-03-18*

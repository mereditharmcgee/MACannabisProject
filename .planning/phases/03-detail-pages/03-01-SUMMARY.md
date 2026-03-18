---
phase: 03-detail-pages
plan: 01
subsystem: lib
tags: [slugs, narrative, jsonld, seo, siblings, vitest, tdd]

# Dependency graph
requires:
  - phase: 02-data-pipeline
    provides: dispensary schema, xlsx-parser, dispensaries.json with 525 records
provides:
  - "stripLegalSuffix, generateSlug, deduplicateSlugs slug utilities"
  - "generateNarrative three-state narrative generator"
  - "buildJsonLd schema.org Store JSON-LD builder"
  - "groupByParentCompany, getSiblings sibling grouping"
  - "buildMetaTitle, buildMetaDescription SEO meta generators"
  - "Updated data pipeline with legal suffix stripping and town disambiguation"
affects: [03-detail-pages, detail page template, SEO]

# Tech tracking
tech-stack:
  added: []
  patterns: [TDD red-green for pure lib functions, pick-style interfaces for testability]

key-files:
  created:
    - src/lib/slugs.ts
    - src/lib/narrative.ts
    - src/lib/jsonld.ts
    - src/lib/siblings.ts
    - src/lib/seo-meta.ts
    - tests/slugs.test.ts
    - tests/narrative.test.ts
    - tests/jsonld.test.ts
    - tests/siblings.test.ts
    - tests/seo-meta.test.ts
  modified:
    - src/lib/xlsx-parser.ts

key-decisions:
  - "Second-pass numeric suffix for same-name-same-town slug collisions (17 groups of multi-license records at same location)"
  - "Narrative composeProse extracts owner name by stripping parenthetical role from owner field"
  - "JSON-LD uses Store type (not LocalBusiness) per research recommendation"

patterns-established:
  - "Pure lib functions with pick-style interfaces for Astro-independent testability"
  - "Slug generation pipeline: stripLegalSuffix -> generateSlug -> deduplicateSlugs (town) -> numeric suffix"

requirements-completed: [DETL-01, DETL-04, DETL-05, DETL-06, DETL-07]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 3 Plan 1: Detail Page Lib Functions Summary

**5 pure TypeScript lib modules with TDD coverage: slug generation (legal suffix stripping + town disambiguation), three-state narrative, schema.org Store JSON-LD, parentCompany sibling grouping, and SEO meta title/description**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T20:59:45Z
- **Completed:** 2026-03-18T21:04:18Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- 5 lib modules with 39 unit tests, all passing via TDD (red-green)
- Slug generation strips legal suffixes (Inc, LLC, Corp, etc.) and disambiguates collisions by town name, with numeric fallback for same-town duplicates
- Data pipeline updated: 525 records regenerated with clean slugs, zero duplicates
- Full regression suite passes: 87 tests (39 new + 48 existing)

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Failing tests** - `b7c77b2` (test)
2. **Task 1 GREEN: Lib implementations** - `d826401` (feat)
3. **Task 2: Pipeline update + data rebuild** - `c2e68eb` (feat)

_TDD Task 1 has separate RED and GREEN commits._

## Files Created/Modified
- `src/lib/slugs.ts` - Legal suffix stripping, slug generation, collision disambiguation
- `src/lib/narrative.ts` - Three-state narrative generation (full, pending, inconclusive)
- `src/lib/jsonld.ts` - schema.org Store JSON-LD builder with conditional phone
- `src/lib/siblings.ts` - Parent company grouping with self-exclusion
- `src/lib/seo-meta.ts` - SEO meta title ("Who Owns [Name]?") and description
- `src/lib/xlsx-parser.ts` - Replaced inline slug function with imported slugs.ts; post-loop deduplication
- `tests/slugs.test.ts` - 16 tests for slug utilities
- `tests/narrative.test.ts` - 4 tests for narrative generation
- `tests/jsonld.test.ts` - 6 tests for JSON-LD builder
- `tests/siblings.test.ts` - 6 tests for sibling grouping
- `tests/seo-meta.test.ts` - 7 tests for SEO meta generation

## Decisions Made
- Added second-pass numeric suffix in deduplicateSlugs for 17 groups of records sharing both tradeName and town (different license types at same location). Plan only specified town disambiguation, but same-name-same-town records needed additional handling.
- Narrative composeProse strips parenthetical roles from owner field (e.g., "(Founder/CEO)") for cleaner prose.
- JSON-LD uses "Store" type as recommended by research, not "LocalBusiness" (Store is a more specific subtype).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Same-name-same-town slug collisions not handled**
- **Found during:** Task 2 (data pipeline rebuild)
- **Issue:** 17 groups of records share identical tradeName AND town (different license types), producing duplicate slugs even after town disambiguation
- **Fix:** Added second-pass numeric suffix in deduplicateSlugs for remaining collisions
- **Files modified:** src/lib/slugs.ts
- **Verification:** Rebuilt dispensaries.json, confirmed 0 duplicate slugs across 525 records
- **Committed in:** c2e68eb (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential for correctness -- duplicate slugs would cause build failures in Astro route generation. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 lib modules exported and tested, ready for consumption by Astro page template (Plan 02)
- Dispensaries.json regenerated with clean slugs for dynamic route generation
- SEO meta functions ready for BaseLayout integration

---
*Phase: 03-detail-pages*
*Completed: 2026-03-18*

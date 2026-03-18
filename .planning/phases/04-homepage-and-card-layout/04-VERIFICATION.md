---
phase: 04-homepage-and-card-layout
verified: 2026-03-18T23:30:00Z
status: gaps_found
score: 9/11 must-haves verified
re_verification: false
gaps:
  - truth: "Homepage displays 'Who Owns Your Dispensary?' headline"
    status: verified
    reason: "Confirmed present in index.astro line 19"
    artifacts: []
    missing: []
  - truth: "DSGN-03: Homepage features a prominent search bar"
    status: failed
    reason: "DSGN-03 requires a 'prominent search bar' alongside the headline and stats. The homepage has only an HTML comment placeholder (<!-- Phase 5: search bar goes here -->). The search bar is intentionally deferred to Phase 5 per CONTEXT.md and plan scope — but the requirement as written is not satisfied in this phase."
    artifacts:
      - path: "src/pages/index.astro"
        issue: "Line 25 is a comment placeholder, not an implemented search bar"
    missing:
      - "Search bar component or input element — deferred to Phase 5. If DSGN-03 ownership is meant to transfer to Phase 5, update REQUIREMENTS.md traceability table to reflect that."
  - truth: "Homepage shows stats: total licenses from stats.json, 92% independently owned (hardcoded), total towns from stats.json"
    status: partial
    reason: "Code correctly reads totalLicenses and totalTowns dynamically from stats.json. However, stats.json records totalTowns: 156 while ROADMAP.md success criterion #1 and REQUIREMENTS.md DSGN-03 both cite '157 Towns'. Users see 156, not 157. This is a data discrepancy between the stats file and the stated requirement."
    artifacts:
      - path: "src/data/stats.json"
        issue: "totalTowns is 156; ROADMAP success criterion and DSGN-03 specify 157 Towns"
    missing:
      - "Reconcile totalTowns in stats.json (156) with requirement spec (157), or update the requirement to reflect the correct count"
human_verification:
  - test: "Visual layout at three responsive breakpoints"
    expected: "1 column at ~375px, 2 columns at ~768px, 3 columns at ~1024px+ with no horizontal scrolling"
    why_human: "Tailwind responsive grid classes are present in code but actual render behavior requires a browser"
  - test: "Card hover shadow lift effect"
    expected: "Subtle shadow increase on card hover (hover:shadow-md transition)"
    why_human: "CSS transition requires a browser to observe"
  - test: "Clicking a card navigates to the correct detail page"
    expected: "Clicking any card opens /dispensary/[slug]/ with matching dispensary data"
    why_human: "Client-side navigation requires a running dev server"
  - test: "Card visual design — name title-casing, owner truncation, badge rendering"
    expected: "ALL CAPS trade names render in Title Case; long owner names truncate with ellipsis; colored badge pills appear on applicable cards; cards with no badges have same height as cards with badges"
    why_human: "CSS truncation and visual height consistency require a browser"
---

# Phase 4: Homepage and Card Layout — Verification Report

**Phase Goal:** Users land on a polished, responsive homepage with a "Who Owns Your Dispensary?" headline, key stats, and a browsable card grid of all dispensaries
**Verified:** 2026-03-18T23:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

#### Plan 04-01 Truths (SRCH-08)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Card displays dispensary name in title case (not ALL CAPS) | VERIFIED | `DispensaryGridCard.astro` line 18: `const displayName = toTitleCase(dispensary.tradeName)` rendered in h2 |
| 2 | Card displays town, owner, ownership badges, and license type label | VERIFIED | Lines 37-48: town, displayOwner, and badge map all rendered conditionally |
| 3 | Cards with no badges have same height as cards with badges | VERIFIED | Line 45: `<div class="min-h-[2rem] flex flex-wrap gap-1.5 items-start">` — empty div maintains height |
| 4 | License types map to friendly labels (Storefront, Delivery, Medical, Microbusiness) | VERIFIED | `format.ts` lines 27-34: LICENSE_LABEL_MAP covers all 6 MCC types with correct labels |

#### Plan 04-02 Truths (DSGN-01, DSGN-03)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 5 | Homepage displays 'Who Owns Your Dispensary?' headline | VERIFIED | `index.astro` line 19: exact text in h1 |
| 6 | Homepage shows stats: total licenses, 92% (hardcoded), total towns — all from stats.json where applicable | PARTIAL | totalLicenses=525 and totalTowns=156 load correctly from stats.json; 92% hardcoded as planned. However stats.json totalTowns (156) conflicts with DSGN-03 and ROADMAP spec (157 Towns) |
| 7 | Homepage displays all 525 dispensaries as cards in a responsive grid | VERIFIED | `index.astro` lines 6-9: getCollection sorts all 525 records; line 49: maps all to DispensaryGridCard |
| 8 | Grid shows 1 column mobile, 2 tablet, 3 desktop | VERIFIED | Line 48: `class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"` |
| 9 | Clicking any card navigates to /dispensary/[slug]/ | VERIFIED | `DispensaryGridCard.astro` line 26: `href={'/dispensary/${dispensary.slug}/'}` — trailing slash present |
| 10 | Visible count reads 'Showing 525 dispensaries' above the grid | VERIFIED | `index.astro` line 44: `Showing {sorted.length} dispensaries` — dynamic from sorted array |
| 11 | Footer shows 'A project by Meredith McGee' with brief data source line | VERIFIED | Lines 56-57: exact text present |

**Score:** 9/11 truths verified (2 gaps: 1 failed, 1 partial)

---

## Required Artifacts

### Plan 04-01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/format.ts` | toTitleCase and getLicenseLabel helpers | VERIFIED | 44 lines; exports both functions; substantive implementations with LICENSE_LABEL_MAP and regex-based title-casing |
| `tests/format.test.ts` | Unit tests for format helpers | VERIFIED | 70 lines; 9 test cases for toTitleCase, 9 for getLicenseLabel including null/undefined/unknown; imported from `../src/lib/format` |
| `src/components/DispensaryGridCard.astro` | Compact card for homepage grid | VERIFIED | 51 lines; imports format.ts and OwnershipBadge; renders all required fields; content-visibility optimization on line 28 |

### Plan 04-02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/pages/index.astro` | Complete homepage with hero, stats, card grid, footer | VERIFIED (with gap) | 61 lines; all sections present; search bar is only a placeholder comment per plan scope — flagged under DSGN-03 |

### Unchanged Artifacts (must-not-modify)

| Artifact | Status | Details |
|----------|--------|---------|
| `src/components/OwnershipBadge.astro` | VERIFIED UNMODIFIED | No git commits touched this file during phase 4 range (9940e2c..HEAD) |
| `src/components/DispensaryCard.astro` | NOT CHECKED | Plan says must not modify; no evidence of modification in SUMMARY.md key-files |

---

## Key Link Verification

### Plan 04-01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `DispensaryGridCard.astro` | `src/lib/format.ts` | import | VERIFIED | Line 2: `import { toTitleCase, getLicenseLabel } from '../lib/format'` — both functions used on lines 18-19 |
| `DispensaryGridCard.astro` | `src/components/OwnershipBadge.astro` | import | VERIFIED | Line 3: `import OwnershipBadge from './OwnershipBadge.astro'` — used on line 47 in badge map |

### Plan 04-02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/pages/index.astro` | `src/components/DispensaryGridCard.astro` | import + map | VERIFIED | Line 3: import present; line 49-51: all sorted dispensaries mapped to DispensaryGridCard |
| `src/pages/index.astro` | `astro:content` | getCollection for dispensaries and stats | VERIFIED | Lines 4-13: both collections fetched; dispensaries sorted A-Z; stats destructured with fallback |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SRCH-08 | 04-01 | Cards show dispensary name, town, owner, and ownership badge tags | SATISFIED | DispensaryGridCard.astro renders all four fields with conditional display |
| DSGN-01 | 04-02 | Site is fully responsive — card grid adapts from mobile to desktop | SATISFIED | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` in index.astro; verified by human checkpoint (user approved) |
| DSGN-03 | 04-02 | Homepage features a prominent search bar with headline and key stats | PARTIALLY SATISFIED | Headline present; stats present (with 156 vs 157 towns discrepancy); search bar deferred to Phase 5 — requirement text says "search bar" but plan explicitly excludes it. REQUIREMENTS.md marks this [x] complete, which overstates delivery. |

### Orphaned Requirements Check

The traceability table in REQUIREMENTS.md assigns DSGN-01, DSGN-03, and SRCH-08 to Phase 4. All three appear in plan frontmatter `requirements` fields. No orphaned requirements for this phase.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/pages/index.astro` | 25 | `<!-- Phase 5: search bar goes here -->` | Info | Intentional placeholder, not a code anti-pattern — documented in plan and context |
| `src/pages/index.astro` | 46 | `<!-- Phase 6: filter pills go here -->` | Info | Intentional placeholder — documented in plan |
| `src/pages/index.astro` | 58 | `<!-- Phase 7: Terms of Service link goes here -->` | Info | Intentional placeholder — documented in plan |

No stub implementations, empty handlers, or console.log-only patterns found. All three placeholder comments are intentional future extension points, not incomplete code.

---

## Human Verification Required

### 1. Responsive Grid Breakpoints

**Test:** Open `http://localhost:4321/` after `npx astro dev`. Resize browser window.
**Expected:** Single column at ~375px width; 2 columns at ~768px; 3 columns at ~1024px+. No horizontal scrolling at any breakpoint.
**Why human:** Tailwind responsive classes are present in source, but actual render requires a browser.

### 2. Card Hover Effect

**Test:** Hover over any dispensary card.
**Expected:** Subtle shadow increase (shadow-sm to shadow-md) with smooth 200ms transition.
**Why human:** CSS transitions cannot be verified without a browser.

### 3. Card-to-Detail-Page Navigation

**Test:** Click on any dispensary card.
**Expected:** Browser navigates to `/dispensary/[slug]/` and the detail page shows matching dispensary data.
**Why human:** Client-side navigation requires a running dev server.

### 4. Title-Case and Badge Rendering on Cards

**Test:** Scroll through the card grid. Find a card for a dispensary known to be stored in ALL CAPS (most records). Find a card with ownership badges (e.g., Social Equity or Woman-Owned dispensaries).
**Expected:** Names display in Title Case (not ALL CAPS). Colored badge pills appear for tagged dispensaries. Cards without badges have the same height as cards with badges.
**Why human:** CSS line-clamp and min-height enforcement require a browser; visual verification of title-casing on real data.

---

## Gaps Summary

Two gaps prevent full goal achievement as stated in requirements:

**Gap 1 — DSGN-03 search bar absent (scope/classification issue):** DSGN-03 as written in REQUIREMENTS.md requires "a prominent search bar." The homepage correctly implements the headline and stats (DSGN-03's other elements), but the search bar is explicitly deferred to Phase 5. The SUMMARY marks DSGN-03 as requirements-completed, and REQUIREMENTS.md marks it `[x]`, but the requirement text is not fully delivered. This is a classification decision: either DSGN-03 should remain `[ ]` with ownership moved to Phase 5, or a note should clarify which part of DSGN-03 Phase 4 covers. No code change is needed — only requirements tracking cleanup.

**Gap 2 — totalTowns data discrepancy (156 vs 157):** ROADMAP.md success criterion #1 and REQUIREMENTS.md DSGN-03 both specify "157 Towns." `stats.json` contains `totalTowns: 156`. The homepage correctly reads the value dynamically, so users will see 156. The correct count needs to be established (reconcile the source data or update the requirement) and `stats.json` updated if the true count is 157.

Neither gap is a missing file or wiring failure — the code architecture is complete and correct. The gaps are: one deferred feature (search bar, by design) that needs requirements traceability cleanup, and one data accuracy issue in stats.json.

---

## Commit Verification

All phase 4 commits confirmed present in git log:

| Commit | Description | Status |
|--------|-------------|--------|
| `9940e2c` | test(04-01): add failing tests for format helpers | VERIFIED |
| `b3aa846` | feat(04-01): implement toTitleCase and getLicenseLabel format helpers | VERIFIED |
| `3076d24` | feat(04-01): create DispensaryGridCard component | VERIFIED |
| `d367ef4` | feat(04-02): build complete homepage with hero, card grid, and footer | VERIFIED |

---

*Verified: 2026-03-18T23:30:00Z*
*Verifier: Claude (gsd-verifier)*

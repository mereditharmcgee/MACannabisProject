---
phase: 07-trust-and-legal
verified: 2026-03-20T16:00:00Z
status: human_needed
score: 12/12 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 10/12
  gaps_closed:
    - "DataDisclaimer.astro detailed variant broken anchor fixed — href='/correct/' replaces dangling '#correction-form'"
    - "terms.astro Corrections section now links directly to /correct/ (copy inaccuracy resolved)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Visit a detail page, find the amber disclaimer box, click 'Suggest a correction'"
    expected: "Browser navigates to /correct/?dispensary=[name] page"
    why_human: "Confirms the fix resolves the previously broken anchor behavior visually"
  - test: "Submit the correction form at /correct/ with a real Formspree form ID configured"
    expected: "Form submits and user receives a success message or redirect"
    why_human: "Formspree ID is a placeholder — cannot verify end-to-end submission programmatically"
---

# Phase 7: Trust and Legal Verification Report

**Phase Goal:** Every listing has a correction mechanism and the site communicates data accuracy context, protecting both users and the publisher

**Verified:** 2026-03-20T16:00:00Z
**Status:** human_needed — all automated checks pass; 2 items require human confirmation
**Re-verification:** Yes — after gap closure (commit 418a760)

---

## Approved Deviations (User-Directed)

The following changes from the original plan were explicitly approved by the user:

1. "No Warranty" section removed from TOS — user deemed it overkill for a public data directory
2. Google Form iframe replaced with native HTML form + Formspree backend
3. Correction form moved to standalone `/correct/` page; detail pages link to it rather than embedding a form

These are intentional changes and do NOT constitute gaps. All references have been evaluated against the final architecture.

---

## Re-verification Summary

### Gap That Was Fixed

**Previous gap:** `DataDisclaimer.astro` detailed variant linked to `#correction-form` — an anchor that no longer existed after the form moved to `/correct/`. Every detail page had a broken call-to-action in the disclaimer.

**Fix applied (commit 418a760):**
- `src/components/DataDisclaimer.astro` line 24: `href="#correction-form"` changed to `href="/correct/"`. Anchor string `#correction-form` no longer appears anywhere in `src/`.
- `src/pages/terms.astro` line 34: Corrections section now links directly to `/correct/` — the phrase "the form on any listing page" is still present but now accompanied by an actual working hyperlink to `/correct/`.

**Regression check:** All 9 previously-passing wiring points confirmed intact (DataDisclaimer import in DispensaryCard, correctionUrl construction, lastVerified conditional, TOS link in DispensaryCard, DataDisclaimer import in index.astro, brief variant on homepage, /terms/ link in footer).

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | lastVerified field passes through data pipeline without breaking existing data | VERIFIED | `dispensary.ts` line 44, `xlsx-parser.ts` line 27 + 155, `content.config.ts` line 23 |
| 2  | Terms of Service page renders at /terms/ with plain-language content | VERIFIED | `src/pages/terms.astro`: 3 sections (About This Data, Using This Directory, Corrections and Contact), No Warranty intentionally removed |
| 3  | Homepage footer displays disclaimer text and links to /terms/ | VERIFIED | `src/pages/index.astro` line 139: `<DataDisclaimer variant="brief" />`, line 141: `<a href="/terms/">` |
| 4  | DataDisclaimer component exists with brief and detailed variants | VERIFIED | `src/components/DataDisclaimer.astro` implements both variants with amber styling |
| 5  | Each detail page has a correction mechanism | VERIFIED | `DispensaryCard.astro` line 59: correctionUrl built as `/correct/?dispensary=...`, line 167: `href={correctionUrl}` |
| 6  | Standalone /correct/ page exists with functional form | VERIFIED | `src/pages/correct.astro`: native HTML form, Formspree action, fields for dispensary/field/correction/email, JS pre-fill |
| 7  | Detail pages display data accuracy disclaimer | VERIFIED | `DispensaryCard.astro` lines 159-162: `<DataDisclaimer variant="detailed" />` always rendered |
| 8  | Detail pages conditionally display lastVerified date when present | VERIFIED | `DispensaryCard.astro` line 151: `{dispensary.lastVerified && (...)}` conditional block |
| 9  | Detail pages have a Terms of Service link | VERIFIED | `DispensaryCard.astro` line 179: `<a href="/terms/">Terms of Service</a>` |
| 10 | Disclaimer "Suggest a correction" link in detailed variant works | VERIFIED | `DataDisclaimer.astro` line 24: `href="/correct/"` — no dangling anchor, no `#correction-form` anywhere in `src/` |
| 11 | lastVerified tests pass | VERIFIED | `tests/schema.test.ts` lines 175-216: 3 tests in "lastVerified field" describe block |
| 12 | TOS content accurately describes correction mechanism | VERIFIED | `terms.astro` line 34: links to `/correct/` with working anchor text; copy inaccuracy from initial verification resolved |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/schemas/dispensary.ts` | lastVerified field in Zod schema | VERIFIED | `lastVerified: z.string().nullable().optional()` |
| `src/lib/xlsx-parser.ts` | lastVerified header mapping and record construction | VERIFIED | `'Last Verified': 'lastVerified'` in headerMap, `lastVerified: rawData.lastVerified ?? null` in record |
| `src/content.config.ts` | lastVerified in Content Collections schema | VERIFIED | `lastVerified: z.string().nullable().optional()` |
| `src/components/DataDisclaimer.astro` | Shared disclaimer component with brief/detailed variants | VERIFIED | Both variants with amber styling; detailed variant links to `/correct/` (gap fixed) |
| `src/pages/terms.astro` | Terms of Service page | VERIFIED | 3 plain-language sections, back link, last updated footer, `/correct/` linked |
| `tests/schema.test.ts` | lastVerified field validation tests | VERIFIED | 3 tests in dedicated describe block |
| `src/components/DispensaryCard.astro` | Correction link, disclaimer, lastVerified display, TOS link | VERIFIED | All four elements present and wired |
| `src/pages/correct.astro` | Standalone correction form page | VERIFIED | Native HTML form with Formspree backend, JS pre-fill via URL param |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/lib/xlsx-parser.ts` | `src/schemas/dispensary.ts` | headerMap + record construction | WIRED | `'Last Verified': 'lastVerified'` (line 27), `lastVerified: rawData.lastVerified ?? null` (line 155) |
| `src/pages/index.astro` | `src/pages/terms.astro` | footer link | WIRED | Line 141: `<a href="/terms/">` |
| `src/pages/index.astro` | `src/components/DataDisclaimer.astro` | component import | WIRED | Line 4: import, line 139: `<DataDisclaimer variant="brief" />` |
| `src/components/DispensaryCard.astro` | `src/components/DataDisclaimer.astro` | component import | WIRED | Line 4: import, line 161: `<DataDisclaimer variant="detailed" />` |
| `src/components/DispensaryCard.astro` | `src/pages/correct.astro` | correction link | WIRED | Line 59: `correctionUrl = '/correct/?dispensary=...'`, line 167: `href={correctionUrl}` |
| `src/pages/dispensary/[slug].astro` | `src/components/DispensaryCard.astro` | dispensary prop (includes lastVerified) | WIRED | `<DispensaryCard dispensary={dispensary}>`, `dispensary` is `entry.data` from Content Collections |
| `src/components/DataDisclaimer.astro` (detailed) | `src/pages/correct.astro` | `href="/correct/"` | WIRED | Line 24: `href="/correct/"` — dangling anchor removed in commit 418a760 |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| TRST-01 | 07-02 | Each listing has a "Suggest a Correction" form that submits without requiring user login | SATISFIED | `/correct/` page with native HTML + Formspree. Detail pages link via correctionUrl. Formspree ID is a placeholder pending deployment config — form architecture complete. |
| TRST-02 | 07-01, 07-02 | Site displays a publisher disclaimer about data accuracy and sources | SATISFIED | DataDisclaimer (brief) on homepage footer, DataDisclaimer (detailed) on every detail page, both citing MCC public records. |
| TRST-03 | 07-01, 07-02 | Each listing shows a "last verified" date | SATISFIED (conditional) | Field plumbed through full data pipeline. Display is conditional on `lastVerified` being populated — currently null for all 525 records. Infrastructure is correct per phase scope. |
| TRST-04 | 07-01 | Site includes Terms of Service / data usage notice | SATISFIED | `/terms/` page with 3 plain-language sections, linked from homepage footer and every detail page. |

All 4 phase requirements satisfied. No orphaned requirements.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/pages/correct.astro` | 5 | `FORMSPREE_ID_PLACEHOLDER` | INFO | Expected placeholder; documented in summary as deployment-time configuration. Form will not submit until replaced with a real Formspree form ID. Does not block phase completion. |

No blockers or warnings remain. The previously-flagged broken anchor and TOS copy issues are resolved.

---

### Commit Verification

| Commit | Description | Verified |
|--------|-------------|---------|
| `fdb183e` | test(07-01): add failing lastVerified tests | YES |
| `e6554fb` | feat(07-01): add lastVerified field to data pipeline | YES |
| `8f4023d` | feat(07-01): add TOS page, DataDisclaimer component, wire footer | YES |
| `56b53b7` | feat(07-02): wire correction form, disclaimer, lastVerified, TOS into detail pages | YES |
| `328ee73` | fix(07): remove No Warranty section, replace Google Form with Formspree | YES |
| `6ed556a` | refactor(07): move correction form to standalone /correct/ page | YES |
| `418a760` | fix(07): fix broken disclaimer link and TOS copy after correction form refactor | YES |

---

### Human Verification Required

#### 1. Disclaimer link navigates to correction form

**Test:** Visit any detail page (e.g., `http://localhost:4321/dispensary/[any-slug]/`). Scroll to the amber disclaimer box below the sibling links. Click "Suggest a correction."

**Expected:** Browser navigates to `/correct/?dispensary=[dispensary-name]`.

**Why human:** Confirms the visual behavior after the anchor fix; verifies the URL param is present for pre-fill.

#### 2. Correction form pre-fill behavior

**Test:** From a detail page, click "Suggest a Correction" (the button/link in the card). Verify the dispensary name is pre-filled in the form on `/correct/`.

**Expected:** `/correct/` page loads with the dispensary name already in the "Dispensary" field.

**Why human:** Pre-fill relies on client-side JavaScript reading the URL parameter; cannot verify DOM manipulation programmatically.

#### 3. Formspree submission (post-deployment)

**Test:** After replacing `FORMSPREE_ID_PLACEHOLDER` with a real Formspree form ID, submit a test correction.

**Expected:** Form submits without error; Formspree delivers submission to configured email.

**Why human:** Requires external service configuration and live form interaction.

---

### Gaps Summary

No gaps remain. The single blocker from the initial verification (broken `#correction-form` anchor in `DataDisclaimer.astro`) was fixed in commit 418a760. The minor TOS copy inaccuracy was also resolved in the same commit. All 12 observable truths are now verified, all key links are wired, all 4 requirements are satisfied.

The only outstanding item is the Formspree placeholder, which is a deployment-time configuration task explicitly noted in the phase summary and not a code gap.

---

_Verified: 2026-03-20T16:00:00Z_
_Verifier: Claude (gsd-verifier)_

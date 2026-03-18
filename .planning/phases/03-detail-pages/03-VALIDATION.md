---
phase: 3
slug: detail-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (already installed from Phase 2) |
| **Config file** | vitest.config.ts (exists) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose && npx astro build` |
| **Estimated runtime** | ~10 seconds (tests) + ~30 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose && npx astro build`
- **Before `/gsd:verify-work`:** Full suite must be green + `astro build` produces 525+ HTML files
- **Max feedback latency:** 10 seconds (tests only)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | DETL-01 | unit | `npx vitest run tests/slugs.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | DETL-04 | unit | `npx vitest run tests/narrative.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | DETL-02, DETL-03 | smoke | `npx astro build` | N/A | ⬜ pending |
| 03-02-02 | 02 | 2 | DETL-06 | unit | `npx vitest run tests/jsonld.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | DETL-07 | unit | `npx vitest run tests/seo-meta.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | DETL-05 | unit | `npx vitest run tests/siblings.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/slugs.test.ts` — legal suffix stripping, collision detection, town disambiguation
- [ ] `tests/narrative.test.ts` — 3-state narrative generation (full, pending, inconclusive)
- [ ] `tests/jsonld.test.ts` — JSON-LD structure validation, required fields present
- [ ] `tests/siblings.test.ts` — parentCompany grouping, self-exclusion, empty groups
- [ ] `tests/seo-meta.test.ts` — unique meta title/description per record state

*Vitest already installed from Phase 2 — no framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| JSON-LD passes Google Rich Results Test | DETL-06 | Requires Google's external validation tool | Copy JSON-LD from a built page, paste into https://search.google.com/test/rich-results |
| Visual layout matches "clean profile card" design | DETL-02 | Visual inspection | Open 3+ detail pages in browser, verify card layout on mobile and desktop |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

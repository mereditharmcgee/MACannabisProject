---
phase: 6
slug: filter-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | SRCH-04 | unit | `npx vitest run tests/filter.test.ts -t "tag filter"` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | SRCH-05 | unit | `npx vitest run tests/filter.test.ts -t "OR logic"` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | SRCH-07 | unit | `npx vitest run tests/filter.test.ts -t "county filter"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/filter.test.ts` — stubs for SRCH-04, SRCH-05, SRCH-07 (pure logic: set intersection, OR union, county matching, count computation)
- [ ] Filter logic extracted into testable pure functions (computeVisibleSlugs, computeTagSlugs, computeCountySlugs, updateCounts)

*Note: DOM-based filter behavior (click handlers, visibility toggling) requires browser test runner (Playwright) which is out of scope. Testing pure set logic functions only.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tag pill click filters card grid | SRCH-04 | DOM interaction | Click each pill, verify card count matches expected |
| Multiple pills show OR results | SRCH-05 | DOM interaction | Activate 2 pills, verify union of results shown |
| County dropdown filters grid | SRCH-07 | DOM interaction | Select county, verify only matching cards shown |
| Filters compose with search | SRCH-04/07 | DOM + search integration | Search "Boston", apply tag filter, verify intersection |
| URL params persist filter state | SRCH-04/07 | Browser navigation | Apply filter, copy URL, paste in new tab, verify filters restored |
| Dynamic counts update | SRCH-04/07 | DOM state | Apply search, verify pill and county counts update |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

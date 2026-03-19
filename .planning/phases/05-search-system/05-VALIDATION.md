---
phase: 5
slug: search-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (already installed) |
| **Config file** | vitest.config.ts (exists) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose && npx astro build`
- **Before `/gsd:verify-work`:** Full suite green + manual browser testing
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DATA-03 | unit | `npx vitest run tests/search-index.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | SRCH-01, SRCH-02, SRCH-03 | unit | `npx vitest run tests/search.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | SRCH-01 | smoke | `npx astro build` | N/A | ⬜ pending |
| 05-02-02 | 02 | 2 | SRCH-01, SRCH-02, SRCH-03 | manual | Browser testing: type queries, verify results | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install fuse.js` — Fuse.js fuzzy search library
- [ ] `tests/search-index.test.ts` — validates build script produces valid search data and index JSON
- [ ] `tests/search.test.ts` — unit tests for Fuse.js search configuration (name, town, owner queries; fuzzy matching; empty query)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Typing produces instant results | SRCH-01 | DOM interaction in browser | Type "Worcester" in search bar, verify card grid filters instantly |
| Town search shows all dispensaries | SRCH-02 | Visual verification | Search "Brewster", verify all Brewster dispensaries appear |
| Owner search shows all dispensaries | SRCH-03 | Visual verification | Search "Curaleaf", verify all Curaleaf-owned dispensaries appear |
| Card grid usable while index loads | SRCH-01 | Throttle network in DevTools | Set 3G throttle, reload, verify cards visible before search works |
| URL updates with ?q= | SRCH-01 | Browser behavior | Type query, check URL updates; use back button, verify search clears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

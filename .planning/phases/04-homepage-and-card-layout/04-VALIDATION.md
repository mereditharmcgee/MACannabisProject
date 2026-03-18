---
phase: 4
slug: homepage-and-card-layout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (already installed) |
| **Config file** | vitest.config.ts (exists) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose && npx astro build` |
| **Estimated runtime** | ~10 seconds (tests) + ~30 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose && npx astro build`
- **Before `/gsd:verify-work`:** Full suite green + visual inspection at 3 breakpoints
- **Max feedback latency:** 10 seconds (tests only)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | SRCH-08 | unit | `npx vitest run tests/homepage.test.ts --reporter=verbose` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DSGN-03 | smoke | `npx astro build && grep "Who Owns Your Dispensary" dist/index.html` | N/A | ⬜ pending |
| 04-02-01 | 02 | 2 | DSGN-01 | manual | Visual inspection at 375px/768px/1024px | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/homepage.test.ts` — unit tests for title-case helper and license type mapping functions

*Vitest already installed. No framework changes needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card grid adapts 1→2→3 columns | DSGN-01 | CSS layout, not testable via unit tests | Resize browser: 375px (1 col), 768px (2 col), 1024px+ (3 col) |
| Cards have hover effect | SRCH-08 | Visual interaction | Hover over cards, verify shadow/scale effect |
| Hero section looks polished | DSGN-03 | Visual quality | Verify headline, subtitle, stats, and reserved search space look cohesive |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

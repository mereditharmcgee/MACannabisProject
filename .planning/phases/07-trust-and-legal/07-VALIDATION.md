---
phase: 7
slug: trust-and-legal
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose` + `npx astro build`
- **Before `/gsd:verify-work`:** Full suite must be green + successful build
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | TRST-03 | unit | `npx vitest run tests/schema.test.ts -t "lastVerified"` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | TRST-04 | smoke | `npx astro build && test -f dist/terms/index.html` | ❌ W0 | ⬜ pending |
| 07-01-03 | 01 | 1 | TRST-01 | manual | N/A — iframe rendering | N/A | ⬜ pending |
| 07-01-04 | 01 | 1 | TRST-02 | manual | N/A — visual/content | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/schema.test.ts` — add test cases for `lastVerified` field (optional, nullable, valid string)
- [ ] Smoke test: `/terms/` page existence verified via `astro build` + file check

*Note: Most TRST requirements involve rendered content (iframes, disclaimers, page copy) that requires browser verification. Automated tests cover schema validation and page generation only.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Correction form iframe renders | TRST-01 | Iframe rendering requires browser | Open detail page, verify form visible at bottom |
| Pre-fill works with dispensary name | TRST-01 | Dynamic iframe behavior | Check form shows correct dispensary name |
| Disclaimer on homepage | TRST-02 | Visual content verification | Check footer area for disclaimer text |
| Disclaimer on detail pages | TRST-02 | Visual content verification | Open detail page, check for disclaimer |
| lastVerified displays when present | TRST-03 | Astro component rendering | Check detail page with populated lastVerified |
| lastVerified omitted when absent | TRST-03 | Astro component rendering | Check detail page without lastVerified |
| TOS page content and links | TRST-04 | Content and navigation | Visit /terms/, verify content and footer links |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

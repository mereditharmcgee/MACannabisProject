---
phase: 8
slug: data-freshness-and-launch-readiness
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 8 — Validation Strategy

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
- **After every plan wave:** Run `npx vitest run --reporter=verbose` + `npx astro build`
- **Before `/gsd:verify-work`:** Full build + Lighthouse check + URL spot-check
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | DSGN-02 | smoke | `npx astro build && test -f dist/sitemap-index.xml` | ❌ W0 | ⬜ pending |
| 08-01-02 | 01 | 1 | DATA-04 | manual | N/A — documentation content | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No new test files needed — phase is configuration + documentation
- [ ] Existing test suite must continue passing with no changes
- [ ] Verification via build output inspection (sitemap existence, page count)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Data update workflow documented | DATA-04 | Documentation content | Read README.md "Updating Data" section, verify steps are clear |
| Homepage < 2s on 3G | DSGN-02 | Browser Lighthouse audit | Run Lighthouse in Chrome DevTools with 3G throttling |
| Sitemap includes all pages | — | Build output inspection | Check dist/sitemap-index.xml contains 528+ URLs |
| All detail pages return 200 | — | Production deployment check | Spot-check 5-10 detail page URLs on production |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

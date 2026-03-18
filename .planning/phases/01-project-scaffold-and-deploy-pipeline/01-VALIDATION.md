---
phase: 1
slug: project-scaffold-and-deploy-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (greenfield — build success is primary validation) |
| **Config file** | None — Wave 0 establishes project |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx astro check` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npx astro check`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DSGN-04 | smoke | `npm run build` | N/A — Wave 0 | ⬜ pending |
| 01-01-02 | 01 | 1 | DSGN-04 | manual | Visit deployed URL | N/A | ⬜ pending |
| 01-01-03 | 01 | 1 | DSGN-04 | smoke | `npm run build` (Tailwind renders) | N/A — Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Astro project initialized with `package.json`
- [ ] `npm run build` produces output in `dist/`
- [ ] No unit test framework needed — build success is the validation for scaffold phase

*Phase 1 is infrastructure/scaffold — validation is primarily "does it build and deploy" rather than unit tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Deployed site loads placeholder at production URL | DSGN-04 | Requires live Cloudflare Pages deployment | Visit `https://dispensaries.meredithmcgee.org` and confirm page loads |
| Tailwind CSS renders correctly on deployed site | DSGN-04 | Visual verification needed | Inspect deployed page for styled Tailwind elements |
| Git push triggers auto build | DSGN-04 | Requires actual git push to remote | Push commit, verify Cloudflare Pages dashboard shows build triggered |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 2
slug: data-pipeline
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (Astro ecosystem standard, Vite-native) |
| **Config file** | None — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | DATA-01 | integration | `npx vitest run tests/data-pipeline.test.ts -t "transforms XLSX"` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | DATA-01 | unit | `npx vitest run tests/schema.test.ts -t "validates records"` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | DATA-02 | unit | `npx vitest run tests/validation.test.ts -t "missing required"` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | DATA-02 | unit | `npx vitest run tests/validation.test.ts -t "missing license"` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | DATA-02 | unit | `npx vitest run tests/validation.test.ts -t "error identifies row"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest` — Vitest not yet installed
- [ ] `vitest.config.ts` — Vitest configuration file
- [ ] `tests/schema.test.ts` — Zod schema validation tests
- [ ] `tests/validation.test.ts` — Build failure tests for missing required fields
- [ ] `tests/data-pipeline.test.ts` — Integration test for full XLSX-to-JSON pipeline
- [ ] `tests/fixtures/test-dispensary.xlsx` — Small test XLSX file (3-5 rows) for testing

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Console shows summary counts during build | DATA-01 | Build output inspection | Run `npm run build`, verify console shows record counts and quality summary |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

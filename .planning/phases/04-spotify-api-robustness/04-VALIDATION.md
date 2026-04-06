---
phase: 04
slug: spotify-api-robustness
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript (`tsc`) — no Jest/Vitest in repo |
| **Config file** | `tsconfig.json` |
| **Quick run command** | `yarn type-check` |
| **Full suite command** | `yarn build && yarn verify:phase1-rules` |
| **Estimated runtime** | ~30–90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn type-check`
- **After every plan wave:** Run `yarn build && yarn verify:phase1-rules`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds (automated); Spotify manual smoke separate

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| *TBD* | 04-01 | 1 | SPOT-01 | type-check | `yarn type-check` | ⬜ W0 | ⬜ pending |
| *TBD* | 04-02 | 2 | SPOT-02 | type-check + message grep | `yarn type-check` | ⬜ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Fill task IDs after PLAN.md tasks are written.*

---

## Wave 0 Requirements

- [ ] **Existing infrastructure** — `yarn type-check` / `yarn build` cover TS regressions for `spotify-scrapper.ts` and `api.d.ts`.

*Wave 0: no new test framework unless a plan explicitly adds a minimal script.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full playlist track count | SPOT-01 | Needs real Spotify API + large public playlist | Run CLI with a public playlist URL with **>100** tracks; log or output count matches Spotify app (or differs only by removed/null tracks). |
| Auth / ID errors | SPOT-02 | Needs bad creds or bad ID | Temporarily wrong `clientSecret` or fake playlist ID; confirm message names **credentials** or **playlist ID** and fix hints. |
| Rate limit messaging | SPOT-02 | Hard to force 429 reliably | If 429 encountered in the wild, message should mention **rate limit** and optional retry; optional doc note in README. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s for automated steps
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 05
slug: spotify-playlist-e2e-acceptance
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-05
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — TypeScript compiler only |
| **Config file** | `tsconfig.json` |
| **Quick run command** | `yarn type-check` |
| **Full suite command** | `yarn type-check` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn type-check`
- **After every plan wave:** Run `yarn type-check`
- **Before `/gsd-verify-work`:** `yarn type-check` must pass
- **Max feedback latency:** Manual E2E run is unbounded (network)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DL-01 | manual | `yarn type-check` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | DL-01 | manual | `rg "## E2E run" .planning/phases/05-spotify-playlist-e2e-acceptance/05-01-SUMMARY.md` | ✅ | ⬜ pending |
| 05-01-03 | 01 | 1 | DL-01 | manual | `yarn type-check` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | DL-01 | grep/docs | `yarn type-check` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 2 | DL-01 | grep/docs | `yarn type-check` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure: `yarn type-check` covers compile safety.
- No new test framework for this phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Spotify → disk E2E | DL-01 | Needs `config/local.json` credentials + network | Run `yarn download --url "<public playlist>"`; confirm MP3s under output folder; note `[execution][finished]` counts |
| Partial download failures | DL-01 | Network + YouTube variability | Use playlist where some searches may fail; confirm logs show fails count without silent abort |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [ ] Feedback latency < 60s for automated portions
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

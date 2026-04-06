---
phase: 02
slug: reliable-download-output
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript (`tsc`) — no Jest/Vitest in repo today |
| **Config file** | `tsconfig.json` |
| **Quick run command** | `yarn type-check` |
| **Full suite command** | `yarn build && yarn verify:phase1-rules` |
| **Estimated runtime** | ~30–90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `yarn type-check`
- **After every plan wave:** Run `yarn build && yarn verify:phase1-rules`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds (includes manual smoke when required)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| *TBD* | 02-01 | 1 | DL-02 | type-check + doc grep | `yarn type-check` | ⬜ W0 | ⬜ pending |
| *TBD* | 02-02 | 1 | DL-02 | type-check + runtime message | `yarn type-check` | ⬜ W0 | ⬜ pending |
| *TBD* | 02-03 | 2 | DL-03 | type-check + doc grep | `yarn type-check` | ⬜ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Fill task IDs after PLAN.md tasks are written.*

---

## Wave 0 Requirements

- [ ] **Existing infrastructure** — `yarn type-check` / `yarn build` cover compile-time regressions for downloader and folder code.
- [ ] **No new test framework** required unless a plan explicitly adds one (out of scope for Phase 2 unless planner mandates minimal script).

*Wave 0: rely on TS compile + manual download smoke per RESEARCH.md.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| YouTube URL → MP3 on disk | DL-02 | Network + YouTube TOS / rate limits | Run `yarn download` with 1–3 known public URLs or tiny fixture list; confirm process does not crash; console shows per-track success/failure. |
| Folder naming under output root | DL-03 | Needs real playlist name or 1001 URL | After run, inspect `outputPath`: folder matches `Spotify-{name}` / `1001tracklists-{slug}` per README; forbidden chars stripped on Windows. |
| FFmpeg preflight message | DL-02 | Requires invalid/missing path in config | Temporarily set bogus `ffmpegPath` in `config/local.json`; confirm early error names key and fix hint before download starts. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s for automated steps
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

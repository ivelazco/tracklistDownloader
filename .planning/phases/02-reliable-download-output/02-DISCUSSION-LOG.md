# Phase 2: Reliable download & output - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `02-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 2-Reliable download & output
**Areas discussed:** YouTube acquisition strategy, Parallelism & per-track failures, Output path & folder naming, FFmpeg & config surfacing

---

## YouTube acquisition strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Harden existing `ytdl-mp3` stack | Audit resolutions/env, keep `Downloader` path; document as primary | ✓ |
| Move primary to `yt-dlp` | Subprocess-first maintainability | |
| Hybrid / flag only | Two backends in parallel from day one | |

**User's choice:** **All** areas selected; **recommended** option: **harden and document existing stack first**; **if audit fails v1 bar, adopt `yt-dlp` (or hybrid) within Phase 2** (see CONTEXT D-01, D-02).
**Notes:** Aligns with ROADMAP success criterion: chosen strategy **implemented and documented**.

---

## Parallelism & per-track failures

| Option | Description | Selected |
|--------|-------------|----------|
| Settled batch + bounded concurrency | `prAll` semantics + explicit cap tied to `queueParallelism` or code limiter | ✓ |
| Unbounded map | Current map-of-promises only | |
| Fail-fast batch | Abort whole run on first failure | |

**User's choice:** Recommended: **keep settled aggregation**; **add explicit concurrency ceiling** (CONTEXT D-03, D-04).
**Notes:** Carries forward GOV-02 / memory-and-concurrency.mdc honesty.

---

## Output path & folder naming

| Option | Description | Selected |
|--------|-------------|----------|
| `--path` = override directory, mkdir if needed | Consistent with downloader folder prep | ✓ |
| `--path` must exist | Stricter UX | |
| Collision: auto-suffix folders | New subfolders per run | |

**User's choice:** Recommended: **`--path` overrides computed folder, directory, create if missing**; **stronger filename sanitization**; **reuse folder on name collision** (CONTEXT D-05–D-07).

---

## FFmpeg & config surfacing

| Option | Description | Selected |
|--------|-------------|----------|
| Early validate + README docs | Fail before heavy work; README as primary doc | ✓ |
| First-download failure only | Lazy discovery | |
| Full rules duplication | Copy all config into `.cursor/rules` | |

**User's choice:** Recommended: **early `ffmpegPath` validation**, **actionable errors**, **README primary** + optional short rules pointer (CONTEXT D-08, D-09).

---

## Claude's Discretion

- Concurrency mechanism if library ignores `queueParallelism`; exit codes; log noise vs signal; exact sanitization (see CONTEXT).

## Deferred Ideas

- Phase 3 dependency cleanup; Phase 4 Spotify robustness; SRCH-01; auto-suffix on collision (see CONTEXT `<deferred>`).

---

## Review session (discuss-phase update)

**Date:** 2026-04-04  
**Prompt:** Batched options A1–A4 (see prior chat). User reply: **A1:1, A2:1, A3:A, A4:A**.

| Area | Choice | Recorded as |
|------|--------|-------------|
| YouTube acquisition | 1 | D-01, D-02 unchanged — harden `ytdl-mp3` first; `yt-dlp`/hybrid in Phase 2 if audit fails v1 bar |
| Parallelism & per-track failures | 1 | D-03, D-04 unchanged — settled batch + explicit concurrency ceiling |
| Output path & folder naming | A → 1 | D-05–D-07 unchanged — `--path` override, mkdir, sanitization, reuse folder on collision |
| FFmpeg & config surfacing | A → 1 | D-08–D-09 unchanged — early `ffmpegPath` validation, README primary |

**Notes:** `A` for areas 3–4 interpreted as **recommended / option 1** (same rows as first session). No decision deltas; CONTEXT reaffirmed.

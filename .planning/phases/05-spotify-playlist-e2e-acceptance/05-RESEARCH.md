# Phase 5: Spotify playlist E2E acceptance — Research

**Researched:** 2026-04-05  
**Domain:** CLI entry (`lambda.ts` / `yarn download`), `handler` pipeline, partial failures vs DL-01, acceptance documentation  
**Confidence:** HIGH (ground truth from `src/handler.ts`, `src/youtubeDownloader/index.ts`, `src/youtubeSearcher/index.ts`, `README.md`)

<user_constraints>

Scope locked by **05-CONTEXT.md**, **ROADMAP Phase 5**, **REQUIREMENTS DL-01**, and `.cursor/rules/`. Integration fixes only for blockers (D-09).

</user_constraints>

<phase_requirements>

| ID | Description | Research support |
|----|-------------|------------------|
| **DL-01** | Spotify playlist URL → completed downloads; partial failures reported; no silent abort | Entry: `lambda.ts` → `handler`; fatal errors exit via `process.exit(1)`; `ytDownloader` uses batched `Promise.allSettled` + `printResults` → per-track success/fail counts in `[execution][finished]` |

</phase_requirements>

---

## Executive summary

**E2E surface:** `yarn download --url '<spotify-playlist-url>'` (`package.json` script → `lambda.ts` → `handler`). Optional `--path` overrides output per Phase 2 (resolved from cwd, mkdir recursive).

**Partial failures:** `youtubeSearcher` uses `prAll` + `responseFormatter` — tracks without a string URL are omitted; **non-empty** URL list proceeds to download. **Empty** list → `handler` throws `no youtube URLs found` (acceptable when no track resolved). Downloader aggregates `fulfilled` / `rejected` per batch and logs counts — process can still exit **0** if `handler` resolves (DL-01 “partial failures reported” is log-based, not necessarily non-zero exit).

**Risks for 05-01:** Spotify credentials / rate limits (Phase 4), FFmpeg path, YouTube search flakiness, long wall-clock time on modest playlists. No automated E2E in repo — proof is **maintainer local run** (D-01).

**05-02:** Checklist under phase dir + README pointer (D-07/D-08); prerequisites: Node `>=18`, `yarn install`, `config/local.json`, public playlist URL placeholder.

---

## Implementation findings

### `lambda.ts`

- `yargs`: `--url` required; `--path` optional; `--json` present (handler third arg currently unused for branching in snippet — verify if JSON mode affects E2E).
- Uncaught rejection → `Fatal error` + `process.exit(1)`.

### `handler.ts`

- Order: `getTracklist` → `searchYtVideos` → `createFolder` → `assertFfmpegAvailable` → `ytDownloader`.
- Empty tracklist → `no tracklist list found`.
- Empty YouTube URL array → `no youtube URLs found`.

### `youtubeDownloader/index.ts`

- Batches with `queueParallelism`; `Promise.allSettled` per batch; errors logged per video; `printResults` summarizes successfuls/fails.

### Documentation

- README already lists `yarn download` with Spotify example URL placeholder `your_playlist_id`.

---

## Risks / out of scope

- **CI E2E** with real Spotify/YouTube: out of scope (secrets, flakiness); manual checklist only.
- **1001tracklists** path: not Phase 5 focus unless it blocks shared code changes.

---

## Validation Architecture

Phase 5 validation is **compile-first** plus **manual Spotify playlist run** and **documentation grep checks**:

| Dimension | Approach |
|-----------|----------|
| Correctness | `yarn type-check` after any code change; maintainer E2E: files appear under expected folder (`Spotify-…` under output root or `--path`) |
| Partial failures | Console contains `[execution][finished]` with Successfuls/Fails counts after a run where some tracks fail |
| Regression | Checklist markdown exists; README links to it |

Executor should run `yarn type-check` after each plan’s code edits.

## RESEARCH COMPLETE

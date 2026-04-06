---
phase: 02-reliable-download-output
status: passed
verified: 2026-04-04
---

# Phase 2 verification

## Goal (from ROADMAP)

YouTube → disk path is maintainable; output directory behavior matches config and is predictable for playlists.

## Must-haves

| Criterion | Evidence |
|-----------|----------|
| Maintainable acquisition + documented strategy | `src/youtubeDownloader/index.ts` — `PHASE2-AUDIT`, `PHASE2-DECISION` (`STRATEGY=ytdl-mp3-only`), bounded `queueParallelism` batches |
| FFmpeg validated early with actionable errors | `src/utils/ffmpegPreflight.ts` — `assertFfmpegAvailable`; `src/handler.ts` calls before downloads |
| Strategy documented for contributors | README `## Download strategy (DL-02)` — `ytdl-mp3`, `ffmpeg-static`, `ffmpegPath`, `queueParallelism`, `lambda.ts` / `YTDL_NO_UPDATE` |
| Output root + naming documented | README `## Output layout (DL-03)` — `outputPath`, `Spotify-`, `1001tracklists-`, `--path`, reuse |
| Folder naming stable (D-06/D-07) | `src/folderManager/index.ts` — `sanitizePlaylistFolderName`, `WINDOWS_FORBIDDEN`, prefixes, reuse log |
| Per-track failure visibility preserved | `src/youtubeDownloader/index.ts` — per-URL `.then`/`.catch` logging + `Promise.allSettled` per batch |

## Automated checks

- `yarn type-check` — exit 0
- `yarn build` — exit 0
- `yarn verify:phase1-rules` — exit 0 (regression)

## Requirements traceability

- DL-02 — plans 02-01, 02-02
- DL-03 — plan 02-03

## human_verification

Optional: run `yarn download` with `queueParallelism: 1` and confirm logs show sequential batches; set invalid `ffmpegPath` and confirm error mentions `youtubeMp3Downloader.ffmpegPath`; run with `--path ./tmp-dl` twice and confirm reuse messaging.

# Tracklist Downloader

## What This Is

A **local CLI** that turns a **Spotify playlist URL** or **1001tracklists.com** URL into an ordered track list, resolves **YouTube** matches per track, and **downloads audio** (MP3 via FFmpeg / `ytdl-mp3`) into a folder under a configured output root. It is a long-lived personal repo that has **drifted and broken** over time; this milestone prioritizes **reliability** and **clear engineering rules** before new features.

## Core Value

**A Spotify playlist URL must successfully drive the full pipeline to downloaded files** — and the codebase must be **governed by explicit `.cursor/rules`** so functional style, memory discipline, utilities, and hooks stay consistent with how the code actually works.

## Requirements

### Validated

- ✓ **CLI entry** — `lambda.ts` with `yargs` (`--url`, optional `--path`, `--json` flag present) → `src/handler.ts` orchestrates the pipeline (`yarn download`).
- ✓ **Source routing** — `scrapperRouter` dispatches Spotify vs 1001tracklists (`src/sourceScrappers/`).
- ✓ **Spotify integration** — `spotify-web-api-node` for playlist metadata and tracks (`spotify-scrapper.ts`).
- ✓ **1001tracklists path** — Playwright + Cheerio (+ captcha/OCR stack) in `1001-scrapper.ts`.
- ✓ **YouTube resolution** — `yt-search`–based search per track (`src/youtubeSearcher/`).
- ✓ **Download execution** — `ytdl-mp3` `Downloader` with **application-level** `queueParallelism` batches and `Promise.allSettled` per batch (`src/youtubeDownloader/`); **PHASE2** audit/decision comments on disk.
- ✓ **FFmpeg preflight** — `assertFfmpegAvailable` before downloads (`src/utils/ffmpegPreflight.ts`, `src/handler.ts`); README **DL-02** / **DL-03** documents strategy and output layout.
- ✓ **Output paths** — Windows-safe `Spotify-` / `1001tracklists-` folder names; optional `--path` override with recursive mkdir (`src/folderManager/`, `src/handler.ts`).
- ✓ **Functional composition** — Ramda + `@flybondi/ramda-land` (`compose`/`pipe`, `prAll`, `tapAfter`, guards).
- ✓ **Typed static config** — `config/local.json` imported as `Config` (`src/types/config.d.ts`).
- ✓ **Output layout** — Folder naming and creation under `youtubeMp3Downloader.outputPath` (`src/folderManager/`).
- ✓ **Engineering rules in `.cursor/rules`** — Validated in Phase 1: FP, memory/concurrency, utils/barrels, hooks (CLI-first), Node `engines` + `verify-phase1-rules` (GOV-01–04, QUAL-01).
- ✓ **Dependency & config honesty (QUAL-02)** — Phase 3: YouTube search is `yt-search` only (no misleading YouTube Data API key in `Config`); legacy direct deps trimmed; README **`## Config keys`** + `config/local.json.example` match `src/types/config.d.ts`.
- ✓ **Spotify API robustness (SPOT-01/02)** — Phase 4: paged `getPlaylistTracks`, actionable Spotify errors.
- ✓ **Spotify playlist E2E + regression checklist (DL-01)** — Phase 5: maintainer E2E recorded in **`05-01-SUMMARY.md`**; **`[execution][finished]`** counts fixed; **`05-MANUAL-ACCEPTANCE.md`** + README link; client-credentials **`market`** + README note on editorial vs user playlists.

### Active

- [ ] **Next milestone** — Define post–v1.0 goals (download stack upgrades, CI, etc.) when ready.

### Out of Scope

- **New product features** — Deferred until rules + Spotify download path are solid; then prioritize together.
- **Hosted service / multi-user product** — Local CLI only; no in-scope deployment model.
- **Legal use of downloaded audio** — User responsible for compliance with YouTube, Spotify, and local law; tool is a technical automation aid.

## Context

- **Brownfield:** Codebase mapped under `.planning/codebase/` (architecture, stack, structure). Pipeline is **single-process**, no HTTP server; concurrency is **Promise-based** (parallel search and download).
- **Pain:** Dependencies and YouTube access patterns change often; **`ytdl-core` / related stack** and **FFmpeg** must be correctly configured (`config/local.json`).
- **Tooling:** Yarn Berry, TypeScript 5.x, Playwright as **runtime** dependency for 1001 scraping.
- **User intent:** Rules live under **`.cursor/rules`** at minimum.

## Constraints

- **Tech:** Node.js, Yarn, FFmpeg on disk, `config/local.json` for secrets and paths (no `.env` in repo today).
- **Ecosystem:** YouTube and Spotify APIs / HTML may rate-limit or change; scrapers may need maintenance.
- **Compatibility:** `engines.node` is `>=18` (aligned with Playwright); README and rules cross-link.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Engineering rules live in **`.cursor/rules/`** | User preference; keeps AI and humans aligned on repo conventions | Phase 1: `.mdc` rules + verification script |
| **V1 acceptance** = Spotify playlist downloads work | User-defined minimum for “fixed” | Phase 5: pipeline + partial-failure reporting verified; confirm MP3s on host where ytdl works |
| **CLI-first** milestone | Existing architecture; UI/hooks rules follow actual code | Phase 1–5 complete for v1.0 milestone |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-05 after Phase 5 completion*

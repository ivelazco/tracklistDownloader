# Phase 2: Reliable download & output - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a **maintainable YouTube → disk** acquisition path and **predictable output layout** under `config/local.json`, including **FFmpeg** handling and **folder naming** that matches documented behavior for **Spotify playlists** (and existing 1001 path). Scope is DL-02 and DL-03; dependency inventory, unused API clients, and Spotify API pagination are **out of scope** (later phases).

</domain>

<decisions>
## Implementation Decisions

### YouTube acquisition strategy (DL-02)
- **D-01:** **Primary approach:** audit, harden, and keep the **existing `ytdl-mp3`-centric stack** in `src/youtubeDownloader/index.ts` (transitive `ytdl-core` family, `YTDL_NO_UPDATE`, `package.json` resolutions) as the **default implementation path** for Phase 2.
- **D-02:** **If** the audit shows that stack cannot meet “maintainable + stable downloads” for v1, **replace or supplement** with a **`yt-dlp` subprocess-backed** path (or documented hybrid) **within Phase 2**, and treat the **final** choice as the **documented** strategy in README (not an open-ended TODO).

### Parallelism & per-track failures
- **D-03:** Preserve **settled aggregation** for a batch of downloads (`prAll` / `Promise.allSettled` semantics) — **do not** fail-fast the entire playlist on the first rejected track; each failure remains **visible**.
- **D-04:** Apply an **explicit concurrency ceiling** for in-flight downloads aligned with **`youtubeMp3Downloader.queueParallelism`** in config **when the downloader supports it**; if the library does not honor it, implement a **small limiter/window** in code so parallel fan-out is **bounded and intentional** (GOV-02).

### Output path & folder naming (DL-03)
- **D-05:** **`--path`** (CLI) is an optional **override of the per-run output directory** (the folder passed to the downloader). Treat it as a **directory path**; **create it recursively if missing**, consistent with current `youtubeDownloader` folder checks.
- **D-06:** Keep **playlist-derived folder names** as today: **`Spotify-{playlistName}`** and **`1001tracklists-{slug}`**, with spaces normalized to hyphens; **extend sanitization** for OS-forbidden characters and messy titles so paths stay stable on Windows.
- **D-07:** On **naming collision**, **reuse the existing folder** (current behavior) and **document** it; do **not** add auto-suffix folders in Phase 2 unless a plan proves unavoidable.

### FFmpeg & config surfacing (DL-02)
- **D-08:** **Validate `ffmpegPath` early** in the download path (before or at the start of the download phase) and fail with a **clear, actionable** message (key name, expected executable, typical fix).
- **D-09:** **Document** FFmpeg installation, `ffmpegPath`, `outputPath`, and downloader-related keys **primarily in README**; optional **short pointer** in `.cursor/rules` only if it reduces agent/human drift (no duplicate full config prose in rules).

### Claude's Discretion
- Exact **limiter implementation** (queue vs p-map style) if `queueParallelism` is not wired by the library.
- **Exit code** policy when some tracks fail (if not already defined in CLI).
- **Log verbosity** cleanup after behavior is correct (keep useful failure signal).
- **Exact** sanitization rules beyond the above principles.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap & requirements
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, plans 02-01 … 02-03.
- `.planning/REQUIREMENTS.md` — DL-02, DL-03 (traceability to Phase 2).
- `.planning/PROJECT.md` — V1 bar, CLI/config model, brownfield context.

### Prior phase & governance
- `.planning/phases/01-engineering-rules-environment/01-CONTEXT.md` — FP, `prAll`, concurrency honesty, logging, barrels.
- `.cursor/rules/functional-style.mdc` — GOV-01 patterns for downloader/search touchpoints.
- `.cursor/rules/memory-and-concurrency.mdc` — GOV-02; bounded parallelism expectation.
- `.cursor/rules/utils-and-modules.mdc` — GOV-03; barrels and console logging.

### Codebase ground truth
- `.planning/codebase/STACK.md` — `ytdl-mp3`, FFmpeg, transitive ytdl ecosystem notes.
- `.planning/codebase/STRUCTURE.md` — `src/` layout and pipeline wiring.
- `.planning/codebase/CONVENTIONS.md` — logging and module conventions.

### Implementation targets
- `src/youtubeDownloader/index.ts` — `Downloader`, folder prep, `prAll` aggregation.
- `src/folderManager/index.ts` — `outputPath`, Spotify vs 1001 folder naming.
- `src/handler.ts` — `createFolder`, `--path` override, orchestration order.
- `src/types/config.d.ts` — `youtubeMp3Downloader` shape (`ffmpegPath`, `outputPath`, `queueParallelism`, etc.).
- `lambda.ts` — CLI flags (`--url`, `--path`, `--json`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/youtubeDownloader/index.ts`:** `ytdl-mp3` `Downloader`, merges `config.youtubeMp3Downloader` with per-run `outputDir`, uses `prAll` + `printResults`.
- **`src/folderManager/index.ts`:** Builds folder under `youtubeMp3Downloader.outputPath` using playlist name or 1001 slug.
- **`src/utils/index.ts`:** `prAll`, `printResults` — keep as the batch result pattern.

### Established Patterns
- **Console logging** with `[namespace]` prefixes across handler and downloader.
- **Config** loaded via static import of `config/local.json` in downloader, folder manager, searcher.

### Integration Points
- **`handler.ts`** chains tracklist → YouTube URLs → `createFolder` → optional `--path` → `ytDownloader`.
- **`process.env.YTDL_NO_UPDATE`** set in `lambda.ts` before imports — part of the ytdl maintenance story.

</code_context>

<specifics>
## Specific Ideas

User selected **all** discussion areas; decisions adopt the **recommended** options summarized in `02-DISCUSSION-LOG.md` unless planning surfaces a conflict.

</specifics>

<deferred>
## Deferred Ideas

- **Unused `simple-youtube-api` / API key path**, legacy `request`, and search-path cleanup — **Phase 3** (QUAL-02).
- **Spotify pagination and API error normalization** — **Phase 4**.
- **Search-quality heuristics** — v2 / backlog (SRCH-01).
- **Auto-suffix folders on collision** — not in Phase 2 (D-07).

</deferred>

---

*Phase: 02-reliable-download-output*
*Context gathered: 2026-04-04*

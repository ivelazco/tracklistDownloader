# Architecture

**Analysis Date:** 2026-04-03

## Pattern Overview

**Overall:** Single-process **CLI pipeline** (no HTTP server). A thin **orchestrator** coordinates sequential async steps: resolve a tracklist → resolve YouTube URLs → prepare an output directory → download audio. Vertical **feature folders** under `src/` own each step; **shared utilities** and **ambient types** live alongside.

**Key Characteristics:**
- **Script entry + handler:** `lambda.ts` parses CLI flags; `src/handler.ts` runs the full workflow.
- **URL-based source routing:** `src/sourceScrappers/index.ts` dispatches to Spotify vs 1001tracklists implementations.
- **Functional composition:** Ramda (`compose`, `pipe`, `map`, etc.) and `@flybondi/ramda-land` (`isNilOrEmpty`, `prAll` pattern helpers) shape validation and aggregation.
- **Static JSON config:** Runtime settings load from `config/local.json` (typed via `src/types/config.d.ts`); modules cast imported JSON as `Config`.

## Layers

**CLI / entry:**

- Purpose: Parse arguments, set process-level flags, invoke the pipeline, exit on failure.
- Location: `lambda.ts`
- Contains: yargs setup, `process.env.YTDL_NO_UPDATE`, fatal error handling.
- Depends on: `src/handler.ts`, Node.js `process`.
- Used by: `yarn download` / `node -r ts-node/register ./lambda.ts`.

**Application orchestration:**

- Purpose: Order pipeline steps and enforce invariants (non-empty tracklist and YouTube URL list).
- Location: `src/handler.ts`
- Contains: default test URL constant, `handler(url, path, _jsonList)` async function.
- Depends on: `src/youtubeDownloader/index.ts`, `src/sourceScrappers/index.ts`, `src/youtubeSearcher/index.ts`, `src/folderManager/index.ts`, `@flybondi/ramda-land`.
- Used by: `lambda.ts`.

**Source acquisition (tracklists):**

- Purpose: Turn a user URL into an ordered `string[]` of track labels (artist + title style strings).
- Location: `src/sourceScrappers/`
- Contains: `scrapperRouter` in `index.ts`; Spotify API client in `spotify-scrapper.ts`; Playwright + Cheerio + OCR path in `1001-scrapper.ts`.
- Depends on: `src/utils` (`tapAfter`), `src/types`, `config/local.json` (Spotify credentials), external APIs and browser automation.
- Used by: `src/handler.ts` (imported as default `getTracklist`).

**YouTube resolution:**

- Purpose: Map each track string to a single watch URL using `yt-search` heuristics (duration, title blacklist).
- Location: `src/youtubeSearcher/index.ts`
- Contains: `searchYtVideos`, `youtubeVideoSearcher`, `prAll`-based aggregation with `responseFormatter`.
- Depends on: `simple-youtube-api` (instantiated; search path primarily uses `yt-search`), `config/local.json` (YouTube API key), `src/utils`, `src/types`, Ramda.
- Used by: `src/handler.ts`.

**Filesystem layout:**

- Purpose: Derive a folder name from the source URL and create `{outputPath}/{folderName}` under configured base path.
- Location: `src/folderManager/index.ts`
- Contains: `createFolder`, `getFolderName`, Spotify playlist name lookup for naming.
- Depends on: `fs`, Ramda, `config/local.json`, `getSpotifyPlaylistName` from `src/sourceScrappers/spotify-scrapper.ts`.
- Used by: `src/handler.ts`.

**Download execution:**

- Purpose: Run `ytdl-mp3` `Downloader` over resolved URLs, parallel per track, aggregate settled results for logging.
- Location: `src/youtubeDownloader/index.ts`
- Contains: `ytDownloader`, Ramda guards (`throwIfVideosIsNilOrEmpty`), directory existence checks, `prAll(printResults(folderPath))`.
- Depends on: `ytdl-mp3`, `fs`, `config/local.json`, `src/utils`.
- Used by: `src/handler.ts`.

**Shared utilities:**

- Purpose: Promise aggregation (`Promise.allSettled` + formatter), logging wrapper after async calls, console reporting for download outcomes.
- Location: `src/utils/index.ts`, `src/utils/printUtils.ts`
- Contains: `prAll`, `tapAfter`, `printResults`, `groupByStatus`, etc.
- Depends on: `src/types`, Ramda / ramda-land.
- Used by: `youtubeDownloader`, `youtubeSearcher`, `sourceScrappers` (Spotify + 1001).

**Types:**

- Purpose: Shared interfaces for config, Spotify/YouTube shapes, and settled promise results.
- Location: `src/types/config.d.ts`, `src/types/api.d.ts`, `src/types/index.d.ts`
- Contains: `Config`, API response subsets, `SettledResult` / `FulfilledResult` / `RejectedResult`.
- Depends on: Nothing at runtime (declarations only).
- Used by: Modules that import from `../types` or `../types/config`.

## Data Flow

**End-to-end download pipeline:**

1. `lambda.ts` reads `--url`, optional `--path`, optional `--json` (flag present but **not wired** in `handler`; `_jsonList` is unused).
2. `handler` calls default export from `src/sourceScrappers/index.ts` → `scrapperRouter(url)` returns `string[]` (tracklist).
3. If empty → throw. Else `searchYtVideos(tracklist)` in `src/youtubeSearcher/index.ts` returns `string[]` of YouTube URLs.
4. If empty → throw. Else `createFolder(url)` builds path under `config.youtubeMp3Downloader.outputPath`.
5. `handler` sets `finalPath` to CLI `--path` if provided, otherwise the folder from step 4.
6. `ytDownloader(youtubeUrls, finalPath)` validates folder, constructs `Downloader`, maps each URL to `downloadSong`, runs `prAll(printResults(finalPath))` over the promise array.

**State management:**

- **No global app state:** Each step uses module-level config (`const config = configData as Config`) and passes data through function arguments and return values.
- **Concurrency:** Multiple parallel `Promise` chains (search per track; download per URL) with results merged via `Promise.allSettled` and formatters.

## Key Abstractions

**Scraper router (`scrapperRouter`):**

- Purpose: Single entry for “URL → tracklist” regardless of host.
- Examples: `src/sourceScrappers/index.ts`
- Pattern: String inspection on lowercase URL; Spotify branch vs default to `1001-scrapper`.

**`prAll` + result formatter:**

- Purpose: Standardize “many async operations → summarize successes/failures” without failing the whole batch on one rejection.
- Examples: `src/utils/index.ts` (`prAll`), `src/youtubeSearcher/index.ts` (`responseFormatter`, `prAllYoutubeVideoSearches`), `src/youtubeDownloader/index.ts` (download promises + `printResults`).
- Pattern: Curried `(formatter) => (promises) => Promise.allSettled(promises).then(formatter)`.

**`tapAfter` logging wrapper:**

- Purpose: Run an async function, then log with access to resolved value (used to wrap scrapers).
- Examples: `src/utils/index.ts`, exports on `getSpotifyPlaylistTracks` and default export in `1001-scrapper.ts`.
- Pattern: `tapAfter(logFn, asyncImpl)(args)`.

**Config as typed JSON import:**

- Purpose: One shared shape for FFmpeg paths, output root, YouTube key, Spotify credentials.
- Examples: `src/types/config.d.ts`, imports in `youtubeDownloader`, `folderManager`, `youtubeSearcher`, `spotify-scrapper`.
- Pattern: `import configData from '../../config/local.json'; const config = configData as Config;`

## Entry Points

**Primary CLI:**

- Location: `lambda.ts`
- Triggers: `yarn download` / `npm run download` (see `package.json` `scripts.download`).
- Responsibilities: yargs CLI, call `handler(argv.url, argv.path, argv.json)`, `process.exit(1)` on fatal error.

**Pipeline implementation:**

- Location: `src/handler.ts`
- Triggers: Import from `lambda.ts` (default export).
- Responsibilities: Orchestrate scraper → search → folder → download; console progress logs.

**TypeScript compile output:**

- `tsconfig.json` sets `outDir` to `dist/` and `rootDir` to `./`; `include` covers `src/**/*` and `lambda.js` (legacy include). Executable path for development is ts-node on `lambda.ts`, not necessarily `dist/` for the script.

## Error Handling

**Strategy:** Mix of **throwing** for pipeline-blocking failures and **per-item logging** for partial failures inside parallel work.

**Patterns:**

- **Orchestrator:** `src/handler.ts` wraps the pipeline in `try/catch`, logs with `console.error`, rethrows so `lambda.ts` can exit non-zero.
- **Guards:** Empty tracklist or empty YouTube URL list → `throw new Error(...)` in `handler`; `youtubeDownloader` throws if folder missing/invalid or video list empty after filtering.
- **Partial failure:** Individual `downloadSong` promises attach `.catch` for logging while still participating in `allSettled`; `youtubeVideoSearcher` may return errors from `yt-search` which upstream coerces to `undefined` in the URL list.

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` with bracketed prefixes (`[handler]`, `[ytDownloader]`, `[Spotify]`, etc.) across modules.

**Validation:** Ramda-based emptiness checks (`isNilOrEmpty`, `rejectNilOrEmpty`); URL substring checks for Spotify vs 1001; downloader verifies directory with `fs.existsSync` / `fs.statSync`.

**Authentication:** Spotify Client Credentials via `spotify-web-api-node` using IDs from config (not hardcoded in source). YouTube Data API key in config for `simple-youtube-api` instance (search path also uses `yt-search`).

---

*Architecture analysis: 2026-04-03*

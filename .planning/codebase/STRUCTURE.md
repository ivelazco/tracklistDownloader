# Codebase Structure

**Analysis Date:** 2026-04-03

## Directory Layout

```
tracklistDownloader/
├── lambda.ts                 # CLI entry (yargs → handler)
├── lambda.js                 # Legacy/alternate JS entry (see tsconfig include)
├── package.json
├── tsconfig.json
├── yarn.lock
├── .eslintrc.json
├── config/
│   ├── local.json            # Local secrets/paths (gitignored pattern typical; do not commit secrets)
│   └── local.json.example    # Template for required JSON keys
├── src/
│   ├── handler.ts            # Pipeline orchestrator
│   ├── folderManager/
│   │   └── index.ts          # Output directory creation and naming
│   ├── sourceScrappers/
│   │   ├── index.ts          # URL router (default export: scrapperRouter, imported as getTracklist)
│   │   ├── 1001-scrapper.ts  # 1001tracklists + Playwright/OCR flow
│   │   └── spotify-scrapper.ts
│   ├── youtubeDownloader/
│   │   └── index.ts          # ytdl-mp3 batch download
│   ├── youtubeSearcher/
│   │   └── index.ts          # yt-search / URL resolution per track
│   ├── types/
│   │   ├── index.d.ts        # Re-exports config + api types
│   │   ├── config.d.ts
│   │   └── api.d.ts
│   └── utils/
│       ├── index.ts          # prAll, tapAfter, re-exports print helpers
│       └── printUtils.ts
├── .planning/
│   └── codebase/             # GSD codebase map outputs (this folder)
├── .agents/                  # Agent skills (documentation)
└── [numeric]-player-script.js  # Ephemeral/debug artifacts at repo root (not part of app architecture)
```

## Directory Purposes

**`src/`:**

- Purpose: All TypeScript application logic for the download pipeline.
- Contains: One orchestrator file, feature folders with `index.ts` barrels, `types/`, `utils/`.
- Key files: `src/handler.ts`, `src/sourceScrappers/index.ts`, `src/youtubeDownloader/index.ts`, `src/youtubeSearcher/index.ts`, `src/folderManager/index.ts`.

**`src/sourceScrappers/`:**

- Purpose: Implementations that produce `string[]` tracklists from URLs; central router chooses implementation.
- Contains: `1001-scrapper.ts` (heavy: Playwright, Cheerio, Sharp, Tesseract), `spotify-scrapper.ts` (API), `index.ts` (routing).
- Key files: `src/sourceScrappers/index.ts`, `src/sourceScrappers/1001-scrapper.ts`, `src/sourceScrappers/spotify-scrapper.ts`.

**`src/youtubeSearcher/`:**

- Purpose: YouTube URL discovery per track name.
- Contains: `index.ts` only.
- Key files: `src/youtubeSearcher/index.ts`.

**`src/youtubeDownloader/`:**

- Purpose: Audio download orchestration using `ytdl-mp3`.
- Contains: `index.ts` only.
- Key files: `src/youtubeDownloader/index.ts`.

**`src/folderManager/`:**

- Purpose: Folder naming and creation under configured output root.
- Contains: `index.ts` only.
- Key files: `src/folderManager/index.ts`.

**`src/types/`:**

- Purpose: Ambient `.d.ts` modules for `Config` and external API shapes used in the app.
- Contains: `config.d.ts`, `api.d.ts`, barrel `index.d.ts`.
- Key files: `src/types/config.d.ts`, `src/types/api.d.ts`, `src/types/index.d.ts`.

**`src/utils/`:**

- Purpose: Shared promise helpers and download result printing.
- Contains: `index.ts`, `printUtils.ts`.
- Key files: `src/utils/index.ts`, `src/utils/printUtils.ts`.

**`config/`:**

- Purpose: Non-code configuration consumed via `import ... from '../../config/local.json'` (paths relative to importing file).
- Contains: JSON settings; use `config/local.json.example` as the documented shape.
- Key files: `config/local.json.example`, `config/local.json` (local only).

**`.planning/codebase/`:**

- Purpose: Structured codebase documentation for GSD planning and execution.
- Contains: Markdown references (STACK, ARCHITECTURE, STRUCTURE, etc.).

## Key File Locations

**Entry Points:**

- `lambda.ts`: CLI; run via `package.json` script `download`.
- `src/handler.ts`: Default export `handler` — the programmatic entry for the full pipeline.

**Configuration:**

- `tsconfig.json`: `commonjs`, `outDir` `dist/`, `rootDir` `./`, permissive strictness; excludes `**/*.test.ts`, `**/*.spec.ts`, `config/local.json` from compilation scope.
- `config/local.json`: Runtime JSON loaded by downloader, searcher, folder manager, Spotify scraper (do not document secret values in repo docs).

**Core Logic:**

- `src/handler.ts`: Step ordering and validation.
- `src/sourceScrappers/index.ts`: Source URL routing.
- `src/sourceScrappers/1001-scrapper.ts`, `src/sourceScrappers/spotify-scrapper.ts`: Site-specific tracklist extraction.
- `src/youtubeSearcher/index.ts`: Track → YouTube URL.
- `src/folderManager/index.ts`: Output path preparation.
- `src/youtubeDownloader/index.ts`: MP3 download batch.

**Testing:**

- No `*.test.ts` / `*.spec.ts` files detected under `src/`; `tsconfig.json` excludes such patterns for future tests.

## Naming Conventions

**Files:**

- **Scraper modules:** kebab-case with domain suffix, e.g. `1001-scrapper.ts`, `spotify-scrapper.ts`.
- **Feature folders:** camelCase single-word or compound (`folderManager`, `youtubeDownloader`, `youtubeSearcher`, `sourceScrappers`).
- **Types:** `*.d.ts` under `src/types/`; `config.d.ts` and `api.d.ts` for domain split.
- **Root entry:** `lambda.ts` (TypeScript source used by the download script).

**Directories:**

- **`src/<feature>/`:** One primary concern per folder; default implementation in `index.ts` except large scrapers split into named files + `index.ts` router.

**Exports:**

- **Default exports:** `handler`, `scrapperRouter` (imported as `getTracklist` in `handler.ts`), `createFolder`, `searchYtVideos`, `ytDownloader`, default from `1001-scrapper.ts`.
- **Named exports:** `getSpotifyPlaylistTracks`, `getSpotifyPlaylistName` from `spotify-scrapper.ts`; utility named exports from `src/utils/index.ts`.

## Where to Add New Code

**New tracklist source (new URL host):**

- Implementation: Add `src/sourceScrappers/<name>-scrapper.ts` (follow existing scraper patterns and default or named exports).
- Registration: Extend `scrapperRouter` in `src/sourceScrappers/index.ts` with a new `lowerUrl` branch before the default 1001 fallback.
- If folder naming needs host-specific behavior: Update `getFolderName` in `src/folderManager/index.ts` and reuse or add helpers in `spotify-scrapper.ts` or a new module.

**New pipeline step (e.g. post-processing, metadata):**

- Implementation: Prefer a new folder `src/<stepName>/index.ts` with a single default-exported async function.
- Wiring: Import and call from `src/handler.ts` in the correct order relative to existing steps.

**Shared helpers:**

- Small cross-cutting helpers: `src/utils/index.ts` or a new file under `src/utils/` re-exported from `index.ts` if widely used.

**Types for new APIs:**

- Add interfaces to `src/types/api.d.ts` (or a new `src/types/<area>.d.ts`) and re-export from `src/types/index.d.ts` if needed app-wide.

**Config fields:**

- Extend `Config` in `src/types/config.d.ts`, document keys in `config/local.json.example`, and populate locally in `config/local.json`.

**Tests (when introduced):**

- Co-locate `*.test.ts` next to source or under `src/**/__tests__/`; note `tsconfig.json` currently excludes `**/*.test.ts` from compilation — adjust `include`/`exclude` or use a separate test tsconfig if tests must type-check with the main project.

## Special Directories

**`dist/`:**

- Purpose: TypeScript emit output (`tsc`).
- Generated: Yes (by `yarn build`).
- Committed: Typically no (verify `.gitignore`).

**`node_modules/`:**

- Purpose: Dependencies.
- Generated: Yes.
- Committed: No.

**Root `*-player-script.js` files:**

- Purpose: Appear to be downloaded or cached browser scripts; not imported by `src/` TypeScript sources.
- Generated: Possibly by scraper/debug runs.
- Committed: Avoid unless intentionally versioned for fixtures.

---

*Structure analysis: 2026-04-03*

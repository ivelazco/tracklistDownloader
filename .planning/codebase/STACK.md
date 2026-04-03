# Technology Stack

**Analysis Date:** 2026-04-03

## Languages

**Primary:**
- TypeScript — application source under `src/`, entry `lambda.ts`
- JavaScript — legacy/compiled output patterns; `lambda.js` listed in `tsconfig.json` `include` (alongside `src/**/*`)

**Secondary:**
- HTML/CSS — not a web app; DOM lib in `tsconfig.json` supports typings for Playwright page APIs

## Runtime

**Environment:**
- Node.js — `engines.node` in `package.json` specifies `>=10.15.3` (modern TypeScript 5.x and Playwright imply a current LTS in practice)

**Package Manager:**
- Yarn Berry — `packageManager` field: `yarn@4.9.2`; lockfile: `yarn.lock` present
- `nodeLinker: node-modules` in `.yarnrc.yml` (classic `node_modules` layout)

## Frameworks

**Core:**
- No HTTP server framework — CLI-only flow: `lambda.ts` parses argv and calls `src/handler.ts`

**CLI:**
- `yargs` with `yargs/helpers` (`hideBin`) — options `--url`, `--path`, `--json` in `lambda.ts`

**Testing:**
- `playwright` (^1.52.0) — used as a **runtime** dependency for scraping (`src/sourceScrappers/1001-scrapper.ts`), not only for automated test suites (no `*.test.ts` / `*.spec.ts` files detected in project root)

**Build / dev:**
- `typescript` (^5.9.3) — `tsc` emits to `dist/` per `tsconfig.json`
- `ts-node` — `yarn download` runs `node -r ts-node/register ./lambda.ts` (see `package.json` `scripts.download`)

## Key Dependencies

**Critical (feature pipeline):**
- `ytdl-mp3` (^5.2.2) — `Downloader` in `src/youtubeDownloader/index.ts`; wraps YouTube audio download; requires **FFmpeg** on disk (`ffmpegPath` in config)
- `yt-search` (^2.12.1) — primary YouTube search in `src/youtubeSearcher/index.ts` (`yts(track)`)
- `playwright` — Chromium launch for `1001tracklists.com` pages, captcha flow, cookie handling
- `cheerio` (^1.0.0-rc.3) — HTML parse after Playwright returns `page.content()` in `src/sourceScrappers/1001-scrapper.ts`
- `spotify-web-api-node` (^5.0.2) — Spotify playlist name and tracks in `src/sourceScrappers/spotify-scrapper.ts`
- `tesseract.js` (^6.0.1) — OCR for captcha solving in `1001-scrapper.ts`
- `sharp` (^0.34.2) — image preprocessing before OCR in `1001-scrapper.ts`
- `ramda` + `@flybondi/ramda-land` — functional helpers across `src/`

**YouTube / ytdl ecosystem (declared):**
- `ytdl-core`, `@distube/ytdl-core` — pinned via `package.json` `resolutions` for `@distube/ytdl-core`; consumed transitively by download stack, not imported directly in `src/`
- `youtube-mp3-downloader`, `youtube-mp3-downloader-fixed` — declared in `package.json`; downloader implementation in repo uses `ytdl-mp3` instead

**Legacy / questionable usage:**
- `simple-youtube-api` — `YouTube` instance constructed with `config.youtubeVideoSearcher.apiKey` in `src/youtubeSearcher/index.ts`, but **search results come from `yt-search` only**; the API client is unused in the current code path
- `request`, `request-promise` — deprecated HTTP stack; **no imports under `src/`** detected
- `fs` (^0.0.1-security) — npm stub; Node built-in `fs` used via `import * as fs from 'fs'` in application code

**Tooling (dev):**
- ESLint 6 + `babel-eslint` parser, `standard`, `prettier`, `@typescript-eslint/*`, `eslint-plugin-ramda`, Flowtype plugins — config in `.eslintrc.json`
- `commitlint` + `@commitlint/config-conventional`, `lint-staged` — present in `devDependencies`; no root `husky`/`prepare` script detected in `package.json`

## Configuration

**Environment:**
- `lambda.ts` sets `process.env.YTDL_NO_UPDATE = '1'` before other imports to reduce `ytdl-core`–related 403/update behavior
- No `.env` files detected at repository root; secrets and paths live in JSON config (see below)

**Application config:**
- `config/local.json` — loaded as JSON import in `src/youtubeDownloader/index.ts`, `src/youtubeSearcher/index.ts`, `src/sourceScrappers/spotify-scrapper.ts`, `src/folderManager/index.ts`
- Shape documented in `src/types/config.d.ts` (`Config` interface)
- `tsconfig.json` excludes `config/local.json` from compilation include set (still resolved at runtime via `resolveJsonModule`)

**Build:**
- `tsconfig.json` — `target` ES2020, `module` commonjs, `outDir` `./dist`, `rootDir` `./`, permissive strictness (`strict: false`, `noImplicitAny: false`)
- `package.json` `scripts.build` → `tsc`; `type-check` → `tsc --noEmit`

**Editor:**
- `.vscode/settings.json`, `.vscode/launch.json` — local IDE settings

## Platform Requirements

**Development:**
- Node.js meeting `engines` and packages (Playwright browsers: run `npx playwright install` or equivalent for Chromium used by `1001-scrapper.ts`)
- FFmpeg binary path configured in `config/local.json` → `youtubeMp3Downloader.ffmpegPath` (example in committed config uses a Windows path pattern)

**Production:**
- Not a deployed service in-repo — **local CLI** usage: `yarn download --url <tracklist-url> [--path ...] [--json]`
- Output directories: `youtubeMp3Downloader.outputPath` plus per-set folder from `src/folderManager/index.ts`

---

*Stack analysis: 2026-04-03*

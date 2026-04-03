# Coding Conventions

**Analysis Date:** 2026-04-03

## Naming Patterns

**Files:**
- Feature modules use `index.ts` as the public entry inside a folder: `src/youtubeDownloader/index.ts`, `src/folderManager/index.ts`, `src/youtubeSearcher/index.ts`, `src/utils/index.ts`.
- Site-specific scrapers use kebab-case with a suffix: `src/sourceScrappers/1001-scrapper.ts`, `src/sourceScrappers/spotify-scrapper.ts`.
- Shared types live under `src/types/` with descriptive names: `config.d.ts`, `api.d.ts`, `index.d.ts`.
- Utilities split when large: `src/utils/printUtils.ts` re-exported from `src/utils/index.ts`.

**Functions:**
- Use `camelCase` for functions and async handlers: `handler`, `createFolder`, `youtubeVideoSearcher`, `scrapperRouter`, `solveCaptcha`.
- Prefix or suffix helpers descriptively: `getRegularFolderName`, `throwIfVideosIsNilOrEmpty`, `findFirstValidVideo`, `hasBlacklistedWords`.

**Variables:**
- `camelCase` for locals and parameters: `folderPath`, `tracklist`, `youtubeUrls`.
- Constants holding loaded config: `const config = configData as Config` in `src/youtubeDownloader/index.ts`, `src/folderManager/index.ts`, `src/youtubeSearcher/index.ts`.

**Types:**
- PascalCase for types and interfaces: `DownloaderItemInformation`, `Config`, `YouTubeSearchResult`, `GroupedResults`.
- Local structural types next to usage when third-party types are not exported (see `DownloaderItemInformation` in `src/youtubeDownloader/index.ts`).

## Code Style

**Formatting:**
- Tool: Prettier (`prettier` in `package.json` devDependencies).
- Settings in `.prettierrc`: `singleQuote: true`, `printWidth: 100`.

**Linting:**
- Tool: ESLint 6 with config in `.eslintrc.json`.
- Parser: `babel-eslint` (legacy); `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` are present in `package.json` but not wired into `.eslintrc.json`.
- Extends: `standard`, `plugin:ramda/recommended`, `plugin:flowtype/recommended`, `prettier/standard`, `plugin:prettier/recommended`.
- Explicit rules: semicolons required (`semi: always`), `no-extra-semi`, `strict: global`.
- Env: `node`, `jest` (Jest is not a project dependency).

**TypeScript compiler:**
- `tsconfig.json`: `strict: false`, `noImplicitAny: false`, `strictNullChecks: false` — permissive checking; prefer tightening when adding new code.

## Import Organization

**Order (observed pattern, not enforced by a documented rule):**
1. External packages (e.g. `yargs`, `playwright`, `ramda`, `cheerio`).
2. Subpath imports from `@flybondi/ramda-land` or other scoped packages.
3. Internal relative imports (`../utils`, `../types`, `./printUtils`).
4. Node built-ins as `import * as fs from 'fs'` or `fs/promises` where used (`src/youtubeDownloader/index.ts`, `src/sourceScrappers/1001-scrapper.ts`).

**Path Aliases:**
- Not detected in `tsconfig.json`; use relative paths from each file.

**Exports:**
- Default export for primary module actions: `export default handler` in `src/handler.ts`, `export default ytDownloader`, `export default createFolder`, `export default scrapperRouter`.
- Named re-exports from `src/utils/index.ts` and `src/types/index.d.ts`.

## Error Handling

**Patterns:**
- **Throw on invalid state:** `throw new Error('...')` when inputs or pipeline data are missing — e.g. `src/sourceScrappers/index.ts`, `src/handler.ts`, `src/youtubeDownloader/index.ts`.
- **try/catch with log and rethrow:** `src/handler.ts` logs with `console.error`, optionally prints `error.stack` for `Error`, then `throw error`.
- **try/catch returning sentinel:** `src/folderManager/index.ts` catches, logs, returns `undefined` on failure instead of throwing (caller must handle missing path).
- **Per-promise catch without failing the batch:** `src/youtubeDownloader/index.ts` attaches `.catch` to each `dl.downloadSong` promise for logging; aggregate outcome uses `Promise.allSettled` via `prAll` in `src/utils/index.ts`.
- **Typed cast of unknown errors:** `const error = e as Error` or `err as { code?: number; message?: string }` in `src/youtubeSearcher/index.ts`.

**Prescriptive guidance for new code:**
- Prefer either consistent throwing from lower layers or explicit `Result` types; avoid mixing `undefined` returns and throws for the same class of failure without documenting it.

## Logging

**Framework:** `console` only (no structured logger dependency).

**Patterns:**
- Namespace logs with bracket tags: `[handler]`, `[ytDownloader]`, `[createFolder]`, `[1001tracklists]`, `[Error][youtube-video-searcher]`.
- Tesseract progress logged in `src/sourceScrappers/1001-scrapper.ts` via logger callbacks.

## Comments

**When to Comment:**
- Inline comments explain non-obvious behavior (e.g. captcha/OCR tuning in `src/sourceScrappers/1001-scrapper.ts`).
- `// @TODO` used in `src/handler.ts` for planned architectural change (router/derivator for tracklist sources).

**JSDoc/TSDoc:**
- Short `/** ... */` blocks on exported router behavior in `src/sourceScrappers/index.ts` and on some helpers in `src/youtubeSearcher/index.ts`.
- Not used consistently on every public function; optional for internal helpers.

## Function Design

**Size:** Large scraper file `src/sourceScrappers/1001-scrapper.ts` mixes captcha solving, navigation, and parsing — new features should extract cohesive units into named functions or files.

**Parameters:**
- Optional parameters with defaults where useful: `handler(url = testUrl, ...)` in `src/handler.ts` (note: default URL is for local/testing convenience).

**Return Values:**
- Async functions return `Promise<void>`, `Promise<string[]>`, `Promise<string | undefined>`, etc., matching the pipeline stage.
- Ramda-heavy utilities use explicit casts `as (...)` when TypeScript cannot infer composed function types (`src/utils/printUtils.ts`, `src/youtubeDownloader/index.ts`).

## Module Design

**Exports:**
- Barrel file `src/utils/index.ts` exports `prAll`, `tapAfter`, and print helpers from `printUtils.ts`.
- `src/types/index.d.ts` re-exports config and API types.

**Barrel Files:**
- Each feature folder’s `index.ts` is the single import target from `src/handler.ts` (e.g. `import ytDownloader from './youtubeDownloader'`).

---

*Convention analysis: 2026-04-03*

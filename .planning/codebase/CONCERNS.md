# Codebase Concerns

**Analysis Date:** 2026-04-03

## Tech Debt

**CLI and handler defaults:**
- Issue: `handler` in `src/handler.ts` defaults `url` to a hardcoded 1001tracklists test URL, so accidental invocation without arguments uses production-like behavior against a fixed page.
- Files: `src/handler.ts`, `lambda.ts`
- Impact: Confusing local runs; risk of downloading unexpected content if a wrapper ever calls `handler()` with no args.
- Fix approach: Remove default URL; require `url` from argv only, or gate test URL behind an explicit env flag (e.g. `USE_TEST_URL=1`).

**Unused CLI option:**
- Issue: `lambda.ts` defines `--json` and passes a third argument to `handler`, but `handler` names it `_jsonList` and never uses it.
- Files: `lambda.ts`, `src/handler.ts`
- Impact: Users assume JSON mode exists; behavior is always the same.
- Fix either: Implement JSON list input/output or remove the flag from `lambda.ts`.

**Planned architecture not implemented:**
- Issue: Comment documents future design: `getTracklist` as a “derivator” over multiple supported sources.
- Files: `src/handler.ts`
- Impact: Only the router in `src/sourceScrappers/index.ts` (Spotify URL vs default 1001) implements routing; no extensible registry or per-source configuration.
- Fix approach: Introduce explicit source plugins and URL→scraper mapping; keep handler free of source-specific defaults.

**TypeScript strictness disabled:**
- Issue: `tsconfig.json` sets `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`.
- Files: `tsconfig.json`
- Impact: `undefined`/`null` and shape errors surface at runtime (e.g. folder path, API responses) instead of compile time.
- Fix approach: Enable `strict` incrementally per package/file; fix `src/folderManager/index.ts` return type `Promise<string | undefined>` vs callers expecting a path.

**ESLint stack mismatched with TypeScript:**
- Issue: `.eslintrc.json` uses `babel-eslint`, `plugin:flowtype/recommended`, and `sourceType: "script"` while the app is TypeScript. `@typescript-eslint/parser` and plugins are in `package.json` but not wired in `.eslintrc.json`.
- Files: `.eslintrc.json`, `package.json`
- Impact: Linting does not reflect real TS rules; Jest env is enabled with no Jest tests.
- Fix approach: Flat config or `.eslintrc` using `@typescript-eslint/parser` and project `parserOptions.project`; drop Flow if unused.

**Unused or redundant dependencies:**
- Issue: `simple-youtube-api` is imported and `youtube` is constructed with `config.youtubeVideoSearcher.apiKey` in `src/youtubeSearcher/index.ts`, but search uses `yt-search` only—the `youtube` instance is never called. `request` / `request-promise` appear unused in `src/` (deprecated packages). `fs` npm package (`0.0.1-security`) is a stub and duplicates Node’s built-in `fs`.
- Files: `package.json`, `src/youtubeSearcher/index.ts`
- Impact: Larger install surface, misleading config (API key appears required for code paths that do not use the official YouTube Data API client), and known-vulnerable/unmaintained transitive risk from `request`.
- Fix approach: Remove dead imports and packages; consolidate on one YouTube metadata/search approach.

**Overlapping YouTube download dependencies:**
- Issue: `package.json` lists `@distube/ytdl-core`, `ytdl-core`, `youtube-mp3-downloader`, `youtube-mp3-downloader-fixed`, and `ytdl-mp3` (actual downloader in `src/youtubeDownloader/index.ts` uses `ytdl-mp3`).
- Files: `package.json`, `src/youtubeDownloader/index.ts`
- Impact: Version skew, confusion over which stack is authoritative, harder upgrades when YouTube changes.
- Fix approach: Depend on the single library chain `ytdl-mp3` actually uses; remove unused packages after verification.

**Tooling placement:**
- Issue: `babel-eslint` and several ESLint configs live under `dependencies` instead of `devDependencies`.
- Files: `package.json`
- Impact: Production installs pull dev-only tooling if someone runs `npm install --production` or similar.
- Fix approach: Move lint/format packages to `devDependencies`.

**Debug artifacts written to process CWD:**
- Issue: `src/sourceScrappers/1001-scrapper.ts` writes `debug_captcha_original.png`, `debug_captcha_processed_*.png`, and `debug-1001-dump.html` on runs.
- Files: `src/sourceScrappers/1001-scrapper.ts`
- Impact: Pollutes working directory; partial gitignore (`debug_captcha*.png`) does not cover `debug-1001-dump.html` (may be committed accidentally).
- Fix approach: Write under `os.tmpdir()` or a configurable `debugDir`; guard with `DEBUG_1001=1`; add `debug-1001-dump.html` to `.gitignore` if keeping file dumps.

**Node engine vs toolchain:**
- Issue: `package.json` `engines.node` is `>=10.15.3` while TypeScript is `^5.9.3` and code targets ES2020.
- Files: `package.json`, `tsconfig.json`
- Impact: Misleading compatibility signal; very old Node is not realistically supported.
- Fix approach: Set `engines.node` to a supported LTS (e.g. `>=20` or `>=18`).

## Known Bugs

**Summary log string formatting:**
- Issue: `printEndOfExecution` in `src/utils/printUtils.ts` uses a template with stray braces and a typo (`0}S`), so console output is misleading.
- Files: `src/utils/printUtils.ts`
- Impact: Operators misread success/failure counts after downloads.
- Fix approach: Correct the template literals and verify counts match `groupByStatus` output.

**Folder creation failure surfaces late:**
- Issue: `createFolder` in `src/folderManager/index.ts` catches errors and returns `undefined` instead of throwing; `handler` uses `path || folderPath || ''`, which can become an empty string and fail later in `ytDownloader`.
- Files: `src/folderManager/index.ts`, `src/handler.ts`, `src/youtubeDownloader/index.ts`
- Impact: Obscure error messages instead of a clear “folder creation failed”.
- Fix approach: Throw from `createFolder` on failure; validate non-empty `finalPath` before download.

**YouTube search error handling:**
- Issue: `youtubeVideoSearcher` in `src/youtubeSearcher/index.ts` returns the raw `err` on failure; the caller keeps only `string` results, so failures become silent drops for that track.
- Files: `src/youtubeSearcher/index.ts`
- Impact: Partial tracklists with no visibility into which searches failed (beyond optional console logs).
- Fix approach: Return `undefined` and log structured errors, or use `Result`-style types; optionally surface rejected counts in `handler`.

## Security Considerations

**Playwright browser hardening flags:**
- Risk: `chromium.launch` in `src/sourceScrappers/1001-scrapper.ts` uses `--disable-web-security`, `--no-sandbox`, and related flags. `--no-sandbox` is common in containers but weakens the sandbox on normal desktops.
- Files: `src/sourceScrappers/1001-scrapper.ts`
- Current mitigation: Headless automation only; no network server exposed by this repo.
- Recommendations: Prefer removing `--disable-web-security` if not required; use `--no-sandbox` only when detecting CI/Docker; document threat model for any page scripts executed during scrape.

**Secrets and config:**
- Risk: Spotify client credentials and YouTube-related settings live in `config/local.json` (see `config/local.json.example`). Misconfiguration could expose keys in logs if ever logged.
- Files: `config/local.json.example`, `src/sourceScrappers/spotify-scrapper.ts`, `src/youtubeSearcher/index.ts`, `src/youtubeDownloader/index.ts`
- Current mitigation: `.gitignore` excludes `config/local.json` and `config/local-*.json`.
- Recommendations: Never log full config objects (audit `src/youtubeDownloader/index.ts` console logging); prefer env vars for secrets in future refactors.

**Third-party site automation:**
- Risk: Automated captcha solving and aggressive browser fingerprint tweaks may violate 1001tracklists terms of service or break without notice.
- Files: `src/sourceScrappers/1001-scrapper.ts`
- Current mitigation: None in code; operational risk only.
- Recommendations: Document ToS/legal constraints for operators; consider official APIs or manual export flows if compliance matters.

## Performance Bottlenecks

**1001 scrape: full browser session per URL:**
- Problem: Each `tracklists1001Scrapper` call launches Chromium, waits (`networkidle`, fixed `waitForTimeout` delays), possibly runs OCR.
- Files: `src/sourceScrappers/1001-scrapper.ts`
- Cause: Anti-bot and cookie/consent flows require a real browser.
- Improvement path: Reuse browser/context across requests if batching is added; reduce fixed sleeps where safe; cache HTML when debugging is off.

**Parallel YouTube searches:**
- Problem: `prAllYoutubeVideoSearches` fires one `yt-search` call per track with no concurrency limit.
- Files: `src/youtubeSearcher/index.ts`, `src/utils/index.ts` (`prAll` + `Promise.allSettled`)
- Cause: Map over full tracklist at once.
- Improvement path: Bounded concurrency (e.g. p-limit) to avoid rate limits and memory spikes on large playlists.

**Download parallelism:**
- Problem: `queueParallelism` in config can run many ffmpeg/ytdl jobs at once (`config/local.json.example` shows `10`).
- Files: `config/local.json.example`, `src/youtubeDownloader/index.ts`
- Cause: `ytdl-mp3` Downloader configuration.
- Improvement path: Tune per machine; expose CLI override for parallelism.

## Fragile Areas

**1001 DOM parsing:**
- Files: `src/sourceScrappers/1001-scrapper.ts` (selectors `div.tlpItem`, `span.trackValue` with fixed `.eq(2)`)
- Why fragile: Markup changes on 1001tracklists break track extraction without runtime errors in some cases (empty or wrong titles).
- Safe modification: Add fixture HTML snapshots and integration tests; validate minimum track count vs page metadata.
- Test coverage: No automated tests (see below).

**Captcha + OCR path:**
- Files: `src/sourceScrappers/1001-scrapper.ts` (`solveCaptcha`, Tesseract + Sharp pipeline)
- Why fragile: Image layout, captcha algorithm, or length rules (hard-coded 6 characters) can change.
- Safe modification: Feature-flag captcha path; add metrics/logging for failure rate; consider human-in-the-loop fallback.

**YouTube audio pipeline:**
- Files: `src/youtubeDownloader/index.ts`, `lambda.ts` (`YTDL_NO_UPDATE`), `package.json` (multiple ytdl-related packages)
- Why fragile: YouTube frequently changes internals; downstream tools lag.
- Safe modification: Pin and routinely update `@distube/ytdl-core` / `ytdl-mp3`; monitor download failure rates; single dependency path.

**Playwright API drift:**
- Files: `src/sourceScrappers/1001-scrapper.ts` uses `page.waitForTimeout`.
- Why fragile: Playwright deprecates fixed timeouts in favor of locators/events; upgrades may require rewrites.
- Safe modification: Replace with `page.waitForFunction` / locator waits where possible.

## Scaling Limits

**Large tracklists:**
- Current capacity: Unbounded parallel `yt-search` requests and sequential browser-heavy 1001 fetches.
- Limit: IP throttling, captcha rate limits, disk and CPU from parallel ffmpeg jobs.
- Scaling path: Concurrency limits, resumable downloads, and optional chunking of the tracklist.

**No observability layer:**
- Current capacity: Console logging only.
- Limit: Hard to diagnose failures in automation or CI.
- Scaling path: Structured logs (JSON), optional metrics, and exit codes tied to partial success policies.

## Dependencies at Risk

**`request` / `request-promise`:**
- Risk: `request` is deprecated and unmaintained; security advisories accumulate.
- Impact: Supply-chain and audit noise if still installed; unused is still a liability in audits.
- Migration plan: Remove from `package.json` if unused; use `fetch` or `undici` for any future HTTP needs.

**YouTube extraction ecosystem:**
- Risk: `ytdl-core` family breaks on YouTube updates; multiple forks (`@distube/ytdl-core`, etc.).
- Impact: Downloads fail intermittently until dependencies update.
- Migration plan: Stay on one maintained fork; watch upstream releases; add smoke test that downloads a short known video.

**`simple-youtube-api`:**
- Risk: Project appears unused in practice (see Tech Debt); if re-enabled, maintenance status should be verified.
- Impact: Quota costs and breaking API changes from Google.
- Migration plan: Use official Data API v3 client or drop in favor of `yt-search` only, adjusting config docs.

## Missing Critical Features

**Automated test suite:**
- Problem: No `*.test.ts` / `*.spec.ts` files; `tsconfig.json` excludes patterns that suggest tests were anticipated but not added.
- Blocks: Safe refactors of scrapers, downloader, and URL routing.
- Priority: High for any production or CI use.

**CI pipeline for this app:**
- Problem: No GitHub Actions (or similar) at repo root for `yarn type-check` / build / tests.
- Blocks: Regression detection on PRs.
- Priority: Medium after a minimal test suite exists.

**Resumable / idempotent downloads:**
- Problem: Re-running the same URL may re-download or partially overlap; behavior depends on `ytdl-mp3` and existing files.
- Blocks: Efficient retry for large lists.
- Priority: Low unless operational pain appears.

## Test Coverage Gaps

**Entire application surface:**
- What's not tested: Scraping (`src/sourceScrappers/1001-scrapper.ts`, `spotify-scrapper.ts`), search (`src/youtubeSearcher/index.ts`), download (`src/youtubeDownloader/index.ts`), folder naming (`src/folderManager/index.ts`), CLI (`lambda.ts`), and orchestration (`src/handler.ts`).
- Files: All of the above
- Risk: Regressions when sites, APIs, or dependencies change; captcha and selector changes go unnoticed.
- Priority: High

**Suggested first tests (no code here—planning only):**
- Unit: `getRegularFolderName` / URL parsing helpers with fixed strings.
- Integration (optional, flagged): Spotify client with mocked HTTP; 1001 with checked-in HTML fixture and no browser.
- Contract: `handler` with mocked `getTracklist` / `searchYtVideos` / `ytDownloader` to verify control flow and error propagation.

---

*Concerns audit: 2026-04-03*

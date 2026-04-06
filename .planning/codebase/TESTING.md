# Testing Patterns

**Analysis Date:** 2026-04-03

## Test Framework

**Runner:**
- Not detected. `package.json` defines `download`, `build`, and `type-check` only; there is no `test` script.

**Assertion Library:**
- Not applicable until a runner is added.

**Config:**
- No `jest.config.*`, `vitest.config.*`, or `playwright.config.*` at the repository root.
- `tsconfig.json` excludes `**/*.test.ts` and `**/*.spec.ts` from compilation — the project anticipates co-located or repo-wide test files named `*.test.ts` / `*.spec.ts`, but none exist yet.

**Run Commands:**
```bash
yarn type-check    # TypeScript compile check only (tsc --noEmit)
yarn build         # Emits to dist/ (tsc)
```
```bash
# Not available yet — add after choosing a runner, e.g.:
# yarn test
```

## Test File Organization

**Location:**
- No `*.test.ts`, `*.spec.ts`, or `__tests__` directories under `src/` or project root.

**Naming:**
- When tests are added, follow the patterns already excluded in `tsconfig.json`: `**/*.test.ts` or `**/*.spec.ts`.

**Structure:**
- Not established. Recommended: mirror `src/` layout, e.g. `src/handler.test.ts` or `src/__tests__/handler.test.ts`, and remove or narrow `exclude` in `tsconfig.json` if tests need different compiler options.

## Test Structure

**Suite Organization:**
- Not applicable — no example suites in-repo.

**Patterns (recommended for future work):**
- **Unit:** Mock filesystem, HTTP, and Playwright for `src/folderManager/index.ts`, `src/youtubeSearcher/index.ts`, and scraper modules.
- **Integration:** Run against fixtures (saved HTML or recorded responses) rather than live 1001tracklists/Spotify/YouTube where possible to avoid flakiness and rate limits.

## Mocking

**Framework:**
- Not configured.

**Patterns:**
- No `jest.mock`, `vi.mock`, or similar in the codebase.

**What to Mock (when introducing tests):**
- `simple-youtube-api`, `yt-search`, `ytdl-mp3` `Downloader`, `request`/`request-promise` if still used, filesystem (`fs`, `fs/promises`), and Playwright `chromium`/`Page` in `src/sourceScrappers/1001-scrapper.ts`.
- External services: Spotify Web API, YouTube, captcha/OCR paths (Tesseract + Sharp) — use fixtures or stub modules.

**What NOT to Mock:**
- Pure Ramda pipelines and small pure helpers in `src/utils/printUtils.ts` — test with fixed inputs/outputs.

## Fixtures and Factories

**Test Data:**
- Not present. For scrapers, prefer checked-in HTML snippets under something like `test/fixtures/` (to be created) rather than hitting production URLs in CI.

**Location:**
- To be defined when tests are added.

## Coverage

**Requirements:** None enforced; no coverage tooling in `package.json`.

**View Coverage:**
```bash
# Not configured — typical addition would be vitest/jest --coverage after adding a runner
```

## Test Types

**Unit Tests:**
- Not used. Highest value first targets: `src/utils/index.ts` (`prAll`, `tapAfter`), `src/utils/printUtils.ts` (`groupByStatus`, formatters), `src/sourceScrappers/index.ts` (URL routing).

**Integration Tests:**
- Not used. Would require controlling config (`config/local.json` is gitignored pattern risk — use test-specific config or env overrides).

**E2E Tests:**
- Playwright (`playwright` in devDependencies) is used as a **runtime dependency for scraping** in `src/sourceScrappers/1001-scrapper.ts`, not as a test runner with specs. A separate `@playwright/test` project could be added later for true E2E; currently **not detected**.

## Common Patterns

**Async Testing:**
- Production code is heavily async (`async/await`, `Promise.allSettled` via `prAll`). Future tests should use the test runner’s async support (`async` test functions or returned promises).

**Error Testing:**
- Assert thrown errors for modules that `throw new Error` (`src/handler.ts`, `src/youtubeDownloader/index.ts`, `src/sourceScrappers/index.ts`).
- For `src/folderManager/index.ts`, assert `undefined` return paths when the catch block swallows errors.

## Tooling Mismatch Note

**ESLint:** `.eslintrc.json` sets `"env": { "jest": true }` but Jest is not installed. When adding tests, either add Jest (or Vitest with compatible globals) and wire ESLint envs, or remove the Jest env to avoid false assumptions in the IDE.

---

*Testing analysis: 2026-04-03*

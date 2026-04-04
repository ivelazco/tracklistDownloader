# Phase 3: Dependency & config cleanup - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove or **intentionally wire** dead/misleading pieces on the **search/download dependency surface** (QUAL-02), and make **`config/local.json`** understandable: contributors know which keys matter for **Spotify**, **YouTube search**, **FFmpeg**, and the **downloader**. No new product features; pagination/Spotify robustness stay Phase 4; E2E acceptance stays Phase 5.

</domain>

<decisions>
## Implementation Decisions

### YouTube search path vs `simple-youtube-api` (03-01)
- **D-01:** **Remove the dead `simple-youtube-api` path** from `src/youtubeSearcher/index.ts`: drop import, drop `new YouTube(...)`, and **remove the `simple-youtube-api` dependency** from `package.json` once nothing references it. **Ground truth:** search results today come only from **`yt-search`** (`yts`); the API client is constructed but never used.
- **D-02:** **Align configuration with reality:** after code cleanup, **`youtubeVideoSearcher.apiKey` must not remain a misleading required field** — either **remove** `youtubeVideoSearcher` from `Config` / sample docs if fully unused, or **narrow** the type (e.g. optional) **only if** a small amount of placeholder/config migration is needed; prefer **delete the key from the mental model** if no code path consumes it.
- **D-03:** **Document explicitly** in README (short paragraph) that **YouTube URL resolution uses `yt-search`**, not the YouTube Data API v3, so contributors do not hunt for API keys for search.

### Legacy / duplicate packages (03-02)
- **D-04:** **`request` and `request-promise`:** **Remove from direct `dependencies`** if **no `src/` or runtime script imports** them; run install/type-check to confirm. If something still pulls them transitively, **document** in README or `.planning/codebase/STACK.md` — do not leave them as **direct** deps without code use.
- **D-05:** **`youtube-mp3-downloader` vs `youtube-mp3-downloader-fixed`:** **Inventory** what `ytdl-mp3` / downloader stack actually resolves; **drop unused** direct package(s) from `package.json` when safe (same bar: no breakage to `yarn download`).
- **D-06:** **`fs` npm stub** — **remove** from `dependencies` if the project uses Node’s built-in `fs` only (per STACK.md); verify no accidental reliance on the stub.
- **D-07:** **ESLint-related packages in `dependencies`** (e.g. `babel-eslint`, plugins) — **evaluate moving to `devDependencies`** where they belong; only in scope if the move is **low-risk** and matches how the repo runs lint (no runtime need).

### Config documentation (cross-plan)
- **D-08:** Add a **single authoritative “Config keys” section in README**: table or bullet list of **every key in `src/types/config.d.ts`** that remains after cleanup, with **one-line purpose** and **which pipeline stage** reads it (Spotify / search / download / paths).
- **D-09:** Add **`config/local.json.example`** (or similarly named tracked template) with **placeholder values** and **no secrets**, matching the post-cleanup shape — so new contributors know the minimal file without reading every importer.

### Claude's Discretion
- Exact **wording** of README config section and example file name (`local.json.example` vs `local.example.json`).
- **Order of operations** in plans (searcher cleanup before vs after package.json trim) as long as CI/type-check stays green.
- Whether to add a **one-line comment** in `package.json` for any dependency that must stay for non-obvious transitive reasons.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap & requirements
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, plans 03-01 … 03-02.
- `.planning/REQUIREMENTS.md` — **QUAL-02** (remove/wire/document dead or misleading deps).
- `.planning/PROJECT.md` — CLI, `config/local.json` model, v1 hardening.

### Prior phase (out of scope items now in scope)
- `.planning/phases/02-reliable-download-output/02-CONTEXT.md` — Deferred: unused `simple-youtube-api` / API key path, legacy `request`, search-path cleanup → **Phase 3**.

### Codebase ground truth
- `.planning/codebase/STACK.md` — Legacy/questionable deps (`simple-youtube-api`, `request`, `fs` stub, downloader packages).
- `.planning/codebase/STRUCTURE.md` — `src/` layout, pipeline wiring.

### Implementation targets
- `src/youtubeSearcher/index.ts` — `yt-search` vs unused `simple-youtube-api` construction.
- `package.json` — direct dependencies to trim or re-home.
- `src/types/config.d.ts` — `Config` shape after `youtubeVideoSearcher` cleanup.
- `config/local.json` — real local file (gitignored); **do not commit secrets** — use example template only in repo.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/youtubeSearcher/index.ts`:** `youtubeVideoSearcher` / `prAllYoutubeVideoSearches` / `findFirstValidVideo` — keep **`yt-search`** path; delete only the unused API client wiring.
- **`src/types/config.d.ts`:** Single source for JSON shape — update in lockstep with README + example file.

### Established Patterns
- **Static JSON import** of `config/local.json` in searcher, downloader, folder manager, Spotify scrapper — any config key removal must stay consistent across all importers or types will lie.

### Integration Points
- **`src/handler.ts`** imports `searchYtVideos` from `./youtubeSearcher` — public API of searcher module unchanged unless exports are intentionally narrowed.

</code_context>

<specifics>
## Specific Ideas

`/gsd-discuss-phase 3 --auto` — all gray areas selected; decisions adopt **recommended** defaults: **remove dead Data API client and misleading API key requirement**, **trim unused direct deps with verification**, **README + tracked example** for config keys.

</specifics>

<deferred>
## Deferred Ideas

- **Spotify pagination and API error messages** — Phase 4 (SPOT-01, SPOT-02).
- **Search-quality heuristics** (SRCH-01) — v2 / backlog.
- **Broad ESLint/Prettier major upgrades** — not required for QUAL-02 unless a dep removal forces it.

</deferred>

---

*Phase: 03-dependency-config-cleanup*
*Context gathered: 2026-04-04*

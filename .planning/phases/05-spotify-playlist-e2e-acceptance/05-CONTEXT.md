# Phase 5: Spotify playlist E2E acceptance - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Prove **v1 core value (DL-01):** a **documented CLI invocation** with a **Spotify playlist URL** and valid `config/local.json` completes the pipeline so **resolvable tracks** end up as **audio files on disk**, with **partial failures reported** and **no silent abort**. Deliver a **short manual acceptance checklist** (and notes) so regressions after dependency bumps can be re-checked. Scoped to roadmap plans **05-01** (run full pipeline, fix integration gaps) and **05-02** (checklist / notes).

</domain>

<decisions>
## Implementation Decisions

### E2E proof method
- **D-01:** Validate DL-01 with a **real local run** of `yarn download --url <spotify-playlist-url>` (same entry as `lambda.ts` / `package.json` script). No requirement for CI automation or committed secrets; proof is **reproducible by a maintainer** with local config.
- **D-02:** The acceptance artifact must state **prerequisites** explicitly: Node per `engines`, `yarn install`, FFmpeg path / `config/local.json` Spotify client credentials, and output root behavior per README.

### Representative playlist
- **D-03:** Use a **public** Spotify playlist URL, **modest size** (on the order of tens of tracks, not hundreds) for routine verification, so YouTube resolution + download duration stay practical.
- **D-04:** **Do not** commit private playlists or secrets. Checklist may use a **placeholder** URL line plus criteria; the verifier substitutes their own public playlist.

### Partial failures & success bar (DL-01)
- **D-05:** Align with prior pipeline decisions: **per-track visibility** for failures; **do not** fail-fast the whole run in a way that hides per-track outcomes (see Phase 2 context: settled aggregation, bounded parallelism).
- **D-06:** After the E2E run, the checklist must record **observed exit code behavior** when some tracks fail. If code and docs disagree, **fix code or docs** as part of 05-01 only when needed for DL-01 clarity; minor polish is **Claude's discretion** / backlog.

### Acceptance artifact location & shape
- **D-07:** Primary **manual acceptance checklist** lives under `.planning/phases/05-spotify-playlist-e2e-acceptance/` (dedicated markdown file created during execution of **05-02**, name at implementer discretion).
- **D-08:** Add a **short, discoverable pointer** in **README** (e.g. a “Regression / acceptance” or “v1 acceptance” bullet) linking to that checklist so contributors find it without spelunking `.planning/`.

### Scope of integration fixes (05-01)
- **D-09:** Fix **only** issues discovered in the E2E run that **block** DL-01 or contradict **documented** behavior from Phases **2–4** (download output, config, Spotify pagination/errors). New capabilities belong in later phases.

### Claude's Discretion
- Exact checklist filename and section headings; optional tiny helper script if it reduces copy-paste without adding maintenance burden.
- Whether a one-line **example** playlist URL is ever added to docs (only if public, stable, and clearly labeled as optional).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap & requirements
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria, plans 05-01 … 05-02.
- `.planning/REQUIREMENTS.md` — **DL-01** (Spotify playlist → completed downloads, partial failure reporting).
- `.planning/PROJECT.md` — V1 bar, CLI/config model, active validation items.

### Prior phase decisions
- `.planning/phases/02-reliable-download-output/02-CONTEXT.md` — Downloader strategy, `prAll` / partial failures, folder naming, FFmpeg, `--path`.
- `.planning/phases/03-dependency-config-cleanup/03-CONTEXT.md` — Config keys, `yt-search`, dependency surface.
- `.planning/phases/04-spotify-api-robustness/04-RESEARCH.md` — Pagination and error-handling intent (Phase 4 execution summaries: `04-01-SUMMARY.md`, `04-02-SUMMARY.md` if verifying behavior).

### Code & docs
- `lambda.ts` — CLI flags (`--url`, `--path`, `--json`).
- `package.json` — `yarn download` script.
- `src/handler.ts` — Pipeline orchestration.
- `src/sourceScrappers/spotify-scrapper.ts` — Spotify playlist → track list.
- `src/youtubeDownloader/index.ts` — Download execution and batching.
- `src/folderManager/index.ts` — Output folder layout.
- `README.md` — Documented command, config keys, output behavior.

### Codebase maps
- `.planning/codebase/STRUCTURE.md` — Pipeline layout.
- `.planning/codebase/STACK.md` — Downloader / Spotify dependencies.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`yarn download`** → `lambda.ts` → `handler` — the **documented** E2E surface.
- **`src/handler.ts`** — Chains scrapper → YouTube search → folder → downloader; acceptance should trace this path for Spotify URLs.

### Established Patterns
- **Console logging** with tagged namespaces; partial results surface via downloader/search patterns from Phase 2.
- **Static `config/local.json`** — E2E depends on local secrets; checklist must say so.

### Integration Points
- **Spotify URL routing** via `scrapperRouter` / `spotify-scrapper`.
- **Disk output** under `youtubeMp3Downloader.outputPath` + `Spotify-` folder naming.

</code_context>

<specifics>
## Specific Ideas

`/gsd-discuss-phase 5 --auto` — all gray areas selected; decisions follow **recommended** defaults: real CLI E2E, public modest playlist (URL not committed as secret), checklist in phase folder + README pointer, DL-01-aligned partial-failure expectations, integration fixes limited to blockers.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-spotify-playlist-e2e-acceptance*
*Context gathered: 2026-04-05*

# Phase 1: Engineering rules & environment - Research

**Researched:** 2026-04-03  
**Domain:** Cursor project rules, Node engine policy, FP/concurrency patterns in existing `src/`  
**Confidence:** HIGH (repo ground truth + npm registry engines); MEDIUM (Cursor rule file mechanics — official doc page returned thin content; ecosystem describes `.mdc` + frontmatter)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Rules layout & granularity (D-01)**  
Use **multiple rule files** under `.cursor/rules/`, **split by topic**, mapping cleanly to GOV-01 (FP), GOV-02 (memory/concurrency), GOV-03 (utils), GOV-04 (hooks), plus a dedicated **Node/engine** doc tied to QUAL-01. Optional thin `AGENTS.md` or index rule that **points** to those files is fine; avoid one monolith that buries hooks or Node.

**Tone & enforceability (D-02)**  
Prefer **short MUST / AVOID (or DO / DON'T) sections** plus **pointers to canonical `src/` paths** (e.g. `src/utils/index.ts`, `src/handler.ts`) so rules stay scannable for humans and agents. Narrative is allowed **only where it disambiguates**; default posture is **prescriptive checklists**, not essay-only guidance.

**Hooks policy (GOV-04) (D-03)**  
State **explicitly: CLI-only codebase today — React hooks N/A** where no UI exists. Include a **brief extension clause**: if a UI layer is added, introduce hooks rules in `.cursor/rules/` and wire them from the same index; do **not** write full React style guides preemptively.

**Node / engine source of truth (QUAL-01) (D-04)**  
Treat **`package.json` `engines.node`** as the **authoritative minimum** once updated; it must be **≥ the stricter of** TypeScript’s and **Playwright’s** declared requirements. As of dependency resolution in this repo, **Playwright requires `node >=18`** (binding constraint vs TypeScript 5.9’s lower floor).

**Cross-link (D-05)**  
**Cross-link**: rules (and a **short README contributor blurb** if present) reference the same minimum so there is no drift between README, rules, and `engines`.

### Claude's Discretion

- Exact **file names** under `.cursor/rules/` (e.g. `fp.md` vs `functional-programming.md`) and **section ordering** inside each file.
- How much **example code** to inline vs reference by path.
- Whether a **single “overview” rule** file is added for onboarding, provided D-01 (split by topic) remains satisfied.

### Deferred Ideas (OUT OF SCOPE)

_None — discussion stayed within Phase 1 scope._
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GOV-01 | `.cursor/rules/` documents FP conventions (Ramda/pipe/compose, `prAll`, guards) and what to avoid | Ground truth: `src/utils/index.ts`, `src/youtubeDownloader/index.ts`, `src/youtubeSearcher/index.ts`, `src/handler.ts`, `CONVENTIONS.md` |
| GOV-02 | Documents memory/RAM: parallel limits, Playwright lifecycle, batching | Ground truth: unbounded parallel maps + single-browser lifecycle in `1001-scrapper.ts`, `prAll` + `Promise.allSettled` in downloader/searcher |
| GOV-03 | Documents `src/utils/` — when to add helpers, naming, errors/logging | Ground truth: `prAll`, `tapAfter`, print helpers; `CONVENTIONS.md` logging/errors |
| GOV-04 | Hooks policy: CLI-only / N/A + extension if UI | Locked in D-03 |
| QUAL-01 | Node/engine expectations aligned with TS + Playwright | **Verified:** `npm view playwright engines` → `{ node: '>=18' }`; `npm view typescript engines` → `{ node: '>=14.17' }` → stricter floor is **18** |
</phase_requirements>

## Summary

Phase 1 is **documentation and policy alignment**, not new runtime features. The codebase already encodes the conventions the rules must describe: Ramda + `@flybondi/ramda-land` (`pipe`, `compose`, `isNilOrEmpty`), shared async aggregation via **`prAll`** (`Promise.allSettled` + handler), side-effect logging via **`tapAfter`** (curried), feature **barrel** `index.ts` files, and `console` logging with bracket namespaces. Concurrency is **implicitly aggressive**: `youtubeSearcher` maps one `yts()` call per track with no cap; `youtubeDownloader` maps one `downloadSong` promise per URL with no cap—both use `prAll` for settlement, not for limiting parallelism. Playwright is used **inside** `fetchWithConsent` in `1001-scrapper.ts`: one `chromium.launch` per call, `browser.close()` on success and in `catch`—rules should describe this lifecycle and caution against leaking browsers or spawning many concurrent Chromium instances.

**Engine policy:** `package.json` currently declares `"node": ">=10.15.3"`, which **contradicts** Playwright’s published `engines` (`>=18`). Planning must include updating `engines.node` to at least **`>=18`** and cross-linking README/rules (D-04/D-05). Playwright’s public docs recommend current **20.x / 22.x / 24.x** for day-to-day support ([Playwright — System requirements](https://playwright.dev/docs/intro#system-requirements)); that is guidance for *supported* versions, not a substitute for the package’s **minimum** `>=18`.

**Primary recommendation:** Ship **multiple** `.cursor/rules/` files (topic-split per D-01) with MUST/AVOID bullets and **file:line or path pointers** into `src/`; set **`engines.node` to `>=18`** (or stricter if team standardizes on e.g. 20 LTS); add a **short** README “Prerequisites” minimum Node line that matches `engines`; document **CLI-only / hooks N/A** plus a one-paragraph **future UI** extension hook.

## Standard Stack

### Core (this phase — artifacts, not new deps)

| Item | Version / note | Purpose | Why Standard |
|------|----------------|---------|--------------|
| Cursor **Project Rules** | `.cursor/rules/*` | Agent + contributor guidance | User decision; matches GSD requirements |
| **Ramda** + **@flybondi/ramda-land** | `^0.26.1` / `^4.0.0` (repo) | FP composition, guards | Already used across `src/` |
| **Playwright** (`chromium`) | `^1.52.0` in repo; **npm latest 1.59.1** (registry, 2026-04-03) | Scraping in `1001-scrapper.ts` | Declares `engines.node: '>=18'` |
| **TypeScript** | `^5.9.3` in repo; **npm latest 6.0.2** (registry) | Compile / type-check | Declares `engines.node: '>=14.17'` |

### Supporting

| Item | Purpose | When to Use |
|------|---------|-------------|
| **Prettier** / **ESLint** | Formatting + lint | Reference in rules as “match existing config”; see `CONVENTIONS.md` for current wiring gaps (e.g. `@typescript-eslint` present but not in `.eslintrc.json`) |
| **ts-node** | `yarn download` | Rules: CLI entry is `lambda.ts` + `ts-node/register` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Multiple rule files | Single `.cursorrules` | Rejected by D-01 — hurts scannability and hooks/Node clarity |
| `engines: >=10` (current) | Keep as-is | **Invalid** for Playwright; fails QUAL-01 |

**Installation:** No new packages required for Phase 1 deliverables.

**Version verification (2026-04-03):**

```text
npm view playwright version   → 1.59.1
npm view playwright engines   → { node: '>=18' }
npm view typescript version   → 6.0.2
npm view typescript engines   → { node: '>=14.17' }
```

Pin rule text to **declared repo versions** where behavior matters; note registry may advance.

## Architecture Patterns

### Recommended rules layout (maps to plans 01-01 … 01-03)

```text
.cursor/rules/
├── (optional) overview.mdc     # links to the rest; thin
├── functional-style.mdc        # GOV-01
├── memory-and-concurrency.mdc  # GOV-02
├── utils-and-modules.mdc       # GOV-03
├── hooks-policy.mdc            # GOV-04
└── node-engines.mdc            # QUAL-01 (+ cross-links)
```

**Cursor rule files (MEDIUM confidence):** Ecosystem and third-party guides describe **`.mdc`** files with YAML frontmatter (`description`, `globs`, `alwaysApply`). Official [Cursor Rules docs](https://docs.cursor.com/context/rules) should be checked during execution if the editor rejects plain `.md`. Planner should add a Wave 0 task: confirm one file applies in Cursor for this project version.

### Pattern 1: Canonical code pointers

**What:** Each rule file ends sections with “See `path`” rather than duplicating large snippets.  
**When to use:** Always (D-02).  
**Example (ground truth — not from external library docs):**

```typescript
// Source: repo src/utils/index.ts
const prAll = <T, R>(fnReturn: PromiseSettledHandler<T, R>) => (ps: Promise<T>[]) =>
  Promise.allSettled(ps).then(fnReturn);
```

### Pattern 2: Playwright lifecycle documentation

**What:** Document: launch → context → work → **`browser.close()`** in both success and error paths.  
**When to use:** Any new scraping code using Playwright.  
**Ground truth:** `src/sourceScrappers/1001-scrapper.ts` (`fetchWithConsent` closes in `try` tail and `catch`).

### Anti-Patterns to Avoid

- **Unbounded parallelism:** Rules should AVOID adding raw `Promise.all` over N network/download operations without an explicit concurrency cap when N can be large (playlist-scale). *Current code uses `prAll` but does not cap concurrency* — document as **risk** and **preferred direction** (batching / limit) without rewriting pipeline in Phase 1 unless scoped.
- **Imperative sprawl in new modules:** AVOID long linear scripts in new files without extraction; align with `CONVENTIONS.md` (“extract cohesive units”).
- **React hooks in `src/` today:** AVOID — no UI; state explicitly per D-03.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Settled promise batching | Ad-hoc `Promise.all` for mixed success/failure reporting | **`prAll`** + handler (see `printResults` usage) | Matches downloader/searcher pattern |
| Post-step logging | Inline duplication | **`tapAfter`** for default-export pipelines (e.g. 1001 scrapper) | Already idiomatic in repo |
| FP guards | Custom null checks everywhere | **`isNilOrEmpty`**, **Ramda** `when`, `reject`, etc. | ESLint `plugin:ramda/recommended` |
| Engine minimum math | Guess from blog posts | **`npm view <pkg> engines`** for Playwright + TypeScript | Authoritative package metadata |

**Key insight:** Rules should **describe what is already there** so agents stop inventing parallel patterns that fight `prAll`/`tapAfter` and barrel imports.

## Common Pitfalls

### Pitfall 1: `engines` drift vs README vs rules

**What goes wrong:** Contributor uses Node 16; Playwright install or runtime fails, or behavior diverges.  
**Why it happens:** `package.json` still says `>=10.15.3`.  
**How to avoid:** Single authoritative `engines.node` (**≥18**), same number in README prerequisites, rules cross-link.  
**Warning signs:** `yarn install` warnings, Playwright launch failures on older Node.

### Pitfall 2: Playwright resource leaks

**What goes wrong:** Multiple `chromium.launch` without `close()` on all paths → zombie processes / RAM.  
**Why it happens:** New scrapers copy partial snippets.  
**How to avoid:** Rules MUST: always `close()` in `finally` or both branches; prefer single browser per operation unless documented otherwise.  
**Warning signs:** Growing Chrome/Chromium process count after runs.

### Pitfall 3: “Parallelism” confusion

**What goes wrong:** Assuming `prAll` *limits* concurrency — it **does not**; it only aggregates `allSettled`.  
**Why it happens:** Name sounds like “controlled pool.”  
**How to avoid:** GOV-02 text must distinguish **settlement aggregation** vs **concurrency caps**; point to `youtubeDownloader` / `youtubeSearcher` maps.  
**Warning signs:** OOM or rate limits on large playlists.

### Pitfall 4: Over-long rules

**What goes wrong:** Agents skip reading; violations increase.  
**Why it happens:** Essay-style-only rules (violates D-02).  
**How to avoid:** Checklist-first; narrative only for disambiguation.

## Code Examples

### `prAll` + per-promise logging (downloads)

```typescript
// Source: repo src/youtubeDownloader/index.ts (pattern summary)
const promises = transformedVideos.map((url: string) => {
  const promise = dl.downloadSong(url);
  promise.then(...).catch(...);
  return promise;
});
return prAll(resultHandler)(promises);
```

### `tapAfter` wrapping a default export

```typescript
// Source: repo src/sourceScrappers/1001-scrapper.ts
export default tapAfter(log1001Results, tracklists1001Scrapper);
```

### Parallel YouTube search (unbounded fan-out)

```typescript
// Source: repo src/youtubeSearcher/index.ts
const promises: Promise<string | undefined>[] = tracklist.map(async (track) => {
  const result = await youtubeVideoSearcher(track);
  return typeof result === 'string' ? result : undefined;
});
return prAll(responseFormatter)(promises);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single `.cursorrules` (legacy) | `.cursor/rules/` multi-file | Cursor ecosystem | Finer-grained agent context |
| Node `>=10` in many old projects | Playwright **requires >=18** | Playwright 2.x+ line (verify per release) | Must bump `engines` for this repo |
| `Promise.all` for mixed outcomes | `Promise.allSettled` via `prAll` | Already in repo | Partial failures don’t reject whole batch |

**Deprecated/outdated:**

- **`package.json` `engines.node`: `>=10.15.3`** — misleading for current stack; **replace** per D-04.

## Open Questions

1. **Cursor rule file extension and frontmatter**
   - **What we know:** Empty `.cursor/rules/` today; many teams use `.mdc` + YAML frontmatter.
   - **What’s unclear:** Exact required schema for this Cursor version.
   - **Recommendation:** Wave 0: create one pilot rule file and confirm it attaches; adjust format per official docs.

2. **Whether to recommend Node 20+ LTS in prose while keeping `engines` at 18**
   - **What we know:** Playwright docs emphasize 20/22/24.
   - **What’s unclear:** Team standard vs minimum bar.
   - **Recommendation:** `engines`: `>=18`; README “recommended”: Node 20+ LTS for alignment with Playwright support statement — if user wants single number only, pick 20 and verify CI/agents.

## Environment Availability

Step 2.6: Phase deliverables are **docs**; runtime verification still matters for **executor** validation.

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | TS, Playwright, CLI | ✓ (dev machine) | v22.16.0 (observed) | CI image must match `engines` |
| Yarn | `packageManager` | ✓ | 4.9.2 (field) | Document `corepack enable` if needed |
| FFmpeg | MP3 pipeline (README) | Not probed | — | Human install; already documented in README |
| Playwright browsers | `chromium.launch` | Not probed | — | `npx playwright install` if missing |

**Missing dependencies with no fallback:**

- None for *writing* rules; **running** full pipeline still needs FFmpeg + browser binaries (existing project assumption).

**Missing dependencies with fallback:**

- None identified for Phase 1 documentation work.

## Validation Architecture

> Nyquist validation is **enabled** (`workflow.nyquist_validation: true` in `.planning/config.json`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **None yet** — no `*.test.ts` / `*.spec.ts` in repo |
| Config file | none |
| Quick run command | `yarn type-check` (ensures TS still compiles after any incidental edits) |
| Full suite command | same until tests land |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| GOV-01–04 | Rules files exist, readable, on-topic | **checklist / script** | e.g. `node scripts/verify-phase1-rules.js` (to add) | ❌ Wave 0 |
| QUAL-01 | `engines.node` satisfies Playwright + TS min | **assertion script** | Parse `package.json` + compare to `>=18` | ❌ Wave 0 |
| Repo health | No accidental TS break | unit/smoke | `yarn type-check` | ✅ |

### Sampling Rate

- **Per task commit:** `yarn type-check`
- **Per wave merge:** `yarn type-check` + rules verification script (once added)
- **Phase gate:** Manual read of `.cursor/rules/` against success criteria + script green

### Wave 0 Gaps

- [ ] Small **verification script** (or `package.json` script) that asserts:
  - `engines.node` is present and semver range **≥ 18**
  - Required rule files exist (filenames TBD in PLAN)
  - Optional: grep for `>=10.15.3` removed from `engines`
- [ ] **VALIDATION.md** (executor) listing human checklist: open each rule file, confirm GOV/QUAL coverage mapping
- [ ] **README** prerequisites line matches `engines` (manual diff or script)

*(No Jest/Vitest/Playwright Test suite required for Phase 1 unless planner explicitly adds one — out of scope for “rules docs” unless user expands scope.)*

## Sources

### Primary (HIGH confidence)

- `01-CONTEXT.md` — locked decisions D-01–D-05  
- `src/utils/index.ts`, `src/handler.ts`, `src/youtubeDownloader/index.ts`, `src/youtubeSearcher/index.ts`, `src/sourceScrappers/1001-scrapper.ts` — ground truth patterns  
- `.planning/codebase/CONVENTIONS.md`, `STRUCTURE.md` — documented conventions  
- **npm registry:** `npm view playwright engines`, `npm view typescript engines`  
- [Playwright docs — System requirements](https://playwright.dev/docs/intro#system-requirements) — supported Node lines (20/22/24)

### Secondary (MEDIUM confidence)

- [Cursor Rules (context)](https://docs.cursor.com/context/rules) — page fetched thin; confirm `.mdc` / frontmatter with local Cursor build  
- Ecosystem guides on `.cursor/rules` filename and `alwaysApply` / `globs`

### Tertiary (LOW confidence)

- None blocking Phase 1 — engine minimum verified via `npm view`

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — pinned to repo + `npm view` engines  
- Architecture (rules layout): **HIGH** — from CONTEXT D-01/D-02  
- Cursor file format details: **MEDIUM** — verify at implementation  
- Pitfalls: **HIGH** — derived from code inspection  

**Research date:** 2026-04-03  
**Valid until:** ~2026-05-03 (re-check Playwright `engines` after major bumps)

## RESEARCH COMPLETE

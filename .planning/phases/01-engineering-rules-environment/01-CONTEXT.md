# Phase 1: Engineering rules & environment - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **`.cursor/rules/`** so contributors and agents share one standard for **functional style**, **memory/concurrency**, **`src/utils/`** usage, and **hooks policy** (CLI-first today). Document **Node/engine expectations** so they match **real toolchain constraints** (TypeScript + Playwright), not the stale `engines` field alone.

</domain>

<decisions>
## Implementation Decisions

### Rules layout & granularity
- **D-01:** Use **multiple rule files** under `.cursor/rules/`, **split by topic**, mapping cleanly to GOV-01 (FP), GOV-02 (memory/concurrency), GOV-03 (utils), GOV-04 (hooks), plus a dedicated **Node/engine** doc tied to QUAL-01. Optional thin `AGENTS.md` or index rule that **points** to those files is fine; avoid one monolith that buries hooks or Node.

### Tone & enforceability
- **D-02:** Prefer **short MUST / AVOID (or DO / DON'T) sections** plus **pointers to canonical `src/` paths** (e.g. `src/utils/index.ts`, `src/handler.ts`) so rules stay scannable for humans and agents. Narrative is allowed **only where it disambiguates**; default posture is **prescriptive checklists**, not essay-only guidance.

### Hooks policy (GOV-04)
- **D-03:** State **explicitly: CLI-only codebase today — React hooks N/A** where no UI exists. Include a **brief extension clause**: if a UI layer is added, introduce hooks rules in `.cursor/rules/` and wire them from the same index; do **not** write full React style guides preemptively.

### Node / engine source of truth (QUAL-01)
- **D-04:** Treat **`package.json` `engines.node`** as the **authoritative minimum** once updated; it must be **≥ the stricter of** TypeScript’s and **Playwright’s** declared requirements. As of dependency resolution in this repo, **Playwright requires `node >=18`** (binding constraint vs TypeScript 5.9’s lower floor).
- **D-05:** **Cross-link**: rules (and a **short README contributor blurb** if present) reference the same minimum so there is no drift between README, rules, and `engines`.

### Claude's Discretion

- Exact **file names** under `.cursor/rules/` (e.g. `fp.md` vs `functional-programming.md`) and **section ordering** inside each file.
- How much **example code** to inline vs reference by path.
- Whether a **single “overview” rule** file is added for onboarding, provided D-01 (split by topic) remains satisfied.

### Folded Todos

_None — no todos were folded into this phase._

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Governance & requirements
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, plan breakdown (01-01 … 01-03).
- `.planning/REQUIREMENTS.md` — GOV-01 … GOV-04, QUAL-01 (traceability to Phase 1).
- `.planning/PROJECT.md` — Vision, CLI-first scope, `.cursor/rules/` decision, v1 bar.

### Codebase ground truth
- `.planning/codebase/CONVENTIONS.md` — FP/Ramda/logging/error patterns, Prettier/ESLint, import style.
- `.planning/codebase/STRUCTURE.md` — `src/` layout, barrels, entry (`lambda.ts` → `handler.ts`).
- `.planning/codebase/STACK.md` — Runtime dependencies (Playwright, Ramda, ts-node, etc.).

### Implementation targets (existing code)
- `src/utils/index.ts` — `prAll`, `tapAfter`, shared promise helpers.
- `src/handler.ts` — Pipeline orchestration and error handling shape.
- `package.json` — `engines`, scripts, dependency versions (to align with D-04/D-05).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/utils/index.ts`:** `prAll`, `tapAfter` — document as the standard for batch/async composition where applicable.
- **Feature folder `index.ts` barrels** (`youtubeDownloader`, `youtubeSearcher`, `folderManager`, `sourceScrappers`) — rules should reinforce “import from barrel” as the public surface.

### Established Patterns
- **Ramda + `@flybondi/ramda-land`:** `pipe` / `compose`, guards — FP rules should match actual usage, not generic FP theory.
- **Logging:** `console` with bracket tags (`[handler]`, etc.) — utils/rules should not assume a structured logger.
- **Concurrency:** `Promise.allSettled`-style aggregation via `prAll` in downloader path — memory/concurrency rules should reference real parallel boundaries when documented.

### Integration Points
- **`.cursor/rules/`** — empty today; new files are the integration surface for Cursor/agents.
- **`package.json` `engines`** — must be updated during Phase 1 execution to match D-04 (not yet edited at context-gather time).

</code_context>

<specifics>
## Specific Ideas

_User replied **all** to discuss all four gray areas; decisions above adopt the **recommended** option from each area unless planning surfaces a conflict._

</specifics>

<deferred>
## Deferred Ideas

_None — discussion stayed within Phase 1 scope._

</deferred>

---

*Phase: 01-engineering-rules-environment*
*Context gathered: 2026-04-03*

---
phase: 03-dependency-config-cleanup
plan: 02
subsystem: infra
tags: [dependencies, eslint, yarn, documentation]

requires:
  - phase: 03-dependency-config-cleanup
    provides: Final Config shape and README search wording after plan 03-01
provides:
  - Trimmed direct dependencies and ESLint packages in devDependencies
  - Authoritative README **Config keys** table aligned to `config.d.ts`
  - Updated STACK.md for post–Phase 3 dependency reality
affects: [maintenance, onboarding]

tech-stack:
  added: []
  patterns:
    - "Config keys documented per leaf field with pipeline stage labels"

key-files:
  created: []
  modified:
    - package.json
    - yarn.lock
    - README.md
    - config/local.json.example
    - .planning/codebase/STACK.md

key-decisions:
  - "Removed unused direct deps (request, request-promise, fs stub, youtube-mp3-downloader*) after ripgrep verification"
  - "ESLint-related packages live in devDependencies only"

patterns-established:
  - "README ## Config keys references canonical config/local.json.example"

requirements-completed: [QUAL-02]

duration: 15min
completed: 2026-04-05
---

# Phase 3: Dependency & config cleanup — Plan 03-02

**Legacy npm deps trimmed after `src/` verification plus contributor-facing Config key matrix and STACK alignment**

## Performance

- **Duration:** ~15 min (same commit as 03-01)
- **Started:** 2026-04-05T00:00:00Z
- **Completed:** 2026-04-05T12:00:00Z
- **Tasks:** 2
- **Files modified:** 5 (including STACK)

## Accomplishments

- Confirmed no `request` / `request-promise` / duplicate downloader / `fs` stub usage in `src/`; removed direct keys from `package.json`
- ESLint-related packages consolidated under `devDependencies`
- README **`## Config keys`** table lists every leaf field with **Spotify**, **Download**, or **Paths / output** stages; cross-reference to **`## YouTube search (QUAL-02)`**
- `config/local.json.example` leaf keys match `Config` exactly (verified via node script)
- **STACK.md** updated: Node `>=18`, Phase 3 trim notes, `yarn why request` shows no `request` in tree

## Task Commits

Merged with plan 03-01 in a single implementation commit:

1. **Task 1: Verify and remove unused direct deps + move ESLint (D-04–D-07)** — `219739e` (feat)
2. **Task 2: Config keys in README + example template (D-08, D-09)** — `219739e` (feat)

## Files Created/Modified

- `package.json` / `yarn.lock` — dependency hygiene
- `README.md` — **Config keys** section
- `config/local.json.example` — template parity with `Config`
- `.planning/codebase/STACK.md` — accurate stack / legacy notes

## Decisions Made

None beyond plan.

## Deviations from Plan

**Combined commit:** Plans 03-01 and 03-02 tasks were committed together as `219739e` because the working tree already contained a unified diff; atomic per-plan commits were not replayed.

## Issues Encountered

`yarn npm why request` is not available on this Yarn 4 CLI; used `yarn why request` (empty output) to confirm `request` is absent from the tree.

## User Setup Required

None.

## Next Phase Readiness

Dependency and config documentation ready for Phase 4 (Spotify API robustness).

---

## Self-Check: PASSED

- `yarn type-check` / `yarn build` exit 0
- `node` leaf-key script for `config/local.json.example` exit 0
- `rg "^## Config keys" README.md` matches

*Phase: 03-dependency-config-cleanup · Plan 02 · Completed: 2026-04-05*

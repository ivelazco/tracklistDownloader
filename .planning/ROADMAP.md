# Roadmap: Tracklist Downloader

## Overview

Stabilize a brownfield CLI that resolves tracklists (Spotify first), finds YouTube matches, and downloads audio. Phase 1 locks **engineering rules** into `.cursor/rules`. Phases 2–3 harden the **download spine** and **dependency/config honesty**. Phases 4–5 make **Spotify playlists** the proven **end-to-end** path.

## Phases

- [x] **Phase 1: Engineering rules & environment** (2026-04-03) — `.cursor/rules` for FP, memory, utils, hooks; document real Node/engine expectations.
- [ ] **Phase 2: Reliable download & output** — Maintainable YouTube acquisition and stable output folders.
- [ ] **Phase 3: Dependency & config cleanup** — Remove or wire dead paths; clearer FFmpeg/config failures.
- [ ] **Phase 4: Spotify API robustness** — Pagination and actionable errors.
- [ ] **Phase 5: Spotify playlist E2E acceptance** — Full CLI run proves v1 core value.

## Phase Details

### Phase 1: Engineering rules & environment

**Goal:** Contributors and agents follow one documented standard for FP style, RAM/concurrency, utilities, and hooks policy; Node expectations match reality.

**Depends on:** Nothing

**Requirements:** GOV-01, GOV-02, GOV-03, GOV-04, QUAL-01

**Success Criteria** (what must be TRUE):

1. New reader can open `.cursor/rules/` and know how to add pipeline code without violating FP/memory conventions.
2. Hooks policy is explicit (CLI-only today + how to extend if UI appears).
3. Minimum Node version (or engine policy) is documented and consistent with TS + Playwright.

**Plans:** 3 plans

Plans:

- [x] `phases/01-engineering-rules-environment/01-01-PLAN.md` — Draft `.cursor/rules` from current `src/` patterns (Ramda, `prAll`, `tapAfter`, module boundaries); Wave 0 `.mdc` pilot.
- [x] `phases/01-engineering-rules-environment/01-02-PLAN.md` — Memory/concurrency guidance (parallel caps, Playwright lifecycle, batching).
- [x] `phases/01-engineering-rules-environment/01-03-PLAN.md` — Node/engine expectations (`package.json`, README, `node-engines.mdc`, `scripts/verify-phase1-rules.mjs`).

**UI hint:** no

---

### Phase 2: Reliable download & output

**Goal:** YouTube → disk path is maintainable; output directory behavior matches config and is predictable for playlists.

**Depends on:** Phase 1

**Requirements:** DL-02, DL-03

**Success Criteria** (what must be TRUE):

1. Chosen download strategy (hardened existing stack and/or yt-dlp-backed path) is implemented and documented in rules or README.
2. A small test playlist (or fixture URLs) downloads without process crash; failures are visible per track.
3. Output path + folder naming for a Spotify playlist match documented behavior.

**Plans:** 3 plans

Plans:

- [ ] 02-01: Audit `youtubeDownloader` + transitive ytdl behavior; decide and implement primary fetch path.
- [ ] 02-02: Validate FFmpeg path handling and user-facing error messages.
- [ ] 02-03: Verify `folderManager` + output root integration after downloader changes.

**UI hint:** no

---

### Phase 3: Dependency & config cleanup

**Goal:** No misleading unused clients/paths; config errors are actionable.

**Depends on:** Phase 2

**Requirements:** QUAL-02

**Success Criteria** (what must be TRUE):

1. Unused or misleading dependencies for the search/download path are removed, wired, or documented with intent.
2. Contributor can tell which keys in `config/local.json` matter for Spotify + YouTube + FFmpeg.

**Plans:** 2 plans

Plans:

- [ ] 03-01: Inventory `youtubeSearcher` / API keys vs `yt-search` usage; resolve dead code or wire intentionally.
- [ ] 03-02: Document or trim legacy packages (`request`, etc.) from the mental model and `package.json` where safe.

**UI hint:** no

---

### Phase 4: Spotify API robustness

**Goal:** Playlists retrieve all tracks; API failures are understandable.

**Depends on:** Phase 3

**Requirements:** SPOT-01, SPOT-02

**Success Criteria** (what must be TRUE):

1. Multi-page playlists return full track lists under normal API limits.
2. Auth/config mistakes produce logs or errors that say what to fix (credentials, playlist ID).

**Plans:** 2 plans

Plans:

- [ ] 04-01: Review pagination and rate-limit handling in `spotify-scrapper.ts`.
- [ ] 04-02: Normalize error messages for Spotify client failures.

**UI hint:** no

---

### Phase 5: Spotify playlist E2E acceptance

**Goal:** Prove v1 core value: Spotify playlist URL → audio files on disk using the CLI.

**Depends on:** Phase 4

**Requirements:** DL-01

**Success Criteria** (what must be TRUE):

1. Documented command (e.g. `yarn download --url <spotify-playlist>`) completes for a representative playlist with partial-failure reporting.
2. User can verify success by inspecting output folder (files present, sane names).
3. A short **manual acceptance checklist** exists (or script) for regression after dependency bumps.

**Plans:** 2 plans

Plans:

- [ ] 05-01: Run full pipeline against real playlist; fix integration gaps discovered.
- [ ] 05-02: Add acceptance checklist / notes for future YouTube or Spotify changes.

**UI hint:** no

---

## Progress

**Execution Order:** 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Engineering rules & environment | 3/3 | Complete | 2026-04-03 |
| 2. Reliable download & output | 0/3 | Not started | - |
| 3. Dependency & config cleanup | 0/2 | Not started | - |
| 4. Spotify API robustness | 0/2 | Not started | - |
| 5. Spotify playlist E2E acceptance | 0/2 | Not started | - |

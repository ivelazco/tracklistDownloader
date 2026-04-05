---
phase: 03-dependency-config-cleanup
status: passed
verified: 2026-04-05
---

# Phase 3 verification

## Goal (from ROADMAP)

No misleading unused clients/paths; config errors are actionable. Contributors know which `config/local.json` keys matter for Spotify + YouTube + FFmpeg (search path uses `yt-search` only; download uses `youtubeMp3Downloader`).

## Must-haves

| Criterion | Evidence |
|-----------|----------|
| Search path: `yt-search` only; no Data API client | `src/youtubeSearcher/index.ts` — `PHASE3-SEARCH`, `import yts from 'yt-search'`; no `simple-youtube-api` / `new YouTube` |
| Config omits misleading YouTube API key | `src/types/config.d.ts` — no `youtubeVideoSearcher`; `config/local.json.example` matches |
| README explains search vs API v3 | README `## YouTube search (QUAL-02)` — `yt-search`, YouTube Data API, v3 |
| Dependency surface trimmed | `package.json` — no direct `request`, `request-promise`, `fs` stub, `youtube-mp3-downloader*`, `simple-youtube-api`; ESLint packages in `devDependencies` |
| Authoritative config map | README `## Config keys` — table for every leaf key; pointer to `config/local.json.example` |
| Stack doc aligned | `.planning/codebase/STACK.md` — Phase 3 search/deps notes; `request` not in tree |

## Automated checks

- `yarn type-check` — exit 0
- `yarn build` — exit 0
- `yarn verify:phase1-rules` — exit 0 (regression)
- Leaf keys in `config/local.json.example` match `Config` (node one-liner from plan 03-02)

## Requirements traceability

- QUAL-02 — plans 03-01, 03-02

## human_verification

None required for this phase (documentation and dependency hygiene).

---
phase: 04-spotify-api-robustness
status: passed
verified: 2026-04-05
---

# Phase 4 verification

## Goal (from ROADMAP)

Playlists retrieve all tracks; API failures are understandable.

## Must-haves

| Criterion | Evidence |
|-----------|----------|
| Multi-page playlists | `getPlaylistTracks` called with `{ limit: PAGE_SIZE, offset }` in a loop until short page; `PAGE_SIZE === 100` |
| Null tracks skipped | `item.track` guarded before `artists` / `name` |
| Actionable errors | `SPOTIFY_ERR` helper; messages include `config/local.json`, `rate limit`, `forbidden`, `Playlist ID:` |
| Logging | `[Spotify][API] page=… offset=…` |

## Automated checks

- `yarn type-check` — exit 0
- `yarn build` — exit 0
- `yarn verify:phase1-rules` — exit 0

## Requirements traceability

- SPOT-01 — plan 04-01
- SPOT-02 — plan 04-02

## human_verification

Recommended: run CLI against a public playlist with **>100** tracks; spot-check bad credentials and bad playlist ID for message clarity.

---
phase: 04-spotify-api-robustness
plan: 01
subsystem: api
tags: [spotify, pagination, spotify-web-api-node]

requires:
  - phase: 03-dependency-config-cleanup
    provides: Clean config surface for Spotify keys
provides:
  - Paged `getPlaylistTracks` (PAGE_SIZE 100, offset loop)
  - `SpotifyPlaylistTracksResponse.body` paging fields in `api.d.ts`
  - Progress logs with `page=` and `offset=`
affects: [phase-05-e2e, spotify-scrapper]

tech-stack:
  added: []
  patterns: [offset-based playlist pagination]

key-files:
  created: []
  modified:
    - src/sourceScrappers/spotify-scrapper.ts
    - src/types/api.d.ts

key-decisions:
  - "Use limit/offset paging (max 100) until a short page; skip null `track` items."

patterns-established:
  - "Log each page with [Spotify][API] and cumulative count."

status: complete
completed: 2026-04-05
---

# Plan 04-01 summary

**SPOT-01:** Full playlist track lists for playlists larger than one API page.

## Delivered

- Typed `next`, `total`, `limit`, `offset` on playlist tracks response body.
- Loop calling `getPlaylistTracks(playlistId, { limit: PAGE_SIZE, offset })` until the last page.
- Null `item.track` entries skipped before formatting.

## Verify

- `yarn type-check` — exit 0

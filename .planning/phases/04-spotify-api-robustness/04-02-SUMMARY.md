---
phase: 04-spotify-api-robustness
plan: 02
subsystem: api
tags: [spotify, errors, rate-limit]

requires:
  - phase: 04-spotify-api-robustness
    provides: Pagination implementation in spotify-scrapper
provides:
  - `spotifyFailureMessage` helper (marker `SPOTIFY_ERR`)
  - Actionable messages for 401, 403, 404, 429 (+ Retry-After), token grant failures
affects: [handler, cli-ux]

tech-stack:
  added: []
  patterns: [centralized API error mapping]

key-files:
  created: []
  modified:
    - src/sourceScrappers/spotify-scrapper.ts

key-decisions:
  - "Single helper for Web API errors + token path; credentials preflight cites config/local.json."

patterns-established:
  - "Use statusCode + optional headers for 429 retry hints."

status: complete
completed: 2026-04-05
---

# Plan 04-02 summary

**SPOT-02:** Actionable Spotify and auth error messages.

## Delivered

- `SPOTIFY_ERR` / `spotifyFailureMessage` maps 401, 403, 404, 429, other status codes, and token failures.
- `getSpotifyPlaylistName` and `getSpotifyPlaylistTracksInternal` use the helper; removed generic double-wrapping.

## Verify

- `yarn type-check` — exit 0

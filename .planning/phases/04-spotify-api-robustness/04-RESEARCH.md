# Phase 4: Spotify API robustness — Research

**Researched:** 2026-04-05  
**Domain:** Spotify Web API via `spotify-web-api-node`, client-credentials flow, playlist tracks pagination, error surfaces  
**Confidence:** HIGH (ground truth from `src/sourceScrappers/spotify-scrapper.ts` + library source in `node_modules/spotify-web-api-node`)

<user_constraints>

No `04-CONTEXT.md` for this run (`--auto` / planning without discuss-phase). Scope is locked by **ROADMAP Phase 4**, **REQUIREMENTS SPOT-01 / SPOT-02**, and existing `.cursor/rules/` (functional style, utils/logging).

</user_constraints>

<phase_requirements>

| ID | Description | Research support |
|----|-------------|------------------|
| **SPOT-01** | Client credentials retrieve **all** playlist tracks (pagination) | Current code calls `getPlaylistTracks(playlistId)` **once** — first page only; API supports `limit` / `offset` via `.withQueryParameters(options)` |
| **SPOT-02** | Errors are **actionable** (auth, rate limit, invalid ID) | Partial handling: 404 / 401 branches exist; **403**, **429**, token grant failures, and generic wrapping lose signal; `WebApiError` exposes `statusCode`, `body`, `headers` |

</phase_requirements>

---

## Executive summary

**Pagination gap:** `getSpotifyPlaylistTracksInternal` maps `response.body.items` from a **single** `getPlaylistTracks` call. Spotify returns at most **100** items per request; larger playlists are truncated (**SPOT-01** failure).

**Recommended approach:** Loop with `getPlaylistTracks(playlistId, { limit: 100, offset })` until a page returns fewer than `limit` items (or `offset + items.length` meets `total` if typed). Filter out `item.track == null` (removed tracks). Keep existing string format `${artists} ${track.name}`.

**Rate limits:** Failed requests may return **429**; `response-error.js` / `http-manager.js` yield errors with **headers** — `Retry-After` can be read for one bounded retry or a clear user message (**SPOT-02**).

**Auth:** `clientCredentialsGrant()` failures (invalid `clientId` / `clientSecret`) surface as thrown errors before playlist fetch; normalize alongside API errors.

**Types:** `SpotifyPlaylistTracksResponse` in `src/types/api.d.ts` omits `next`, `total`, `limit`, `offset`; extend minimally for planner/executor clarity (optional fields).

---

## Implementation findings

### Current flow (`spotify-scrapper.ts`)

- URL → playlist ID extraction (query/hash trimming) — adequate for **SPOT-02** messaging (include `playlistId` in errors).
- Credentials check: empty `clientId` / `clientSecret` → generic message; can cite **`config/local.json`** keys `spotify.clientId` / `spotify.clientSecret`.
- **Single-page** `getPlaylistTracks` at line ~79 — **pagination missing**.
- Inner `catch` maps 404 / 401 only; other `statusCode` values collapse to `Spotify API error: ${message}`.
- Outer `catch` re-wraps with `Failed to fetch Spotify playlist:` — can double-wrap; normalization should produce **one** actionable line (or structured log + throw).

### Library (`spotify-web-api-node`)

- `getPlaylistTracks(playlistId, options, callback)` passes **options** as query parameters — compatible with Spotify’s `limit` (default 100, max 100) and `offset`.
- Errors: `WebapiAuthenticationError`, `WebapiRegularError`, etc., with **`statusCode`**, **`body`**, **`headers`**.

### Project conventions

- Bracketed logs: `[Spotify][API]` already used — extend consistently.
- Prefer small pure helpers + `compose` / `reject` / `isNilOrEmpty` where it stays readable; pagination loop may stay imperative for clarity (existing file mixes try/catch with Ramda).

---

## Risks / out of scope

- **User OAuth** / private user-only playlists: client-credentials only access **public** playlists; document in error if 403/404 ambiguous.
- **Automated tests** against real Spotify: manual smoke with a >100-track public playlist remains the practical check (no new test framework in repo).

---

## Validation Architecture

Phase 4 validation is **compile-first** plus **manual Spotify smoke**:

| Dimension | Approach |
|-----------|----------|
| Correctness | `yarn type-check`; manual run against playlist known to exceed 100 tracks — count matches Spotify client |
| Errors | Temporarily break credentials / use bad ID — console shows actionable text per SPOT-02 |
| Regression | `yarn build` optional; phase 1 rules script if part of local habit |

Executor should run `yarn type-check` after each plan’s code edits.

## RESEARCH COMPLETE

# Stack Research

**Domain:** Node.js CLI — tracklist → YouTube → local audio  
**Researched:** 2026-04-03  
**Confidence:** MEDIUM (ecosystem changes frequently)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-------------------|
| Node.js | Current LTS (20.x or 22.x) | Runtime | Matches TypeScript 5.x, Playwright, modern `fetch` if needed |
| TypeScript | ^5.9 (existing) | Type-safe pipeline | Already in repo; keep aligned with `ts-node` dev path |
| FFmpeg | User-installed | Encode/transmux audio | Required by `ytdl-mp3` and most download paths |
| Spotify Web API | `spotify-web-api-node` (existing) | Playlist + tracks | Official API path for Spotify URLs |

### YouTube acquisition

| Approach | Purpose | Notes |
|----------|---------|-------|
| **yt-dlp** (binary) + **yt-dlp-wrap** or `child_process` | Download + format selection | **Most resilient** to YouTube changes; community updates fast |
| **@distube/ytdl-core** (existing resolution) | In-process stream | Works until it doesn’t; maintainers moving toward **youtubei.js** long-term |
| **ytdl-mp3** (existing) | Opinionated MP3 pipeline | Depends on underlying ytdl stack — treat as integration point to validate |

**Recommendation for reliability:** Plan a **primary path** that can shell out to **yt-dlp** for audio extraction, and keep Node-native stack as optional/fallback only if you accept more breakage risk.

### Supporting Libraries

| Library | Purpose | When to Use |
|---------|---------|-------------|
| `yt-search` | Heuristic YouTube search without quota | Already primary search path — tune ranking/blacklists before adding Data API cost |
| Playwright + Cheerio | 1001tracklists scraping | Keep for HTML-heavy sources; isolate browser lifecycle to minimize RAM |
| Ramda + ramda-land | Pipeline composition | Align `.cursor/rules` with actual `pipe`/`prAll` usage |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Yarn Berry | Package management | Existing; keep `resolutions` explicit for ytdl forks |
| ESLint + Prettier | Style | Existing; extend rules via `.cursor/rules` for FP/memory |

## What NOT to Use (for this milestone)

| Avoid | Why |
|-------|-----|
| Relying solely on **deprecated `request`** | Not used under `src/` — remove from mental model |
| **YouTube Data API** for search without need | Code constructs client but search uses `yt-search` — avoid paying complexity for dead path unless you need quota-based search |

## Installation / Ops

- `playwright install` (Chromium) for 1001 path.
- Document **minimum Node** consistent with TS + Playwright (ignore stale `engines` if needed for local dev).

---
*Stack research: 2026-04-03*

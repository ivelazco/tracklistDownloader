---
phase: 05-spotify-playlist-e2e-acceptance
plan: 01
completed: 2026-04-05
---

# Plan 05-01 — Summary

## E2E run

### Command

```bash
yarn download --url "https://open.spotify.com/playlist/REDACTED" --path ./e2e-output
```

(Playlist ID `4ku3EDQJ3ZsZZMM0FW6SqV` — public user playlist; URL shown as `REDACTED` in this doc for brevity.)

### Prerequisites

- Node 20+ / Yarn; repo `yarn install` done
- `config/local.json` with `spotify.clientId`, `spotify.clientSecret`, and `youtubeMp3Downloader` keys (including `ffmpegPath`)
- FFmpeg installed at path configured in `config/local.json`

### Observed

- Spotify: **22** tracks fetched (single API page; pagination exercised on larger playlists in Phase 4)
- YouTube search: **22** URLs resolved (`[youtube-video-searcher] Results: 22 url tracks founded`)
- Downloader: all **22** download attempts failed with `YtdlMp3Error` / `Failed to find any playable formats` (@distube/ytdl-core) in this environment
- Console showed **`[execution][finished]`** with Successfuls **0** and Fails **22** (after fixing `printUtils` typos that previously garbled this line)

### Exit code

`0`

### Output folder

`c:\Users\nach\Documents\programming\tracklistDownloader\e2e-output` — **no** MP3 files written (all downloads rejected by ytdl); folder exists and was used as `outputDir`.

### Integration gaps

- **Spotify + client credentials:** Editorial playlists (e.g. Today’s Top Hits) returned **404**; **user-owned public** playlists work. Addressed with default **`market`** query param (`US` unless `spotify.market` set), clearer **404** message, **README** note, and **`config/local.json.example`** `market` field.
- **`src/utils/printUtils.ts`:** **`[execution][finished]`** line had stray **`}`** and **`S`** characters — fixed so success/fail counts are readable (**DL-01** partial-failure reporting).
- **YouTube / ytdl:** Widespread **“Failed to find any playable formats”** in this run — upstream/player extraction issue, not a small integration typo; no code change in this plan beyond logging clarity.

### Follow-up

- `src/sourceScrappers/spotify-scrapper.ts` — `market` on `getPlaylist` / `getPlaylistTracks`; expanded 404 message
- `src/types/config.d.ts` — optional `spotify.market`
- `config/local.json.example` — `spotify.market` example
- `README.md` — client-credentials vs editorial playlists
- `src/utils/printUtils.ts` — fix `[execution][finished]` formatting

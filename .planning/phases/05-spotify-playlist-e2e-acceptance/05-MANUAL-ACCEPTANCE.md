# Phase 5 — Manual acceptance (Spotify playlist)

## Spotify playlist E2E

1. From repo root, run **`yarn install`**. Use Node **`>=18`** as declared in **`package.json`** **`engines.node`** (Node 20+ LTS recommended in README).
2. Ensure **`config/local.json`** exists (copy from **`config/local.json.example`**) and contains **`spotify.clientId`**, **`spotify.clientSecret`**, and **`youtubeMp3Downloader`** keys described in README (including **`ffmpegPath`**).
3. Confirm FFmpeg is installed and **`youtubeMp3Downloader.ffmpegPath`** points at the executable; the CLI should fail fast with a clear error before downloads if FFmpeg is misconfigured.
4. Run **`yarn download --url '<spotify-playlist-url>'`** with a **user-owned public** playlist (see **README** — Spotify editorial playlists often **404** under client credentials).
5. Optionally pass **`--path ./manual-acceptance-output`**; relative paths are resolved from the current working directory and the directory is created if missing.
6. Success signals: MP3 files appear under the effective output folder; the log includes **`[execution][finished]`** with **Successfuls** / **Fails** counts. **Partial** failures (some tracks fail) may still yield process exit **0** — that is expected; use the finished line and per-track errors to assess the run.

## Playlist URL

- Use a **public** playlist with a modest number of tracks for a quick check. Replace the placeholder: **`<YOUR_PUBLIC_PLAYLIST_URL>`** with your chosen `https://open.spotify.com/playlist/...` link.

## After dependency bumps

- Re-run this checklist after upgrading **`ytdl-core`**, **`@distube/ytdl-core`**, **`ytdl-mp3`**, **`yt-search`**, or **`spotify-web-api-node`**.
- Run **`yarn type-check`** before declaring the bump safe.

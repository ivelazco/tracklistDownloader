# 🎵 Tracklist MP3 Downloader

This community-driven project allows you to download music from various sources as MP3 files. It supports both 1001tracklists.com tracklists and Spotify playlists. The tool works by searching YouTube for the first relevant result for every track and extracting the MP3 audio automatically.

## ✅ Features

- Support for multiple sources:
  - 1001tracklists.com tracklists
  - Spotify playlists (requires Spotify API credentials)
- Automatically searches YouTube for each track
- Downloads the audio in MP3 format using `ffmpeg`
- Skips `ID-ID` and duplicate tracks
- Organizes downloads in source-specific folders

## 📦 Requirements

- [Node.js](https://nodejs.org/)
  - **Minimum:** Node.js 18+ (`engines.node` in `package.json`)
  - **Recommended:** Node.js 20 LTS or newer for Playwright-supported versions
- [FFmpeg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg)
- Spotify API credentials (only if using Spotify playlist feature)

## 🚀 Installation
We strongly recommend using [Yarn](https://yarnpkg.com/) as the package manager:

```bash
yarn install
```

Alternatively:

```bash
npm install
```

### Configuration Setup

Copy the tracked template to your local (gitignored) config: `cp config/local.json.example config/local.json`.

1. Create a `config/local.json` file by copying `config/local.json.example`:
   ```bash
   cp config/local.json.example config/local.json
   ```

2. Configure your credentials:
   - For Spotify (if needed):
     1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
     2. Log in and create a new application
     3. Get your Client ID and Client Secret
     4. Add them to your config file

3. Make sure to add `config/local.json` to your `.gitignore` to keep your credentials secure.

The canonical JSON shape and placeholders are in **`config/local.json.example`** — copy that file and fill in values (see **Config keys** below).

## YouTube search (QUAL-02)

Track → YouTube URL resolution **prefers [yt-dlp](https://github.com/yt-dlp/yt-dlp)** search (`ytsearchN:`) when **`youtubeMp3Downloader.ytDlpPath`** runs successfully — the same probe as **Download strategy (DL-02)**. If yt-dlp is unavailable or returns no acceptable hit, the CLI falls back to the **`yt-search`** npm package against public search results. Lookups run with **bounded concurrency** (**`searchParallelism`**, or **`queueParallelism`** when omitted) so large playlists (for example 1000+ tracks) do not open thousands of simultaneous searches. The CLI does **not** call **YouTube Data API** **v3**, so no Google Cloud API key is required for this step.

## Download strategy (DL-02)

By default (**`downloadBackend`: `auto`**), the CLI uses **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** when `youtubeMp3Downloader.ytDlpPath` runs successfully (typically `yt-dlp` on your PATH). That path shells out to yt-dlp and passes **`--ffmpeg-location`** using the directory of **`youtubeMp3Downloader.ffmpegPath`**, then writes MP3s with the same filename rules as before (**`getYtdlMp3OutputPath`** / ytdl-mp3-style sanitization).

If yt-dlp is not installed or fails the probe, the CLI falls back to **`ytdl-mp3`** (**`@distube/ytdl-core`**), which bundles **`ffmpeg-static`**. You can force one stack with **`downloadBackend`**: **`ytdl-mp3`** or **`yt-dlp`** (the latter fails fast with a clear error if the binary is missing).

Relevant **`youtubeMp3Downloader`** keys: **`ffmpegPath`**, **`outputPath`**, **`queueParallelism`**, **`searchParallelism`** (optional), **`youtubeVideoQuality`**, **`progressTimeout`**, **`downloadBackend`**, **`ytDlpPath`**. **`queueParallelism`** limits how many tracks download at once; **`searchParallelism`** limits concurrent URL lookups (defaults to **`queueParallelism`**).

Install **[FFmpeg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg)** and set **`ffmpegPath`** to the executable (for example `ffmpeg` on your PATH). Install **[yt-dlp](https://github.com/yt-dlp/yt-dlp/releases)** for the recommended download path when YouTube changes break pure JS extractors.

**`YTDL_NO_UPDATE`** is set in **`lambda.ts`** before other imports to reduce unwanted `ytdl-core` update behavior on the fallback path.

## Config keys

No field in **`config/local.json`** exists solely for YouTube search after Phase 3 plan **03-01** — search uses **yt-dlp** when the binary runs, else **`yt-search`**; see **YouTube search (QUAL-02)** above.

| Key | Purpose (one line) | Stage |
| --- | --- | --- |
| `youtubeMp3Downloader.ffmpegPath` | Path to the `ffmpeg` executable (validated always; used by yt-dlp for encode) | Download |
| `youtubeMp3Downloader.outputPath` | Root folder for playlist output directories | Paths / output |
| `youtubeMp3Downloader.progressTimeout` | Timeout (ms) for download progress reporting | Download |
| `youtubeMp3Downloader.queueParallelism` | Max concurrent downloads in application code | Download |
| `youtubeMp3Downloader.searchParallelism` | Max concurrent YouTube URL lookups (optional; defaults to `queueParallelism`) | YouTube search |
| `youtubeMp3Downloader.youtubeVideoQuality` | Preferred YouTube stream quality hint for the ytdl-mp3 path | Download |
| `youtubeMp3Downloader.downloadBackend` | `auto` (default), `yt-dlp`, or `ytdl-mp3` — see **Download strategy (DL-02)** | Download |
| `youtubeMp3Downloader.ytDlpPath` | yt-dlp executable (default `yt-dlp`); download when backend resolves to yt-dlp, and YouTube search when the binary runs | Download |
| `spotify.clientId` | Spotify Web API application client ID | Spotify |
| `spotify.clientSecret` | Spotify Web API application client secret | Spotify |
| `spotify.market` | Optional ISO 3166-1 alpha-2 country for playlist API queries (defaults to **US** if omitted) | Spotify |

The canonical JSON template is **`config/local.json.example`**.

## 🖥️ Usage

### For 1001tracklists:
```bash
yarn download --url 'https://www.1001tracklists.com/tracklist/f82b001/john-00-fleming-the-digital-blonde-joof-radio-002-2020-01-14.html'
```

### For Spotify playlists:
```bash
yarn download --url 'https://open.spotify.com/playlist/your_playlist_id'
```

The CLI uses **Spotify client credentials** (see `config/local.json`). That flow can read **user-owned public** playlists; **Spotify editorial** playlists (e.g. “Today’s Top Hits”) often return **404** from the Web API — pick a public playlist created by a user, or use the **Authorization Code** flow in your own fork if you need editorial access.

## Output layout (DL-03)

Playlist folders are created under **`outputPath`** from **`config/local.json`** (the root for all playlist directories).

- Spotify playlists: `Spotify-{playlist_name}` (hyphens instead of spaces; unsafe characters stripped).
- 1001tracklists: `1001tracklists-{slug}` derived from the tracklist URL.

Use **`yarn download --url <url> --path ./my-run`** to override the download directory for that run only. Relative **`--path`** values are resolved from the current working directory; the directory is created if missing (**D-05**).

**Collision / reuse:** if the target folder already exists under **`outputPath`**, the run **reuses** the **existing** directory (no numeric suffix).

## 📂 Output Structure

Downloads use the folder naming above. See **Output layout (DL-03)** for details.

## Manual acceptance (v1 Spotify)

After dependency or API changes, re-verify the Spotify playlist → MP3 path using the phase checklist: [05-MANUAL-ACCEPTANCE.md](./.planning/phases/05-spotify-playlist-e2e-acceptance/05-MANUAL-ACCEPTANCE.md).

## 🤝 Contributing

Pull requests are welcome!
For major changes, please open an issue first to discuss what you'd like to propose.
Make sure to update or add relevant tests when necessary.
Use the Node version in `package.json` `engines` — see Requirements above.

## 📌 Notes

- Supported sources:
  - [1001tracklists](https://www.1001tracklists.com)
  - [Spotify](https://open.spotify.com) playlists (requires API credentials)
- `ID-ID` tracks will not be searched
- Duplicate tracks will not be downloaded
- For Spotify playlists:
  - The playlist must be **public**; with **client credentials**, prefer **user-created** public playlists (many **Spotify editorial** lists return **404** from the Web API).
  - Your Spotify API credentials must be properly configured (`spotify.clientId` / `spotify.clientSecret`; optional **`spotify.market`** — see **Config keys**).



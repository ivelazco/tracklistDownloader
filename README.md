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

Track → YouTube URL resolution is done with the **`yt-search`** npm package against public search results. The CLI does **not** call **YouTube Data API** **v3**, so no Google Cloud API key is required for this step.

## Download strategy (DL-02)

The CLI downloads audio with **`ytdl-mp3`**, which bundles **`ffmpeg-static`** for transcoding on the default code path. **`youtubeMp3Downloader.ffmpegPath`** in **`config/local.json`** is still validated before downloads start so misconfiguration fails fast; if **`STRATEGY=yt-dlp`** appears in `src/youtubeDownloader/index.ts`, that path would use **`ffmpegPath`** with **`yt-dlp`**.

Relevant **`youtubeMp3Downloader`** keys: **`ffmpegPath`**, **`outputPath`**, **`queueParallelism`**, **`youtubeVideoQuality`**, **`progressTimeout`**. **`queueParallelism`** limits how many tracks download at once in **application code** (not inside **`ytdl-mp3`**).

Install **[FFmpeg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg)** and set **`ffmpegPath`** to the executable (for example `ffmpeg` on your PATH).

**`YTDL_NO_UPDATE`** is set in **`lambda.ts`** before other imports to reduce unwanted `ytdl-core` update behavior.

## Config keys

No field in **`config/local.json`** exists solely for YouTube search after Phase 3 plan **03-01** — search uses **`yt-search`**; see **YouTube search (QUAL-02)** above.

| Key | Purpose (one line) | Stage |
| --- | --- | --- |
| `youtubeMp3Downloader.ffmpegPath` | Path to the `ffmpeg` executable used for transcoding | Download |
| `youtubeMp3Downloader.outputPath` | Root folder for playlist output directories | Paths / output |
| `youtubeMp3Downloader.progressTimeout` | Timeout (ms) for download progress reporting | Download |
| `youtubeMp3Downloader.queueParallelism` | Max concurrent downloads in application code | Download |
| `youtubeMp3Downloader.youtubeVideoQuality` | Preferred YouTube stream quality hint for the downloader | Download |
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



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
- A valid [YouTube API Key](https://developers.google.com/youtube/v3/getting-started)
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

1. Create a `config/local.json` file by copying `config/local.json.example`:
   ```bash
   cp config/local.json.example config/local.json
   ```

2. Configure your credentials:
   - For YouTube: Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
   - For Spotify (if needed):
     1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
     2. Log in and create a new application
     3. Get your Client ID and Client Secret
     4. Add them to your config file

3. Make sure to add `config/local.json` to your `.gitignore` to keep your credentials secure.

Example configuration:

```json
{
  "youtubeMp3Downloader": {
    "ffmpegPath": "ffmpeg",
    "outputPath": "/Users/user/Music/youtube-downloader",
    "youtubeVideoQuality": "highest",
    "queueParallelism": 10,
    "progressTimeout": 2000
  },
  "youtubeVideoSearcher": {
    "apiKey": "YOUR_YOUTUBE_API_KEY"
  },
  "spotify": {
    "clientId": "your_spotify_client_id_here",
    "clientSecret": "your_spotify_client_secret_here"
  }
}
```

## Download strategy (DL-02)

The CLI downloads audio with **`ytdl-mp3`**, which bundles **`ffmpeg-static`** for transcoding on the default code path. **`youtubeMp3Downloader.ffmpegPath`** in **`config/local.json`** is still validated before downloads start so misconfiguration fails fast; if **`STRATEGY=yt-dlp`** appears in `src/youtubeDownloader/index.ts`, that path would use **`ffmpegPath`** with **`yt-dlp`**.

Relevant **`youtubeMp3Downloader`** keys: **`ffmpegPath`**, **`outputPath`**, **`queueParallelism`**, **`youtubeVideoQuality`**, **`progressTimeout`**. **`queueParallelism`** limits how many tracks download at once in **application code** (not inside **`ytdl-mp3`**).

Install **[FFmpeg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg)** and set **`ffmpegPath`** to the executable (for example `ffmpeg` on your PATH).

**`YTDL_NO_UPDATE`** is set in **`lambda.ts`** before other imports to reduce unwanted `ytdl-core` update behavior.

## 🖥️ Usage

### For 1001tracklists:
```bash
yarn download --url 'https://www.1001tracklists.com/tracklist/f82b001/john-00-fleming-the-digital-blonde-joof-radio-002-2020-01-14.html'
```

### For Spotify playlists:
```bash
yarn download --url 'https://open.spotify.com/playlist/your_playlist_id'
```

## Output layout (DL-03)

Playlist folders are created under **`outputPath`** from **`config/local.json`** (the root for all playlist directories).

- Spotify playlists: `Spotify-{playlist_name}` (hyphens instead of spaces; unsafe characters stripped).
- 1001tracklists: `1001tracklists-{slug}` derived from the tracklist URL.

Use **`yarn download --url <url> --path ./my-run`** to override the download directory for that run only. Relative **`--path`** values are resolved from the current working directory; the directory is created if missing (**D-05**).

**Collision / reuse:** if the target folder already exists under **`outputPath`**, the run **reuses** the **existing** directory (no numeric suffix).

## 📂 Output Structure

Downloads use the folder naming above. See **Output layout (DL-03)** for details.

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
  - The playlist must be public
  - Your Spotify API credentials must be properly configured



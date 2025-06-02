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

## 🖥️ Usage

### For 1001tracklists:
```bash
yarn download --url 'https://www.1001tracklists.com/tracklist/f82b001/john-00-fleming-the-digital-blonde-joof-radio-002-2020-01-14.html'
```

### For Spotify playlists:
```bash
yarn download --url 'https://open.spotify.com/playlist/your_playlist_id'
```

## 📂 Output Structure

Downloads are organized in source-specific folders:
- 1001tracklists downloads: `1001tracklists - [tracklist_name]`
- Spotify downloads: `Spotify - [playlist_name]`

## 🤝 Contributing

Pull requests are welcome!
For major changes, please open an issue first to discuss what you'd like to propose.
Make sure to update or add relevant tests when necessary.

## 📌 Notes

- Supported sources:
  - [1001tracklists](https://www.1001tracklists.com)
  - [Spotify](https://open.spotify.com) playlists (requires API credentials)
- `ID-ID` tracks will not be searched
- Duplicate tracks will not be downloaded
- For Spotify playlists:
  - The playlist must be public
  - Your Spotify API credentials must be properly configured



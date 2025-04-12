# 🎵 Tracklist MP3 Downloader

This community-driven project allows users to specify a tracklist URL (from supported sources) and download each song individually. It works by searching YouTube for the first relevant result for every track and extracting the MP3 audio automatically.

## ✅ Features

- Input a tracklist URL (currently supports 1001tracklists.com)
- Automatically searches YouTube for each track
- Downloads the audio in MP3 format using `ffmpeg`
- Skips `ID-ID` and duplicate tracks

## 📦 Requirements

- [Node.js](https://nodejs.org/)
- [FFmpeg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg)
- A valid [YouTube API Key](https://developers.google.com/youtube/v3/getting-started)

## 🚀 Installation

We recommend using [Yarn](https://yarnpkg.com/) as the package manager:

```bash
yarn install
```

Alternatively:

```bash
npm install
```

Then, create a local.json configuration file based on the local.json.example file located in the config/ folder.

Example:

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
  }
}
```

🖥️ CLI Usage

```unix
yarn download --url 'https://www.1001tracklists.com/tracklist/f82b001/john-00-fleming-the-digital-blonde-joof-radio-002-2020-01-14.html'
```

🤝 Contributing

Pull requests are welcome!
For major changes, please open an issue first to discuss what you’d like to propose.
Make sure to update or add relevant tests when necessary.

📌 Notes

- For now, the only site available is [1001tracklists](www.1001tracklists.com)
- `ID-ID` tracks will not be searched.
- Duplicates track will not be downloaded.

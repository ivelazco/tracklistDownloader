# tracklist mp3 downloader

This little project allows to the user specify a tracklist link (see the supported sites) for download each song of it, searching into the youtube website and finding the first related video for each track extracting its mp3 audio.

## Requirements

- [node](https://nodejs.org/es/)
- [ffmepg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg)
- [get a Youtube API KEY](https://developers.google.com/youtube/v3/getting-started)

## Installation

Recommended: Use `yarn`as package manager [yarn](https://yarnpkg.com/en/)

```bash
yarn install
```

or

```bash
npm install
```

Creates a `local.json` config file, There is an example filed called `local.json.example` into `config/` folder.

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
    "apiKey": "AIzsSyB1sr5NsdyJSdj2DXQQd4mdMNq7YofBbGc"
  }
}
```

## Usage in Command line

```unix
yarn download --url 'https://www.1001tracklists.com/tracklist/f82b001/john-00-fleming-the-digital-blonde-joof-radio-002-2020-01-14.html'
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Aclarations

- For now, the only site available is [1001tracklists](www.1001tracklists.com)
- `ID-ID` tracks will not be searched.
- Duplicates track will not be downloaded.

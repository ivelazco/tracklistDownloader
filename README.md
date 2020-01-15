# tracklist mp3 downloader

Tracklist MP3 Downloader is a script that allows specifying a URL of supported sites where will extract the tracklist, search for youtube videos related to each song for being downloaded in mp3 format finally.

## Requirements
- [node](https://nodejs.org/es/)
- [ffmepg](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg)
- [get a Youtube API KEY](https://developers.google.com/youtube/v3/getting-started)

## Installation

Use the package manager [yarn](https://yarnpkg.com/en/) to install.

```bash
yarn install
```

Configure a `local.json` config, you have an example called `local.json.example`

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

- For now, the only sites that is available is [1001tracklists](www.1001tracklists.com)
- `ID-ID` tracks will not be searched

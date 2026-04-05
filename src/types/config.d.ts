/**
 * Configuration structure matching config/local.json
 */
export interface Config {
  youtubeMp3Downloader: {
    ffmpegPath: string;
    outputPath: string;
    youtubeVideoQuality: string;
    queueParallelism: number;
    progressTimeout: number;
  };
  spotify: {
    clientId: string;
    clientSecret: string;
  };
}


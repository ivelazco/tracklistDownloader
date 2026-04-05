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
    /** ISO 3166-1 alpha-2; required for client-credentials playlist reads when Spotify has no user market. */
    market?: string;
  };
}


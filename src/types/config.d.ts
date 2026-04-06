/**
 * Configuration structure matching config/local.json
 */
export interface Config {
  youtubeMp3Downloader: {
    ffmpegPath: string;
    outputPath: string;
    youtubeVideoQuality: string;
    queueParallelism: number;
    /** Max concurrent YouTube URL lookups; defaults to queueParallelism when omitted. */
    searchParallelism?: number;
    progressTimeout: number;
    /** Default `auto`: use yt-dlp when the binary runs; else ytdl-mp3. */
    downloadBackend?: 'auto' | 'ytdl-mp3' | 'yt-dlp';
    /** Executable for yt-dlp (default `yt-dlp`). Used when backend resolves to yt-dlp. */
    ytDlpPath?: string;
  };
  spotify: {
    clientId: string;
    clientSecret: string;
    /** ISO 3166-1 alpha-2; required for client-credentials playlist reads when Spotify has no user market. */
    market?: string;
  };
}


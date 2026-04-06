import { spawnSync } from 'child_process';
import type { Config } from '../types/config';

export type ResolvedDownloadBackend = 'ytdl-mp3' | 'yt-dlp';

const probeYtDlp = (ytDlpPath: string): boolean => {
  const r = spawnSync(ytDlpPath, ['--version'], {
    encoding: 'utf-8',
    windowsHide: true,
  });
  return r.error == null && r.status === 0;
};

type DownloaderSection = Config['youtubeMp3Downloader'];

/**
 * DL-02: Prefer yt-dlp when `downloadBackend` is `auto` (default) and the binary works;
 * avoids brittle @distube/ytdl-core decipher churn. Explicit `yt-dlp` throws if the binary is missing.
 */
export const resolveDownloadBackend = (section: DownloaderSection): ResolvedDownloadBackend => {
  const ytPath = (section.ytDlpPath ?? 'yt-dlp').trim();
  const mode = section.downloadBackend ?? 'auto';

  if (mode === 'ytdl-mp3') {
    return 'ytdl-mp3';
  }
  if (mode === 'yt-dlp') {
    if (!probeYtDlp(ytPath)) {
      throw new Error(
        `youtubeMp3Downloader.downloadBackend is "yt-dlp" but "${ytPath}" did not run (--version failed). Install yt-dlp (https://github.com/yt-dlp/yt-dlp) or set youtubeMp3Downloader.ytDlpPath to the executable.`,
      );
    }
    return 'yt-dlp';
  }
  if (probeYtDlp(ytPath)) {
    return 'yt-dlp';
  }
  console.log(
    `[ytDownloader] yt-dlp not available at "${ytPath}" — using ytdl-mp3 (@distube/ytdl-core). Install yt-dlp for a more reliable download path.`,
  );
  return 'ytdl-mp3';
};

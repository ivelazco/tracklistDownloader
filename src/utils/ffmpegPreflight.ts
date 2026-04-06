import * as fs from 'fs';
import { spawnSync } from 'child_process';

/**
 * D-08: Fail fast with actionable messages if FFmpeg is missing or broken.
 * WINDOWS_FORBIDDEN: playlist folder sanitization lives in folderManager; here we only probe ffmpeg -version.
 */
export const assertFfmpegAvailable = (ffmpegPath: string): void => {
  if (typeof ffmpegPath !== 'string' || !ffmpegPath.trim()) {
    throw new Error(
      'Invalid youtubeMp3Downloader.ffmpegPath in config/local.json — set a non-empty string pointing to your ffmpeg binary.',
    );
  }
  const trimmed = ffmpegPath.trim();

  if (!fs.existsSync(trimmed)) {
    throw new Error(
      `youtubeMp3Downloader.ffmpegPath not found: "${trimmed}". Check config/local.json and install FFmpeg.`,
    );
  }

  const probe = spawnSync(trimmed, ['-version'], {
    timeout: 8000,
    encoding: 'utf8',
    windowsHide: true,
  });

  if (probe.error || probe.status !== 0) {
    throw new Error(
      `ffmpeg -version failed for youtubeMp3Downloader.ffmpegPath="${trimmed}". Install FFmpeg or fix the path.`,
    );
  }
};

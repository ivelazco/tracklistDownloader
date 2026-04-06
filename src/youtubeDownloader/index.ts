import ytdl from '@distube/ytdl-core';
import { Downloader } from 'ytdl-mp3';
import { Config } from '../types/config';
import configData from '../../config/local.json';
import { compose, when } from 'ramda';
import { isNilOrEmpty, rejectNilOrEmpty } from '@flybondi/ramda-land';
import { getYtdlMp3OutputPath, printResults } from '../utils';
import { resolveDownloadBackend } from '../utils/resolveDownloadBackend';
import { downloadOrSkipWithYtDlp } from '../utils/ytDlpExec';
import * as fs from 'fs';

/*
 * PHASE2-AUDIT
 * Stack: `ytdl-mp3` wraps `@distube/ytdl-core` for fetch; transcoding uses bundled `ffmpeg-static`
 * unless overridden inside the library. Config `ffmpegPath` is present for pipeline contract (D-08)
 * but is not passed through Downloader options for the ytdl-mp3 code path. Application enforces
 * `queueParallelism` here because the library does not cap concurrent `downloadSong` calls (D-04).
 * `YTDL_NO_UPDATE` is set in `lambda.ts` before imports to reduce ytdl-core self-update churn.
 * Pin versions via package.json resolutions / overrides for reproducible `@distube/ytdl-core`.
 * Substrings for traceability: ytdl-mp3, @distube/ytdl-core, ffmpeg-static, ffmpegPath,
 * queueParallelism, YTDL_NO_UPDATE, package.json resolutions.
 *
 * Default path is ytdl-mp3 per D-01.
 */

/*
 * PHASE2-DECISION
 * STRATEGY=auto|ytdl-mp3|yt-dlp (config youtubeMp3Downloader.downloadBackend, default auto)
 * When backend is yt-dlp, subprocess uses youtubeMp3Downloader.ffmpegPath directory for --ffmpeg-location.
 * ytdl-mp3 path still uses bundled ffmpeg-static inside the library; ffmpegPath is validated in handler (D-08).
 */

// DownloaderItemInformation is not exported, so we define it locally
type DownloaderItemInformation = {
  album: null | string;
  artist: null | string;
  genre: null | string;
  outputFile: string;
  trackNo: null | number;
  year: null | string;
};

const skippedItem = (outputFile: string): DownloaderItemInformation => ({
  album: null,
  artist: null,
  genre: null,
  outputFile,
  trackNo: null,
  year: null,
});

/**
 * Resolves the MP3 path ytdl-mp3 would use; skips download if it already exists.
 * Uses one getInfo here; when a download runs, ytdl-mp3 calls getInfo again (same as before for that path).
 */
const downloadOrSkipIfExists = async (
  dl: Downloader,
  folderPath: string,
  url: string,
  indexLabel: string,
): Promise<DownloaderItemInformation> => {
  const info = await ytdl.getInfo(url);
  const title = info.videoDetails.title;
  const outputFile = getYtdlMp3OutputPath(folderPath, title);
  if (fs.existsSync(outputFile)) {
    console.log(`[ytDownloader] ${indexLabel} skip (already on disk):`, outputFile);
    return skippedItem(outputFile);
  }
  return dl.downloadSong(url) as Promise<DownloaderItemInformation>;
};

const config = configData as Config;

const throwIfVideosIsNilOrEmpty = compose(
  when(isNilOrEmpty, () => {
    throw new Error(`there aren't video urls to download`);
  }),
  rejectNilOrEmpty,
) as (videos: (string | null | undefined)[]) => string[];

const ytDownloader = (videos: (string | null | undefined)[], folderPath: string) => {
  console.log('[ytDownloader] Received videos:', videos.length, 'URLs');
  console.log('[ytDownloader] Videos:', videos);
  console.log('[ytDownloader] Folder path:', folderPath);
  console.log('[ytDownloader] Config:', config.youtubeMp3Downloader);

  // Verify folder exists before creating Downloader (required by ytdl-mp3)
  if (!folderPath) {
    throw new Error('Folder path is required');
  }
  if (!fs.existsSync(folderPath)) {
    console.error('[ytDownloader] ERROR: Folder does not exist:', folderPath);
    console.log('[ytDownloader] Attempting to create folder...');
    try {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log('[ytDownloader] Folder created successfully');
    } catch (error) {
      const err = error as Error;
      console.error('[ytDownloader] Failed to create folder:', err.message);
      throw new Error(`Failed to create output directory: ${folderPath}. Error: ${err.message}`);
    }
  }
  const stats = fs.statSync(folderPath);
  if (!stats.isDirectory()) {
    console.error('[ytDownloader] ERROR: Path is not a directory:', folderPath);
    throw new Error(`Path is not a directory: ${folderPath}`);
  }
  console.log('[ytDownloader] Folder verified, is directory:', stats.isDirectory());

  const transformedVideos = throwIfVideosIsNilOrEmpty(videos);
  console.log('[ytDownloader] Transformed videos:', transformedVideos.length);

  const downloaderConfig = {
    ...config.youtubeMp3Downloader,
    outputDir: folderPath,
  };
  console.log('[ytDownloader] Downloader config:', downloaderConfig);

  const backend = resolveDownloadBackend(config.youtubeMp3Downloader);
  const ytDlpPath = (config.youtubeMp3Downloader.ytDlpPath ?? 'yt-dlp').trim();
  console.log('[ytDownloader] Download backend:', backend);

  const dl =
    backend === 'ytdl-mp3' ? new Downloader(downloaderConfig as any) : null;
  if (backend === 'ytdl-mp3') {
    console.log('[ytDownloader] Downloader instance created (ytdl-mp3)');
  }

  const limit = Math.max(1, Number(config.youtubeMp3Downloader.queueParallelism) || 1);
  console.log('[ytDownloader] Concurrency ceiling (queueParallelism):', limit);

  const runOne = (url: string, label: string): Promise<DownloaderItemInformation> => {
    if (backend === 'yt-dlp') {
      return downloadOrSkipWithYtDlp(
        ytDlpPath,
        config.youtubeMp3Downloader.ffmpegPath,
        folderPath,
        url,
      );
    }
    if (!dl) {
      throw new Error('[ytDownloader] internal error: ytdl-mp3 Downloader not initialized');
    }
    return downloadOrSkipIfExists(dl, folderPath, url, label);
  };

  const runBatched = async () => {
    const combined: PromiseSettledResult<DownloaderItemInformation>[] = [];

    for (let i = 0; i < transformedVideos.length; i += limit) {
      const batch = transformedVideos.slice(i, i + limit);
      const batchPromises = batch.map((url: string, batchIdx: number) => {
        const index = i + batchIdx;
        const label = `Video ${index + 1}/${transformedVideos.length}`;
        console.log(`[ytDownloader] Creating promise for ${label}:`, url);
        const promise = runOne(url, label);
        promise
          .then((result) => {
            console.log(`[ytDownloader] ${label} ok:`, result.outputFile);
          })
          .catch((error) => {
            console.error(`[ytDownloader] ${label} failed:`, error);
          });
        return promise;
      });

      const settled = await Promise.allSettled(batchPromises);
      combined.push(...settled);
    }

    console.log('[ytDownloader] Result handler created');
    const resultHandler = printResults(folderPath);
    resultHandler(combined as Parameters<typeof resultHandler>[0]);
    console.log('[ytDownloader] Promise chain completed, results aggregated');
  };

  return runBatched()
    .then(() => {
      console.log('[ytDownloader] All downloads completed');
    })
    .catch((error) => {
      console.error('[ytDownloader] Error in download chain:', error);
    });
};

export default ytDownloader;

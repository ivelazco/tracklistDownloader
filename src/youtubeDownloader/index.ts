import { Downloader } from 'ytdl-mp3';
import { Config } from '../types/config';
import configData from '../../config/local.json';
import { map, pipe, compose, when } from 'ramda';
import { isNilOrEmpty, rejectNilOrEmpty } from '@flybondi/ramda-land';
import { prAll, printResults } from '../utils';
import * as fs from 'fs';

// DownloaderItemInformation is not exported, so we define it locally
type DownloaderItemInformation = {
  album: null | string;
  artist: null | string;
  genre: null | string;
  outputFile: string;
  trackNo: null | number;
  year: null | string;
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
  
  const dl = new Downloader(downloaderConfig as any);
  console.log('[ytDownloader] Downloader instance created');
  
  const promises = transformedVideos.map((url: string, index: number) => {
    console.log(`[ytDownloader] Creating promise for video ${index + 1}/${transformedVideos.length}:`, url);
    const promise = dl.downloadSong(url);
    promise
      .then((result) => {
        console.log(`[ytDownloader] Video ${index + 1} downloaded successfully:`, result);
      })
      .catch((error) => {
        console.error(`[ytDownloader] Video ${index + 1} failed:`, error);
      });
    return promise;
  });
  
  console.log('[ytDownloader] Created', promises.length, 'download promises');
  
  const resultHandler = printResults(folderPath);
  console.log('[ytDownloader] Result handler created');
  
  const result = prAll(resultHandler)(promises);
  console.log('[ytDownloader] Promise chain created, waiting for results...');
  
  result
    .then(() => {
      console.log('[ytDownloader] All downloads completed');
    })
    .catch((error) => {
      console.error('[ytDownloader] Error in download chain:', error);
    });
  
  return result;
};

export default ytDownloader;


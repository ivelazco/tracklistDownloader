import YouTube from 'simple-youtube-api';
import yts from 'yt-search';
import { prAll, tapAfter } from '../utils';
import {
  map,
  head,
  compose,
  prop,
  pipe,
  uniq,
  chain,
  reject,
  either,
  propSatisfies,
  complement,
  propEq,
} from 'ramda';
import { isNilOrEmpty } from '@flybondi/ramda-land';
import { Config } from '../types/config';
import { YouTubeSearchResult, YouTubeVideo, FulfilledResult } from '../types';
import configData from '../../config/local.json';

const config = configData as Config;
const youtube = new YouTube(config.youtubeVideoSearcher.apiKey);
const propNotEq = complement(propEq);

const getURLFromHead = compose(prop('url'), head) as (videos: YouTubeVideo[]) => string | undefined;

/**
 * Checks if a video title contains blacklisted words
 */
const hasBlacklistedWords = (title: string): boolean => {
  const blacklistedWords = ['set', 'session'];
  const lowercaseTitle = title.toLowerCase();
  return blacklistedWords.some(word => lowercaseTitle.includes(word));
};

/**
 * Converts duration string "HH:MM:SS" to minutes
 */
const durationToMinutes = (duration: string): number => {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }
  return parts[0] + parts[1] / 60;
};

/**
 * Finds the first valid video that meets our criteria
 */
const findFirstValidVideo = (videos: YouTubeVideo[]): YouTubeVideo | undefined => {
  return videos.find(video => {
    const minutes = durationToMinutes(video.duration.timestamp);
    return !hasBlacklistedWords(video.title) && minutes < 15;
  });
};

/**
 * Searches for a YouTube video matching the track name with specific criteria
 */
async function youtubeVideoSearcher(track: string): Promise<string | undefined | unknown> {
  try {
    const r = (await yts(track)) as YouTubeSearchResult;
    const validVideo = findFirstValidVideo(r.videos);
    return validVideo ? validVideo.url : undefined;
  } catch (err) {
    const error = err as { code?: number; message?: string };
    console.log(
      '[Error][youtube-video-searcher] ',
      error.code === 403 ? error.message : JSON.stringify(error),
    );
    return err;
  }
}

const responseFormatter = (results: Array<FulfilledResult<string | undefined>>): string[] => {
  const fulfilled = results.filter(
    (r): r is FulfilledResult<string | undefined> =>
      r.status === 'fulfilled' && r.value !== undefined && r.value !== null,
  );
  const values = fulfilled.map(r => r.value).filter((v): v is string => typeof v === 'string');
  return uniq(values);
};

/**
 * Searches YouTube for videos matching each track in the tracklist
 */
const prAllYoutubeVideoSearches = (tracklist: string[]): Promise<string[]> => {
  const promises: Promise<string | undefined>[] = tracklist.map(async (track) => {
    const result = await youtubeVideoSearcher(track);
    return typeof result === 'string' ? result : undefined;
  });
  return prAll(responseFormatter)(promises);
};

const logResults = (trackNames: string[]): string[] => {
  console.log(`[youtube-video-searcher] Results: ${trackNames.length} url tracks founded.`);
  return trackNames;
};

const searchYtVideos = async (tracklist: string[]): Promise<string[]> => {
  const result = await prAllYoutubeVideoSearches(tracklist);
  return logResults(result);
};

export default searchYtVideos;


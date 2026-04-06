import yts from 'yt-search';
import configData from '../../config/local.json';
import {
  loadYoutubeUrlCache,
  mapWithConcurrencySettled,
  saveYoutubeUrlCache,
  isYoutubeWatchUrlValid,
  youtubeUrlCacheFilePath,
} from '../utils';
import { isYtDlpAvailable } from '../utils/resolveDownloadBackend';
import { searchYoutubeWithYtDlp } from '../utils/ytDlpExec';
import { Config } from '../types/config';
import { YouTubeSearchResult, YouTubeVideo } from '../types';

// PHASE3-SEARCH — YouTube URL lookup: yt-dlp `ytsearchN:` when the binary is available, else yt-search (no Data API v3).

const config = configData as Config;

/** Inclusive max length for a single track (not DJ sets / long mixes). */
const MAX_TRACK_SECONDS = 15 * 60;

const LONG_FORM_TITLE_MARKERS = [
  'long video',
  'long mix',
  'hour mix',
  'hours mix',
  'full album',
  'continuous mix',
  '10 hour',
  '24 hour',
  '24/7',
  'marathon mix',
  'set',
  'session',
] as const;

const titleLooksLikeLongForm = (title: string): boolean => {
  const t = title.toLowerCase();
  return LONG_FORM_TITLE_MARKERS.some(marker => t.includes(marker));
};

/**
 * Parses yt-search duration timestamp to total seconds (HH:MM:SS, MM:SS, or SS).
 */
const durationToSeconds = (timestamp: string): number => {
  const parts = timestamp.split(':').map(Number);
  if (parts.some(n => Number.isNaN(n))) return Number.POSITIVE_INFINITY;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return Number.POSITIVE_INFINITY;
};

type SearchCandidate = {
  title: string;
  url: string;
  /** `null` when duration unknown — length filter skipped, title heuristics still apply. */
  durationSeconds: null | number;
};

const fromYtsVideo = (video: YouTubeVideo): SearchCandidate => {
  const seconds = durationToSeconds(video.duration.timestamp);
  return {
    title: video.title,
    url: video.url,
    durationSeconds: seconds === Number.POSITIVE_INFINITY ? null : seconds,
  };
};

/**
 * Finds the first search result that looks like a single track, not a long-form upload.
 */
const findFirstValidVideo = (videos: SearchCandidate[]): SearchCandidate | undefined =>
  videos.find(video => {
    if (titleLooksLikeLongForm(video.title)) return false;
    if (video.durationSeconds == null) return true;
    return video.durationSeconds <= MAX_TRACK_SECONDS;
  });

/**
 * Searches for a YouTube video matching the track name with specific criteria
 */
async function youtubeVideoSearcher(track: string): Promise<string | undefined> {
  const dl = config.youtubeMp3Downloader;

  if (isYtDlpAvailable(dl)) {
    const ytPath = (dl.ytDlpPath ?? 'yt-dlp').trim();
    try {
      const hits = await searchYoutubeWithYtDlp(ytPath, track, 20);
      const pick = findFirstValidVideo(hits);
      if (pick?.url) return pick.url;
    } catch (err) {
      console.log('[Error][youtube-video-searcher][yt-dlp] ', err instanceof Error ? err.message : JSON.stringify(err));
    }
  }

  try {
    const r = (await yts(track)) as YouTubeSearchResult;
    const mapped = r.videos.map(fromYtsVideo);
    const validVideo = findFirstValidVideo(mapped);
    return validVideo ? validVideo.url : undefined;
  } catch (err) {
    const error = err as { code?: number; message?: string };
    console.log(
      '[Error][youtube-video-searcher][yt-search] ',
      error.code === 403 ? error.message : JSON.stringify(error),
    );
    return undefined;
  }
}

const responseFormatter = (results: PromiseSettledResult<string | undefined>[]): string[] => {
  const out: string[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value !== undefined && r.value !== null && r.value !== '') {
      out.push(r.value);
    }
  }
  return out;
};

const resolveUrlForTrack = async (
  track: string,
  cache: Record<string, string>,
): Promise<string | undefined> => {
  const cached = cache[track];
  if (cached) {
    if (await isYoutubeWatchUrlValid(cached)) {
      console.log('[youtube-video-searcher] cache hit:', track.slice(0, 80));
      return cached;
    }
    console.log('[youtube-video-searcher] cache miss (invalid or removed video), re-search:', track.slice(0, 80));
    delete cache[track];
  }

  const found = await youtubeVideoSearcher(track);
  if (found) {
    cache[track] = found;
  }
  return found;
};

const searchConcurrencyLimit = (section: Config['youtubeMp3Downloader']): number => {
  const raw = section.searchParallelism ?? section.queueParallelism;
  return Math.max(1, Number(raw) || 1);
};

/**
 * Searches YouTube for videos matching each track in the tracklist (bounded concurrency).
 */
const runYoutubeVideoSearches = async (tracklist: string[], cache: Record<string, string>): Promise<string[]> => {
  const limit = searchConcurrencyLimit(config.youtubeMp3Downloader);
  const settled = await mapWithConcurrencySettled(tracklist, limit, (track: string) =>
    resolveUrlForTrack(track, cache),
  );
  return responseFormatter(settled);
};

const logResults = (trackNames: string[]): string[] => {
  console.log(`[youtube-video-searcher] Results: ${trackNames.length} track URLs found.`);
  return trackNames;
};

const searchYtVideos = async (tracklist: string[]): Promise<string[]> => {
  const dl = config.youtubeMp3Downloader;
  console.log(
    '[youtube-video-searcher] engine:',
    isYtDlpAvailable(dl) ? `yt-dlp (${(dl.ytDlpPath ?? 'yt-dlp').trim()})` : 'yt-search',
  );
  const searchLimit = searchConcurrencyLimit(dl);
  console.log('[youtube-video-searcher] search concurrency (searchParallelism || queueParallelism):', searchLimit);
  console.log('[youtube-video-searcher] URL cache file:', youtubeUrlCacheFilePath());
  const cache = await loadYoutubeUrlCache();
  const result = await runYoutubeVideoSearches(tracklist, cache);
  await saveYoutubeUrlCache(cache);
  return logResults(result);
};

export default searchYtVideos;

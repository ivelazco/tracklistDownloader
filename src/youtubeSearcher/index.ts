import yts from 'yt-search';
import { prAll, loadYoutubeUrlCache, saveYoutubeUrlCache, isYoutubeWatchUrlValid, youtubeUrlCacheFilePath } from '../utils';
import { YouTubeSearchResult, YouTubeVideo, SettledResult } from '../types';

// PHASE3-SEARCH — YouTube URL lookup uses yt-search only (no YouTube Data API v3 client).

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

/**
 * Finds the first search result that looks like a single track, not a long-form upload.
 */
const findFirstValidVideo = (videos: YouTubeVideo[]): YouTubeVideo | undefined =>
  videos.find(video => {
    const seconds = durationToSeconds(video.duration.timestamp);
    return !titleLooksLikeLongForm(video.title) && seconds <= MAX_TRACK_SECONDS;
  });

/**
 * Searches for a YouTube video matching the track name with specific criteria
 */
async function youtubeVideoSearcher(track: string): Promise<string | undefined> {
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
    return undefined;
  }
}

const responseFormatter = (results: Array<SettledResult<string | undefined>>): string[] => {
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

/**
 * Searches YouTube for videos matching each track in the tracklist
 */
const prAllYoutubeVideoSearches = (tracklist: string[], cache: Record<string, string>): Promise<string[]> => {
  const promises: Promise<string | undefined>[] = tracklist.map(track => resolveUrlForTrack(track, cache));
  return prAll(responseFormatter)(promises);
};

const logResults = (trackNames: string[]): string[] => {
  console.log(`[youtube-video-searcher] Results: ${trackNames.length} track URLs found.`);
  return trackNames;
};

const searchYtVideos = async (tracklist: string[]): Promise<string[]> => {
  console.log('[youtube-video-searcher] URL cache file:', youtubeUrlCacheFilePath());
  const cache = await loadYoutubeUrlCache();
  const result = await prAllYoutubeVideoSearches(tracklist, cache);
  await saveYoutubeUrlCache(cache);
  return logResults(result);
};

export default searchYtVideos;

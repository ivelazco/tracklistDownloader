import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

const CACHE_BASENAME = 'tracklist-downloader-youtube-url-cache.json';

type CacheFileV1 = { version: 1; entries: Record<string, string> };

export const youtubeUrlCacheFilePath = (): string =>
  path.join(os.tmpdir(), CACHE_BASENAME);

export const loadYoutubeUrlCache = async (): Promise<Record<string, string>> => {
  try {
    const raw = await fs.readFile(youtubeUrlCacheFilePath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<CacheFileV1>;
    if (parsed && typeof parsed === 'object' && parsed.entries && typeof parsed.entries === 'object') {
      return { ...parsed.entries };
    }
  } catch {
    // missing or corrupt cache
  }
  return {};
};

export const saveYoutubeUrlCache = async (entries: Record<string, string>): Promise<void> => {
  const payload: CacheFileV1 = { version: 1, entries };
  await fs.writeFile(youtubeUrlCacheFilePath(), JSON.stringify(payload), 'utf8');
};

/**
 * Lightweight availability check (no YouTube Data API). Deleted/private videos fail oEmbed.
 */
export const isYoutubeWatchUrlValid = async (url: string): Promise<boolean> => {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  if (!lower.includes('youtube.com/') && !lower.includes('youtu.be/')) return false;
  try {
    const u = new URL('https://www.youtube.com/oembed');
    u.searchParams.set('url', url);
    u.searchParams.set('format', 'json');
    const res = await fetch(u, { method: 'GET', redirect: 'follow' });
    return res.ok;
  } catch {
    return false;
  }
};

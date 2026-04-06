import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { getYtdlMp3OutputPath } from './ytdlMp3OutputPath';

const execFileAsync = promisify(execFile);

export type YtDlpTrackMeta = {
  album: null | string;
  artist: null | string;
  genre: null | string;
  outputFile: string;
  trackNo: null | number;
  year: null | string;
};

const skippedItem = (outputFile: string): YtDlpTrackMeta => ({
  album: null,
  artist: null,
  genre: null,
  outputFile,
  trackNo: null,
  year: null,
});

const execYtDlp = async (
  ytDlpPath: string,
  args: string[],
  maxBuffer = 50 * 1024 * 1024,
): Promise<{ stdout: string; stderr: string }> => {
  try {
    return await execFileAsync(ytDlpPath, args, {
      maxBuffer,
      windowsHide: true,
    });
  } catch (err: unknown) {
    const e = err as { stderr?: Buffer; message?: string };
    const stderr = e.stderr ? e.stderr.toString() : '';
    throw new Error(stderr.trim() || e.message || String(err));
  }
};

export type YtDlpSearchHit = {
  title: string;
  url: string;
  /** Seconds when flat metadata includes it; otherwise rely on title heuristics only. */
  durationSeconds: null | number;
};

type YtDlpFlatSearchJson = {
  duration?: number;
  id?: string;
  title?: string;
  url?: string;
  webpage_url?: string;
};

/**
 * Resolves `ytsearchN:query` via yt-dlp (newline-delimited JSON). More resilient than scraping
 * youtube.com/search from Node when yt-dlp is installed.
 */
export const searchYoutubeWithYtDlp = async (
  ytDlpPath: string,
  query: string,
  maxResults = 20,
): Promise<YtDlpSearchHit[]> => {
  const q = query.trim();
  if (!q) return [];

  const { stdout } = await execYtDlp(
    ytDlpPath,
    ['--no-warnings', '--simulate', '--skip-download', '--flat-playlist', '--dump-json', `ytsearch${maxResults}:${q}`],
    12 * 1024 * 1024,
  );

  const hits: YtDlpSearchHit[] = [];
  for (const line of stdout.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const j = JSON.parse(trimmed) as YtDlpFlatSearchJson;
      const title = j.title;
      if (!title || typeof title !== 'string') continue;

      const url =
        (typeof j.url === 'string' && /^https?:\/\//i.test(j.url) && j.url) ||
        (typeof j.webpage_url === 'string' && /^https?:\/\//i.test(j.webpage_url) && j.webpage_url) ||
        (typeof j.id === 'string' && j.id ? `https://www.youtube.com/watch?v=${j.id}` : '');
      if (!url) continue;

      const durationSeconds =
        typeof j.duration === 'number' && Number.isFinite(j.duration) && j.duration >= 0 ? j.duration : null;

      hits.push({ title, url, durationSeconds });
    } catch {
      // skip malformed line
    }
  }
  return hits;
};

export const fetchYoutubeTitleViaYtDlp = async (ytDlpPath: string, url: string): Promise<string> => {
  const { stdout } = await execYtDlp(ytDlpPath, [
    '--no-warnings',
    '--dump-json',
    '--skip-download',
    url,
  ]);
  const meta = JSON.parse(stdout) as { title?: string };
  if (!meta.title || typeof meta.title !== 'string') {
    throw new Error('yt-dlp JSON response had no title');
  }
  return meta.title;
};

/**
 * Extract audio to MP3 using config ffmpeg dir, same basename rules as ytdl-mp3 (getYtdlMp3OutputPath).
 */
export const downloadOrSkipWithYtDlp = async (
  ytDlpPath: string,
  ffmpegPath: string,
  folderPath: string,
  url: string,
): Promise<YtDlpTrackMeta> => {
  const title = await fetchYoutubeTitleViaYtDlp(ytDlpPath, url);
  const outputFile = getYtdlMp3OutputPath(folderPath, title);
  if (fs.existsSync(outputFile)) {
    console.log(`[ytDownloader][yt-dlp] skip (already on disk):`, outputFile);
    return skippedItem(outputFile);
  }
  const ffmpegDir = path.dirname(ffmpegPath.trim());
  const outputTemplate = outputFile.replace(/\.mp3$/i, '.%(ext)s');
  await execYtDlp(ytDlpPath, [
    '--no-warnings',
    '--no-playlist',
    '-x',
    '--audio-format',
    'mp3',
    '--ffmpeg-location',
    ffmpegDir,
    '-o',
    outputTemplate,
    url,
  ]);
  return skippedItem(outputFile);
};

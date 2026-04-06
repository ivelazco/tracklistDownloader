import * as fs from 'fs';
import { match, head, slice } from 'ramda';
import { Config } from '../types/config';
import configData from '../../config/local.json';
import { getSpotifyPlaylistName } from '../sourceScrappers/spotify-scrapper';

const config = configData as Config;

/** WINDOWS_FORBIDDEN: <>:"/\|?* — cannot appear in Windows file/folder names */
const WINDOWS_FORBIDDEN = /[<>:"/\\|?*]/g;

const FALLBACK_FOLDER_TOKEN = 'playlist';

/**
 * Sanitize a single path segment after space→hyphen normalization (D-06).
 * Strips forbidden characters, trims trailing dots and spaces, falls back if empty.
 */
export const sanitizePlaylistFolderName = (raw: string): string => {
  let s = raw.replace(WINDOWS_FORBIDDEN, '-');
  s = s.replace(/\.+$/g, '').trim();
  s = s.replace(/^\.+/g, '').trim();
  if (!s) {
    console.log('[createFolder] Sanitized name empty; using fallback token:', FALLBACK_FOLDER_TOKEN);
    return FALLBACK_FOLDER_TOKEN;
  }
  return s;
};

const getRegularFolderName = (url: string): string => {
  const matches = match(/(?:[^/]+)$(?<=(?:.html))/g)(url);
  const firstMatch = head(matches);
  if (!firstMatch) return '';
  return slice(0, -5)(firstMatch);
};

async function getFolderName(url: string): Promise<string> {
  if (url.includes('open.spotify.com/playlist')) {
    const playlistName = await getSpotifyPlaylistName(url);
    console.log('[createFolder] playlistName', playlistName);
    const hyphenated = playlistName.replace(/ /g, '-');
    return `Spotify-${sanitizePlaylistFolderName(hyphenated)}`;
  }
  const slug = getRegularFolderName(url).replace(/ /g, '-');
  return `1001tracklists-${sanitizePlaylistFolderName(slug)}`;
}

async function createFolder(url: string): Promise<string | undefined> {
  try {
    console.log('[createFolder] Creating folder for URL:', url);
    const folderName = await getFolderName(url);
    console.log('[createFolder] Folder name:', folderName);
    const folderPath = `${config.youtubeMp3Downloader.outputPath}/${folderName}`;
    console.log('[createFolder] Full folder path:', folderPath);

    // Ensure parent directory exists
    const parentDir = config.youtubeMp3Downloader.outputPath;
    if (!fs.existsSync(parentDir)) {
      console.log('[createFolder] Creating parent directory:', parentDir);
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (!fs.existsSync(folderPath)) {
      console.log('[createFolder] Creating folder:', folderPath);
      fs.mkdirSync(folderPath, { recursive: true });
    } else {
      console.log('[createFolder] Folder already exists, reusing:', folderPath);
    }

    // Verify folder was created
    if (fs.existsSync(folderPath)) {
      const stats = fs.statSync(folderPath);
      console.log('[createFolder] Folder verified, is directory:', stats.isDirectory());
      return folderPath;
    } else {
      console.error('[createFolder] Folder was not created!');
      return undefined;
    }
  } catch (e) {
    const error = e as Error;
    console.error('[createFolder] Error creating folder:', error.message);
    console.error('[createFolder] Error stack:', error.stack);
    return undefined;
  }
}

export default createFolder;

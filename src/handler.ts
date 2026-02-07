import ytDownloader from './youtubeDownloader';
import getTracklist from './sourceScrappers';
import searchYtVideos from './youtubeSearcher';
import createFolder from './folderManager';
import { isNilOrEmpty } from '@flybondi/ramda-land';

const testUrl =
  'https://www.1001tracklists.com/tracklist/2tmuwz79/monika-kruse-factory-93-escape-psycho-circus-united-states-2019-10-26.html';

// @TODO in a future getTracklist will be a derivator, for each download pages that can be supported by the application.
async function handler(
  url: string = testUrl,
  path: string | undefined = undefined,
  _jsonList: boolean | undefined = undefined,
): Promise<void> {
  try {
    console.log('[handler] Starting with URL:', url);
    console.log('[handler] Path:', path);
    
    // URL or TEST
    console.log('[handler] Fetching tracklist...');
    const tracklist = await getTracklist(url);
    console.log('[handler] Tracklist fetched:', tracklist?.length, 'tracks');
    if (isNilOrEmpty(tracklist)) {
      throw new Error('no tracklist list found.');
    }

    console.log('[handler] Searching YouTube videos...');
    const youtubeUrls = await searchYtVideos(tracklist);
    console.log('[handler] YouTube URLs found:', youtubeUrls?.length, 'URLs');
    console.log('[handler] YouTube URLs:', youtubeUrls);
    if (isNilOrEmpty(youtubeUrls)) {
      throw new Error('no youtube URLs found.');
    }

    console.log('[handler] Creating folder...');
    const folderPath = await createFolder(url);
    console.log('[handler] Folder path:', folderPath);
    const finalPath = path || folderPath || '';
    console.log('[handler] Final download path:', finalPath);
    console.log('[handler] Starting downloads...');

    const result = await ytDownloader(youtubeUrls, finalPath);
    console.log('[handler] Download completed, result:', result);
    return result;
  } catch (error) {
    console.error('[handler][error][catch]', error);
    if (error instanceof Error) {
      console.error('[handler][error] Stack:', error.stack);
    }
    throw error;
  }
}

export default handler;


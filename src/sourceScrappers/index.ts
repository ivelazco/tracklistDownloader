import { getSpotifyPlaylistTracks } from './spotify-scrapper';
import tracklists1001Scrapper from './1001-scrapper';

/**
 * Routes the scraping request to the appropriate scraper based on the URL
 */
async function scrapperRouter(url: string): Promise<string[]> {
  if (!url) {
    throw new Error('URL is required');
  }

  // Convert to lowercase for case-insensitive matching
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('spotify')) {
    return getSpotifyPlaylistTracks(url);
  }

  // Default to 1001tracklists scraper
  return tracklists1001Scrapper(url);
}

export default scrapperRouter;


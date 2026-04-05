import { compose, reject } from 'ramda';
import { isNilOrEmpty } from '@flybondi/ramda-land';
import { tapAfter } from '../utils';
import { Config } from '../types/config';
import {
  SpotifyPlaylistTracksResponse,
  SpotifyPlaylistResponse,
  SpotifyClientCredentialsGrantResponse,
  SpotifyPlaylistItem,
} from '../types';
import configData from '../../config/local.json';
import SpotifyWebApi from 'spotify-web-api-node';

const config = configData as Config;

type SpotifyErrorCtx = {
  playlistId?: string;
  operation: 'token' | 'playlistMeta' | 'playlistTracks';
};

function readRetryAfterSeconds(headers: unknown): string | undefined {
  if (typeof headers !== 'object' || headers === null) {
    return undefined;
  }
  const h = headers as Record<string, unknown>;
  const raw = h['retry-after'] ?? h['Retry-After'];
  if (raw === undefined || raw === null) {
    return undefined;
  }
  return String(raw);
}

/** SPOTIFY_ERR — centralized user-facing Spotify API failure text (Phase 4). */
function spotifyFailureMessage(err: unknown, ctx: SpotifyErrorCtx): string {
  if (typeof err === 'object' && err !== null && 'statusCode' in err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    const headers = (err as { headers?: unknown }).headers;

    if (statusCode === 401) {
      return 'Spotify credentials rejected. Check spotify.clientId and spotify.clientSecret in config/local.json.';
    }
    if (statusCode === 403) {
      const id = ctx.playlistId ?? 'unknown';
      return `Spotify permission denied (forbidden). Playlist may be private or not accessible with client credentials. Playlist ID: ${id}`;
    }
    if (statusCode === 404) {
      const id = ctx.playlistId ?? 'unknown';
      return (
        `Playlist not found (404). Check the URL and that the playlist is public. ` +
        `With client-credentials auth, many Spotify editorial playlists are unavailable — use a user-created public playlist. ` +
        `Playlist ID: ${id}`
      );
    }
    if (statusCode === 429) {
      const retryAfter = readRetryAfterSeconds(headers);
      return retryAfter
        ? `Spotify rate limit exceeded. Retry after ${retryAfter}s.`
        : 'Spotify rate limit exceeded. Wait and retry.';
    }
    if (typeof statusCode === 'number') {
      const msg = err instanceof Error ? err.message : '';
      return `Spotify API error (status ${statusCode}). ${msg}`.trim();
    }
  }

  if (ctx.operation === 'token') {
    return 'Spotify token request failed. Verify spotify.clientId and spotify.clientSecret in config/local.json.';
  }

  const fallback = err instanceof Error ? err.message : String(err);
  return `Spotify request failed: ${fallback}`;
}

async function getSpotifyPlaylistName(url: string): Promise<string> {
  if (!url.includes('open.spotify.com/playlist')) {
    throw new Error('Invalid Spotify playlist URL');
  }

  let playlistId = url.split('/playlist/')[1];
  if (playlistId.includes('?')) {
    playlistId = playlistId.split('?')[0];
  }
  if (playlistId.includes('/')) {
    playlistId = playlistId.split('/')[0];
  }

  if (!config.spotify.clientId || !config.spotify.clientSecret) {
    throw new Error(
      'Spotify credentials not found. Set spotify.clientId and spotify.clientSecret in config/local.json.',
    );
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
  });

  let data: SpotifyClientCredentialsGrantResponse;
  try {
    data = (await spotifyApi.clientCredentialsGrant()) as SpotifyClientCredentialsGrantResponse;
  } catch (grantErr) {
    throw new Error(spotifyFailureMessage(grantErr, { operation: 'token' }));
  }
  spotifyApi.setAccessToken(data.body.access_token);

  const market = config.spotify.market ?? 'US';

  let response: SpotifyPlaylistResponse;
  try {
    response = (await spotifyApi.getPlaylist(playlistId, { market })) as SpotifyPlaylistResponse;
  } catch (apiErr) {
    throw new Error(spotifyFailureMessage(apiErr, { playlistId, operation: 'playlistMeta' }));
  }
  return response.body.name;
}

async function getSpotifyPlaylistTracksInternal(url: string): Promise<string[]> {
  if (!url.includes('open.spotify.com/playlist')) {
    throw new Error('Invalid Spotify playlist URL. Please provide a valid Spotify playlist link.');
  }

  let playlistId = url.split('/playlist/')[1];
  if (playlistId.includes('?')) {
    playlistId = playlistId.split('?')[0];
  }
  if (playlistId.includes('/')) {
    playlistId = playlistId.split('/')[0];
  }

  console.log(`[Spotify][API] Extracted playlist ID: ${playlistId}`);

  if (!config.spotify.clientId || !config.spotify.clientSecret) {
    throw new Error(
      'Spotify credentials not found. Set spotify.clientId and spotify.clientSecret in config/local.json.',
    );
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: config.spotify.clientId,
    clientSecret: config.spotify.clientSecret,
  });

  let data: SpotifyClientCredentialsGrantResponse;
  try {
    data = (await spotifyApi.clientCredentialsGrant()) as SpotifyClientCredentialsGrantResponse;
  } catch (grantErr) {
    throw new Error(spotifyFailureMessage(grantErr, { operation: 'token' }));
  }
  spotifyApi.setAccessToken(data.body.access_token);

  const market = config.spotify.market ?? 'US';

  console.log(`[Spotify][API] Successfully authenticated, fetching playlist: ${playlistId}`);

  const PAGE_SIZE = 100;
  let offset = 0;
  const allItems: SpotifyPlaylistItem[] = [];
  let page = 0;

  try {
    while (true) {
      const response = (await spotifyApi.getPlaylistTracks(playlistId, {
        limit: PAGE_SIZE,
        offset,
        market,
      })) as SpotifyPlaylistTracksResponse;

      const items = response.body.items;
      allItems.push(...items);
      page += 1;
      console.log(
        `[Spotify][API] page=${page} offset=${offset} fetched=${items.length} cumulative=${allItems.length}`,
      );

      if (items.length === 0 || items.length < PAGE_SIZE) {
        break;
      }
      offset += PAGE_SIZE;
    }
  } catch (apiErr) {
    throw new Error(spotifyFailureMessage(apiErr, { playlistId, operation: 'playlistTracks' }));
  }

  const tracks = allItems
    .map(item => {
      const track = item.track;
      if (!track) {
        return null;
      }
      const artists = track.artists.map(artist => artist.name).join(', ');
      return `${artists} ${track.name}`;
    })
    .filter((line): line is string => line !== null);

  return compose(reject(isNilOrEmpty))(tracks) as string[];
}

const logSpotifyResults = (trackNames: string[]): string[] => {
  console.log(`[Spotify] Results: ${trackNames.length} tracks fetched: ${trackNames}`);
  return trackNames;
};

export const getSpotifyPlaylistTracks = tapAfter(logSpotifyResults, getSpotifyPlaylistTracksInternal);
export { getSpotifyPlaylistName };

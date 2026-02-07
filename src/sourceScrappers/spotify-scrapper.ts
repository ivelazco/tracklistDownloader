import { compose, reject } from 'ramda';
import { isNilOrEmpty } from '@flybondi/ramda-land';
import { tapAfter } from '../utils';
import { Config } from '../types/config';
import { SpotifyPlaylistTracksResponse, SpotifyPlaylistResponse, SpotifyClientCredentialsGrantResponse } from '../types';
import configData from '../../config/local.json';
import SpotifyWebApi from 'spotify-web-api-node';

const config = configData as Config;

async function getSpotifyPlaylistName(url: string): Promise<string> {
  if (!url.includes('open.spotify.com/playlist')) {
    throw new Error('Invalid Spotify playlist URL');
  }

  try {
    let playlistId = url.split('/playlist/')[1];
    if (playlistId.includes('?')) {
      playlistId = playlistId.split('?')[0];
    }
    if (playlistId.includes('/')) {
      playlistId = playlistId.split('/')[0];
    }

    if (!config.spotify.clientId || !config.spotify.clientSecret) {
      throw new Error('Spotify credentials not found in config');
    }

    const spotifyApi = new SpotifyWebApi({
      clientId: config.spotify.clientId,
      clientSecret: config.spotify.clientSecret,
    });

    const data = (await spotifyApi.clientCredentialsGrant()) as SpotifyClientCredentialsGrantResponse;
    spotifyApi.setAccessToken(data.body.access_token);

    const response = (await spotifyApi.getPlaylist(playlistId)) as SpotifyPlaylistResponse;
    return response.body.name;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to fetch Spotify playlist name: ${err.message}`);
  }
}

async function getSpotifyPlaylistTracksInternal(url: string): Promise<string[]> {
  if (!url.includes('open.spotify.com/playlist')) {
    throw new Error('Invalid Spotify playlist URL. Please provide a valid Spotify playlist link.');
  }

  try {
    // Extract playlist ID from URL - handle both full URLs and shortened ones
    let playlistId = url.split('/playlist/')[1];
    if (playlistId.includes('?')) {
      playlistId = playlistId.split('?')[0];
    }
    if (playlistId.includes('/')) {
      playlistId = playlistId.split('/')[0];
    }

    console.log(`[Spotify][API] Extracted playlist ID: ${playlistId}`);

    if (!config.spotify.clientId || !config.spotify.clientSecret) {
      throw new Error('Spotify credentials not found in config. Please check your config/local.json file.');
    }

    const spotifyApi = new SpotifyWebApi({
      clientId: config.spotify.clientId,
      clientSecret: config.spotify.clientSecret,
    });

    try {
      // Get access token
      const data = (await spotifyApi.clientCredentialsGrant()) as SpotifyClientCredentialsGrantResponse;
      spotifyApi.setAccessToken(data.body.access_token);

      console.log(`[Spotify][API] Successfully authenticated, fetching playlist: ${playlistId}`);

      // Get playlist tracks
      const response = (await spotifyApi.getPlaylistTracks(playlistId)) as SpotifyPlaylistTracksResponse;

      // Transform the response to match your existing format
      const tracks = response.body.items.map(item => {
        const track = item.track;
        const artists = track.artists.map(artist => artist.name).join(', ');
        return `${artists} ${track.name}`;
      });

      return compose(reject(isNilOrEmpty))(tracks) as string[];
    } catch (apiError) {
      const error = apiError as { statusCode?: number; message?: string };
      if (error.statusCode === 404) {
        throw new Error(`Playlist not found. Please check if the playlist exists and is public. Playlist ID: ${playlistId}`);
      } else if (error.statusCode === 401) {
        throw new Error('Authentication failed. Please check your Spotify API credentials.');
      } else {
        throw new Error(`Spotify API error: ${error.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    const err = error as Error;
    throw new Error(`Failed to fetch Spotify playlist: ${err.message}`);
  }
}

const logSpotifyResults = (trackNames: string[]): string[] => {
  console.log(`[Spotify] Results: ${trackNames.length} tracks fetched: ${trackNames}`);
  return trackNames;
};

export const getSpotifyPlaylistTracks = tapAfter(logSpotifyResults, getSpotifyPlaylistTracksInternal);
export { getSpotifyPlaylistName };


'use strict';

const { compose, reject } = require('ramda');
const { isNilOrEmpty } = require('@flybondi/ramda-land');
const { tapAfter } = require('../utils');
const {
    spotify: spotifyConfig
  } = require('../../config/local.json');

// You'll need to install this package
// npm install spotify-web-api-node
const SpotifyWebApi = require('spotify-web-api-node');

async function getSpotifyPlaylistName(url) {
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

    if (!spotifyConfig.clientId || !spotifyConfig.clientSecret) {
      throw new Error('Spotify credentials not found in config');
    }

    const spotifyApi = new SpotifyWebApi({
      clientId: spotifyConfig.clientId,
      clientSecret: spotifyConfig.clientSecret
    });

    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);

    const response = await spotifyApi.getPlaylist(playlistId);
    return response.body.name;
  } catch (error) {
    throw new Error(`Failed to fetch Spotify playlist name: ${error.message}`);
  }
}

async function getSpotifyPlaylistTracks(url) {
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
    
    if (!spotifyConfig.clientId || !spotifyConfig.clientSecret) {
      throw new Error('Spotify credentials not found in config. Please check your config/local.json file.');
    }

    const spotifyApi = new SpotifyWebApi({
      clientId: spotifyConfig.clientId,
      clientSecret: spotifyConfig.clientSecret
    });

    try {
      // Get access token
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);

      console.log(`[Spotify][API] Successfully authenticated, fetching playlist: ${playlistId}`);

      // Get playlist tracks
      const response = await spotifyApi.getPlaylistTracks(playlistId);
      
      // Transform the response to match your existing format
      const tracks = response.body.items.map(item => {
        const track = item.track;
        const artists = track.artists.map(artist => artist.name).join(', ');
        return `${artists} ${track.name}`;
      });

      return compose(reject(isNilOrEmpty))(tracks);
    } catch (apiError) {
      if (apiError.statusCode === 404) {
        throw new Error(`Playlist not found. Please check if the playlist exists and is public. Playlist ID: ${playlistId}`);
      } else if (apiError.statusCode === 401) {
        throw new Error('Authentication failed. Please check your Spotify API credentials.');
      } else {
        throw new Error(`Spotify API error: ${apiError.message}`);
      }
    }
  } catch (error) {
    throw new Error(`Failed to fetch Spotify playlist: ${error.message}`);
  }
}

module.exports = {
  getSpotifyPlaylistTracks: tapAfter((trackNames) => {
    console.log(`[Spotify] Results: ${trackNames.length} tracks fetched: ${trackNames}`);
    return trackNames;
  }, getSpotifyPlaylistTracks),
  getSpotifyPlaylistName
}; 
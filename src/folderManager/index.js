'use strict';

const fs = require('fs');
const { match, head, slice, compose } = require('ramda');
const { youtubeMp3Downloader: config } = require('../../config/local.json');
const { getSpotifyPlaylistName } = require('../sourceScrappers/spotify-scrapper');

const getRegularFolderName = compose(slice(0, -5), head, match(/(?:[^/]+)$(?<=(?:.html))/g));

async function getFolderName(url) {
  if (url.includes('open.spotify.com/playlist')) {
    const playlistName = await getSpotifyPlaylistName(url);
    return `Spotify - ${playlistName}`;
  }
  return `1001tracklists - ${getRegularFolderName(url)}`;
}

async function createFolder(url) {
  try {
    const folderName = await getFolderName(url);
    const folderPath = `${config.outputPath}/${folderName}`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    return folderPath;
  } catch (e) {
    console.error('Error creating folder:', e.message);
    return undefined;
  }
}

module.exports = createFolder;

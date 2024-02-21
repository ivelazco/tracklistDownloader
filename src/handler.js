'use strict';
const ytDownloader = require('./youtube-mp3-downloader');
const getTracklist = require('./1001-tracklists-scrapper');
const searchYtVideos = require('./youtube-videos-searcher');
const createFolder = require('./create-folder');
const testUrl =
  'https://www.1001tracklists.com/tracklist/2tmuwz79/monika-kruse-factory-93-escape-psycho-circus-united-states-2019-10-26.html';

// @TODO in a future getTracklist will be a derivator, for each download pages that can be supported by the application.
async function handler(url = testUrl, path = null) {
  try {
    // URL or TEST
    const tracklist = await getTracklist(url, path);
    console.log(`tracklist to download: ${tracklist}`);
    const youtubeUrls = await searchYtVideos(tracklist);
    const folderPath = await createFolder(url);
    // return ytDownloader(youtubeUrls, path || folderPath);
  } catch (error) {
    return console.log('[error][catch]', error);
  }
}

module.exports = handler;

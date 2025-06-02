'use strict';
const ytDownloader = require('./youtubeDownloader');
const getTracklist = require('./sourceScrappers');
const searchYtVideos = require('./youtubeSearcher');
const createFolder = require('./folderManager');
const { isNilOrEmpty } = require('@flybondi/ramda-land');
const testUrl =
  'https://www.1001tracklists.com/tracklist/2tmuwz79/monika-kruse-factory-93-escape-psycho-circus-united-states-2019-10-26.html';

// @TODO in a future getTracklist will be a derivator, for each download pages that can be supported by the application.
async function handler(url = testUrl, path = undefined, jsonList = undefined) {
  try {
    // URL or TEST
    let tracklist;
    if (jsonList) {
      tracklist = await getTracklist(url, path);
    } else {
      tracklist = await getTracklist(url, path);
    }
    if (isNilOrEmpty(tracklist)) {
      throw new Error('no tracklist list found.');
    }


    const youtubeUrls = await searchYtVideos(tracklist);
    if (isNilOrEmpty(youtubeUrls)) {
      throw new Error('no youtube URLs found.');
    }

    const folderPath = await createFolder(url);
    console.log('Downloading... ');


    return ytDownloader(youtubeUrls, path || folderPath);
  } catch (error) {
    console.log('[error][catch]', error);
    throw error;
  }
}

module.exports = handler;

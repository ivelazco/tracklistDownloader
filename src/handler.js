'use strict';
const ytDownloader = require('./youtube-mp3-downloader');
const getTracklist = require('./1001-tracklists-scrapper');
const searchYtVideos = require('./youtube-videos-searcher');
// @TODO in a future getTracklist will be a derivator, for each download pages that can be supported by the application.
async function handler() {
  // (url, path) {

  try {
    const url =
      'https://www.1001tracklists.com/tracklist/2tmuwz79/monika-kruse-factory-93-escape-psycho-circus-united-states-2019-10-26.html';
    const tracklist = await getTracklist(url);
    const [first] = await searchYtVideos(tracklist);
    console.log('trackList: ', JSON.stringify([first]));
    return ytDownloader('qDoViTMGmtM');
  } catch (error) {
    return console.log('[error][catch]', error);
  }
}

module.exports = handler;

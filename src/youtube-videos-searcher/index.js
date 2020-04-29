'use strict';

const YouTube = require('simple-youtube-api');
const { prAll } = require('../utils');
const { map, head, compose, prop, pipe, tap } = require('ramda');
const {
  youtubeVideoSearcher: { apiKey }
} = require('../../config/local.json');

const youtube = new YouTube(apiKey);

const getIdFromHead = compose(tap(a => console.log('[youtube-video-searcher] finished')), prop('id'), head);

/**
 *
 *
 * @param {String} track
 */
async function youtubeVideoSearcher(track) {
  return (
    youtube
      .searchVideos(track, 2)
      .then(results => getIdFromHead(results))
      // @todo: pass this err function to a utils ( pass context as param)
      .catch(err => console.log('[Error][youtube-video-searcher] ', JSON.stringify(err)))
  );
}

/**
 *
 *
 * @param {Array<String>} tracklist
 */
const youtubeVideosSearcher = pipe(map(youtubeVideoSearcher), prAll);

module.exports = youtubeVideosSearcher;

'use strict';

const YouTube = require('simple-youtube-api');
const { prAll } = require('../utils');
const { map, head, compose, prop, pipe } = require('ramda');
const youtube = new YouTube('AIzaSyB1Xr5NydyJLRj2WXQLd4mKMNp7YohBbGc');
const getIdFromHead = compose(prop('id'), head);
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

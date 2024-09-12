'use strict';

const YouTube = require('simple-youtube-api');
const yts = require( 'yt-search' )
const { prAll, tapAfter } = require('../utils');
const {
  map,
  head,
  compose,
  prop,
  pipe,
  uniq,
  chain,
  reject,
  either,
  propSatisfies,
  complement,
  propEq
} = require('ramda');
const { isNilOrEmpty } = require('@flybondi/ramda-land');
const {
  youtubeVideoSearcher: { apiKey }
} = require('../../config/local.json');

const youtube = new YouTube(apiKey);
const propNotEq = complement(propEq);

const getURLFromHead = compose(prop('url'), head);

/**
 *
 *
 * @param {String} track
 */
async function youtubeVideoSearcher(track) {
  try {
  const r = await yts(track);
  return getURLFromHead(r.videos);
  } catch(err) {
        console.log(
          '[Error][youtube-video-searcher] ',
          err.code === 403 ? err.message : JSON.stringify(err)
        )
        return err;
  }
}

const responseFormatter = compose(
  uniq,
  chain(prop('value')),
  reject(either(propNotEq('status', 'fulfilled'), propSatisfies(isNilOrEmpty, 'value')))
);

/**
 *
 *
 * @param {Array<String>} tracklist
 */
const prAllYoutubeVideoSearches = pipe(map(youtubeVideoSearcher), prAll(responseFormatter));

module.exports = tapAfter(trackNames => {
  console.log(`[youtube-video-searcher] Results: ${trackNames.length} url tracks founded.`);
  return trackNames;
}, prAllYoutubeVideoSearches);

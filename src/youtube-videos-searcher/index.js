'use strict';

const YouTube = require('simple-youtube-api');
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

const getIdFromHead = compose(prop('id'), head);

/**
 *
 *
 * @param {String} track
 */
async function youtubeVideoSearcher(track) {
  return (
    youtube
      .searchVideos(track, 10)
      .then(results => {
        console.log(
          JSON.stringify({
            [track]: {
              results,
              raws: results.map(r => r.raw && r.raw.snippet && r.raw.snippet.title)
            }
          })
        );
        return getIdFromHead(results);
      })
      // @todo: pass this err function to a utils ( pass context as param)
      .catch(err =>
        console.log(
          '[Error][youtube-video-searcher] ',
          err.code === 403 ? err.message : JSON.stringify(err)
        )
      )
  );
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

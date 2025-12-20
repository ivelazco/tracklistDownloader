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
 * Checks if a video title contains blacklisted words
 * @param {String} title 
 * @returns {Boolean}
 */
const hasBlacklistedWords = title => {
  const blacklistedWords = ['set', 'session'];
  const lowercaseTitle = title.toLowerCase();
  return blacklistedWords.some(word => lowercaseTitle.includes(word));
};

/**
 * Converts duration string "HH:MM:SS" to minutes
 * @param {String} duration 
 * @returns {Number}
 */
const durationToMinutes = duration => {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }
  return parts[0] + parts[1] / 60;
};

/**
 * Finds the first valid video that meets our criteria
 * @param {Array} videos 
 * @returns {Object|undefined}
 */
const findFirstValidVideo = videos => {
  return videos.find(video => {
    const minutes = durationToMinutes(video.duration.timestamp);
    return !hasBlacklistedWords(video.title) && minutes < 15;
  });
};

/**
 * Searches for a YouTube video matching the track name with specific criteria
 * @param {String} track
 */
async function youtubeVideoSearcher(track) {
  try {
    const r = await yts(track);
    const validVideo = findFirstValidVideo(r.videos);
    return validVideo ? validVideo.url : undefined;
  } catch(err) {
    console.log(
      '[Error][youtube-video-searcher] ',
      err.code === 403 ? err.message : JSON.stringify(err)
    );
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

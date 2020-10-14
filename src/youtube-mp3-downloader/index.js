'use strict';
const Downloader = require('./Downloader');
const { youtubeMp3Downloader: config } = require('../../config/local.json');
const printResults = require('../print-results');
const { map, pipe, compose, when } = require('ramda');
const { isNilOrEmpty, rejectNilOrEmpty } = require('@flybondi/ramda-land');
const { prAll } = require('../utils');

const logError = (error, videoId) => {
  console.log(`[error][${videoId}] ${error}`);
  return { status: false };
};

const throwIfVideosIsNilOrEmpty = compose(
  when(isNilOrEmpty, () => {
    throw new Error(`there aren't video urls to download`);
  }),
  rejectNilOrEmpty
);

Downloader.prototype.getMP3 = function(track, callback) {
  const self = this;

  // Register callback
  self.callbacks[track.videoId] = {callback, name: track.name};
  // Trigger download
  self.YD.download(track.videoId, track.name);
};

module.exports = (videos, folderPath) => {
  const transformedVideos = throwIfVideosIsNilOrEmpty(videos);
  const dl = new Downloader({
    ...config,
    outputPath: folderPath
  });
  return pipe(
    map(
      videoId =>
        new Promise((resolve, reject) =>
          dl.getMP3({ videoId: videoId }, function(err, { videoTitle, videoId }) {
            try {
              videoTitle && console.log('[finished] ', JSON.stringify(videoTitle));
              const result = err
                ? logError(err, videoId)
                : { status: true, videoTitle: videoTitle };
              resolve(result);
            } catch (e) {
              reject(e.message);
            }
          })
        )
    ),
    prAll(printResults)
  )(transformedVideos);
};

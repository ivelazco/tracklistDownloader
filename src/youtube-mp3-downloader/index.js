'use strict';
const Downloader = require('./Downloader');
const { youtubeMp3Downloader: config } = require('../../config/local.json');
const { map, pipe } = require('ramda');
const { prAll } = require('../utils');

const logError = (error, videoId) => {
  console.log(`[error][${videoId}] ${error}`);
  return { status: false };
};

Downloader.prototype.getMP3 = function(track, callback) {
  const self = this;

  // Register callback
  self.callbacks[track.videoId] = callback;
  // Trigger download
  self.YD.download(track.videoId, track.name);
};

module.exports = (videos, path) => {
  const dl = new Downloader({ ...config, outputPath: path || config.outputPath });
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
    prAll
  )(videos);
};

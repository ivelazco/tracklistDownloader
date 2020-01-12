'use strict';
var YoutubeMp3Downloader = require('youtube-mp3-downloader');
const { youtubeMp3Downloader: config } = require('../../config/development.json');
const { map, pipe } = require('ramda');
const { prAll } = require('../utils');

const roundedNumber = number => Math.round(number * 100) / 100;

const logError = (error, videoId) => {
  console.log(`[error][${videoId}] ${error}`);
  return { status: false };
};

var Downloader = function() {
  var self = this;

  // Configure YoutubeMp3Downloader with your settings
  self.YD = new YoutubeMp3Downloader(config);

  self.callbacks = {};

  self.YD.on('finished', function(error, data) {
    if (self.callbacks[data.videoId]) {
      self.callbacks[data.videoId](error, data);
    } else {
      console.log('Error: No callback for videoId!');
    }
  });

  self.YD.on('progress', function({ progress: { percentage }, videoId }) {
    console.log(`[progress][${videoId}] ${roundedNumber(percentage)}%`);
  });

  self.YD.on('error', function(error, data) {
    if (self.callbacks[data.videoId]) {
      self.callbacks[data.videoId](error, data);
    } else {
      console.log('Error: No callback for videoId!');
    }
  });
};

Downloader.prototype.getMP3 = function(track, callback) {
  var self = this;

  // Register callback
  self.callbacks[track.videoId] = callback;
  // Trigger download
  self.YD.download(track.videoId, track.name);
};

module.exports = async videos => {
  const dl = new Downloader();
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

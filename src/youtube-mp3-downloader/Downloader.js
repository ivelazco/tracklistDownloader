'use strict';
const YoutubeMp3Downloader = require('youtube-mp3-downloader');

const roundedNumber = number => Math.round(Math.round(number * 100) / 100);

const Downloader = function(config) {
  const self = this;

  self.YD = new YoutubeMp3Downloader(config);

  self.callbacks = {};

  self.YD.on('finished', function(error, data) {
    if (self.callbacks[data.videoId] && self.callbacks[data.videoId].callback) {
      self.callbacks[data.videoId].callback(error, data);
    } else {
      console.log('Error: No callback for videoId!');
    }
  });

  self.YD.on('progress', function({ progress: { percentage }, videoId }) {

    console.log(`[progress][${self.callbacks[videoId].name || videoId}] ${roundedNumber(percentage)}%`);
  });

  self.YD.on('error', function(error, data) {
    if (data && data.videoId && self.callbacks[data.videoId] && self.callbacks[data.videoId].callback) {
      self.callbacks[data.videoId].callback(error, data);
    } else {
      console.log(error);
    }
  });
};

module.exports = Downloader;

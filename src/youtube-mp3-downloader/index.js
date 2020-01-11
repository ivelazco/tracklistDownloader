'use strict';
var YoutubeMp3Downloader = require('youtube-mp3-downloader');
const config = require('../../config/development.json').youtubeMp3Downloader;

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

  self.YD.on('error', function(error, data) {
    console.error(error + ' on videoId ' + data);

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

module.exports = videoId => {
  const dl = new Downloader();
  let i = 0;
  console.log(videoId);
  dl.getMP3({ videoId: videoId, name: 'test' }, function(err, res) {
    i++;
    if (err) throw err;
    else {
      console.log('Song ' + i + ' was downloaded: ' + res.file);
    }
    return i;
  });
};

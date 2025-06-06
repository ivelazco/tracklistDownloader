'use strict';
const { Downloader } = require('ytdl-mp3');
const { youtubeMp3Downloader: config } = require('../../config/local.json');
const { map, pipe, compose, when } = require('ramda');
const { isNilOrEmpty, rejectNilOrEmpty } = require('@flybondi/ramda-land');
const { prAll, printResults } = require('../utils');

const logError = (error, videoId) => {
  console.log(`[error][${videoId}] ${error}`);
  return { status: false };
};

const throwIfVideosIsNilOrEmpty = compose(
  when(isNilOrEmpty, () => {
    throw new Error(`there aren't video urls to download`);
  }),
  rejectNilOrEmpty,
);

module.exports = (videos, folderPath) => {
  const transformedVideos = throwIfVideosIsNilOrEmpty(videos);
  const dl = new Downloader({
    ...config,
    outputPath: folderPath,
    outputDir: folderPath,
  });
  return pipe(
    map((url) => dl.downloadSong(url)),
    prAll(printResults(folderPath)),
  )(transformedVideos);
};

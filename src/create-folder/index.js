'use strict';

const fs = require('fs');
const { match, head, slice, compose } = require('ramda');
const { youtubeMp3Downloader: config } = require('../../config/local.json');

const getFolderName = compose(slice(0, -5), head, match(/(?:[^/]+)$(?<=(?:.html))/g));

async function createFolder(url) {
  try {
    const folderName = getFolderName(url);
    const folderPath = `${config.outputPath}/${folderName}`;
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    return folderPath;
  } catch (e) {
    return undefined;
  }
}

module.exports = createFolder;

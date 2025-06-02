'use strict';

const cheerio = require('cheerio');
const { chromium } = require('playwright');
const { compose, reject, either, includes } = require('ramda');
const { isNilOrEmpty } = require('@flybondi/ramda-land');
const { tapAfter } = require('../utils');
const fs = require('fs/promises');
const {getSpotifyPlaylistTracks: spotifyScrapper} = require('./spotify-scrapper');
const tracklists1001Scrapper = require('./1001-scrapper');


/**
 * Routes the scraping request to the appropriate scraper based on the URL
 * @param {string} url - The URL to scrape
 * @returns {Promise<string[]>} - Array of tracks in format "artist trackName"
 */
async function scrapperRouter(url) {
  if (!url) {
    throw new Error('URL is required');
  }

  // Convert to lowercase for case-insensitive matching
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('spotify')) {
    return spotifyScrapper(url);
  }

  // Default to 1001tracklists scraper
  return tracklists1001Scrapper(url);
}

module.exports = scrapperRouter;

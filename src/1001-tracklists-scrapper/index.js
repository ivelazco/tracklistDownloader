'use strict';

const cheerio = require('cheerio');
const { compose, reject, either, includes } = require('ramda');
const request = require('request-promise');
const { isNilOrEmpty } = require('@flybondi/ramda-land');
const { tapAfter } = require('../utils');

// @todo (iv): change to regex
const rejectIDtracks = compose(reject(either(isNilOrEmpty, includes('ID - ID'))));

async function tracklists1001Scrapper(url) {
  // make a tap after
  console.log(`[1001tracklists][Scrapping] URL: ${url}`);
  const options = {
    uri: url,
    transform: function(body) {
      return cheerio.load(body);
    }
  };
  return new Promise((resolve, reject) =>
    request(options)
      .then($ => {
        const songs = [];
        $('main')
          .find('table')
          .find('tr.tlpItem')
          .map(
            (i, element) =>
              element &&
              songs.push(
                $(element)
                  .find('span.trackValue')
                  .text()
                  .trim()
              )
          );
        resolve(rejectIDtracks(songs));
      })
      .catch(err => console.log(reject(err)))
  );
}

module.exports = tapAfter(trackNames => {
  console.log(`[1001tracklists] Results: ${trackNames.length} tracks scrapped. `);
  return trackNames;
}, tracklists1001Scrapper);

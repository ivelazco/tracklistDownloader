'use strict';

const cheerio = require('cheerio');
const { chromium } = require('playwright');
const { compose, reject, either, includes } = require('ramda');
const { isNilOrEmpty } = require('@flybondi/ramda-land');
const { tapAfter } = require('../utils');
const fs = require('fs/promises');

// @todo (iv): change to regex
const rejectIDtracks = compose(reject(either(isNilOrEmpty, includes('ID - ID'))));

async function fetchWithConsent(url, { acceptCookies = true, timeout = 30000 } = {}) {
  // 1. Launch browser with enhanced configuration
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
    ],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    javaScriptEnabled: true,
  });

  const page = await context.newPage();

  // 2. Navigate and wait for full page load
  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout,
    });

    // Wait for any dynamic content to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Give extra time for JS to execute

    // 3. Handle cookie consent
    const candidateSelectors = [
      '#notice',
      'button[class="message-component unstack"]',
      'message-component message-column',
      'button[title="Accept"]',
    ];

    for (const sel of candidateSelectors) {
      const el = await page.$(sel);
      if (el) {
        if (acceptCookies) {
          await el.click({ delay: 50 });
        } else {
          const rejectSel = candidateSelectors.find((s) => s.includes('Rechazar'));
          const rejectBtn = await page.$(rejectSel);
          if (rejectBtn) await rejectBtn.click({ delay: 50 });
        }
      }
    }

    // 4. Wait for any post-click dynamic content
    await page.waitForTimeout(2000);

    // 5. Get the final HTML and close
    const html = await page.content();
    await browser.close();

    // 6. Return Cheerio-ready HTML
    return cheerio.load(html);
  } catch (error) {
    await browser.close();
    throw new Error(`Failed to fetch page: ${error.message}`);
  }
}

async function tracklists1001Scrapper(url) {
  // make a tap after
  console.log(`[1001tracklists][Scrapping] URL: ${url}`);

  const $ = await fetchWithConsent(url);

  // 2. Scraping tal cual lo tenías (ajusto un par de detalles CSS)
  const tracks = $('body')
    .find('div.tlpItem')
    .map((_i, element) => {
      const $el = $(element);

      // Primer span.trackValue  ➜ nombre del tema
      const artist = $el
        .find('span.trackValue')
        .first() // equivale a :nth-child(1)
        .text()
        .trim();

      // Tercer span.trackValue ➜ artista
      const trackName = $el
        .find('span.trackValue')
        .eq(2) // índice 0-based (0: primero, 1: segundo, 2: tercero)
        .find('span')
        .text()
        .trim();

      return `${artist} ${trackName}`;
    })
    .get(); // convierte la colección Cheerio en un Array JS

  return rejectIDtracks(tracks);
}

module.exports = tapAfter((trackNames) => {
  console.log(`[1001tracklists] Results: ${trackNames.length} tracks scrapped: ${trackNames}`);
  return trackNames;
}, tracklists1001Scrapper);

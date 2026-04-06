import * as cheerio from 'cheerio';
import { chromium, Page, Browser } from 'playwright';
import { compose, reject, either, includes } from 'ramda';
import { isNilOrEmpty } from '@flybondi/ramda-land';
import { tapAfter } from '../utils';
import { recognize, RecognizeResult } from 'tesseract.js';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as fsSync from 'fs';

const rejectIDtracks = compose(
  reject(either(isNilOrEmpty, includes('ID - ID'))),
) as (tracks: string[]) => string[];

async function solveCaptcha(page: Page, attempt: number = 1): Promise<string | null> {
  try {
    const captchaImg = await page.$('img');
    if (!captchaImg) {
      console.error('[1001tracklists] Could not find captcha image');
      return null;
    }

    const imageBuffer = await captchaImg.screenshot();
    await fs.writeFile('debug_captcha_original.png', imageBuffer);

    // Vary parameters slightly based on attempt number
    const contrastValue = 2.0 + attempt * 0.2; // Higher base contrast
    const whiteThreshold = 210 - attempt * 3; // Less aggressive white threshold reduction
    const blackThreshold = 45 + attempt * 3; // Lower base threshold for black
    const blurValue = 0.5 + attempt * 0.05; // More subtle blur changes

    // Process for both black and white text with improved parameters
    const processedBufferWhite = await sharp(imageBuffer)
      .trim({ threshold: 0 } as any)
      .resize(600, 100, {
        fit: 'fill',
        kernel: sharp.kernel.nearest,
      })
      .linear(contrastValue, -30)
      .grayscale()
      .negate()
      .threshold(whiteThreshold)
      .median(1)
      .blur(blurValue)
      .extend({
        top: 15,
        bottom: 15,
        left: 15,
        right: 15,
        background: { r: 255, g: 255, b: 255 },
      })
      .toBuffer();

    const processedBufferBlack = await sharp(imageBuffer)
      .trim({ threshold: 0 } as any)
      .resize(800, 120, {
        // Larger size for better character definition
        fit: 'fill',
        kernel: sharp.kernel.cubic, // Changed to cubic for better quality
      })
      .linear(contrastValue, -20) // Less negative offset
      .grayscale()
      .normalize() // Add normalize step
      .threshold(blackThreshold)
      .median(2) // Increased median filter
      .blur(blurValue)
      .extend({
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
        background: { r: 255, g: 255, b: 255 },
      })
      .toBuffer();

    await fs.writeFile(`debug_captcha_processed_white_${attempt}.png`, processedBufferWhite);
    await fs.writeFile(`debug_captcha_processed_black_${attempt}.png`, processedBufferBlack);

    // Try OCR on both processed images with improved settings
    const [resultWhite, resultBlack] = await Promise.all([
      recognize(processedBufferWhite, 'eng', {
        logger: (m: unknown) => console.log('[Tesseract Progress White]:', m),
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        tessedit_pageseg_mode: '8', // Treat as single word
        tessedit_ocr_engine_mode: '1', // Neural net mode only
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0',
      } as any),
      recognize(processedBufferBlack, 'eng', {
        logger: (m: unknown) => console.log('[Tesseract Progress Black]:', m),
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        tessedit_pageseg_mode: '8',
        tessedit_ocr_engine_mode: '1',
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0',
      } as any),
    ]);

    // Clean and combine results
    const textWhite = resultWhite.data.text.trim().replace(/[^a-zA-Z0-9]/g, '');
    const textBlack = resultBlack.data.text.trim().replace(/[^a-zA-Z0-9]/g, '');

    console.log('[1001tracklists] OCR Result White:', textWhite);
    console.log('[1001tracklists] OCR Result Black:', textBlack);

    // Try to build a 6-character result position by position
    let finalText = '';
    for (let i = 0; i < 6; i++) {
      const whiteChar = textWhite[i];
      const blackChar = textBlack[i];

      // If both detected a character, prefer the one that's alphanumeric
      if (blackChar && /[a-zA-Z0-9]/.test(blackChar)) {
        finalText += blackChar;
      } else if (whiteChar && /[a-zA-Z0-9]/.test(whiteChar)) {
        finalText += whiteChar;
      } else {
        // If we can't get a valid character for this position, try to get it from the other result
        const remainingWhite = textWhite.slice(i);
        const remainingBlack = textBlack.slice(i);

        if (remainingBlack && remainingBlack[0] && /[a-zA-Z0-9]/.test(remainingBlack[0])) {
          finalText += remainingBlack[0];
        } else if (remainingWhite && remainingWhite[0] && /[a-zA-Z0-9]/.test(remainingWhite[0])) {
          finalText += remainingWhite[0];
        } else {
          console.log('[1001tracklists] Missing character at position', i);
          return null;
        }
      }
    }

    console.log('[1001tracklists] Combined Result:', finalText);

    // Validate exactly 6 alphanumeric characters
    if (!finalText || finalText.length !== 6 || !/^[a-zA-Z0-9]{6}$/.test(finalText)) {
      console.log('[1001tracklists] Invalid result - not exactly 6 alphanumeric characters');
      return null;
    }

    return finalText;
  } catch (error) {
    console.error('[1001tracklists] Error solving captcha:', error);
    return null;
  }
}

interface FetchOptions {
  acceptCookies?: boolean;
  timeout?: number;
}

async function fetchWithConsent(
  url: string,
  { acceptCookies = true, timeout = 30000 }: FetchOptions = {},
): Promise<cheerio.CheerioAPI> {
  // 1. Launch browser with enhanced configuration
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--hide-scrollbars',
      '--disable-notifications',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-component-extensions-with-background-pages',
      '--disable-extensions',
      '--disable-features=TranslateUI,BlinkGenPropertyTrees',
      '--disable-ipc-flooding-protection',
      '--disable-renderer-backgrounding',
      '--enable-features=NetworkService,NetworkServiceInProcess',
      '--force-color-profile=srgb',
      '--metrics-recording-only',
      '--mute-audio',
    ],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    javaScriptEnabled: true,
    hasTouch: false,
    locale: 'en-US',
    timezoneId: 'Europe/London',
    permissions: ['geolocation'],
    geolocation: { latitude: 51.5074, longitude: -0.1278 },
    deviceScaleFactor: 1,
    isMobile: false,
    colorScheme: 'light',
  });

  // Add custom headers
  await context.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
  });

  const page = await context.newPage();

  try {
    // Add page event listeners
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout,
    });

    // Wait for any dynamic content to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check for captcha and handle it with retries
    const hasCaptcha = await page.$('input[name="captcha"]');
    if (hasCaptcha) {
      console.log('[1001tracklists] Captcha detected, attempting to solve...');

      // Try up to 5 times to solve the captcha
      for (let attempt = 1; attempt <= 5; attempt++) {
        console.log(`[1001tracklists] Captcha solve attempt ${attempt}/5`);

        // Get the salt value
        const saltValue = await page.$eval('input[name="cSalt"]', (el: any) => el.value);

        // Try to solve the captcha
        const captchaText = await solveCaptcha(page, attempt);
        if (!captchaText) {
          console.log('[1001tracklists] Failed to get captcha text, retrying...');
          if (attempt < 5) {
            // Click refresh button to get new captcha
            await page.click('button[name="reload"]');
            await page.waitForTimeout(2000); // Increased wait time between attempts
            continue;
          }
          throw new Error('Failed to solve captcha after 5 attempts');
        }

        console.log('[1001tracklists] Attempting captcha solution:', captchaText);

        // Fill in the form
        await page.fill('input[name="captcha"]', captchaText);

        // Submit the form
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {}),
          page.click('button[type="submit"]#captchaBtn'),
        ]);

        await page.waitForTimeout(3000); // Increased wait time after submission

        // Check if we still have captcha after submission
        const stillHasCaptcha = await page.$('input[name="captcha"]');
        if (!stillHasCaptcha) {
          console.log('[1001tracklists] Captcha solved successfully!');
          break;
        }

        if (attempt === 5) {
          throw new Error('Captcha solution was incorrect after 5 attempts');
        }

        console.log('[1001tracklists] Incorrect solution, trying again...');
        await page.waitForTimeout(2000); // Added delay before next attempt
      }
    }

    // Check for JavaScript warning and handle it
    const jsWarning = await page.locator('text=Please enable JavaScript').count();
    if (jsWarning > 0) {
      console.log('JavaScript warning detected, trying to bypass...');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }

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
          const rejectSel = candidateSelectors.find(s => s.includes('Rechazar'));
          const rejectBtn = rejectSel ? await page.$(rejectSel) : null;
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
    const err = error as Error;
    throw new Error(`Failed to fetch page: ${err.message}`);
  }
}

async function tracklists1001Scrapper(url: string): Promise<string[]> {
  console.log(`[1001tracklists][Scrapping] URL: ${url}`);

  const $ = await fetchWithConsent(url);
  fsSync.writeFileSync('debug-1001-dump.html', $.html());
  const tracks = $('body')
    .find('div.tlpItem')
    .map((_i, element) => {
      const $el = $(element);

      const artist = $el
        .find('span.trackValue')
        .first() // equivale a :nth-child(1)
        .text()
        .trim();

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

const log1001Results = (trackNames: string[]): string[] => {
  console.log(`[1001tracklists] Results: ${trackNames.length} tracks scrapped: ${trackNames}`);
  return trackNames;
};

export default tapAfter(log1001Results, tracklists1001Scrapper);


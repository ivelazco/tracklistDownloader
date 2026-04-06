# External Integrations

**Analysis Date:** 2026-04-03

## APIs & External Services

**Spotify Web API (REST):**
- Used for: public playlist metadata and track listing when URL contains `spotify` (router in `src/sourceScrappers/index.ts`)
- Client: `spotify-web-api-node` in `src/sourceScrappers/spotify-scrapper.ts`
- Flow: `clientCredentialsGrant()` then `getPlaylist` / `getPlaylistTracks` with playlist id parsed from `open.spotify.com/playlist/...` URLs
- Credentials: `config.spotify.clientId`, `config.spotify.clientSecret` (see `src/types/config.d.ts`) — stored in `config/local.json` locally; **do not commit real secrets**

**YouTube (search — unofficial / scraping):**
- Used for: resolving each track string to a watch URL in `src/youtubeSearcher/index.ts`
- Implementation: `yt-search` package (`yts`), not the official YouTube Data API v3 in the active code path
- Official API client: `simple-youtube-api` is instantiated with `config.youtubeVideoSearcher.apiKey` but **not called** for search; the API key is effectively unused unless future code uses the `youtube` instance

**YouTube (media download — unofficial):**
- Used for: MP3 (or configured format) download in `src/youtubeDownloader/index.ts`
- Implementation: `ytdl-mp3` `Downloader` with options merged from `config.youtubeMp3Downloader` and per-run `outputDir`
- Depends on: FFmpeg executable path from config; underlying stream extraction aligns with `ytdl-core` family (see stack resolutions in `package.json`)

**1001tracklists.com (HTML + bot mitigation):**
- Used for: default tracklist source when URL is not Spotify (`src/sourceScrappers/index.ts` → `src/sourceScrappers/1001-scrapper.ts`)
- Implementation: Playwright Chromium (`chromium.launch`) navigates the site, optional captcha form (`input[name="captcha"]`) solved via screenshot → Sharp → Tesseract.js OCR, then HTML passed to Cheerio (`div.tlpItem` / `span.trackValue`)
- Debug artifacts: writes such as `debug-1001-dump.html`, `debug_captcha_*.png` in working directory during runs (see `1001-scrapper.ts`)

## Data Storage

**Databases:**
- Not applicable — no database client or schema in `src/`

**File Storage:**
- Local filesystem only — downloads under `config.youtubeMp3Downloader.outputPath`; per-playlist folders created in `src/folderManager/index.ts`

**Caching:**
- None detected — no Redis, disk cache layer, or HTTP cache abstraction in application code

## Authentication & Identity

**Spotify:**
- OAuth2 **client credentials** grant (server-to-server, no user login) via `spotify-web-api-node` in `spotify-scrapper.ts`

**YouTube / Google:**
- API key present in config for `simple-youtube-api` construction only; active search does not use Google API authentication

**1001tracklists:**
- Session behavior handled in-browser (cookies, consent clicks, captcha); no API tokens

## Monitoring & Observability

**Error Tracking:**
- None — `console.log` / `console.error` throughout `src/handler.ts`, downloaders, and scrapers

**Logs:**
- Stdout/stderr only; verbose step logging in handler and `youtubeDownloader`

## CI/CD & Deployment

**Hosting:**
- Not applicable — CLI tool, no cloud deploy manifest in repository root

**CI Pipeline:**
- No GitHub Actions (or similar) under repository root `.github/` for this project; only skill-related workflow exists under `.agents/skills/playwright-best-practices/.github/workflows/validate-skill.yml` (not app CI)

## Environment Configuration

**Required config (via `config/local.json` + `Config` in `src/types/config.d.ts`):**
- `youtubeMp3Downloader`: `ffmpegPath`, `outputPath`, `youtubeVideoQuality`, `queueParallelism`, `progressTimeout`
- `youtubeVideoSearcher.apiKey` — required for constructor side effect today even though search uses `yt-search`
- `spotify.clientId`, `spotify.clientSecret` — required when using Spotify playlist URLs

**Process environment:**
- `YTDL_NO_UPDATE` — set in `lambda.ts` (not typically supplied by operator)

**Secrets location:**
- Intended: `config/local.json` (gitignored or local-only recommended); **never paste secret values into planning docs or commits**

## Webhooks & Callbacks

**Incoming:**
- None — no HTTP server

**Outgoing:**
- None — no registered webhooks; only outbound HTTP/HTTPS from Playwright, `yt-search`, `spotify-web-api-node`, and download libraries

## Optional runtime downloads

**Playwright:** Chromium binaries managed by Playwright install step.

**Tesseract.js:** May fetch language data (e.g. `eng`) on first OCR use depending on bundler/runtime defaults — verify in deployment docs if packaging offline.

---

*Integration audit: 2026-04-03*

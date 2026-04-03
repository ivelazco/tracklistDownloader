# Pitfalls Research

**Domain:** YouTube + Spotify + scraping CLI  
**Researched:** 2026-04-03  
**Confidence:** MEDIUM–HIGH

## Critical Pitfalls

### Pitfall 1: YouTube access drift (403, signature, format)

**What goes wrong:** Downloads fail intermittently or for all videos; `ytdl-core` forks lag YouTube changes.

**Why it happens:** YouTube updates player JS; pure JS extractors break until patched.

**How to avoid:** Prefer **yt-dlp** binary for the actual media fetch, or pin and monitor **@distube/ytdl-core** / **youtubei.js** with upgrade discipline. Set `YTDL_NO_UPDATE` only if you control updates deliberately.

**Warning signs:** Spikes in rejected promises; errors mentioning `403` or `signature`.

**Phase to address:** Download reliability phase.

---

### Pitfall 2: Unbounded parallelism → RAM spikes

**What goes wrong:** Large playlists × concurrent browser or download tasks exhaust memory.

**Why it happens:** `Promise.all` / many parallel Playwright pages / many ffmpeg processes.

**How to avoid:** Cap concurrency (batch size), stream vs buffer where possible, close Playwright contexts aggressively.

**Warning signs:** Process killed by OS; linear growth in RSS with playlist length.

**Phase to address:** Rules + download phase (document limits in `.cursor/rules`).

---

### Pitfall 3: Spotify credentials / rate limits

**What goes wrong:** Empty track lists or 401s.

**Why it happens:** Expired client secret, wrong app type, or throttling.

**How to avoid:** Document setup in Context; handle API errors with actionable messages.

**Warning signs:** Auth errors in logs from `[Spotify]`.

**Phase to address:** Spotify E2E verification phase.

---

### Pitfall 4: Wrong YouTube match

**What goes wrong:** Live sets, covers, or shorts matched instead of studio track.

**Why it happens:** Search heuristics are naive (title/duration only).

**How to avoid:** Tunable blacklist, duration bounds, prefer official channels — document tradeoffs in rules.

**Warning signs:** Wrong audio in output folder with plausible filenames.

**Phase to address:** Post-v1 tuning; note in requirements as quality, not blocker for “downloads complete”.

---

### Pitfall 5: Scraping 1001tracklists fragility

**What goes wrong:** Captcha loops, DOM changes break Cheerio selectors.

**Why it happens:** Site is hostile to automation.

**How to avoid:** Isolate scraper; feature-flag; don’t block Spotify v1 on 1001 health.

**Warning signs:** OCR path always engaged; zero tracks returned.

**Phase to address:** After Spotify path is green.

---
*Pitfalls research: 2026-04-03*

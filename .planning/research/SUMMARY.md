# Project Research Summary

**Project:** Tracklist Downloader  
**Domain:** Node.js CLI — Spotify / 1001tracklists → YouTube search → local audio  
**Researched:** 2026-04-03  
**Confidence:** MEDIUM (YouTube stack volatile)

## Executive Summary

This is a **brownfield** single-process CLI: scrape or API-resolve a tracklist, search YouTube per line, then download audio with FFmpeg-backed tooling. Experts in this space increasingly treat **yt-dlp** (external binary) as the **stable download spine** because pure JS extractors break when YouTube changes. For **v1**, the product goal is **Spotify playlist URL → successful bulk download**; **1001tracklists** remains valuable but **fragile** and should not gate the first milestone. **Parallelism** without caps is a primary **RAM** risk — rules in `.cursor/rules` should document FP patterns (`pipe`, `prAll`) and **concurrency/memory** expectations aligned with the real code.

## Key Findings

### Recommended Stack

- Stay on **TypeScript + Yarn**; bump **Node** to a current LTS in practice.  
- **FFmpeg** remains mandatory.  
- Evaluate **yt-dlp** (via **yt-dlp-wrap** or `child_process`) for download reliability while auditing current **ytdl-mp3** / **@distube/ytdl-core** chain.

### Expected Features

**Must have (table stakes):** Spotify playlist → tracks → YouTube URLs → files; clear per-track success/failure; configurable output path.

**Defer:** New UX features until governance + download path work.

### Architecture Implications

Keep the **handler orchestrator**; changes should swap or harden **youtubeDownloader** and possibly **youtubeSearcher** without rewriting scrapers first.

### Pitfalls to Design Against

YouTube **403/signature** drift, **unbounded parallel** downloads, **Spotify auth** failures, **wrong video** selection, **1001** captcha/DOM churn.

## Roadmap Hints

1. Codify **`.cursor/rules`** (FP, memory, utils, hooks).  
2. **Harden download** (yt-dlp or fixed ytdl path + tests/manual checklist).  
3. **Verify Spotify E2E** as acceptance.  
4. **1001** maintenance afterward.

---
*Summary: 2026-04-03*

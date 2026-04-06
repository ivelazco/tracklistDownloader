# Feature Research

**Domain:** Personal CLI — Spotify / 1001tracklists → YouTube → MP3  
**Researched:** 2026-04-03  
**Confidence:** HIGH (from PROJECT.md + codebase map)

## Feature Landscape

### Table Stakes (Users Expect These)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Spotify playlist → track list | Core input for v1 acceptance | MEDIUM | Client credentials + playlist ID flow |
| YouTube match per track | Without it, no download | MEDIUM | `yt-search` heuristics; wrong video = bad UX |
| Bulk download with per-track outcome | One failure shouldn’t silently drop whole run | MEDIUM | `Promise.allSettled` already — surface failures clearly |
| Configurable output folder + naming | Organize rips by playlist/set | LOW | `folderManager` + `config/local.json` |
| Working FFmpeg path | Encode pipeline | LOW | Windows paths in config |

### Differentiators (Nice Later)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| 1001tracklists support | DJ set tracklists | HIGH | Captcha/OCR — fragile |
| JSON export of tracklist | Automation / review | LOW | CLI has `--json` flag **not wired** in handler |
| Quality / format options | Audiophile / storage tradeoffs | MEDIUM | yt-dlp exposes format selectors |

### Anti-features (Defer)

| Anti-feature | Reason |
|--------------|--------|
| Full music library manager | Out of scope — downloader first |
| Account-based Spotify user flows | v1 = playlist URLs + client credentials |

---
*Features research: 2026-04-03*

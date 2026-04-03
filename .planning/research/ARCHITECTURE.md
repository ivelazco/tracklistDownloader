# Architecture Research

**Domain:** Brownfield CLI pipeline  
**Researched:** 2026-04-03  
**Confidence:** HIGH (matches `.planning/codebase/ARCHITECTURE.md`)

## Standard Architecture (this repo)

### System Overview

```
lambda.ts (CLI)
    → handler(url, path, json?)
        → scrapperRouter(url)  → string[] tracks
        → searchYtVideos(tracks) → string[] youtube URLs
        → createFolder(url)      → output directory
        → ytDownloader(urls, path) → parallel downloads + settled summary
```

### Component Boundaries

| Component | Responsibility | Depends on |
|-----------|----------------|------------|
| `sourceScrappers` | URL → `string[]` labels | Spotify API, Playwright (1001) |
| `youtubeSearcher` | Label → watch URL | `yt-search`, config |
| `folderManager` | URL → folder path | Spotify name helper, fs |
| `youtubeDownloader` | URLs → files on disk | `ytdl-mp3`, FFmpeg path |
| `utils` | `prAll`, `tapAfter`, printing | Ramda |

### Data Flow

1. Single **orchestrator** (`handler`) — no hidden global state beyond imported config.
2. **Parallelism** at search and download steps — memory scales with playlist size × concurrency.
3. **Errors:** throw to stop pipeline for empty lists; per-item failures inside `allSettled`.

### Suggested Build Order (roadmap phases)

1. **Governance** — `.cursor/rules` + memory/FP conventions (unblocks safe refactors).
2. **Download reliability** — validate/fix YouTube acquisition (possibly yt-dlp path).
3. **Spotify E2E** — playlist URL → files (user v1 bar).
4. **1001 / extras** — after core stable.

---
*Architecture research: 2026-04-03*

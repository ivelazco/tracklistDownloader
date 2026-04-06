# Quick task 260405-lqa — YouTube searcher cache and filters

## Done

- Persist track name → watch URL in OS temp (`tracklist-downloader-youtube-url-cache.json`).
- On cache hit, validate with YouTube oEmbed; if invalid, drop cache entry and run `yt-search` again.
- Title heuristics extended for long-form uploads (long video/mix, hour mixes, full album, continuous mix, marathon mix, 24h patterns, plus existing set/session).
- Max duration enforced as **≤ 15 minutes** via parsed timestamp seconds (replaces strict `< 15` minutes float).
- Removed `uniq` on URL list so duplicate URLs for different tracks are preserved in order.

## Files

- `src/utils/youtubeUrlCache.ts` — load/save cache, oEmbed check
- `src/utils/index.ts` — re-exports
- `src/youtubeSearcher/index.ts` — cache integration and filters

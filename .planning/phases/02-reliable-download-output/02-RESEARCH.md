# Phase 2: Reliable download & output — Research

**Researched:** 2026-04-04  
**Domain:** Node/TS CLI — YouTube acquisition (`ytdl-mp3` / `ytdl-core`), FFmpeg, output layout, bounded concurrency  
**Confidence:** HIGH (ground truth from vendored `ytdl-mp3` source + repo files); MEDIUM (yt-dlp integration details until implemented)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**YouTube acquisition strategy (DL-02)**

- **D-01:** **Primary approach:** audit, harden, and keep the **existing `ytdl-mp3`-centric stack** in `src/youtubeDownloader/index.ts` (transitive `ytdl-core` family, `YTDL_NO_UPDATE`, `package.json` resolutions) as the **default implementation path** for Phase 2.
- **D-02:** **If** the audit shows that stack cannot meet “maintainable + stable downloads” for v1, **replace or supplement** with a **`yt-dlp` subprocess-backed** path (or documented hybrid) **within Phase 2**, and treat the **final** choice as the **documented** strategy in README (not an open-ended TODO).

**Parallelism & per-track failures**

- **D-03:** Preserve **settled aggregation** for a batch of downloads (`prAll` / `Promise.allSettled` semantics) — **do not** fail-fast the entire playlist on the first rejected track; each failure remains **visible**.
- **D-04:** Apply an **explicit concurrency ceiling** for in-flight downloads aligned with **`youtubeMp3Downloader.queueParallelism`** in config **when the downloader supports it**; if the library does not honor it, implement a **small limiter/window** in code so parallel fan-out is **bounded and intentional** (GOV-02).

**Output path & folder naming (DL-03)**

- **D-05:** **`--path`** (CLI) is an optional **override of the per-run output directory** (the folder passed to the downloader). Treat it as a **directory path**; **create it recursively if missing**, consistent with current `youtubeDownloader` folder checks.
- **D-06:** Keep **playlist-derived folder names** as today: **`Spotify-{playlistName}`** and **`1001tracklists-{slug}`**, with spaces normalized to hyphens; **extend sanitization** for OS-forbidden characters and messy titles so paths stay stable on Windows.
- **D-07:** On **naming collision**, **reuse the existing folder** (current behavior) and **document** it; do **not** add auto-suffix folders in Phase 2 unless a plan proves unavoidable.

**FFmpeg & config surfacing (DL-02)**

- **D-08:** **Validate `ffmpegPath` early** in the download path (before or at the start of the download phase) and fail with a **clear, actionable** message (key name, expected executable, typical fix).
- **D-09:** **Document** FFmpeg installation, `ffmpegPath`, `outputPath`, and downloader-related keys **primarily in README**; optional **short pointer** in `.cursor/rules` only if it reduces agent/human drift (no duplicate full config prose in rules).

### Claude's Discretion

- Exact **limiter implementation** (queue vs p-map style) if `queueParallelism` is not wired by the library.
- **Exit code** policy when some tracks fail (if not already defined in CLI).
- **Log verbosity** cleanup after behavior is correct (keep useful failure signal).
- **Exact** sanitization rules beyond the above principles.

### Deferred Ideas (OUT OF SCOPE)

- **Unused `simple-youtube-api` / API key path**, legacy `request`, and search-path cleanup — **Phase 3** (QUAL-02).
- **Spotify pagination and API error normalization** — **Phase 4**.
- **Search-quality heuristics** — v2 / backlog (SRCH-01).
- **Auto-suffix folders on collision** — not in Phase 2 (D-07).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **DL-02** | Maintainable YouTube acquisition strategy (documented); FFmpeg configuration validated with clear errors | Audit of `ytdl-mp3` vs config; `YTDL_NO_UPDATE`; gap analysis on `ffmpegPath` / `queueParallelism`; yt-dlp fallback criteria |
| **DL-03** | Output under configured root; folder naming documented and stable for Spotify | Trace `folderManager` + `handler` + `--path`; README vs code; Windows sanitization |
</phase_requirements>

---

## Summary (executive)

Phase 2 is constrained to **harden the existing `ytdl-mp3` + `@distube/ytdl-core` path first**, with an **in-phase escape hatch to `yt-dlp` subprocess** if the audit shows the stack cannot stay maintainable. Ground truth from `ytdl-mp3@5.2.2` shows the **`Downloader` does not read `ffmpegPath`, `queueParallelism`, `youtubeVideoQuality`, or `progressTimeout`** from your merged config: it only uses `outputDir`, `getTags`, `silentMode`, `verifyTags`, and `customSearchTerm`. Transcoding uses **`ffmpeg-static`** inside the library, not `config.youtubeMp3Downloader.ffmpegPath`. **`queueParallelism` is therefore ineffective** today; **D-04** implies an application-level limiter. Downloads currently **buffer entire video payloads in memory** per track (`Buffer.concat` in `ytdl-mp3`), so **unbounded `map` → parallel downloads** is both a **RAM risk** and a **process stability** risk for large playlists.

**Primary recommendation:** Treat **02-01** as a written audit (config vs library API, memory/concurrency, breakage history). Implement **early `ffmpegPath` validation (D-08)** as a real preflight (existence + executable probe), **document honestly** that the current `ytdl-mp3` build uses bundled FFmpeg unless/until a **yt-dlp** path uses `ffmpegPath`. Add a **bounded concurrent window** aligned with `queueParallelism`. Extend **folder name sanitization** for Windows-forbidden characters and align **README “Output Structure”** with code (`Spotify-…` / `1001tracklists-…` without the misleading spaced hyphen prose).

---

## Project Constraints (from `.cursor/rules/`)

| Source | Directive |
|--------|-----------|
| `functional-style.mdc` | Prefer `pipe`/`compose`; use **`prAll`** (not raw `Promise.all`) for mixed success/failure batches; `tapAfter` for scraper-style logging. |
| `memory-and-concurrency.mdc` | **`prAll` does not cap concurrency**; avoid unbounded parallel fan-out over large **N**; add explicit batch size or limiter when raising parallelism; Playwright lifecycle N/A for downloader but rule sets cultural expectation. |
| `utils-and-modules.mdc` | Helpers in `src/utils/` barrel; bracketed `console` namespaces; no new logger unless scoped later. |
| `node-engines.mdc` | **`engines.node` ≥ 18** is authoritative (Playwright floor). |

---

## Standard Stack (verified)

| Package | Registry / lock | Role |
|---------|-----------------|------|
| `ytdl-mp3` | **5.2.2** (`npm view`, matches lock) | `Downloader` + internal `@distube/ytdl-core` + **`ffmpeg-static`** |
| `@distube/ytdl-core` | **4.16.12** (resolution + transitive) | YouTube stream/info (403/signature churn risk) |
| `ffmpeg-static` | Transitive of `ytdl-mp3` | **Actual** encoder binary used by `ytdl-mp3` today |

**Note:** `ytdl-mp3` declares `engines.node: ">=20.0.0"` in its own `package.json`; this repo declares **`>=18`**. Yarn may still install; treat as **compatibility watch** (run smoke on Node 18 CI if used).

**Fallback stack (if D-02 triggered):** `yt-dlp` CLI (subprocess) + configurable FFmpeg location — ecosystem standard for YouTube breakage; aligns with using **`ffmpegPath`** from config.

---

## 2. Current implementation findings

### `ytdl-mp3` integration

- **Config merge:** `downloaderConfig = { ...config.youtubeMp3Downloader, outputDir: folderPath }` then `new Downloader(downloaderConfig as any)` — **type escape hides that most keys are ignored** (see `node_modules/ytdl-mp3/dist/index.d.ts`: only `DownloaderOptions` fields apply).
- **FFmpeg:** Library `FormatConverter` uses **`ffmpeg-static`**, not `ffmpegPath`.
- **Quality / timeout:** `youtubeVideoQuality`, `progressTimeout` are **not** passed into `ytdl-mp3`; `downloadVideo` uses `ytdl.downloadFromInfo(videoInfo, { quality: "highestaudio" })` internally.
- **Memory:** Full stream is collected into a **single `Buffer`** before `execSync` ffmpeg — **high memory per concurrent download**.

### `ytdl-core` / env

- **`lambda.ts`** sets `process.env.YTDL_NO_UPDATE = '1'` **before** importing `handler` (and thus the downloader chain) — consistent with mitigating `ytdl-core` update/check behavior (STACK.md).
- **`package.json` `resolutions`** pins `@distube/ytdl-core` to **^4.16.12** — important for reproducible installs; document in README/strategy section.

### `prAll` usage

- **`src/utils/index.ts`:** `prAll` = `Promise.allSettled` then handler — **settlement only**, **no concurrency cap** (matches `memory-and-concurrency.mdc`).
- **`printResults`:** Groups fulfilled vs rejected; **`printFailVideoTitle` exists but is not composed into `printResults`** — failed tracks are **counted** in `printEndOfExecution` but **per-failure detail** may be weaker than “visible per track” success criteria unless logs from `.catch` on each promise suffice (they currently log in `youtubeDownloader`).

### Unbounded parallel fan-out

- **`transformedVideos.map((url) => dl.downloadSong(url))`** starts **all** downloads **immediately** — **violates GOV-02 direction** and **D-04** until a limiter exists.

---

## 3. FFmpeg / config integration gaps vs D-08

| Config key | Expected by user/docs | Actual in `ytdl-mp3@5.2.2` |
|------------|----------------------|-----------------------------|
| `ffmpegPath` | User-tuned FFmpeg binary | **Ignored**; **`ffmpeg-static`** used |
| `queueParallelism` | Cap parallel work | **Ignored** by library |
| `youtubeVideoQuality` | Quality knob | **Ignored**; hardcoded `highestaudio` in library |
| `progressTimeout` | Progress / stall behavior | **Not wired** in current integration |

**D-08 gap:** Early validation of **`ffmpegPath`** is **correct for contract and for yt-dlp**, but **must be paired with README truth**: today’s default path still transcodes via **`ffmpeg-static`**. Planners should choose one coherent story:

1. **Validate `ffmpegPath` + document** it as the **supported** binary for the **documented** strategy once yt-dlp (or a custom ffmpeg invocation) is primary; **or**
2. **Validate `ffmpegPath`** and add a **follow-up task** to **route encoding** through that path (non-trivial without forking `ytdl-mp3`).

**Recommendation aligned with CONTEXT:** Implement **D-08** preflight on `ffmpegPath` (e.g. `fs.existsSync` / `access`, then `spawnSync(ffmpegPath, ['-version'])` with timeout) **before** starting downloads; README states **current** vs **yt-dlp** behavior explicitly.

---

## 4. `folderManager` vs `handler` `--path` flow

| Step | Behavior |
|------|----------|
| `createFolder(url)` | Builds name via `getFolderName`: Spotify → `` `Spotify-${playlistName.replace(/ /g, '-')}` ``; 1001 → `` `1001tracklists-${slug}` ``; joins with `config.youtubeMp3Downloader.outputPath`; creates parent + leaf. |
| `finalPath` | `path \|\| folderPath \|\| ''` — **`--path` overrides** playlist-derived folder; still **runs** `createFolder` (side effect: folder under `outputPath` may exist even when override used). |
| `ytDownloader(..., finalPath)` | Ensures directory exists (`mkdirSync` recursive), validates directory. |

**D-05:** `--path` as override + recursive create — **already consistent** in `youtubeDownloader`; ensure **relative paths** and **Windows path normalization** are covered in tests/docs.

**D-06 gaps:** Only **spaces → hyphens** today; Windows-forbidden characters (`<>:"/\|?*`), control chars, trailing dots/spaces, and MAX_PATH risks **not** handled.

**README drift:** README shows `Spotify - [playlist_name]` and `1001tracklists - [tracklist_name]`; code uses **`Spotify-`** / **`1001tracklists-`** **without spaces**. Phase 2 docs should **match code** (or deliberately change code — **out of scope** unless planned).

---

## 5. Risks

| Risk | Why it matters | Mitigation (plan-level) |
|------|----------------|-------------------------|
| **YouTube API / signature churn** | `@distube/ytdl-core` breaks intermittently | Pin versions; document; **yt-dlp** fallback per D-02 |
| **OOM / high RAM** | Full-video buffers × **N** parallel | **Concurrency cap**; consider yt-dlp **file-based** pipeline |
| **Windows paths** | Invalid folder names, path length | **Sanitization** per D-06; optional `path` normalization |
| **Silent config misunderstanding** | Users tune `ffmpegPath` / `queueParallelism` — **no effect** today | README + optional startup **warnings** for ignored keys until wired |
| **`ytdl-mp3` Node ≥20** vs repo **≥18** | Engine mismatch | CI matrix or bump `engines` if failures appear |

---

## 6. Recommended technical approach (aligned with CONTEXT)

1. **Audit (02-01):** Document the table in §3 in PLAN/verification; list **maintainability** signals (last successful smoke, upstream issue rate, ability to honor `ffmpegPath` / streaming).
2. **Harden default stack (D-01):** Keep `ytdl-mp3` but add **application-level** `queueParallelism` limiter (e.g. sliding window over URLs, still returning **`prAll`** over the **same logical batch** — implement as chunked `Promise.all` of chunks **or** async pool; preserve **allSettled** semantics globally).
3. **FFmpeg (D-08):** Add **early** `ffmpegPath` validation helper (shared util); error message cites **`youtubeMp3Downloader.ffmpegPath`**, suggests install / PATH / absolute path on Windows.
4. **Documentation (D-02, D-03, D-09):** README sections **grep-friendly** for reviewers: e.g. `## Download strategy (DL-02)`, `## Output layout (DL-03)` describing strategy, collision, `--path`, naming, sanitization.
5. **yt-dlp fallback (D-02):** **Trigger** if audit concludes: repeated `ytdl` failures, no viable pin, or cannot meet memory/concurrency bar. Implementation sketch: `spawn` `yt-dlp` with `-x --audio-format mp3`, `--ffmpeg-location` from `ffmpegPath`, output template under folder; reuse **same limiter** and **settled aggregation** pattern.

**Don’t hand-roll:** YouTube URL parsing, signature deciphering, or DASH merging — stay on **`@distube/ytdl-core` / `yt-dlp`**.

---

## Runtime State Inventory

Phase 2 is **not** a rename/migration of external data stores. **None** of the following apply beyond git-tracked config:

| Category | Finding |
|----------|---------|
| Stored data | **None** — no app DB. |
| Live service config | **None** for downloader (Spotify credentials in `local.json` unchanged). |
| OS-registered state | **None** required for Phase 2. |
| Secrets / env | **`YTDL_NO_UPDATE`** set at process start in `lambda.ts` only. |
| Build artifacts | **`dist/`** rebuilt via `yarn build`; no extra migration. |

---

## Environment Availability

**Step 2.6:** Dependencies are **Node**, **FFmpeg** (for D-08 validation and any **yt-dlp** path), optional **yt-dlp** executable if fallback is implemented.

| Dependency | Required by | Probe | Fallback |
|------------|-------------|-------|----------|
| Node | CLI | `node --version` (≥18) | — |
| FFmpeg at `ffmpegPath` | D-08 / yt-dlp | `ffmpegPath -version` | Document install links |
| `yt-dlp` | D-02 fallback branch | `yt-dlp --version` | Stay on `ytdl-mp3` only |

*(CI/local: run probes in verification or document manual smoke.)*

---

## Validation Architecture

> Nyquist enabled (`workflow.nyquist_validation` is true in `.planning/config.json`).

### Test framework

| Property | Value |
|----------|-------|
| Framework | **No automated unit/integration test suite** detected (`*.test.ts` / `*.spec.ts` absent) |
| Config | None |
| Quick checks | `yarn type-check`, `yarn build` |
| Project script | `yarn verify:phase1-rules` (Phase 1 rules; **not** Phase 2 downloader) |

### Phase requirements → verification map

| Req ID | Behavior | Test type | Automated command | File exists? |
|--------|----------|-----------|-------------------|--------------|
| DL-02 | Documented strategy; FFmpeg errors clear | Manual smoke + doc grep | `yarn build` + README section | ❌ Add manual checklist |
| DL-02 | Per-track failures visible; no crash | Manual / fixture URLs | `yarn download --url <short playlist>` | ❌ No fixture harness |
| DL-03 | Output root + naming | Manual + doc | Inspect disk + README `DL-03` | ❌ |

### Sampling rate (proposal)

- **Per task / commit:** `yarn type-check` (fast)  
- **Per wave / phase gate:** `yarn build` + **manual** small playlist (2–3 tracks) + confirm logs show per-track success/failure  
- **Documentation gate:** README contains grep anchors **`DL-02`** / **`DL-03`** (headings or explicit text) for traceability

### Wave 0 gaps

- [ ] Add minimal **smoke script** or documented **fixture URLs** in README (no network in CI unless opted in).  
- [ ] Optional: **unit tests** for `sanitizeFolderName` / `assertFfmpeg` if extracted to pure functions (fast, no download).  
- [ ] Optional: **integration test** behind `RUN_NETWORK_TESTS=1` (skipped by default).

---

## Sources

### Primary (HIGH)

- `node_modules/ytdl-mp3/dist/index.js`, `index.d.ts`, `package.json` — constructor options, `ffmpeg-static`, buffering model  
- `src/youtubeDownloader/index.ts`, `src/handler.ts`, `src/folderManager/index.ts`, `lambda.ts`, `src/utils/index.ts`  
- `.planning/phases/02-reliable-download-output/02-CONTEXT.md`, `.planning/REQUIREMENTS.md`  
- `.cursor/rules/memory-and-concurrency.mdc`, `functional-style.mdc`

### Secondary (MEDIUM)

- `npm view ytdl-mp3 version` → **5.2.2**; `npm view @distube/ytdl-core version` → **4.16.12**  
- [ytdl-mp3 README](https://github.com/joshunrau/ytdl-mp3#readme) — high-level usage (less detail than source)

---

## Metadata

| Area | Confidence | Reason |
|------|------------|--------|
| Standard stack / library behavior | **HIGH** | Read bundled `ytdl-mp3` dist + types |
| Architecture / handler flow | **HIGH** | Repo source |
| yt-dlp subprocess details | **MEDIUM** | Standard practice; flags validated at implementation |
| Pitfalls | **HIGH** | Follows from buffering + unbounded map |

**Valid until:** ~2026-05-04 (faster refresh if YouTube or `ytdl` ecosystem churn spikes)

## RESEARCH COMPLETE

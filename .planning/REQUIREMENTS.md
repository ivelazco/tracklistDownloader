# Requirements: Tracklist Downloader

**Defined:** 2026-04-03  
**Core Value:** Spotify playlist URL drives a working end-to-end download, with `.cursor/rules` governing engineering style and resource discipline.

## v1 Requirements

### Governance & conventions

- [ ] **GOV-01**: `.cursor/rules/` documents **functional programming** conventions used in `src/` (Ramda/`pipe`/`compose`, `prAll`, guards) and what to avoid (imperative sprawl without justification).
- [ ] **GOV-02**: `.cursor/rules/` documents **memory / RAM** expectations: parallel download/search limits, Playwright lifecycle, when to batch work.
- [ ] **GOV-03**: `.cursor/rules/` documents **shared utilities** (`src/utils/`) — when to add helpers, naming, and error/reporting patterns.
- [ ] **GOV-04**: `.cursor/rules/` documents **hooks** policy: for any React/hooks code introduced later, or explicitly state “CLI-only; hooks N/A” with extension rules if a UI lands.

### Download pipeline

- [ ] **DL-01**: User can run the CLI with a valid **Spotify playlist URL** and configured `config/local.json` and reach **completed downloads** for resolvable tracks (partial failures reported, run does not abort silently).
- [ ] **DL-02**: Download path uses a **maintainable** YouTube acquisition strategy (document choice: e.g. current stack hardened, or **yt-dlp**-backed path) and **FFmpeg** configuration is validated with clear errors if missing/invalid.
- [ ] **DL-03**: Output files land under the configured **output root** with **folder naming** behavior documented and stable for Spotify playlists.

### Spotify integration

- [ ] **SPOT-01**: **Client credentials** (or documented auth flow) retrieves **all playlist tracks** for typical playlists (pagination handled).
- [ ] **SPOT-02**: Errors from Spotify API surface as **actionable** messages (auth, rate limit, invalid ID).

### Quality & hardening

- [ ] **QUAL-01**: **Node/engine** expectations documented for contributors (minimum version aligned with TS + Playwright in practice).
- [ ] **QUAL-02**: Dead or misleading dependencies/paths called out (e.g. unused YouTube API client for search) — either **removed** or **wired** with intent documented.

## v2 Requirements

### 1001tracklists

- **1001-01**: 1001tracklists URL path returns a track list reliably enough for routine use (captcha/DOM changes addressed or documented as manual fallback).
- **1001-02**: Optional: wire `--json` export of resolved track list for inspection/automation.

### Search quality

- **SRCH-01**: Tunable heuristics to reduce wrong YouTube matches (duration bounds, channel preferences, title blacklist).

## Out of Scope

| Feature | Reason |
|---------|--------|
| New product features beyond v1 list | User deferred until download + rules solid |
| Hosted multi-user service | Local CLI only |
| Legal compliance for copyrighted audio | User responsibility |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GOV-01 | Phase 1 | Pending |
| GOV-02 | Phase 1 | Pending |
| GOV-03 | Phase 1 | Pending |
| GOV-04 | Phase 1 | Pending |
| QUAL-01 | Phase 1 | Pending |
| DL-02 | Phase 2 | Pending |
| DL-03 | Phase 2 | Pending |
| QUAL-02 | Phase 3 | Pending |
| SPOT-01 | Phase 4 | Pending |
| SPOT-02 | Phase 4 | Pending |
| DL-01 | Phase 5 | Pending |

**Coverage:**

- v1 requirements: 11 total  
- Mapped to phases: 11  
- Unmapped: 0 ✓  

---
*Requirements defined: 2026-04-03*  
*Last updated: 2026-04-03 after initial definition*

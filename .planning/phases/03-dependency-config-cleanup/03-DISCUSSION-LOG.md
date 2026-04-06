# Phase 3: Dependency & config cleanup - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `03-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-04
**Phase:** 3 — Dependency & config cleanup
**Mode:** `--auto` (recommended defaults applied without interactive prompts)
**Areas discussed:** YouTube search / Data API dead path, Legacy & duplicate packages, Config documentation

---

## YouTube search vs `simple-youtube-api`

| Option | Description | Selected |
|--------|-------------|----------|
| A | Remove unused client + dependency; align `Config` and docs with `yt-search`-only search | ✓ |
| B | Wire Data API as optional fallback (keep key, dual path) | |
| C | Keep dependency “for later” with comment only | |

**User's choice:** [auto] Option A — recommended: matches QUAL-02 and Phase 2 deferred note; code today only calls `yts`.
**Notes:** `new YouTube(config.youtubeVideoSearcher.apiKey)` is unused; `youtubeVideoSearcher.apiKey` should not imply a required YouTube Data API key for v1.

---

## Legacy HTTP and duplicate downloader packages

| Option | Description | Selected |
|--------|-------------|----------|
| A | Remove unused direct deps (`request`, `request-promise`, unused downloader pkgs, `fs` stub) after grep/install verification | ✓ |
| B | Document only; leave `package.json` unchanged | |
| C | Aggressive churn including major ESLint moves in the same phase | |

**User's choice:** [auto] Option A — recommended: QUAL-02 asks to remove or document; prefer remove when zero usage.
**Notes:** Move ESLint-related packages to `devDependencies` only when low-risk (Claude discretion).

---

## Config documentation surface

| Option | Description | Selected |
|--------|-------------|----------|
| A | README “Config keys” section + tracked `config/local.json.example` | ✓ |
| B | README only | |
| C | Example file only | |

**User's choice:** [auto] Option A — recommended: aligns with Phase 2 D-08/D-09 pattern (README primary + optional pointer).

---

## Claude's Discretion

- Example filename, exact README table format, `package.json` comment for odd transitive keeps.

## Deferred Ideas

- Phase 4 Spotify robustness; v2 search quality; large lint toolchain upgrades unless forced by dep removal.

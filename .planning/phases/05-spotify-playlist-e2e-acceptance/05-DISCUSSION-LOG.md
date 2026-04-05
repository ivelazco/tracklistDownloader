# Phase 5: Spotify playlist E2E acceptance - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `05-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-05
**Phase:** 5-Spotify playlist E2E acceptance
**Mode:** `--auto` (no interactive prompts)
**Areas discussed:** E2E proof method, Representative playlist, Partial failures & success bar, Acceptance artifact location, Integration fix scope

---

## E2E proof method

| Option | Description | Selected |
|--------|-------------|----------|
| Real local `yarn download` run | Maintainer executes full CLI with local `config/local.json`; no CI secrets | ✓ |
| Automated CI only | Would require secrets and flaky YouTube/Spotify coupling | |
| Dry-run / mock | Would not satisfy DL-01 “completed downloads” | |

**User's choice:** `[auto]` Recommended: real local CLI run.
**Notes:** Prerequisites documented in checklist (Node, Yarn, FFmpeg, Spotify credentials, output path).

---

## Representative playlist

| Option | Description | Selected |
|--------|-------------|----------|
| Public, modest-sized playlist | Tens of tracks; verifier supplies URL; criteria in checklist | ✓ |
| Large catalog playlist | Slow, brittle for routine acceptance | |
| Committed private URL | Rejected — secrets / access | |

**User's choice:** `[auto]` Recommended: public playlist, modest size, URL not committed as secret.

---

## Partial failures & success bar

| Option | Description | Selected |
|--------|-------------|----------|
| DL-01 + Phase 2 semantics | Per-track reporting; no silent whole-run abort; document exit code after run | ✓ |
| Fail-fast on first error | Contradicts Phase 2 settled batching | |
| Ignore partial failures in checklist | Contradicts DL-01 | |

**User's choice:** `[auto]` Recommended: align with DL-01 and Phase 2 partial-failure visibility.

---

## Acceptance artifact location

| Option | Description | Selected |
|--------|-------------|----------|
| Phase folder + README pointer | Checklist under `05-spotify-playlist-e2e-acceptance/`; short README link | ✓ |
| README only | Harder to keep long checklist with planning artifacts | |
| Phase folder only | Poor discoverability | |

**User's choice:** `[auto]` Recommended: primary doc in phase directory, README pointer.

---

## Integration fix scope (05-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Blockers + doc contradictions only | Fixes required for DL-01 and documented Phases 2–4 behavior | ✓ |
| Broad refactor | Out of scope | |

**User's choice:** `[auto]` Recommended: minimal integration fixes.

---

## Claude's Discretion

- Checklist filename, optional helper script, optional public example URL in docs.

## Deferred Ideas

None recorded.

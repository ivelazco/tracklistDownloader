# Phase 1: Engineering rules & environment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `01-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 1-Engineering rules & environment
**Areas discussed:** Rules layout & granularity, Tone & enforceability, Hooks policy (GOV-04), Node / engine source of truth (QUAL-01)

---

## Rules layout & granularity

| Option | Description | Selected |
|--------|-------------|----------|
| Split files by topic | Separate `.cursor/rules/` files for FP, memory, utils, hooks, Node — maps to GOV-01…04 + QUAL-01 | ✓ |
| Single RULE.md | One document for all governance topics | |
| Hybrid index + splits | Overview file + topic files (still satisfies split-by-topic) | |

**User's choice:** **All** areas selected; **recommended** option adopted: **split files by topic** (see CONTEXT D-01).
**Notes:** `.cursor/rules/` is currently empty; greenfield layout.

---

## Tone & enforceability

| Option | Description | Selected |
|--------|-------------|----------|
| MUST/AVOID + pointers | Short prescriptive blocks + references to canonical `src/` paths | ✓ |
| Narrative-first | Long-form explanation with fewer explicit MUST/AVOID lists | |
| Mixed minimal | Ultra-short rules only | |

**User's choice:** Recommended: **MUST/AVOID (or DO/DON'T) + pointers** (see CONTEXT D-02).
**Notes:** Aligned with roadmap success criterion: new reader opens `.cursor/rules/` and knows the bar.

---

## Hooks policy (GOV-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal + extension | CLI-only today, hooks N/A; brief clause for future UI | ✓ |
| Preemptive React rules | Detailed hooks guidance before any UI exists | |
| Defer entirely | No hooks mention | |

**User's choice:** Recommended: **minimal CLI-first + extension clause** (see CONTEXT D-03).

---

## Node / engine source of truth (QUAL-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Bump `engines` + cross-link | Update `package.json` `engines.node` to real minimum; rules + README agree | ✓ |
| Document only | Prose minimum in rules/README; leave `engines` stale | |
| Rules only | Change rules but not `package.json` | |

**User's choice:** Recommended: **`package.json` as authority**, **>= Playwright’s requirement** (currently **`node >=18`** in installed `playwright` package), cross-linked from rules/README (see CONTEXT D-04, D-05).
**Notes:** TypeScript 5.9 declares `node >=14.17`; Playwright is the binding constraint for this repo.

---

## Claude's Discretion

- Exact rule filenames, section order, amount of inline example code, optional overview index file (see CONTEXT).

## Deferred Ideas

_None recorded._

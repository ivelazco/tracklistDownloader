---
phase: 1
slug: engineering-rules-environment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution (rules + `engines` alignment; no app test suite yet).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no `*.test.ts` / `*.spec.ts` in repo yet |
| **Config file** | none |
| **Quick run command** | `yarn type-check` |
| **Full suite command** | `yarn type-check` and (once added) `yarn verify:phase1-rules` or equivalent Node script |
| **Estimated runtime** | ~30–90 seconds (type-check + script) |

---

## Sampling Rate

- **After every task commit:** `yarn type-check`
- **After every plan wave:** `yarn type-check` + rules/engines verification script when Wave 0 lands
- **Before `/gsd-verify-work`:** Full suite (type-check + verification script) green
- **Max feedback latency:** ~120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | GOV-01–04, QUAL-01 | script + manual read | `yarn type-check`; script asserts rule files + `engines` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Small Node script (or `package.json` script) that asserts `package.json` `engines.node` semver satisfies **≥18** and required `.cursor/rules/` files exist (exact names per PLAN)
- [ ] Remove or replace misleading `engines.node` floor (e.g. `>=10.15.3`) per QUAL-01
- [ ] README (or contributor section) prerequisite line matches `engines`

*Wave 0 completes when the verification script exists and exits 0 on a clean tree.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rules scannable for humans | Success criteria in ROADMAP | Subjective readability | Open each new rule file; confirm MUST/AVOID + `src/` pointers |
| Cursor applies rules | GOV-01–04 | Editor-version dependent | Create pilot rule; confirm Cursor picks it up per project settings |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

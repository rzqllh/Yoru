# Yoru engineering checkpoint — 2026-11-01

Branch: `fix/stremio-strict-reference-identity-20261101`; base main `ceff75590dd1d8e41c425da3c07628a3b760c6b6`.

## Audit before changes
- main exact SHA `ceff755`; Linux/Windows [CI](https://github.com/rzqllh/Yoru/actions/runs/41267695966) SUCCESS and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41267695965) SUCCESS, four checks.
- Open PRs: draft #77 (cloud sync; owner/live acceptance pending), draft #127 (planning docs; separate non-overlapping scope).
- Issue #44 open, #78 open; release #20 blocked. No production, live provider, real iPhone, unrelated Supabase, or historical branch operations.
- No `docs/handsoff` on audited main.

## Isolated change
- `backend/providers/stremio.ts`: reject noncanonical numeric MAL and episode references before config lookup/network access. Preserve canonical `mal:1` and legacy `1` mapping.
- `tests/stremio-env.test.mjs`: subprocess regression for exponent, hexadecimal, leading zeros, decimal, sign, whitespace, newline, and extra-segment identifiers. No real network calls expected.
- Code and regression test committed to branch; **CI and browser results pending**, not PASS.

## Checkpoint exit
Before merging, collect exact PR-head CI + Chromium/WebKit SUCCESS; publish evidence in PR and #44; delete this file and TRACKER.md; verify no handoff files in PR diff; re-run exact final-head CI and browser; only then merge if main is compatible. Reverify merged main checks. No production deployment/release.

## QA checkpoint (initial PR head)
- PR #130 initial head `39e76877c7998753e52b7d051ae243f0ca516ced`.
- [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41269576006) SUCCESS, both jobs.
- [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41269576041) SUCCESS, both jobs.
- **These runs validate initial PR head only**, not the eventual cleanup commit. Transfer evidence to PR #130 and issue #44; remove temporary handoff files; wait for exact final-head runs before merge.

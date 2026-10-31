# Yoru checkpoint — source picker untrusted metadata

Date: 2026-11-01 (Asia/Jakarta)
Branch: `feat/source-picker-untrusted-metadata-20261101`
Base main: `e5812270dd13843a04bbb4bb15fe921520917856`

## Audit
- Main HEAD matches base; main CI https://github.com/rzqllh/Yoru/actions/runs/41238271758 and Chromium/WebKit https://github.com/rzqllh/Yoru/actions/runs/41238271636 both completed SUCCESS (four jobs).
- PR #77 remains draft; Issues #44 and #78 remain open; release #20 blocked. No live acceptance claimed.
- `summarizeSourceSearch` accepts candidates with `tracks` null/missing and non-string `quality`. The source picker renders `stream.tracks.some(...)` and interpolates `stream.quality`; malformed provider metadata can crash React despite a valid media URL.

## Scope and gates
- Isolated frontend source metadata normalization and unit regressions; do not alter Supabase, provider live, resolver, Vercel, production or release.
- Await exact-HEAD CI Linux/Windows + Chromium/WebKit on PR, then publish evidence to PR/#44, remove this entire handoff folder before merge.

## Status
CODED: normalization now removes malformed tracks/quality, enforces native candidate URL safety, and adds three deterministic regression tests. Local execution unavailable (repository Git transport inaccessible in this runtime). Exact-head CI and browser results PENDING.

## First CI failure and correction
- PR #115 first exact-head `7ef4d6f` CI failed because Node `--experimental-strip-types` requires `.ts` on runtime imports. Failure observed in CI job 124662328518 (`ERR_MODULE_NOT_FOUND` for source-readiness); Chromium build also failed. This is NOT a PASS.
- Corrected runtime import to `./source-readiness.ts` in `c39a34d`. Re-run exact-head CI/Chromium/WebKit required.

## Tested checkpoint (before cleanup)
- Branch head `10b167bed33c68f9ac9c81b6af3f91d1ffaa6e49` exact-head CI Linux/Windows SUCCESS: https://github.com/rzqllh/Yoru/actions/runs/41243657089 (validate + Windows jobs).
- Exact-head Chromium/WebKit SUCCESS: https://github.com/rzqllh/Yoru/actions/runs/41243657082 (both browser jobs).
- The earlier failed run is recorded above, not reclassified as passing. Publish these immutable links to PR #115 and Issue #44, then delete handoff files and require final cleanup-HEAD CI again before merge.

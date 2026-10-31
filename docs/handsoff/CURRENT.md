# Yoru — YX-10 isolated engineering checkpoint
Updated: 2026-10-31 (Asia/Jakarta)
Branch: `feat/yx10-watch-progress-bounds-20261031`
Base main: `42923d1498c2956b4bd62008cb1841f24da9a767`
Epic: https://github.com/rzqllh/Yoru/issues/44
Cloud acceptance: https://github.com/rzqllh/Yoru/issues/78
Release gate: https://github.com/rzqllh/Yoru/issues/20

## Verified baseline
- main exact HEAD `42923d1`: Linux/Windows CI SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41185232926; Chromium/WebKit Browser E2E SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41185232817.
- Only open PR at branch creation: draft #77 for opt-in manual cloud snapshots; not merged or live two-user OTP/RLS verified. PR #80 was merged and temporary handoff removed.
- Existing watch-path normalization accepts at most 80 steps, but the progress update helper previously used the raw stepCount and raw clock timestamp. An invalid count could advance progress even when normalization rejected it; a backward clock could regress updatedAt.

## This branch — CODED / CI PENDING
- Use one shared bounded step count (0–80) for normalize and update.
- Reject invalid runtime direction, keep updatedAt monotonic for valid timestamps, preserve timestamp on no-op or invalid clock.
- Add deterministic unit regressions for invalid counts and timestamp rollback.
- Isolated changes: `frontend/src/lib/watch-path-progress.ts`, `tests/watch-path-progress.test.mjs` only (besides temporary checkpoint).
- Local focused Node test: 5 tests PASS (2026-10-31); NOT equivalent to full repository CI.
- Exact branch-head Linux/Windows CI and Chromium/WebKit E2E must complete successfully before merge.

## Non-goals and gates
No change to IndexedDB schema, backup format, media provider, player, Supabase, auth, production, or release configuration. Physical iPhone, live media/subtitle providers, resolver permission, two-user OTP/RLS, hosting, release #20 and historical branch deletion remain DEFERRED/BLOCKED.

## Before merging
1. Inspect exact branch HEAD, CI and Browser E2E job conclusions.
2. Copy checkpoint evidence to PR and Issue #44.
3. Delete the whole `docs/handsoff/` directory from PR branch.
4. Re-run and verify CI Linux/Windows and Chromium/WebKit at the final clean HEAD; merge only if reviewed and no regressions.

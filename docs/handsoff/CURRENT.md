# Yoru — temporary engineering checkpoint

Date: 2026-11-01 Asia/Jakarta
Baseline main: `503212d1f52a2a07f0014ba3e6fcca87a1d67aa6` (exact-head CI Linux/Windows `41222655954` SUCCESS, Chromium/WebKit `41222656068` SUCCESS).

Scope: Phase 02, fail-closed subtitle episode metadata coercion only. Existing normalizers treat `Number(true)` as episode 1 and `Number([5])` as episode 5, which could mark untrusted malformed provider records as exact episode matches. Preserve numeric and decimal-digit string episode values, and preserve existing low-confidence missing-episode handling. Add deterministic regression tests across SubDL, OpenSubtitles, and SubSource. No change to provider endpoints, keys, mapping/season policy, or production.

Audit: only open PR #77 draft; issues #44/#78 open; #20 release BLOCKED. No `docs/handsoff/` in baseline main. Exact-head CI for this branch: PENDING. Real subtitle provider, iPhone, Supabase OTP/RLS, hosting, resolver and release: DEFERRED.

Checkpoint rule: record code and test SHA, wait for CI Linux/Windows + Browser E2E Chromium/WebKit on exact head, transfer evidence to PR and issue #44, then delete this folder before merging.

Code checkpoint: source commit `524c372` and regression commit `fe5eba9`. CI and browser tests pending; season mapping still unverified.

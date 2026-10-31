# Yoru engineering — working checkpoint

Date: 2026-10-31
Base main: `4de44080dfbd16803a94ac4d336b602c40fc0210`
Branch: `feat/yx03-malformed-hls-levels-20261031`
Scope: YX-03 defensive quality-level presentation when an HLS manifest supplies malformed or null level records. Preserve genuine advertised heights, stable original level indices, and Auto fallback. No provider, auth, Supabase, player architecture, deployment or release changes.

Audit: #44 open; #78 open; #77 draft and not mergeable. Base main CI 41191906031 SUCCESS (Linux/Windows), browser E2E 41191906008 SUCCESS (Chromium/WebKit). These are BASE evidence only, not feature-head acceptance.

Pending: code + focused unit regression; exact-final-feature-head CI and Chromium/WebKit; transfer evidence to PR and #44; remove both handoff files before merge; rerun exact final HEAD acceptance; do not merge on missing/failed checks.

Deferred: two-account OTP/RLS live, physical iPhone, provider/subtitle live and resolver permission, production hosting, #20 release, historical branches.

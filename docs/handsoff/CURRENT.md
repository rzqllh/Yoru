# Yoru — working checkpoint (31 Oct 2026)

Scope: isolated YX-06 source-memory reliability. Base main `264617033cc2e5d26fba3ffdf76cea061d8bba99`.

Audit: main Linux/Windows CI SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41185978061 and Chromium/WebKit SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41185978026. PR #77 DRAFT/not mergeable and #78 open, both without live OTP/RLS; #44 open; #20 release BLOCKED. Only open PR at initial audit: #77.

CODED: `frontend/src/lib/source-memory.ts` now reads generic memory when scoped preference read fails; validates IDs before attempting fallback; writes scoped memory before best-effort generic memory; rejects invalid now and nonpositive persisted timestamps. Added focused unit regressions in `tests/source-memory.test.mjs`. No provider URL, token, media verification, Supabase, hosting or player changes.

TESTED: pending exact-head CI Linux/Windows and Chromium/WebKit. LIVE_VERIFIED: NO. Do not claim PASS yet.

Checkpoint: source changes `f8259a9`; unit tests `d13f59d`. Temporary handoff only; transfer final evidence to PR/#44 and remove this folder before merge.

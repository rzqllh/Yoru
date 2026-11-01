# Yoru engineering checkpoint — 2026-11-01

- Baseline main: `18f3694eb9440d3eeb9a9a873f548354de084ed1`.
- Baseline exact-main CI: Linux/Windows [SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41253384007); Chromium/WebKit [SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41253383991). These do not prove live video, real iPhone, or production.
- Issue #44 open; #78 open; PR #77 draft. Release gate #20 open and BLOCKED.
- Scope: local JSON provider config only. Reject coerced MAL IDs, episode numbers, and subtitle modes before they can create incorrect identity matches or runtime type confusion. Preserve valid numeric IDs and enum values.
- Changed: `backend/pipeline/validate.ts`; new `tests/local-provider-validation.test.mjs`.
- Tests: NOT RUN on this branch yet. Await exact-head Linux/Windows and Chromium/WebKit workflows. Do not merge until green.
- External: two-account OTP/RLS, physical iPhone, live authorized media/subtitle, resolver permission, hosting, release and historical branch cleanup deferred.
- Handoff protocol: move evidence to PR and issue #44; delete `docs/handsoff/` from branch before merge. Never merge temporary handoff files.

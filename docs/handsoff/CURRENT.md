# Yoru — YX-02 source-ranking checkpoint (31 Oct 2026)

Base main: `6654894e6ee7ae9013e8f87ac71ecb6ecd9fb411` (PR #82 merged). Prior main exact-head CI Linux/Windows SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41191340624 and Chromium/WebKit SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41191340621.

Audit: #44 remains open; #77 remains draft and #78 needs live OTP/RLS/two-account sign-off; #20 release blocked. No live provider, physical iPhone, hosting, resolver or branch cleanup planned.

Scope: isolated YX-02 defensive presentation ranking for malformed provider subtitle/quality metadata; avoid throwing away healthy native candidates or inventing Indonesian subtitle score. Preserve all playback preflight and availability semantics. Add Node unit regressions, require exact-head Linux/Windows and Chromium/WebKit CI.

Status: PLANNED, not CODED or TESTED. Temporary handoff must be transferred to PR/issues and removed before merge.

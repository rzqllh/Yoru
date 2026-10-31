# Yoru — YX-06 tested checkpoint (31 Oct 2026)

Base main: `264617033cc2e5d26fba3ffdf76cea061d8bba99`. Working feature HEAD `f91b3b43d93c9e1bbf552959605f2d17cc42bf9d`.

CODED: source-memory scoped read failure fallback, scoped-first persistence, invalid clock rejection; three focused Node regressions. No stream URL/token storage, no playback authorization bypass, no Supabase/production changes.

TESTED at working feature HEAD: Linux/Windows CI SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41191002474 ; Chromium/WebKit SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41191002462 . Not yet final-head evidence because handoff removal remains.

Evidence copied to PR #82 and Issue #44. LIVE_VERIFIED: NO. #77/#78 and #20 external gates deferred. Next delete all docs/handsoff before merge, then rerun exact-final-HEAD CI and browser tests.

# Yoru — YX-02 coded checkpoint (31 Oct 2026)

Base main `6654894e6ee7ae9013e8f87ac71ecb6ecd9fb411`, postmerge Linux/Windows SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41191340624 and Chromium/WebKit SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41191340621.

CODED: `frontend/src/lib/source-ranking.ts` guards malformed/nonstring quality, absent/null subtitle track arrays and invalid track language before awarding Indonesian subtitle rank; stable native-only ordering and actual playback verification remain unchanged. Regression tests in `tests/source-ranking.test.mjs`. Commits `315e4d5` and `e8bfc37`.

TESTED: PENDING exact-head Linux/Windows and Chromium/WebKit. LIVE_VERIFIED: NO. #77/#78 external sync and #20 release remain blocked. Temporary handoff must be removed after PR/Issue evidence transfer and before merge.

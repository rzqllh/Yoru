# Yoru — working checkpoint (31 Oct 2026)

Scope: isolated YX-06 source-memory reliability only. Base main `264617033cc2e5d26fba3ffdf76cea061d8bba99`.

Audit: main exact-head CI Linux/Windows SUCCESS (https://github.com/rzqllh/Yoru/actions/runs/41185978061) and Chromium/WebKit SUCCESS (https://github.com/rzqllh/Yoru/actions/runs/41185978026). PR #77 remains DRAFT and not live-verified; #78 remains open; #44 remains open. Production release #20 remains BLOCKED.

Implementation plan: preserve episode-first source memory and generic fallback on an individual scoped-read failure; ensure scoped preference is written before optional generic fallback; reject invalid clock values. No playback authorization or media validation change. Add focused unit regressions, run exact-head CI and browser E2E before any merge.

Checkpoint state: PLANNED. Not CODED, TESTED or LIVE_VERIFIED. Temporary working notes only; transfer evidence to PR/#44 and delete docs/handsoff before merge.

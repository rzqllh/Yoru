# Yoru — temporary checkpoint tracker

| Check | Status | Evidence |
| --- | --- | --- |
| Main HEAD / PR / CI / #44/#78 audit | VERIFIED | `503212d1`, Actions `41222655954` and `41222656068` SUCCESS; PR #77 draft; #44/#78 open |
| Episode metadata type guard | PLANNED | `backend/providers/subtitles.ts` `confidence()` currently coerces boolean/array into numbers |
| Regression tests | PLANNED | `tests/subtitle-providers.test.mjs` |
| Branch Linux/Windows CI | PENDING | Exact-head workflow required |
| Branch Chromium/WebKit | PENDING | Exact-head workflow required |
| Live subtitle and production | BLOCKED / DEFERRED | Issue #20 G3/G5; no external access attempted |
| Temporary handoff cleanup | PENDING | Delete both files before merge |

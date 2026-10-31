# Yoru checkpoint tracker — 2026-11-01

| Item | State | Evidence / next |
| --- | --- | --- |
| Audit main, PRs, #44/#78/#20 | VERIFIED | main bb9c95a; Actions 41229828524 and 41229828494 SUCCESS |
| OpenSubtitles file-ID coercion | CODED / NOT VERIFIED | Strict type guard before Number conversion |
| SubSource ID coercion | CODED / NOT VERIFIED | Strict string or safe-integer type guard |
| Unit regression | CODED / NOT RUN | tests/subtitle-providers.test.mjs: malformed IDs + legitimate decimal IDs |
| PR CI Linux/Windows | NOT RUN | Await PR |
| PR Chromium/WebKit | NOT RUN | Await PR |
| Production / live providers / OTP / iPhone | DEFERRED | Explicitly out of scope |
| Cleanup / merge | NOT STARTED | Remove this folder only after transferring evidence |

# Yoru checkpoint tracker — 2026-11-01

| Item | State | Evidence / next |
| --- | --- | --- |
| Audit main, PRs, #44/#78/#20 | VERIFIED | main bb9c95a; Actions 41229828524 and 41229828494 SUCCESS |
| OpenSubtitles file-ID coercion | CODED / NOT VERIFIED | Strict type guard before Number conversion |
| SubSource ID coercion | CODED / NOT VERIFIED | Strict string or safe-integer type guard |
| Unit regression | VERIFIED on cdb6621 | Covered by Linux/Windows CI 41234620897; malformed IDs + legitimate decimal IDs |
| PR CI Linux/Windows | VERIFIED on cdb6621 | https://github.com/rzqllh/Yoru/actions/runs/41234620897 SUCCESS |
| PR Chromium/WebKit | VERIFIED on cdb6621 | https://github.com/rzqllh/Yoru/actions/runs/41234620827 SUCCESS |
| Production / live providers / OTP / iPhone | DEFERRED | Explicitly out of scope |
| Cleanup / merge | NOT STARTED | Remove this folder only after transferring evidence |

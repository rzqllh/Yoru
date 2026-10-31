# Yoru checkpoint tracker — 2026-11-01

| Item | State | Evidence / next |
| --- | --- | --- |
| Audit main, PRs, #44/#78/#20 | VERIFIED | main bb9c95a; Actions 41229828524 and 41229828494 SUCCESS |
| OpenSubtitles file-ID coercion | IDENTIFIED | Number(true) and Number([25]) create false file IDs |
| SubSource ID coercion | IDENTIFIED | String([25]) creates a false ID |
| Unit regression | NOT RUN | Add malformed and valid fixtures |
| PR CI Linux/Windows | NOT RUN | Await PR |
| PR Chromium/WebKit | NOT RUN | Await PR |
| Production / live providers / OTP / iPhone | DEFERRED | Explicitly out of scope |
| Cleanup / merge | NOT STARTED | Remove this folder only after transferring evidence |

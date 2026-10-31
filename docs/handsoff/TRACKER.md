# Yoru — Branch checkpoint tracker

| Step | State | Evidence |
| --- | --- | --- |
| Audit main/PR/CI/#44/#78 | VERIFIED | main `f68bb0e`; CI 41227689029 SUCCESS; Browser 41227689000 SUCCESS; #77 draft; #44/#78 open |
| Backup validator malformed status | PLANNED | `frontend/src/lib/backup.ts` |
| Regression | PLANNED | `tests/backup-validation.test.mjs` |
| PR-head Linux/Windows and Chromium/WebKit | NOT RUN | Must await GitHub Actions |
| Evidence transfer + cleanup | NOT RUN | PR/issues before deleting this folder |
| Merge/main exact SHA checks | NOT RUN | No release/deploy |

| Code | CODED | `2b779d80`, `52b7d684`; backup.ts + backup-validation.test.mjs |
| CI after code | NOT RUN | Await Actions on PR |

# Checkpoint tracker — source picker metadata

| Item | Status | Evidence |
|---|---|---|
| Main/PR/issues audit | VERIFIED | main `e5812270`, PR #77 draft, #44/#78 open; main Actions 41238271758 and 41238271636 SUCCESS |
| Normalize malformed source quality/tracks | CODED | `frontend/src/lib/source-lifecycle.ts` |
| Regression unit tests | CODED, NOT RUN | `tests/source-lifecycle.test.mjs` |
| Branch exact-head Linux/Windows CI | NOT RUN | GitHub Actions |
| Branch exact-head Chromium/WebKit | NOT RUN | GitHub Actions |
| Publish evidence PR/#44 | PENDING | PR discussion |
| Remove handoff before main merge | PENDING | tree inspection |
| Live acceptance/release | DEFERRED | #77, #78, #20 |

| First PR CI attempt | FAILED | https://github.com/rzqllh/Yoru/actions/runs/41243589382 — ERR_MODULE_NOT_FOUND, fixed in `c39a34d` |
| Browser first attempt | FAILED | https://github.com/rzqllh/Yoru/actions/runs/41243589492 — Chromium build, recheck needed |
| Runtime import fix | CODED, NOT YET TESTED | `c39a34d` |

| Tested branch head | VERIFIED | `10b167bed33c68f9ac9c81b6af3f91d1ffaa6e49` |
| Linux/Windows | SUCCESS | https://github.com/rzqllh/Yoru/actions/runs/41243657089 |
| Chromium/WebKit | SUCCESS | https://github.com/rzqllh/Yoru/actions/runs/41243657082 |
| Cleanup-head CI | PENDING | Handoff removal changes branch SHA |

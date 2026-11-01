# Yoru isolated checkpoint tracker — 2026-11-01

| Checkpoint | Status | Evidence |
| --- | --- | --- |
| Audit main/PR/CI/#44/#78 | VERIFIED | main `18f3694`; #77 draft; #44/#78 open; baseline 4/4 CI SUCCESS |
| Local provider strict identity/mode guard | CODED | `backend/pipeline/validate.ts` |
| Regression unit tests | CI SUCCESS | `tests/local-provider-validation.test.mjs`; [Linux/Windows 2/2](https://github.com/rzqllh/Yoru/actions/runs/41256811876) on `596f326` |
| Chromium/WebKit | NOT VERIFIED | [attempt 1 CANCELLED](https://github.com/rzqllh/Yoru/actions/runs/41256811874) at Playwright apt install; attempt 2 requested |
| PR/issue evidence migration | IN PROGRESS | #121 and #44; preserve cancellation accurately |
| Remove temporary handoff | PENDING | delete folder before merge, recheck CI on cleanup head |
| External live gates | DEFERRED | #78/#20, iPhone, media, hosting; no production actions |

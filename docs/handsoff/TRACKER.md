# Yoru — isolated checkpoint tracker

| Step | Status | Evidence |
| --- | --- | --- |
| Main/PR/issue audit | VERIFIED | main `a2c2549a4dc93fbce99309afa533c832295a6631`; #77 draft; #44/#78 open; exact-main CI/browser SUCCESS |
| Canonical guide MAL ID fix | PENDING | No code change yet |
| Unit regression | NOT RUN | Pending |
| Chromium/WebKit | NOT RUN | Pending |
| Evidence in PR/#44 | PENDING | Before handoff cleanup |
| Remove `docs/handsoff/` | PENDING | Required before merge |
| Exact cleanup-head CI/browser | NOT RUN | Required before merge |
| Merge and post-merge CI/browser | NOT RUN | Only if all gates succeed |

External OTP/RLS, iPhone, provider/subtitle live, resolver permission, hosting, release #20 and historical branch deletion remain deferred.

## Code checkpoint
- `be9e83607645f649f7ab7db4abcdba7aee50a234`: code and regression tests committed on isolated branch.
- Unit/Chromium/WebKit CI: PENDING GitHub Actions PR runs.
- PR evidence and handoff removal: PENDING. No merge yet.

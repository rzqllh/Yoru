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

## PR-head CI checkpoint (2026-11-01)
- Exact branch SHA `9f15b5341a5e8e1c70cae4ace8483572cacd85bb` (including temporary handoff files).
- Linux/Windows CI: [SUCCESS, both jobs](https://github.com/rzqllh/Yoru/actions/runs/41249112177).
- Chromium/WebKit: [SUCCESS, both jobs](https://github.com/rzqllh/Yoru/actions/runs/41249112169).
- These are deterministic checks; physical iPhone, live media, OTP/RLS and production NOT VERIFIED.
- Next: transfer this evidence to PR #119 and Issue #44; delete temporary files; recheck exact cleanup-head CI/browser before merge.

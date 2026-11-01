# Yoru temporary branch tracker — 2026-11-01

| Requirement | Status | Evidence | Remaining |
| --- | --- | --- | --- |
| YX-02 candidate truthfulness / local demo fixture | CODE CHANGED; TEST NOT VERIFIED | `source-readiness.ts`, `source-readiness.test.mjs` | Exact PR-head Linux/Windows and Chromium/WebKit success |
| Previous PR #121 local provider identity | MERGED; MAIN TESTED | [PR #121](https://github.com/rzqllh/Yoru/pull/121), [main CI](https://github.com/rzqllh/Yoru/actions/runs/41265463762), [browser](https://github.com/rzqllh/Yoru/actions/runs/41265463730) | Real provider acceptance remains external |
| External acceptance #77/#78/#20 | DEFERRED | Issue #44 and #78 | Owner-assisted OTP/RLS, live provider, iPhone, hosting and release gates |

Cleanup contract: preserve CI links/SHAs and risk notes in PR/Issue #44, remove `docs/handsoff/` from final diff and main, and do not infer live media availability from fixtures.

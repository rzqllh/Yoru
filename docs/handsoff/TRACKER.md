# Temporary branch checkpoint tracker — 2026-11-01

| Requirement | Status | Evidence / next |
| --- | --- | --- |
| Audit main/PR/CI/#44/#78/#20 | VERIFIED at base `ceff755` | [CI](https://github.com/rzqllh/Yoru/actions/runs/41267695966), [Browser](https://github.com/rzqllh/Yoru/actions/runs/41267695965); open #77/#127 |
| Stremio canonical MAL/episode reference parsing | CODED, NOT CI VERIFIED | `backend/providers/stremio.ts` branch change |
| Regression: malformed identifiers never become mapped episodes/network fetch | CODED, NOT CI VERIFIED | `tests/stremio-env.test.mjs`; await CI |
| Exact PR-head unit/lint/build Linux/Windows | NOT RUN / PENDING | GitHub Actions after PR |
| Exact PR-head Chromium/WebKit | NOT RUN / PENDING | GitHub Actions after PR |
| Evidence moved to PR/#44 and temporary docs removed | NOT YET | Mandatory before merge |
| Live addon/provider, iPhone, OTP/RLS, production, release | DEFERRED | #78 and #20; no live claims |

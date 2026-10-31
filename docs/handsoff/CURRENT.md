## Yoru engineering checkpoint — 2026-10-31

Base `main`: `3a9b30aa7cd49d1452a5beebe62438d660628052`.
Scope: client API request cancellation during an HTTP error JSON body read, isolated to `frontend/src/lib/api.ts` and `tests/catalog-recovery.test.mjs`.
Status: AUDITED / PROPOSED; no test outcome claimed yet.
Risk: a caller-aborted navigation can be misreported as HTTP 503 because error-body parsing swallows the abort. Preserve the original HTTP status for malformed error JSON, preserve cancellation for caller aborts, and retain timeout diagnostics.
Constraints: no production deployment, Supabase, provider live, secrets, or release changes. `vercel.json` currently disables Git deployment. Remove both handoff files before merge; evidence belongs in PR and Issue #44.

CODED: test `08992e2`, fix `7720643`; exact-head CI and Chromium/WebKit pending. No local pass claimed.

VERIFIED (pre-cleanup PR head `7b11a60`): Linux/Windows CI SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41211746383 ; Chromium/WebKit SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41211746388 . Cleaned final head requires fresh checks.

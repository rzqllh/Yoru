# Catalog recovery — 31 October 2026

Production 74144ef predates API adapter; health/discover 404. Direct Tenrai probes 200. #90 disables Git deployments; observed merged main 2233786.

CODED: reject malformed upstream envelopes before caching; bounded client timeout and JSON/catalog validation; preserve abort and HTTP error diagnostics; WebKit/Chromium recovery regressions; read-only hosted catalog acceptance command.

PENDING: npm run check; Linux/Windows and Chromium/WebKit CI on exact head. Local Playwright runtime download failed (truncated archive from environment); use CI evidence, never claim local browser PASS. Current Vercel fetch connector cannot access existing immutable preview; latest deployment quota still held. No deployment performed.

Supabase audit: dedicated Yoru project exists and table/RPC/RLS are deployed, zero auth users/snapshots, advisor zero findings. SQL read-only repro found missing-field NULL acceptance in payload validation; tracked in #78, schema repair preparation separate.

Move evidence to PR/#44 and delete handsoff before merge.

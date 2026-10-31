# Yoru — Isolated checkpoint 2026-11-01

- Base main: `f68bb0ec3938d557ef78ec6055b24c9bb6177eba`; CI Linux/Windows [SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41227689029); browser Chromium/WebKit [SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41227689000).
- Audit: only open PR #77 (draft cloud sync); Issues #44/#78 open; #20 release BLOCKED. `vercel.json` disables automatic Git deployments.
- Scope: local backup v1 validation only. `validLibrary` currently calls `String(value.status)` on untrusted imported data. JSON status object with a non-callable `toString` can throw before validation returns false. Change to strict string check; add malformed-input regression.
- Stage: AUDITED, NOT CODED, NOT TESTED. No Supabase, provider, Vercel or release changes.

## Code checkpoint

- CODED `2b779d80`: strict string status validation, preserving `planned`/`watching`/`completed`.
- CODED `52b7d684`: regression for imported JSON objects with poisoned `toString`/`valueOf`, arrays, null and primitives; asserts no throw and false; valid status remains true.
- PR-head CI and Chromium/WebKit: NOT RUN as of this checkpoint. Do not merge before results.

## Pre-cleanup verification checkpoint

- Exact PR branch head `35f85b58503dc23af08a9c044cb8be1a14ea2441` [CI Linux/Windows SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41229435760), jobs validate and Windows/Node22/production-smoke both success.
- Same head [Chromium/WebKit SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41229435664), jobs chromium and webkit-smoke both success.
- Tests are deterministic; no real device, live provider or production acceptance. Next: copy evidence to PR #112 and Issue #44, delete handoff files, verify cleanup head and merge only with exact-head CI.

# Yoru isolated engineering checkpoint — 2026-11-01

- Main baseline: `84d9ff1ff6c97f2bedc7f9381fb805ab07edb516`; exact main [CI](https://github.com/rzqllh/Yoru/actions/runs/41265463762) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41265463730) SUCCESS, each 2/2.
- Scope: restrict browser-side `/demo/` relative candidate bypass to shipped `/demo/stream.m3u8` with HLS format. Unknown relative demo paths were previously accepted as candidates even though they were not shipped; preflight would later fail.
- Changed paths: `frontend/src/lib/source-readiness.ts`, `tests/source-readiness.test.mjs`.
- Regression: reject unknown demo paths, traversal-like paths, query/fragment variants and format mismatch while preserving exact demo fixture and external HTTPS candidates.
- Current work branch head: see GitHub PR; PR head `f9ac9b274a0e2f3d1917b5c8efbf91c02cbb7922` [CI Linux/Windows #41265717025](https://github.com/rzqllh/Yoru/actions/runs/41265717025) **SUCCESS (2/2)** and [Chromium/WebKit #41265717032](https://github.com/rzqllh/Yoru/actions/runs/41265717032) **SUCCESS (2/2)**. These results apply to the temporary-docs head; after deleting handoff files, final head requires a new exact-SHA CI/browser verification.
- Guardrails: no Supabase, live provider, resolver, hosting, production, secret, release or historical branch change.
- Handoff: transfer all evidence to PR and Issue #44; delete this file and TRACKER.md before merge. Re-run CI on final cleanup head, then main.

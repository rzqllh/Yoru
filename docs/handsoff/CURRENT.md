# Yoru — temporary recovery checkpoint: YX-13 local library sorting
Date: 2026-10-31 (Asia/Jakarta)
Repository: https://github.com/rzqllh/Yoru
Branch: `feat/yx13-library-sorting-20261031` based on `e5b306086f1e58b44a5a8311da5312ce1f1347ec` (after PR #79).
Task: YX-13 locally persisted collection sorting, independent of live providers/accounts.
Current code HEAD prior to this file: `426d1f1d89c48e41c7831200b4662fa07815fab7` (get current branch SHA fresh).
Files:
- `frontend/src/lib/library-sort.ts` pure deterministic recent/title/score/year sorting with missing score/year last and stable ties; no data mutation.
- `frontend/src/App.tsx` selection persisted as `library-sort` preference in IndexedDB, default recent, filter interaction retained.
- `frontend/src/styles.css` responsive/select focus styles.
- `tests/library-sort.test.mjs` sorts and malformed-sort fallback.
- `tests/browser/yoru.spec.mjs` persists choice across reload using fixture library.
Status: CODED; exact-head CI Linux/Windows and Chromium/WebKit E2E NOT YET VERIFIED.
Owner directive: all external blockers deferred until final phase. No need for OTP/iPhone/live provider now.
Safety: no changes to Supabase, production or main yet. Do not merge if tests fail.
Before main merge: transfer durable status to PR/Issue #44 and DELETE this entire `docs/handsoff/` folder from PR head; rerun exact final-head CI.
Parallel draft cloud PR #77 remains separate and uses temporary handoff in its own branch. Its sync preference whitelist will need `library-sort` support if this P1 setting should cross devices, after review and merging.
Recovery: verify PR #79 merged, read this file, current branch SHA, CI, and issue #44. Complete tests and docs cleanup, merge engineering only with PASS, continue next unblocked task.

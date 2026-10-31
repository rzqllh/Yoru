# Yoru — active engineering checkpoint (temporary)

Updated: 2026-10-31 (Asia/Jakarta)
Repository: https://github.com/rzqllh/Yoru
Work branch: `feat/yx06-episode-source-recovery-20261031`; base main `c3bfe11bde6085abeb7009e6b65f33f65077134f`.
Owner directive: **Defer ALL external blockers** (OTP two-account, real iPhone, authorized upstream streaming/subtitles, production signoff, release, branch deletion requiring external access). Continue all independently testable engineering work without asking owner to provide inputs.

## Current task: YX-06 episode-scoped verified source recovery
- CODED as of branch code commit `0461eed099d532159d9aba03e49e4c2e61c22318`; exact CI & Browser E2E pending.
- `frontend/src/lib/source-memory.ts`: `sourceMemoryKey(malId,episode?)`; optional episode-scoped provider ID preference with legacy per-anime fallback; no stream URLs/tokens; strict episode/ID validation.
- `frontend/src/App.tsx`: source choice, resume, auto-next and recovery read per-episode memory, then legacy generic preference. Save both episode-specific and generic ID only AFTER successful native browser media preflight. Unverified fallback remains opt-in.
- `tests/source-memory.test.mjs` tests precedence, per-episode isolation, legacy compatibility, rejecting embeds and corrupt values.
- `tests/browser/yoru.spec.mjs` checks IndexedDB keys after verified fixture playback.
- No production deployment or user account changes.
- **Before merging:** run exact code-head CI Linux/Windows and Chromium/WebKit. Delete entire `docs/handsoff/` directory from merge candidate, transfer checkpoint to PR issue comments, reverify exact final candidate with CI. Only then review/merge to `main` if all checks pass.

## Deferred external blocker lane
1. Draft PR #77 cross-device sync: app changes and Yoru Supabase migration are staged; no real two-account OTP/RLS test, keep draft; data and migration evidence in https://github.com/rzqllh/Yoru/issues/78 and its own `docs/handsoff/` branch.
2. Auto-sync data architecture remains unimplemented (needs offline queue, deletion tombstones, conflict policy).
3. G1/G2 authorized live streaming and exact episode identity; G3 subtitle credentials and download proof; G4 physical iPhone; G5 HTTPS hosting and protections; G6 final release owner go/no-go. Issue https://github.com/rzqllh/Yoru/issues/20 remains BLOCKED.
4. Torrent-only candidate resolver gated by security, legal/source authorization and browser support.
5. Historical branches/artifacts cleanup not complete; do not blindly delete unique code.

## Next independently implementable work
After YX-06 tests, add pure/testable improvements to recovery and smart-next (never fake playback), then prioritized UX/search/library/performance independent PRs. Keep one active branch per conflicting shared file and handoff per branch. Read GitHub issue #44 for exact epic statuses.

## Recovery
Read this file, verify work branch HEAD, CI and PRs, and continue without relying on previous chats. Do not copy this file to `main`.

# Yoru — work-branch task tracker (temporary)
Updated 2026-10-31 Asia/Jakarta.
**DO NOT MERGE `docs/handsoff/` to `main`.** Move evidence to PR/Issue #78, then delete directory before merge.
Repository: https://github.com/rzqllh/Yoru
Work branch: `feat/opt-in-cross-device-sync-20261031`; last exact SHA checked `64d90d0c047642d80481410d85e81c6d3396098b`
Main baseline: `c3bfe11bde6085abeb7009e6b65f33f65077134f`
PR: https://github.com/rzqllh/Yoru/pull/77
Cloud acceptance issue: https://github.com/rzqllh/Yoru/issues/78
Public release gate: https://github.com/rzqllh/Yoru/issues/20

Status terms: PLANNED / CODED / CI_TESTED / LIVE_VERIFIED / BLOCKED.
Mock CI tests are not LIVE_VERIFIED.

| Priority | Task | Status | Evidence / next action |
| --- | --- | --- | --- |
| P0 | YX-06 source identity | CI_TESTED on main | Merged PR #76; provider ID only, media preflight required each play |
| P0 | Optional manual cloud snapshot | CODED (draft PR #77) | Yoru Supabase migration applied; RLS on, authenticated SELECT-only; no real two-account acceptance |
| P0 | Sync security/data minimization | CODED | Private SECURITY DEFINER, public INVOKER, CAS, value canonicalization; cloud snapshots now only ID/title/status/progress/allowlisted preferences |
| P0 | Cloud safe download merge | CODED | Newer updatedAt wins for library/progress, local tie; preferences remain explicit remote override; no deletes propagated |
| P0 | Live cloud Auth/RLS test | BLOCKED | Need two user-owned staging identities and OTP access tokens; live fail-closed verifier `scripts/verify-device-sync-live.mjs` checks isolation/CAS/cleanup |
| P0 | Automatic background sync | PLANNED | Needs per-record versions/tombstones, offline queue and tested conflict semantics; do not use destructive snapshot polling |
| P0 | Enhanced playback recovery | PARTIAL | Source memory merged; advanced recover/retry/smart-next still pending |
| P0 | Live streaming G1/G2 | BLOCKED | Authorized source provider matrix; correct episode/season/codec/CORS verification |
| P0 | Live subtitle G3 | BLOCKED | Provider credentials and representative real downloads/quotas |
| P0 | Torrent resolver YX-19 | BLOCKED | Security architecture, lawful source/access consent, supported engine; never pretend Safari plays hash |
| P0 | Physical iPhone G4 | BLOCKED | Real iOS device and verified player/fullscreen/PiP/subtitles/PWA |
| P1 | Watch Guide expansion | PARTIAL | Curated examples verified; more chronology/source evidence needed |
| P1 | Smart search, library, onboarding | PLANNED | Separate UX slices with fixture and API evidence |
| P1 | UI/accessibility/performance | PARTIAL | Needs physical and measured CWV, no fake optimizations |
| P0 | Hosting production G5 | BLOCKED | HTTPS deployment, auth/rate limit, observability, rollback |
| P0 | Release signoff G6 | BLOCKED | Exact-commit tests, G1-G5, no P0/P1, owner explicit go/no-go |
| FINAL | Historical branch/artifact cleanup | PARTIAL | No risky delete before checking PR sources; remove this handoff folder before main merge |

## 31 October changes committed in current work session
- `d983fbca` minimal cloud anime identity (IDs/title only), strips arbitrary upstream metadata.
- `422fd12d` unit test proving tokens/artwork/private fields do not upload.
- `6a6f6b9f` public cloud data disclosure clarified.
- `1e23907a` safe live two-account verifier (no env => exit 2, no network).
- `d643c4c6` negative verifier test.
- `cf14aafc` operator live acceptance guide.
- `e665b70e`, `8bb083b2`, `8185f80c`, `9c7e3597`, `e917f491` reconcile downloaded history and test.
- `a40c1857`, `64d90d0c` sanitize remote records and test.
- Current head `64d90d0c047642d80481410d85e81c6d3396098b` CI/Browser runs queued/in progress at last inspection. **Do not mark PASS until checked.**
- Real Supabase snapshots remain empty at last inspection. No live OTP or two-user mutation has been executed.
- Production `main` still separate and not automatically deployed.

## Session recovery
Read this file and `docs/handsoff/CURRENT.md`, check GitHub SHA/PR77 and latest CI runs and Issue #78. Inspect Supabase Yoru project `ospwrqyfvfxnippknire`, existing migration ledger and RLS. Keep all secrets out of docs. Don't merge before live auth signoff. On each meaningful task update this tracker and `CURRENT.md`; clean both before main merge.

## Owner priority decision — 31 October 2026
All external/owner-dependent blockers are **DEFERRED to the final acceptance phase**: two-account OTP, physical iPhone, authorized video/subtitle providers, torrent resolver approval, production hosting and release signoff. Do not repeatedly request owner input or falsely mark these done. Continue independent code, tests, UX and performance work on isolated branches first. YX-06 episode-scoped source recovery is active in PR #79 based on main; cloud draft PR #77 remains unmerged. Keep this handoff temporary; remove it before any main merge after preserving state in Issue #78/PR comments.

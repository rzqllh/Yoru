# Yoru — resumable engineering checkpoint
Updated: 2026-10-31 (Asia/Jakarta)
Branch: `feat/opt-in-cross-device-sync-20261031`
Branch HEAD (verify fresh): `3bd916657914fc6def492a08b4ea63a1a9780c94`
Main HEAD at last read: `c3bfe11bde6085abeb7009e6b65f33f65077134f`
PR: https://github.com/rzqllh/Yoru/pull/77 (DRAFT)
Blocking issue: https://github.com/rzqllh/Yoru/issues/78
Release gate: https://github.com/rzqllh/Yoru/issues/20

## Scope and rules
User requests full remaining Yoru backlog delivered in dependency order, with this checkpoint under `docs/handsoff/` only on work branches. Before any merge to `main`, transfer durable state to Issues/PR, remove the whole `docs/handsoff/` directory from candidate tree, check no agent artifacts in `main`. Never falsely claim physical iPhone, live provider, torrent resolver, release acceptance, or cloud authentication based solely on fixtures. Keep production deployment disabled.

## VERIFIED
- YX-06 source identity preference merged to main via PR #76; fresh native preflight on playback, no persisted stream URLs/tokens.
- Opt-in MANUAL Supabase snapshot code in PR #77: frontend OTP, local-first backup export/import UI, whitelist/canonicalized preference values, no service-role keys in VITE config; `sb_publishable_*` only.
- Yoru Supabase project `ospwrqyfvfxnippknire`, region eu-west-2, active healthy. Migration `20261031072944_yoru_device_sync_initial` applied. Main DB currently has `public.yoru_sync_snapshots` zero rows; RLS enabled. Public wrapper functions `yoru_sync_put` and `yoru_sync_delete` are SECURITY INVOKER; private helpers `yoru_private.sync_put` / `sync_delete` are SECURITY DEFINER; authenticated role has table SELECT only (not INSERT/UPDATE/DELETE). Service_role and postgres retain admin grants. DB security advisor previously zero findings.
- PR #77 head `3bd916657914fc6def492a08b4ea63a1a9780c94` passed Linux/Windows CI and Chromium/WebKit E2E runs 41179413570 and 41179413603. Tests use mocks; no live Auth/RLS assertions made.

## NOT DONE / BLOCKED
1. High priority: real OTP/Auth 2-account/anonymous tests; RLS ownership and CAS concurrency tests; verify REST calls against dedicated staging Yoru; enable build-time public key and privacy notice only after live evidence. PR #77 stays draft.
2. Automatic bidirectional sync is NOT IMPLEMENTED: current implementation is manual snapshots. Needs tombstones, per-record versioning/device conflict strategy, offline queue.
3. YX-06 enhanced auto-recovery/smart next remains partial.
4. Live authorized native streaming/video G1/G2, subtitle G3, provider matrix, torrent resolver opt-in architecture G19/20 are blocked by authorized upstream and safety review.
5. Physical iPhone G4, HTTPS production G5, final release G6 and explicit owner approval remain blocked.
6. UI/UX accessibility/performance, smart search, personalized library, wider source-reviewed anime chronology are partial.
7. Historical remote branch and CI artifact cleanup remains incomplete; don't delete uniquely unmerged work. Do not create generic AI/agent files in main.

## Next safe actions
1. Query Supabase grants/functions again, verify project ref and Auth setup; use non-secret publishable key only. RLS two-user tests require real authenticated accounts; no fake success.
2. Add deterministic API contract/security tests and evidence, review current PR head; no nontrivial schema changes without safety review.
3. Implement other non-live product tasks on isolated branch, checkpoint each meaningful commit here (same PR branch or separate branch), exact SHA CI and browser gates.
4. Merge only tested, reviewed work after moving checkpoint to issue/PR comments and deleting `docs/handsoff/` from merge candidate. Do not merge PR #77 until live-security signoff.

## Recovery commands
Fetch branch, read this checkpoint and PR #77/#78, verify exact refs and CI, inspect Supabase migration ledger / RLS and security advisor; continue implementation without depending on old chats.

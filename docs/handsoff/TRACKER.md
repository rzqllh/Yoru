# Yoru — YX-10 temporary branch tracker
Updated: 2026-10-31 Asia/Jakarta.
**DELETE `docs/handsoff/` BEFORE MAIN MERGE.** Preserve evidence in PR/Issue #44.

| Priority | Slice | Status | Evidence / next action |
| --- | --- | --- | --- |
| P0 | Main baseline | VERIFIED | `42923d1`; CI 41185232926 and Browser E2E 41185232817 SUCCESS |
| P1 | YX-10 manual watch-path progress bounds and clock | CODED / CI PENDING | Local 5 focused unit tests PASS; verify branch-head Linux/Windows and Chromium/WebKit |
| P0 | Draft #77 opt-in manual cloud sync | DEFERRED / NOT LIVE_VERIFIED | OTP two accounts and real RLS acceptance in #78; no changes on this branch |
| P0 | Streaming/subtitles/torrent resolver/physical iPhone | DEFERRED / NOT LIVE_VERIFIED | Authorized sources, device and permissions required at final gate |
| P0 | Production hosting/release #20 | BLOCKED | No production promotion or GO |
| FINAL | Historical branch cleanup | DEFERRED | No remote deletion |
| MERGE | Remove temporary handoff and retest final HEAD | PENDING | Copy evidence to PR/#44, remove `docs/handsoff/`, verify exact-head CI/E2E |

Only code paths changed are the manual watch-path helper and its unit test. No Supabase project, credential, provider, deployment or release mutation.

# PHASE 07 — Local Library, Backup, Privacy and Cloud Sync

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** LOCAL CODE EXISTS; CLOUD DRAFT #77 BLOCKED. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Local Library, Backup, Privacy and Cloud Sync. Dependencies: 00 privacy/canonical identity; compatible changes from 04/05/06. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Protect IndexedDB local library, save/status/delete, resume, preferences, watch-path manual progress and versioned backup/import.
- Verify data-validation, no silent loss, storage-denied and cross-page search/sort/backup compatibility.
- Keep opt-in Supabase email OTP/manual snapshots independent of offline use.
- Verify authentic two-account/anonymous RLS isolation, CAS conflict, deletion, corrupted imports and 2-device actual flow before enabling cloud.
- Decide manual vs automatic sync as separate product/architecture approval; no auto sync/tombstones by default.

## Existing implementation and evidence at snapshot

- `frontend/src/lib/db.ts` and `backup.ts` already provide local-first storage/backup and validation.
- Draft [#77](https://github.com/rzqllh/Yoru/pull/77) has code and staging schema; [#78](https://github.com/rzqllh/Yoru/issues/78) reports null-safe migration and anonymous denial tested.
- Two real OTP users, authenticated cross-user RLS, two physical browsers/devices, deletion/conflict and privacy acceptance are NOT verified. No cloud sync is active on main.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

AC-LOCAL-01..04 and AC-SYNC-01..07; reject cloud merge if real account/device/privacy tests unresolved.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** Accidental loss of local backups, stale device overwrite, RLS bypass, token leakage, ambiguous cloud delete and privacy retention.
- **Approval needed:** Owner must supply safe test identities/devices and approve any production Auth policy or automatic sync architecture; no service-role key in browser.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Rebase draft #77 onto current main only after scope review, without activating cloud.
2. Run RLS/OTP/CAS/consent/privacy tests using real accounts and isolated devices.
3. Record explicit go/no-go for manual sync; leave auto sync deferred without owner decision.

## Primary files and references

frontend/src/lib/db.ts, frontend/src/lib/backup.ts, draft PR #77, Supabase migrations in PR, tests/backup-validation.test.mjs

## Actual changes / PR / test log

| Field | Current entry |
| --- | --- |
| Phase implementation PR | NOT CREATED for this phase |
| Modified app files | NONE as part of this planning task |
| Implemented SHA | NOT APPLICABLE; baseline only |
| New phase CI / browser tests | NOT RUN |
| Live provider / device verification | NOT RUN in this planning task |
| Phase sign-off | PENDING |
| Next handoff update | On first actual implementation PR or new verified blocker |

**Update protocol:** append dated checkpoint below after each real phase slice. Include PR, diff paths, exact SHA, test URLs, blockers resolved/new, any owner decisions, and follow-up instructions. Do not rewrite an incomplete checkpoint as DONE.

## Checkpoint history

- **2026-10-31 — BASELINE / PLANNING:** handoff initialized from repository, epic/gate and user-approved UX/CX decisions. No code, cloud, production configuration or release change in this handoff.

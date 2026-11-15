# 07 — Data, Database, Ownership and Migration Contract

**Status:** **Observed current storage vs PROPOSED logical target explicitly separated**. This file **does not authorize a schema migration, Supabase connection, production DB reads, RLS changes or deployment**. See [root AGENTS](../../AGENTS.md), [SECURITY](10-SECURITY.md), [Decision Register](../planning/owner-freeze-2026-11-15/DECISION_REGISTER.md).

## A. Observed at historical inspected main

[frontend/src/lib/db.ts](../../frontend/src/lib/db.ts) defines IndexedDB `yoru-local-v1` schema v2:

| Store | Current key | Value |
|---|---|---|
| `library` | `anime.id` | `LibraryEntry {anime,status,updatedAt}` |
| `progress` | `anime.id` | `ProgressEntry {anime,episode,seconds,duration,updatedAt}` |
| `preferences` | `key` | `{key,value}` |

The DB is **not currently account-keyed**, and includes no cloud sync engine or cloud snapshots on inspected main. [backup.ts](../../frontend/src/lib/backup.ts) validates/imports **backup version 1**. `P52` account separation, `P33` automatic sync, `P60` versioned snapshots and `RG05` guest ownership are desired behaviors, **not facts about present schema**. Cloud candidate PR #77 and issue #78 are separate, not merged proof.

## B. Proposed conceptual data entities — NOT actual SQL tables

| Proposed entity | Identifier/relationship | Minimum required attributes | Notes |
|---|---|---|---|
| `AnimeIdentity` | internal stable anime ID + namespace mappings | `malId?`, `aniListId?`, source IDs, aliases, provenance/confidence | Never title-only join; preserve legacy `mal:<id>` links |
| `AnimeMetadataField` | anime ID + field + authority | value, source, fetchedAt, stale/verified status | P38 per-field provenance; eligibility of AniList not yet approved |
| `EpisodeIdentity` | internal episode ID + anime/edition | season/cour, episode number, OVA/movie/special, official release status/source | Episode key must not be raw `number` alone |
| `ProviderCandidate` | provider ID + episode ID + source candidate | format, capability, expiry, identity evidence, health state | Prefer references, avoid leaking private playable URLs |
| `PlaybackEvidence` | episode ID + device/browser/test environment + source | observed result, timestamp, source mode, version, proof ref | Audit 100% denominator independently |
| `UserLocalSpace` | guest identity or authenticated owner ID | owned library/progress/preferences revision | Separate namespaces on shared devices |
| `LibraryRecord` | owner + anime | status, updatedAt, revision, deletion tombstone if needed | Prevent cross-user leak/resurrection |
| `ProgressRecord` | owner + canonical episode | timestamp, duration, update revision, device | Preserve precise resume and merge |
| `SyncRevision` | owner + device/snapshot | revision, operation, CAS marker, appliedAt | Safe concurrency; no silent overwrite |
| `BackupSnapshot` | owner + snapshot version | schema version, createdAt, checksum, retention, restore state | Bounded retention and account deletion policy |
| `AccountDeletion` | owner request | approval/confirmation, deletion target, audit state | No uncontrolled historical retention |

**All identifiers/field names above are conceptual**, not final table names or database schema. Existing Supabase PR and migration drafts must be inspected before proposing SQL. PostgreSQL constraints, RLS policies, indexes, tombstones, storage buckets and snapshot encryption require separate security approval.

## C. Ownership and isolation rules

1. Default guest records remain guest-owned and local.
2. When user logs in, the app switches to **that account's own local namespace**; only records already explicitly assigned to it are auto-synced (RG05).
3. Do not infer ownership from device, IP, last login or titles. Guest-to-account import is a separate explicit claim flow with a safety review.
4. User A cannot read/write User B library, progress, preferences, exports, snapshots or backups via browser store, authenticated API or direct DB policy.
5. Logout revokes session, leaves data attributed to account/device according to an owner-approved privacy policy. Account deletion must be a separate explicit workflow.
6. Revision/CAS or equivalent guards prevent silent overwrite and stale-device resurrection; ambiguous merges are user-confirmed.

## D. Migration plan (proposal, not executed)

- Inventory and snapshot legacy `yoru-local-v1` data and backup v1 before changes; preserve guest records.
- Add a reversible version/owner namespace while maintaining valid legacy MAL/AniList IDs and route compatibility.
- Treat unowned legacy records as **guest/unclaimed**, never automatically upload them.
- Implement idempotent migration with interruption/retry protection. Double migrations may not duplicate or overwrite.
- Perform negative two-account tests, logout/login, same-anime collisions, cloud conflict/resurrection, corrupt import and rollback.
- Never delete old stores until owner approves a tested retention/rollback strategy.
- A migration touching production DB/RLS is **BLOCKED until separately approved**; local preview L01 does not authorize it.

## E. Cloud backend decision boundary

Supabase cloud-sync draft #77 and issue #78 may provide concrete SQL, Auth, OTP, CAS and snapshot operations, but neither is promoted to **current main** merely because named here. For cloud sync:

- Auth via approved supported provider, verified OTP and session expiry.
- RLS denies anonymous and cross-user accesses, tested against **actual identities**, not an admin-only happy path.
- Service-role credentials never reach browser or local previews by default.
- Sync can retry safely without duplicating writes or resurrecting deletions.
- Snapshot retention bounded; P70's '30 days' is an **example**, not approved exact numeric limit.
- Export/import must be validated, owner-scoped, and corruption-safe; no tokens/media grants in backup.
- If hosted cloud database use is essential for local testing, determine a safe isolated test scope explicitly. **Do not silently connect local preview to production users/DB**.

## F. Database acceptance/rollback

| Case | Expected | State |
|---|---|---|
| DB-01 | Guest vs A vs B data remains isolated locally | NOT RUN |
| DB-02 | Cloud RLS denies anonymous, A→B read/write/delete | BLOCKED live identities |
| DB-03 | Two devices concurrent update merges via CAS, no loss | NOT RUN |
| DB-04 | Import backup v1, preserve identity/progress | NOT RUN |
| DB-05 | Corrupt owner/ID/schema import rejected transactionally | NOT RUN |
| DB-06 | Account deletion and bounded snapshot retention honored | BLOCKED policy |
| DB-07 | Local tests have no unauthorized production connection | NOT RUN |
| DB-08 | Rollback restored exact prior records from snapshot | NOT RUN |

**Agent blocker:** Missing concrete approved SQL/schema → `YOR-BLK-004`, cite current code and issue #78, ask owner before generating production migration. Do not invent tables/column types and call them existing.

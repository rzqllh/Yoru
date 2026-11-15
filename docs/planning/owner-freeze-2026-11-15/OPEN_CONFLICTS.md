# Yoru — unresolved conflicts, restrictions and owner approval gates

> This document **preserves** challenging owner decisions; it does not silently replace them. Product preference is not permission to alter another party's access controls, read private records, use tokens or change production.

| ID | Severity | Affected decisions | Decision/observed conflict | Blocking condition |
|---|---|---|---|---|
| C01 | **CRITICAL / SECURITY** | P40/P42/P48/P51/P61/P71/RG03/RG06 | Same prod DB; owner-only preview; test-only writes; unrestricted reads | No proof of least privilege, read minimization, isolated credential, or recoverability |
| C02 | **CRITICAL / METRICS** | P19/P45/P55/P64/P67/P68/RG04/RG07/RG08 | 100% all aired anime versus defining aired episodes only after provider has video | Provider-dependent denominator can hide missing episodes |
| C03 | **BLOCKED / ACCESS** | P07/P31/P62/RG02/RG09 | Agent requested to bypass anti-bot | No authorization to ignore upstream access restrictions |
| C04 | **BLOCKED / DATA RIGHTS** | P18/P38/RG10 | Force AniList/MAL regardless of terms | Provider can deny/limit use; legal/ToU review and possibly provider permission required |
| C05 | **ENGINEERING** | P02/P03/P10/P11/P15/RG08 | Legacy D02 excludes iframe; new owner contract allows consented proven fallback | Reconciliation of code, safety, acceptance and UX pending |
| C06 | **ENGINEERING / PRIVACY** | P32/P33/P41/P52/P60/P63/P70/RG05 | Local-first current, proposed cloud automatic sync | Real OTP, two-account RLS, CAS, deletion, backup/device tests missing |
| C07 | **LIVE SOURCE** | P27/P55/RG07 | Tests, manifests, metadata cannot prove all episodes | Actual authorized playback/episode identity/device evidence missing |
| C08 | **DEVICE** | P39 | Browser WebKit smoke ≠ iPhone physical | Device owner/tester and results required |
| C09 | **PRODUCTION** | P29/P50/P69 | Release gates and security monitoring | Exact SHA production full stack/rollback/quotas and owner GO not verified |
| C10 | **SOURCE DISCOVERY** | P18/P53/P19 | AniList/MAL field authority & complete catalog | Provenance, pagination, 429/ToU, stale-cache and reversible migration unresolved |

## C01: production-data preview

**Freeze owner intent:** preview and production same physical DB; test-account writes only; preview may read any production data; reviewed branch; owner-only strong auth; audit trail.

**Risk:** An admin credential behind protected preview could bypass RLS, exposing or corrupting real users' data. UI auth cannot enforce database row scope. DB rollback is different from code rollback. Owner's permission does not establish legal/privacy basis to expose third-party users' records to experimental code.

**Minimum design prerequisite (not automatic approval):**
- Document concrete database roles/service credentials and their reachable read/write privileges.
- Separate test-account identity and enforce write constraints server-side and at DB/RPC boundaries. Prove cross-account negative tests.
- Independently assess **whether production personal-data read should be permitted at all**; default to minimized/obfuscated fixtures. A request for blanket read remains OPEN until justified and reviewed.
- Require environment access controls, MFA/SSO where available, audit, redaction, isolation, rollback/recovery with restore drill.
- If this cannot be achieved, maintain NO-GO for preview with production access. No service-role/admin credentials in browser or preview test runtime.

## C02: 100% coverage denominator

**Owner selection preserved:** P68 C says a new episode counts as released only after a provider offers video. **But** RG07 B says all already-aired titles must have real playback, P64 B says all released episodes, and RG04 A prevents public release before coverage reaches 100%.

**Unsafe inference:** `found video / provider-listed episodes = 100%` proves only coverage of the provider's list. An empty provider list cannot produce PASS.

**Measurement contract recommended for separate approval:**
- `eligible_titles`: independently verified already-aired anime in a frozen catalog snapshot; upcoming excluded.
- `eligible_episodes`: independently verified officially aired episodes by reliable release metadata, including unlisted source gaps; uncertain total marked UNKNOWN/BLOCKED, not excluded invisibly.
- `verified_episodes`: each matching eligible episode with real native or consented fallback playback evidence on target device.
- `title_coverage` and `episode_coverage`: numerator/denominator separately, no 0/0 pass; last verified at; origin; player type.
- After first public release, P67 B allows honestly displayed newly unavailable episodes. Define regression thresholds and incident policy without silently promising 100% forever.
- **P68 must remain on register as C** until owner explicitly approves a new denominator; do not substitute this proposed formula as already decided.

## C03: ant-bot bypass request

RG09 B asks for automatically overcoming site protection. That cannot authorize use of unpermitted access-control circumvention, stealth sessions, credential theft, DRM bypass, or hidden cookie forwarding. Work can audit official APIs, agreed integrations, user-authorized sessions, provider consent and stable public endpoints. Absent an authorized route: provider BLOCKED, evaluate alternatives. Do not implement forbidden bypass as a fallback.

## C04: AniList and MAL terms

RG10 B requests always-on access. An upstream can deny access, impose terms/rate budgets or change schema. Verify applicable [AniList terms](https://docs.anilist.co/guide/terms-of-use), [rate guidance](https://docs.anilist.co/guide/rate-limiting) and MAL terms immediately before any proposed activation; where needed obtain permissions. User goals cannot override provider controls. Cache/fallback preserves user data, never silently rebrands metadata origin.

## C05: iframe fallback scope

Updated product contract allows iframe and labeled hard subtitles after explicit consent if **actual correct playback** is evidenced. Legacy tests actively assert the opposite. Retire/revise tests only along with approved code changes and security review. Do not count discovered iframe URLs without observed playback, and do not show fake player controls.

## C06: cloud ownership and deletion

P63 automatic login sync is limited by RG05 to account-owned data. Guest data remains local until explicit claim/import. P46 logout retains data, P52 isolates accounts, P60 snapshots versioned and P70 bounded. Required: real email OTP; account A/B/anonymous RLS; CAS concurrent updates; two devices; import rollback; deletion and retention semantics; no tokens/media grants in backups. Keep [#78](https://github.com/rzqllh/Yoru/issues/78) open until evidence.

## C07–C09: live QA and release

[#20](https://github.com/rzqllh/Yoru/issues/20) still requires live provider coverage, correct episode identity, real subtitle search/download, physical iPhone Safari/PWA, production full-stack security and explicit owner GO. Mock tests, a READY Vercel deployment or a live metadata HTTP 200 do not satisfy these.

## Open parameters, not an invitation to invent defaults

- Exact limits for provider timeout/retry/cooldown, per-host quotas, rate errors.
- Snapshot retention number/count (30 days is illustrative), migration and delete guarantees.
- Minimum playback observation duration/segment count/device coverage and evidence freshness.
- Independent catalog boundary, eligible release date and uncertain metadata treatment.
- Explicit incident alert destination, rollback authority and kill-switch scope.
- Access privileges and legal/privacy justification for P71 broad production reads.
- Exact upstream inventory and entitlement per host.
- Consent scope and revocation for iframe fallback.
- Code ownership and PR/branch/deployment authorization.

**Current verdict: Decision Freeze DRAFT; security/coverage/source access blockers remain. No implementation or production release authorization.**

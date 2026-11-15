# 03 — Requirement Traceability Matrix

**Status:** TARGET + evidence pointers, NOT completed tests. **Truth:** [Decision register](../planning/owner-freeze-2026-11-15/DECISION_REGISTER.md) and [Open conflicts](../planning/owner-freeze-2026-11-15/OPEN_CONFLICTS.md). `P0` = correctness/security/release dependency; `P1` = core product UX; `P2` = conditional optimization. `FR` functional, `NFR` nonfunctional, `GATE` stop condition.

| ID | Priority | Must / acceptance invariant | Owner refs | Test link | Initial evidence state |
|---|---|---|---|---|---|
| FR-001 | P0 | Correct canonical MAL/AniList/provider identity, season/cour/movie/special | P17/P38 | DF-DATA-02, DF-SRC-02 | PARTIAL |
| FR-002 | P0 | Discovery broad, upcoming separate, no fabricated episodes/totals | P16/P19/RG07 | DF-DATA-04, DF-COV-01 | PARTIAL |
| FR-003 | P0 | All candidate sources distinct from verified playback | P04/P27/P59 | DF-SRC-01/02 | PARTIAL |
| FR-004 | P0 | Validated native HLS/MP4 or consented actually playable iframe/hardsub | P02/P03/P11/RG08 | DF-SRC-05/06 | **MISMATCH iframe path** |
| FR-005 | P0 | Provider isolated failover, bounded timeouts, health cooldown | P08/P34/P43 | DF-SRC-03/08 | PARTIAL |
| FR-006 | P0 | Subtitle provider independence and correct release/episode | P12/P35/P54 | DF-SUB-03/06 | PARTIAL; live blocked |
| FR-007 | P0 | Indonesian first, English consent, Off persistent | P12–P15 | DF-SUB-01/02/05 | SOURCE ALIGN; not live proved |
| FR-008 | P0 | All eligible already-aired catalog episodes verified before initial public release | P45/P55/P64/RG04/RG07 | DF-COV-01..06 | **BLOCKED C02** |
| FR-009 | P0 | Per-account IndexedDB isolation and guest ownership | P32/P52/RG05 | DF-SYNC-01/02 | MISSING on inspected main |
| FR-010 | P0 | Auto-sync account-owned only, CAS conflict/merge, two-device | P33/P41/P63/RG05 | DF-SYNC-02/03/06 | NOT MERGED / BLOCKED |
| FR-011 | P0 | Versioned snapshot and corruption-safe restore | P60/P70 | DF-SYNC-04 | PARTIAL local manual |
| FR-012 | P0 | No external provider activation without allowed access, identity and actual device proof | P62/RG02/RG09 | DF-SRC-10 | BLOCKED where unpermitted |
| FR-013 | P0 | AniList+MAL field-level authority subject to provider rights | P18/P38/RG10 | DF-DATA-01 | **BLOCKED C04** |
| FR-014 | P0 | Physical iPhone Safari and desktop Chrome acceptance | P39 | DF-SRC-11 / DF-REL-02 | NOT RUN |
| FR-015 | P0 | Production release only on explicit owner GO | P29/P50 | DF-REL-05 | NO-GO |
| FR-016 | P1 | Full-page anime detail on desktop and mobile | P21 | DF-UX-01 | **MISMATCH desktop** |
| FR-017 | P1 | Resume one-click with exact episode/timestamp | P22 | DF-PLAY-03 | SOURCE ALIGN / live not proved |
| FR-018 | P1 | Verified next episode and cancellable 8s countdown | P36 | DF-SRC-12 | PARTIAL identity |
| FR-019 | P1 | Home 8s hero with interaction/reduced motion | P24 | DF-UX-02 | SOURCE ALIGN / device pending |
| FR-020 | P1 | Mobile two columns and selectable Compact mode | P56 | DF-UX-03 | PARTIAL |
| FR-021 | P1 | Main Browse filters visible; advanced collapsible; URL state | P57 | DF-UX-04 | PARTIAL |
| FR-022 | P1 | Caption presets/manual styles where supported | P44/P58 | DF-SUB-04 | PARTIAL |
| FR-023 | P1 | Intro/recap skip only if verified timestamps | P49 | DF-PLAY-02 | MISSING |
| FR-024 | P1 | Offline shell/library/metadata, never imply offline video | P37/P47 | DF-UX-06 | PARTIAL |
| FR-025 | P1 | Metadata cache, fallback and provenance | P38/P53 | DF-DATA-03 | PARTIAL |
| FR-026 | P1 | Curated Watch Guide if verified, else release order | P23 | DF-UX-05 | PARTIAL |
| FR-027 | P2 | Provider discovery expands only unique verified playable coverage | P07/P62/RG02 | DF-SRC-02/10 | PLANNED |
| FR-028 | P2 | FlyStream used as architectural reference ONLY | RG01 | Code inventory | DECIDED |
| FR-029 | P1 | Honest after-launch newly unavailable episodes | P67 | DF-COV-05 | NOT RUN |

## Non-functional requirements

| ID | Priority | Invariant | References | Evidence |
|---|---|---|---|---|
| NFR-001 | P0 | **Only production hosted; preview/testing local only** | L01 | local workflow, Vercel config/deploy inventory |
| NFR-002 | P0 | No unapproved local access to real production DB, users or secrets | L01/P48 | local/CI secret scan, negative access tests |
| NFR-003 | P0 | Backend secret isolation, SSRF/DNS/redirect safety | P09/P48 | DF-SEC-01/02 |
| NFR-004 | P0 | No unpermitted anti-bot/DRM/control bypass or terms violation | RG09/RG10 | rights/permission signoff |
| NFR-005 | P0 | Technical logs minimal; no private watching history, tokens, signed URLs | P65 | DF-SEC-02 |
| NFR-006 | P0 | Reviewed exact SHA and distinct mock/live/device evidence | P26/P27/P39 | DF-REL-01/02 |
| NFR-007 | P0 | Rollback production requires owner except previously authorized disable-only provider switch | P50/P69 | DF-SEC-05 |
| NFR-008 | P1 | Controls truthful/capability gated, error states recoverable | P15/P59 | DF-PLAY-01/DF-SRC-03 |
| NFR-009 | P1 | Accessibility, safe area, Back/Forward, stored preferences | P21/P24/P56 | DF-UX-01/02/03 |
| NFR-010 | P1 | Bounded cache and retries, progress preserved | P43/P47 | DF-SRC-03/DF-UX-06 |

## BLOCKED / owner decision dependencies

| Blocker ID | Conflict | What may proceed | What must stop |
|---|---|---|---|
| YOR-BLK-001 | P68 provider-defined release vs P55/RG07 entire aired coverage (C02) | Catalog/identity analysis, draft denominator options | 100% PASS and public-release signoff |
| YOR-BLK-002 | RG09 unpermitted upstream anti-bot approach (C03) | Allowed integration research | Unauthorized access-control bypass |
| YOR-BLK-003 | RG10 AniList/MAL usage despite ToU limits (C04) | Eligibility review and alternatives | Unapproved API use/guaranteed availability |
| YOR-BLK-004 | Real OTP/RLS and account data isolation not verified | Local conceptual design, nonprod fixtures | Production cloud activation |
| YOR-BLK-005 | Physical iPhone/live media/subtitle proof missing | Controlled local QA prep | Claim public-ready |
| YOR-BLK-006 | Unknown production-data access need from local | Read-only analysis and test fixtures | Connect local to prod without authorization |

## Implementation-to-acceptance rule

An agent cannot set `DONE` from documentation, API HTTP 200, URL discovery, a fixture suite, or a PR merge. Each requirement needs an exact-SHA implementation pointer, unit/browser test, proper live/device evidence if applicable, and owner approval for security/production changes. If evidence lacks source or the requirement needs unapproved assumption, output the [AGENTS blocker template](../../AGENTS.md).

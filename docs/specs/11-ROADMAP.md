# 11 — Roadmap, Work Packages, Priorities and Gates

**Status:** Proposed planning, **not** implementation approval or a guaranteed schedule. Baseline: [Decision Freeze](../planning/owner-freeze-2026-11-15/README.md), [Code Audit](../planning/owner-freeze-2026-11-15/CODE_ALIGNMENT_AUDIT.md), [PRD](01-PRD.md), [Requirements](03-REQUIREMENTS.md), [Execution Plan](../planning/owner-freeze-2026-11-15/EXECUTION_PLAN.md).

## Priority definitions

- **P0:** release integrity, privacy/security, actual source correctness, live verification and prerequisites that block all downstream milestones.
- **P1:** core user-facing UX/features already chosen by owner; may be implemented separately after scope approval and dependencies.
- **P2:** optimization and extra source research after the core is reliable; no unsanctioned scope creep.
- **BLOCKED:** dependent on owner answer, third-party permission, exact source code evidence, credentials/DB design or real device. Not the same as 'in progress'.

## Phased work packages (dependency order)

| Phase | Theme | Work | Dependencies | Gate to exit |
|---|---|---|---|---|
| E00 | Audit/decision baseline | Repo HEAD/worktrees, existing issues, source/code vs latest spec, contract traceability | None | All mismatches/open blockers listed; no local work destroyed |
| E01 | Owner/security/permissions | C02 episode denominator, C03 provider authorization, C04 AniList terms; verify L01 local/test isolation | E00 | Written owner/permission decisions or explicit BLOCKED verdict |
| E02 | Canonical identity & adapter contract | Titles/seasons/cours/specials, source states, failover/SSRF rules | E01 for affected sources | Unit/contracts & negative mapping cases |
| E03 | Single real watch-path proof | One authorized video on Chrome + physical Safari, correct episode, subtitle, resume | E02 and permissions | Real playable media evidence, source and exact SHA; no fake READY |
| E04 | Staged source expansion | Otakudesu and other permitted candidates; health/cooldown/kill switch | E03 | Each provider adds unique verified playable episodes |
| E05 | Metadata & discovery | AniList/MAL field provenance if permitted, catalog, filters, cache, upcoming | E01/E02 | IDs & taxonomy cross-source, routes and fallback tested |
| E06 | Player and UX | Full-page desktop detail, compact cards, advanced filters, caption presets, intro markers, Watch Guide | E02/E05 | Browser/mobile accessibility and product tests |
| E07 | Account-local/cloud | Guest/account isolation, auth, OTP, RLS, CAS, snapshots, account deletion | E01 + data/API owner approval | Two-user/two-device tests and safe recovery |
| E08 | Integrated QA / catalog coverage | Full representative and target-wide tests, live providers/subtitles, iPhone and Chrome, security review | E03–E07 and C02 | Exact-SHA evidence; zero unresolved critical gaps |
| E09 | Production release gate | Owner review, production only deploy, observe/recovery, ops documentation | E08/#20 | Owner GO or explicit NO-GO; never auto deploy |

E05/E06/E07 may be **planned** in parallel; code edits to `App.tsx`, `Player.tsx`, models, router, API and data schema must have coordinated ownership. No timing SLA is assumed.

## P0 backlog with evidence

| ID | Deliverable | Validation |
|---|---|---|
| P0-01 | Decision/register/AGENTS/spec alignment | Owner supersession matrix, exact SHA |
| P0-02 | L01 local-only preview verification | No hosted preview dependency; isolated local data, no prod credential transfer |
| P0-03 | Upstream entitlement / metadata ToU review | Allow/deny verdict by provider, no bypass |
| P0-04 | Source-independent release eligibility/coverage definition | P68 conflict resolved, numerator/denominator test |
| P0-05 | Canonical anime/episode edition matching | Wrong cour/movie/special negative tests |
| P0-06 | Verified native and consented fallback playback | Real episode in Safari/Chrome, honest source state |
| P0-07 | SSRF/rate/health/failover/kill switch | Negative network and disable-only tests |
| P0-08 | Live federated subtitle with consent and correct release | Real rendered Indonesian/English track |
| P0-09 | Per-account local isolation and guest ownership | Shared-device A/B/guest tests |
| P0-10 | Cloud sync, RLS, CAS and backups | Two account/devices, corruption/restore/deletion |
| P0-11 | Physical device QA | iPhone Safari PWA, captions, video, safe area |
| P0-12 | Final infrastructure/release | Exact-SHA production, logs/rollback, owner GO |

## P1 backlog

| ID | Deliverable |
|---|---|
| P1-01 | Hybrid metadata per-field provenance and stale fallback |
| P1-02 | Full-page anime detail desktop and mobile |
| P1-03 | Two-column card default plus Compact selector |
| P1-04 | Browse visible-primary and expandable advanced filters |
| P1-05 | Player intro/recap skip with trusted markers, no fabricated controls |
| P1-06 | Subtitle quick presets plus manual styles |
| P1-07 | Watch Guide curated/release fallback and edition relations |
| P1-08 | Offline metadata/detail cache and bounded cleanup |
| P1-09 | Stable source health ranking and recovery |
| P1-10 | First-run, empty/error states, accessibility and mobile responsive |

## P2 backlog — conditional

- Additional authorized providers that increase **unique verified episode playback**, not merely adapter count.
- Read-only architecture evaluation of anime-sdk and AniStream.
- FlyStream **reference-only**, no integration or scraping.
- Android/other device parity after iPhone+Chrome acceptance.
- Advanced recommendation relevance and runtime performance metrics after measurement.
- Torrent resolver **deferred**; a separately approved architecture decision is required before any work.

## Per-slice delivery template

```text
Slice: E## / P#-##
Owner decision refs and requirement IDs:
Exact base SHA / target branch:
Known current implementation and mismatch:
In scope / out of scope:
Files/modules allowed to change:
DB/API/upstream/security/preview impact:
Blocked dependencies and external permissions:
Unit/contract/browser/security/live/iPhone tests:
Rollback / legacy compatibility:
Owner approval and signoff:
Observed evidence:
Final status: CODED | TESTED_FIXTURE | TESTED_BROWSER | LIVE_VERIFIED | BLOCKED
```

## Stop-the-line gates

- Unknown API/table/provider mapping/design assumptions → **BLOCKED**, do not auto invent.
- P68 full coverage denominator unresolved → cannot certify public 100%.
- RG09/RG10 third-party restrictions unresolved → no unpermitted access.
- Cloud account separation and real OTP/RLS not tested → no production sync activation.
- Real source/video/subtitle and physical Safari missing → no public release.
- Scope, production deploy, new hosted preview, secrets, DB/RLS or billing not authorized → stop and seek owner confirmation.

## Repository governance

This roadmap is an artifact inside draft PR #161. **Owner review of docs is separate from implementation authorization**. Avoid branch/worktree cleanup, force push, automatic deployment, installer generation or feature activation unless separately scoped. If the implementation branch changes after the original audit, re-baseline and update mismatch references first.

# Yoru — Requirement, Evidence and Blocker Tracker

> **Snapshot:** 2026-10-31 (Asia/Jakarta) · audited `main 2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> This is a **planning snapshot**, not a live dashboard. Update with dated actual observations after each PR/review.

## Status protocol

- **VERIFIED CODE:** identified in merged main; does not imply user-journey PASS.
- **TESTED:** acceptance on a specified commit/test/environment with linked evidence.
- **LIVE_VERIFIED:** actual provider/device/production check, not fixture.
- **PARTIAL:** relevant implementation exists, some acceptance fails or is not yet checked.
- **PLANNED:** approved contract but no implementation evidence.
- **BLOCKED:** external input, approval, environment or release gate needed.
- **UNKNOWN:** insufficient evidence; do not silently mark DONE.

Owners below are **responsibility roles**, not claims that any specific person/agent has performed work. A real assignee is added only on assignment. Links to historical PRs are background evidence, not proof of latest acceptance.

## Phase and requirement ledger

| ID | Phase | Requirement / decision | Status as of snapshot | Responsible role | PR / main source | Acceptance / remaining evidence |
| --- | --- | --- | --- | --- | --- | --- |
| GOV-01 | 00 | Owner UX/CX decisions D01–D09 captured | DOCUMENTED | Product owner | This directory | Review/approve PR; no code changed |
| BASE-01 | 00 | Repository inventory, existing source, CI and gates | PARTIAL | Engineering | [main](https://github.com/rzqllh/Yoru/commit/2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b), [#44](https://github.com/rzqllh/Yoru/issues/44) | Recheck before implementation |
| SRC-01 / YX-01 | 01 | Resume checked source/progress and no silent fallback | PARTIAL | Playback engineering | [#52](https://github.com/rzqllh/Yoru/pull/52), [#88](https://github.com/rzqllh/Yoru/pull/88) | AC-SRC-01, 02; representative actual media |
| SRC-02 / YX-02 | 01 | Source state/candidate validation/ranking | PARTIAL | Playback engineering | [#86](https://github.com/rzqllh/Yoru/pull/86), [#97](https://github.com/rzqllh/Yoru/pull/97) | AC-SRC-03, 04; live G1/G2 |
| SRC-03 / YX-18 | 01 | Distinguish Stremio direct URL/hash/external | VERIFIED CODE | API engineering | `backend/providers/stremio-core.ts`, [#51](https://github.com/rzqllh/Yoru/pull/51) | AC-SRC-05; real addon fixture/provider |
| SRC-04 / YX-19 | 01 | Torrentio-only torrent engine/resolver | BLOCKED — ARCHITECTURE NOT APPROVED | Product owner + security | [#44](https://github.com/rzqllh/Yoru/issues/44) | Explicit opt-in/rights/hosting/browser plan; no automatic torrent start |
| SRC-05 / D02 | 01 | Exclude uncontrolled iframe from playable options | MERGED + MAIN CI TESTED (D02 only) | Playback/UX | Legacy `App.tsx` / `Player.tsx` fallback | AC-SRC-06; source-gating regression |
| SRC-06 / YX-03 | 01 | Honest native quality Auto and resolution labels | PARTIAL | Playback engineering | [#97](https://github.com/rzqllh/Yoru/pull/97) | AC-SRC-07; real manifest levels |
| SUB-01 / D01 | 02 | English requires explicit confirmation; Sub Indo preferred | TESTED IN PR #101; MERGE PENDING / LIVE BLOCKED | Player/UX | `Player.tsx`, [#21](https://github.com/rzqllh/Yoru/pull/21) | AC-SUB-01/02; current native auto-English behaviour must change |
| SUB-02 / D09 | 02 | Caption presets/font/size/contrast/position | PARTIAL | Player/UX | [#55](https://github.com/rzqllh/Yoru/pull/55), `caption-appearance.ts` | AC-SUB-03/04; browser capability |
| SUB-03 | 02 | Subtitle season/cour/episode mapping | PLANNED | API/data | `backend/providers/subtitles.ts` has hardcoded season=1 | AC-SUB-05/06 |
| SUB-04 | 02 | OpenSubtitles/SubDL/SubSource/Stremio APIs | CODED, LIVE BLOCKED | API engineering + owner inputs | [#21](https://github.com/rzqllh/Yoru/pull/21), [#28](https://github.com/rzqllh/Yoru/pull/28), [#32](https://github.com/rzqllh/Yoru/pull/32) | AC-SUB-07/08; #20 R-G3 |
| HOME-01 / D06 | 03 | Hero 8s pause/hover/focus/swipe/no old controls | PARTIAL (8s timer only) | UI engineering | `App.tsx` current hero | AC-HOME-01..04 |
| HOME-02 / D07 | 03 | Anime Popular label and uniform 2:3 grid | PLANNED | UI engineering | `App.tsx` / `styles.css` | AC-HOME-05/06 |
| DS-01 / YX-15 | 03 | Shared tokens/cards/forms, responsive/a11y | PARTIAL | Design engineering | `DESIGN.md` and `styles.css` | AC-UX-01..03 |
| BROWSE-01 / D03 | 04 | Tenrai/MAL identity + AniList enrichment | PLANNED (existing isolated daily/guide data) | Data/API engineering | `backend/pipeline` | AC-DATA-01..04 |
| BROWSE-02 | 04 | Dynamic AniList genres/tags and honest filters | PLANNED (currently 12) | Data/API engineering | `backend/api/app.ts` + `router.ts` | AC-DATA-05..08 |
| BROWSE-03 / D08 | 04 | Separate Akan Datang and Watch Guide destinations | PLANNED | UX/navigation | `App.tsx` / `router.ts` | AC-DATA-09 |
| DETAIL-01 / D04 | 05 | Mobile full-page /anime/:malId and history | PLANNED (currently dialog) | UX/router | `App.tsx` | AC-DETAIL-01..05 |
| GUIDE-01 / D05 | 06 | Release/curated paths, uncertainty and editions | PARTIAL | Guide/UX | [#72](https://github.com/rzqllh/Yoru/pull/72), `WatchGuide.tsx` | AC-GUIDE-01..05 |
| GUIDE-02 / YX-10 | 06 | Manual path progress/backup compatibility | PARTIAL | Local data | [#64](https://github.com/rzqllh/Yoru/pull/64), [#81](https://github.com/rzqllh/Yoru/pull/81) | AC-GUIDE-06 |
| DATA-LOCAL | 07 | IndexedDB, validated import/export, PWA | PARTIAL | Local data/security | `frontend/src/lib/db.ts`, `backup.ts` | AC-LOCAL-01..04; real device |
| SYNC-01 | 07 | Opt-in cloud manual snapshot, OTP, CAS, RLS | DRAFT / BLOCKED | Sync engineering + owner | [draft #77](https://github.com/rzqllh/Yoru/pull/77), [#78](https://github.com/rzqllh/Yoru/issues/78) | AC-SYNC-01..07; real two-account/2-device |
| QA-01 | 08 | Exact main Linux/Windows CI and Chromium/WebKit | TESTED for `2b6c1d4` only | QA/engineering | [CI](https://github.com/rzqllh/Yoru/actions/runs/41218153012), [E2E](https://github.com/rzqllh/Yoru/actions/runs/41218152990) | Retest future implementation SHA |
| QA-02 | 08 | Physical iPhone Safari/PWA | BLOCKED | Device tester/owner | [#20](https://github.com/rzqllh/Yoru/issues/20) | AC-DEVICE-01..05 |
| QA-03 | 08 | Security/perf/a11y/failure regressions | PARTIAL | QA/security | `tests/`, `scripts/` | AC-SEC/UX/PERF tests |
| HOST-01 | 09 | Latest production SHA and live catalog API | PARTIAL / LIVE UNKNOWN | Hosting engineering | [Vercel project](https://vercel.com/rzqllhs-projects/yoru) | Production READY SHA `5496aae`, main `2b6c1d4`; live health/discover recheck |
| HOST-02 | 09 | Automatic deployments separated from merge | VERIFIED CONFIG | Release engineering | `vercel.json` `deploymentEnabled:false`, [#90](https://github.com/rzqllh/Yoru/pull/90) | Don't change without approval |
| REL-01 | 09 | G1–G6 final public release | BLOCKED | Product owner + release team | [#20](https://github.com/rzqllh/Yoru/issues/20) | AC-REL-01..06; explicit GO |

## Concrete evidence ledger (do not extrapolate)

| Evidence | SHA | Result recorded | Scope / limitation |
| --- | --- | --- | --- |
| [Merged-main CI](https://github.com/rzqllh/Yoru/actions/runs/41218153012) | `2b6c1d4` | SUCCESS (as linked in merged PR #97) | Linux/Windows deterministic checks |
| [Merged-main Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41218152990) | `2b6c1d4` | SUCCESS (as linked in merged PR #97) | Chromium/WebKit; not iPhone |
| [PR #77 CI](https://github.com/rzqllh/Yoru/actions/runs/41207906569) and [E2E](https://github.com/rzqllh/Yoru/actions/runs/41207906589) | `06e0e72` draft head | SUCCESS recorded for that historical head | Real user OTP/isolated accounts/devices absent |
| [#78 cloud tests](https://github.com/rzqllh/Yoru/issues/78) | staging schema migrations as logged | Anonymous access denied; schema checks | Two authenticated accounts not tested |
| Vercel project deployment `dpl_514E91c6XQkRCvF2wS5YumdgvgrU` | `5496aae` | READY in Vercel deployment listing (snapshot) | READY != verified HTTP health/catalog, older than current main |
| User iPhone screenshots (conversation, 2026-10-31) | observed deployment not fully tied to exact SHA | Visually confirmed subtitle/hero/grid/filter issues | Not physical functionality PASS |
| [#20](https://github.com/rzqllh/Yoru/issues/20) | issue evidence snapshot | Release BLOCKED | All G1–G6 need live acceptance |

## Blockers, risks, mitigation and required decisions

| Risk / blocker | Severity | Next safe action | Approval/evidence needed |
| --- | --- | --- | --- |
| Torrentio hash returned without browser-compatible stream | P0 product | Keep disabled diagnostic classification; research optional supported resolver/engine | Owner architecture + rights/security + actual browser test |
| D02 makes current uncontrolled AnimeEmbed fallback ineligible | P0 product | Gate playable selector; clear empty state; audit source coverage | Explicit owner choice already made; code/tests pending |
| Video season/episode cannot be proven via provider metadata alone | P0 correctness | Strict mapping, verify examples including season 3, specials/movie | Real release/provider sample |
| Subtitle API credentials/live/quotas missing | P0 release | Fail-closed live verifier, secure backend-only setup | Owner/provider account and rate entitlement |
| Static subtitle season=1 | P0 correctness | Replace with verified season mapping, exclude uncertain auto-selection | Regression + live proof |
| Production READY but behind main and no live catalog evidence | P0 hosting | Compare aliases/SHA, probe `/api/health` and `/api/anime/discover`, collect logs | Official Vercel deployment gate, no quota workaround |
| Vercel ignored build step and daily 402 history | P1 operations | Check current ignored step/plan limits, use official non-abusive workflow | Owner approval before changed production settings/payment |
| #77 OTP / 2 accounts / device tests absent | P0 privacy | Keep draft disabled; conduct owner-assisted real test plan | Approved users/devices/privacy review |
| AniList enrichment mapping/429 | P1 data | Cache, bound queries, provenance, empty-idMal behaviour | Source-backed API test |
| iPhone physical acceptance absent | P0 release | Execute documented manual matrix | Actual iOS tester/evidence |
| Long-lived docs drift | P1 process | Update tracking/hand-off per PR and refresh source snapshot | Review under docs PR |

## Current work queue

1. Review and merge **documentation only** after owner approval; do not auto-deploy.
2. Phase 01 source eligibility and Torrentio compatibility *design* (no resolver installation without authorization).
3. Phase 02 subtitle correctness and English opt-in.
4. Phase 03 visual/interaction consistency; Phase 04 hybrid browse on isolated branches.
5. Phase 05 full-page detail, Phase 06 guide; Phase 07 local/cloud separate.
6. Phase 08 comprehensive validation; Phase 09 live release gate.

Keep #44/#20/#78 synced to verifiable outcome, not aspirational completion.

## Engineering checkpoint — 2026-10-31, D02

- Phase 00 planning integrated via [PR #98](https://github.com/rzqllh/Yoru/pull/98) into `ab5f1723267570cecc63ea765332dccabc6c9a76` (its exact PR-head CI/Browser checks succeeded).
- Phase 01 slice D02 branch `fix/y01-uncontrolled-embed-gate-20261031` has code commit `bf79c92` and test commit `36d34d0`, before handoff update. **Tests pending; NOT MERGED**. Only frontend source selection, result classification and related tests changed. No Vercel/Supabase/dependency/provider configuration.
- This slice deliberately removes uncontrolled iframe fallback, even if that reduces apparent video availability. Torrentio torrent-only candidates remain disabled; no resolver has been installed. See [Phase 01 handoff](handoffs/PHASE_01_HANDOFF.md).

- **PR #100 evidence update:** code/test head `a91e7ec` [CI Linux/Windows SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41220260198), [Browser Chromium/WebKit SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41220260118). Documentation follow-up changes SHA; exact final head must be rechecked. No live media/iPhone acceptance.

- **D02 main merge:** PR #100 merged at `f021a85658895123cbc17e02e0ba55d43cf11d7f`. Final PR head `6e3af557` checks [CI SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41220492467), [Chromium/WebKit SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41220492441). Merged-main checks pending at checkpoint; no live production verification.

- **2026-10-31 — Phase 02 D01:** Player English auto fallback removed and explicit English-offer controls introduced on branch `fix/y02-english-subtitle-consent-20261031` code `963b686a`, browser regression `528f70a`. Tests pending; do not mark tested or live. Exact merged-main Phase 01 [CI](https://github.com/rzqllh/Yoru/actions/runs/41220660439) and [Browser](https://github.com/rzqllh/Yoru/actions/runs/41220660473) SUCCESS for `f021a85`.

- **D01 PR #101 corrected head `d02aef2`:** four jobs SUCCESS at [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41221159658) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41221159599). First head failed lint and is not counted; final docs SHA must be rechecked. Live SubDL/OpenSubtitles/SubSource and iOS acceptance still pending.

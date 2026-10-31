> **Quick latest status:** [CURRENT_STATE.md](CURRENT_STATE.md) — dated, plain-language Done / Partial / Blocker / Next. Verify HEAD before use.

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
| SUB-01 / D01 | 02 | English requires explicit confirmation; Sub Indo preferred | MERGED PR #101 / PR-HEAD TESTED; LIVE BLOCKED | Player/UX | `Player.tsx`, [#21](https://github.com/rzqllh/Yoru/pull/21) | AC-SUB-01/02; current native auto-English behaviour must change |
| SUB-02 / D09 | 02 | Caption presets/font/size/contrast/position | MERGED PR #103 / PR-HEAD TESTED; IPHONE PENDING | Player/UX | [#55](https://github.com/rzqllh/Yoru/pull/55), `caption-appearance.ts` | AC-SUB-03/04; browser capability |
| SUB-03 | 02 | Subtitle season/cour/episode mapping | PARTIAL: #105/#107 GUARDS MERGED; LIVE MAPPING BLOCKED | API/data | Season-1 default removed by #107; mapping remains partial | AC-SUB-05/06 |
| SUB-04 | 02 | OpenSubtitles/SubDL/SubSource/Stremio APIs | CODED, LIVE BLOCKED | API engineering + owner inputs | [#21](https://github.com/rzqllh/Yoru/pull/21), [#28](https://github.com/rzqllh/Yoru/pull/28), [#32](https://github.com/rzqllh/Yoru/pull/32) | AC-SUB-07/08; #20 R-G3 |
| HOME-01 / D06 | 03 | Hero 8s pause/hover/focus/swipe/no old controls | MERGED #106 + CI; IPHONE PENDING | UI engineering | `App.tsx` current hero | AC-HOME-01..04 |
| HOME-02 / D07 | 03 | Anime Popular label and uniform 2:3 grid | MERGED #106/#108 + CI; IPHONE PENDING | UI engineering | `App.tsx` / `styles.css` | AC-HOME-05/06 |
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

- **D01 merge checkpoint:** PR #101 merged to main `7a6086880b89c83a854b79165d7b6e1897b38660`. Exact PR-head checks PASS: [CI](https://github.com/rzqllh/Yoru/actions/runs/41221351877), [browser](https://github.com/rzqllh/Yoru/actions/runs/41221351895). Exact merged-main checks pending when recorded. Phase 02 as a whole remains PARTIAL, G3 blocked.

- **D09 caption defaults slice:** branch `fix/y02-native-caption-defaults-20261031`, 90% size/50% background/system sans default, retains user-overridden settings; tests and physical iPhone NOT RUN at checkpoint. Main handoff #102 merged at `36176a1`.

- **PR #103 D09:** exact code head `b56cae5`, 4/4 checks [CI](https://github.com/rzqllh/Yoru/actions/runs/41222013660), [browser](https://github.com/rzqllh/Yoru/actions/runs/41222013653) SUCCESS. Docs follow-up exact SHA still requires verification; live Safari/legibility unknown.

- **D09 merged:** [PR #103](https://github.com/rzqllh/Yoru/pull/103) main `6b13e0016670ab443ebd6cb1d212534656dff44b`, final head [CI](https://github.com/rzqllh/Yoru/actions/runs/41222189020) + [Browser](https://github.com/rzqllh/Yoru/actions/runs/41222188893) 4/4 SUCCESS. Current merged-main checks pending at checkpoint. New subtitle defaults are code shipped to `main`, NOT production/device/live-verified.

- **2026-11-01 — Phase 02 season guard:** `fix/y02-explicit-season-subtitles-20261101`, code `92a2fd4`, tests `758d97d`. Hardcoded search season 1 removed; explicit season-number titles must match provider season identity; ambiguous/unverified season results fail closed. CI/live providers NOT RUN; see [Phase 02 handoff](handoffs/PHASE_02_HANDOFF.md). This does not close #20 G3.

- **2026-11-01 — Phase 03 D06/D07:** branch `feat/y03-swipe-hero-20261101`, code `e2e4729`, CSS `d85538c`, browser tests `184536a`. Removed hero numbering/controls, added pause and swipe, renamed Anime Popular. **CI NOT RUN, NOT MERGED**, see [Phase 03 handoff](handoffs/PHASE_03_HANDOFF.md).

- **PR #106:** corrected code SHA `3134282` passes [CI](https://github.com/rzqllh/Yoru/actions/runs/41223942927) and [Browser](https://github.com/rzqllh/Yoru/actions/runs/41223942739) 4/4. Documentation follow-up is not yet tested; no physical swipe evidence or 2:3 grid polish.

- **2026-11-01 — merge-conflict resolution:** PR #107 subtitle-season code and permanent notes from main `dc2bd458` retained; Phase 03 test and notes merged without overwrite. Combined exact-head CI pending.

- **2026-11-01 — D07 Anime Popular grid:** branch `fix/y03-anime-popular-grid-20261101`, targeted full-column 2:3 ranked posters, title width and rank/score separation. 320px/390px browser fixture tests added. CI/physical iPhone NOT RUN; see [Phase 03 handoff](handoffs/PHASE_03_HANDOFF.md).

- **2026-11-01 — Integrated checkpoint:** [#107](https://github.com/rzqllh/Yoru/pull/107) at `dc2bd45`, [#106](https://github.com/rzqllh/Yoru/pull/106) at `f21c4a8`, [#108](https://github.com/rzqllh/Yoru/pull/108) at `b4f35bd` merged. PR heads 4/4 CI+browser PASS. Main #107 and #106 exact SHAs 4/4 PASS; #108 main `b4f35bd` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41225040383) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41225040380) SUCCESS 4/4. Existing earlier pending/failed rows remain history only. Cloud #77 still draft; live media/subtitle and iPhone not tested; public release #20 blocked. [Current state](CURRENT_STATE.md).


### 2026-11-01 — Resumed Phase 04 engineering result

- **MERGED:** [#111](https://github.com/rzqllh/Yoru/pull/111) → `main` `ae9bc81ae00ce61cba5abcdd4d1be34edb465327`. Browse label uses loaded count **“N ditampilkan”** (AC-DATA-08 partially addressed) and default sort accurately reads **“Paling populer”**. Exact PR head `0f3db7a`: [CI](https://github.com/rzqllh/Yoru/actions/runs/41227101975) and [Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41227101983) SUCCESS (4/4 jobs; fixture, not live). Dynamic AniList genres/tags and correct canonical matching/filter semantics remain PLANNED; no live production iPhone/media/subtitle certification or deployment.
- **Recovery audit:** [#110](https://github.com/rzqllh/Yoru/pull/110) persists source and hosting facts, release/sync/branch-cleanup blockers and exact-SHA evidence. Production READY but still on `5496aae` until approved deployment. `/api/health` and `/api/anime/discover` live HTTP checks remain UNKNOWN from this tool environment.

### 2026-11-01 — Y04 independent genre API slice

- **CODED / PENDING CI:** `feat/y04-tenrai-genre-options-20261101`. New isolated `/api/anime/genres` Tenrai-backed genre-option contract with source provenance and safe fallback; dedicated negative/source-cache/API tests. Phase 04 full dynamic filter integration **NOT DONE**, AniList tag taxonomy **NOT DONE**, live source and production **NOT VERIFIED**. No change to existing 12 static Browse options. See [Phase 04 handoff](handoffs/PHASE_04_HANDOFF.md).

- **PR #116 checkpoint (not a UI release):** source-labeled Tenrai canonical genre options and safe 12-item fallback implemented; code head `27eb458` [CI Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41244040283) + [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41244040288) SUCCESS. Initial TypeScript loader failure corrected; current docs head and final main still require rechecks. Dynamic Browse options, server acceptance of newly listed genres, AniList tags and live Tenrai verification **NOT DONE**.

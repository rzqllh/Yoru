> **Quick latest status:** [CURRENT_STATE.md](CURRENT_STATE.md) — dated, plain-language Done / Partial / Blocker / Next. Verify HEAD before use.

# Yoru — Requirement, Evidence and Blocker Tracker

### 2026-11-01 — Phase 05 long episode pagination correctness (#147)

- [PR #147](https://github.com/rzqllh/Yoru/pull/147), code/test head `91fb3d4b41324c37f00d56c7bab74ba36ded0ee7`: serializes next-page episode requests (synchronous in-flight guard, disabled/aria-busy loading UI), aborts outstanding requests on detail exit/change, resets page cursor, validates response page number, deduplicates overlapping episode identities, and keeps loaded rows available for retry after HTTP/invalid-page failure.
- Deterministic browser fixtures cover 100 episodes across five pages with a held request, overlapping boundary, no duplicate fetch, and two error/retry modes. [Linux/Windows CI #41282282090](https://github.com/rzqllh/Yoru/actions/runs/41282282090) **SUCCESS** and [Chromium/WebKit #41282282063](https://github.com/rzqllh/Yoru/actions/runs/41282282063) **SUCCESS** (four jobs) on that exact code/test head. **Documentation-added final PR-head checks and merged-main checks are separate, not yet claimed.**
- Phase 05 AC-DETAIL-05 is **PARTIAL**: long-list pagination correctness fixture now verified; responsive physical iPhone/landscape/safe-area, semantic document detail, live provider/source/subtitle and production acceptance are still NOT VERIFIED. #20 remains NO-GO. No auth, provider config, security policy, database, dependency, production or release changes.


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

### 2026-11-01 — Y04 source-backed genre UI/URL integration

- **CODED / CI PENDING:** `feat/y04-genre-filter-ui-20261101` integrates merged #116 into Browse UI and backend. New Tenrai-validated MAL genre IDs are passed to server-side filtered/paginated requests. Legacy `genre=Action` continues to work; new values like `genre=mal%3A46` can round-trip. Fallback remains explicit when the taxonomy service is unavailable. API rejects unknown/adult numeric IDs rather than returning unfiltered matches.
- **NOT DONE:** Complete AniList genre/tag taxonomy, source-provenance enrichment, live Tenrai search matrix, independent performance/device gate, and release #20. No production/deployment configuration change.

- **PR #117 exact code evidence:** `9fa0143` [CI Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41244704532) + [Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41244698662) SUCCESS. Dynamic Tenrai/MAL genres now implemented in isolated branch UI/router/server, not yet merged or deployed at this checkpoint; AniList tags and live media/devices remain NOT VERIFIED.

### 2026-11-01 — Y04 merged API + UI status

- **MERGED:** #116 `ae43a69` genre-option API + safe fallback; #117 `4157fec` dynamic source-backed MAL genre UI/router/server filters. #117 PR head `f9982aa` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41244901215) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41244896643) SUCCESS. Exact merged-main [CI](https://github.com/rzqllh/Yoru/actions/runs/41245111173) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41245111417) initiated, pending final conclusion at time of checkpoint. **AC-DATA-05/06 PARTIAL**: live provider and AniList taxonomy/tags not accepted. Production unchanged and #20 NO-GO.


### 2026-11-01 — New execution checkpoint, Phase 04 D08

- **CODED, AWAITING CI:** [PR #123](https://github.com/rzqllh/Yoru/pull/123) separates `/jelajahi/akan-datang` as destination instead of third browse category tab, with a return CTA and mobile URL/reload browser regression. This implements only D08 discovery hierarchy slice; main, production, providers, Supabase remain unchanged until reviewed merge. Exact SHA and CI/browser URLs must be recorded after verification. AC-DATA-09 PARTIAL, NOT DONE pending evidence.
- **Current verified baseline:** `main` `50d80ed4f0ee4550f7175c72346d5a121f9d389e`, prior merged PR #122. [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41266056770) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41266056746) SUCCESS. Production remains older READY deployment `5496aae` according to last Vercel project inspection; live `/api/health` and `/api/anime/discover` remain UNKNOWN (no HTTP response from available web probe).

## 2026-11-01 owner vNext source-of-truth checkpoint

**2026-11-01 vNext owner supersession.** Inspected GitHub main [`ce12d98`](https://github.com/rzqllh/Yoru/commit/ce12d98678f6e89cefd81516fb641c62df972572); this is **DOCS ONLY**, not hosted/provider verification. D03=**3A AniList-primary** replaces archival D03=3B Tenrai/MAL-primary. D01=1A, D02=2B, D04=4A, D05=5A, D06–D09 retained. Existing Tenrai/MAL code remains until an approved reversible migration.

| Workstream | State (this checkpoint) | Evidence / next gate |
| --- | --- | --- |
| Subtitle consent/readability D01/D09 | CODED / LIVE NOT VERIFIED | merged PR #101/#103/#107; actual provider + iPhone pending |
| Source eligibility D02 | CODED / LIVE NOT VERIFIED | merged #100; confirm all configured streams never reveal uncontrolled iframe |
| Torrentio / Stremio video and addon subtitles | CODED/PARTIAL | `stremio.ts`, `stremio-core.ts`; real manifest/provider capability matrix and exact episode verification pending; torrent descriptor still unavailable |
| OpenSubtitles/SubSource/SubDL direct API | CODED/PARTIAL | Independent backend adapters; third-party live API keys/downloads not signed off; cannot assume Torrentio proxy |
| D03=3A AniList-primary | **PLANNED / APPROVAL-GATED** | Existing #116/#117 Tenrai/MAL dynamic genres transitional; AniList ToU and reversible identity/backup architecture needed |
| Hero and Anime Popular | CODED/PARTIAL | merged #106/#108, physical iPhone visual tests pending |
| Upcoming and filter/guide UI | PARTIAL | PR #123 open at checkpoint; separate review and CI required |
| Full-page Detail D04 / Guide D05 | PLANNED/PARTIAL | MAL legacy URL and AniList-only route plan; end-to-end history/episode/guide tests |
| Cloud PR #77 / issue #78 | DRAFT / BLOCKED | two OTP users, RLS, devices, privacy and planned ID migration compatibility |
| Production/public release | BLOCKED | #20 G1–G6, live endpoints, authorized video/subtitles, real iPhone, owner GO |

### Planned Torrentio/Stremio stream + subtitle federation (not resolver activation)

- A configured Stremio addon declares `stream` and/or `subtitles` via its `manifest.json`. **Torrentio is a candidate video stream addon, not an automatic OpenSubtitles/SubSource/SubDL API gateway**. Use separate Stremio `/stream` and `/subtitles` resources where declared; direct OpenSubtitles, SubSource and SubDL APIs remain independent backend adapters, or a distinct subtitle-only Stremio addon can be configured.
- The current Yoru source files `backend/providers/stremio.ts`, `stremio-core.ts` and `backend/providers/subtitles.ts` already implement configured addon candidate classification, addon subtitle resources and independent direct API adapters. Label this **CODED/PARTIAL**; no live Torrentio/third-party API compatibility, actual playback, provider rights or physical iPhone PASS may be assumed.
- Exact validated anime identity, season/cour/movie/special, episode, language and subtitle release must match before joining candidates or ranking them. Rank by real native playability, source health, subtitle control/Indonesian match, then prior healthy source. D01 requires explicit English consent; Off persists. D02 excludes uncontrolled iframe/hard-sub from Play.
- An HTTPS HLS/MP4 `url` is only a **candidate** until safety and actual browser decoding checks. `infoHash`/`fileIdx` is a **torrent descriptor, not a Safari-playable video URL**. `externalUrl` is navigation, not native Play. A manifest or metadata listing is not playable-video proof.
- Any torrent resolver/engine, seed/peer access, arbitrary proxy, external service, credentials, hosting, cost, user-data exposure or content authorization requires an **isolated owner-approved architecture/security/licensing decision**. This docs change neither installs nor invokes a resolver.
- Require end-to-end provider contracts, 401/403/429/timeout/expired-source failures, bounded fetch/SSRF guards, signed subtitle grants, physical Safari tests and release gate #20 before public streaming claims.
- Reference: [Stremio resources](https://stremio.github.io/stremio-addon-sdk/api/), [protocol](https://stremio.github.io/stremio-addon-sdk/protocol.html), [manifest](https://stremio.github.io/stremio-addon-sdk/api/responses/manifest.html), [stream object](https://stremio.github.io/stremio-addon-sdk/api/responses/stream.html).

### Approved D03=3A: AniList-primary metadata with MAL legacy compatibility

- **Future metadata primary key: `aniListId` (`Media.id`)**. Preserve `malId`/`Media.idMal` only as a validated, nullable external mapping for existing `/anime/:malId` links, provider queries, IndexedDB, resume, watch-guide progress and versioned backups. AniList-only titles need a distinct unambiguous route; never conflate numeric namespaces or join on title alone.
- Existing Tenrai/Jikan APIs and dynamic MAL genre additions #116/#117 are implemented **transitional** capabilities, not completion of the requested AniList-primary migration. No destructive rewrite of saved data, routes, provider IDs or cloud snapshot contracts.
- Plan provenance-aware GraphQL `Media`, `GenreCollection`, `MediaTagCollection`, genres/tags/status/format/year/season/score/sort and server-side pagination. Return truthful loaded vs total counts. Keep provider and exact episode availability independent of media metadata.
- Gate rollout on [AniList terms](https://docs.anilist.co/guide/terms-of-use) applicability to a tracking/library-like app and [current rate limit](https://docs.anilist.co/guide/rate-limiting) (degraded temporary 30 req/min at this checkpoint), batching/caching/429 handling, data migration rollback, source-outage behavior, tests, and owner approval. Never silently rebrand Tenrai data as AniList.

No code, deployment, resolver or new dependencies are part of this planning commit.

### 2026-11-01 — Merged D08 and no-synthetic-episode checkpoints

- **D08 / AC-DATA-09 PARTIAL (navigation slice MERGED):** [#123](https://github.com/rzqllh/Yoru/pull/123) → main `84807c8`. Two tab categories, separate upcoming CTA, direct/reload/back route, mobile no overflow. PR head `2bda841` [CI](https://github.com/rzqllh/Yoru/actions/runs/41266399249) + [browser](https://github.com/rzqllh/Yoru/actions/runs/41266399337) SUCCESS. Main `84807c8` [CI](https://github.com/rzqllh/Yoru/actions/runs/41266563101) + [browser](https://github.com/rzqllh/Yoru/actions/runs/41266563069) SUCCESS. Broader D08 information architecture/live/physical tests remain partial.
- **Phase 05 / AC-DETAIL-03 PARTIAL (negative case MERGED):** [#124](https://github.com/rzqllh/Yoru/pull/124) → main `ce12d98`; no synthetic Episode 1 when both episode lists empty, button disabled with honest state. PR head `5643b43` [CI](https://github.com/rzqllh/Yoru/actions/runs/41266656368) + [browser](https://github.com/rzqllh/Yoru/actions/runs/41266656388) SUCCESS. Exact merged-main runs [CI](https://github.com/rzqllh/Yoru/actions/runs/41266791512) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41266791496) pending conclusion at checkpoint.
- **Still NOT DONE:** D04 full-page detail/deep links, AniList tags and live paginated genre filters, external subtitle/video source evidence, iPhone, cloud two-account OTP/RLS and #20 release gates. Production has not been deployed from these merges.

### 2026-11-01 — Phase 01/02 regional subtitle aliases

- **#128 CODE MERGED**, [PR #128](https://github.com/rzqllh/Yoru/pull/128) → `659265fd`: normalize Stremio embedded tracks and addon subtitle `ind`/`eng` and regional tags to exact `id`/`en` without activating English by default. Exact head `454f90f` [CI](https://github.com/rzqllh/Yoru/actions/runs/41267363857) and [Browser](https://github.com/rzqllh/Yoru/actions/runs/41267363890) SUCCESS. No live addon/download/iPhone verification.
- **#129 MERGED:** [PR #129](https://github.com/rzqllh/Yoru/pull/129) → main `ceff75590dd1d8e41c425da3c07628a3b760c6b6`, direct OpenSubtitles/SubDL/SubSource strict regional aliases; PR head `c6d3c08`: [CI](https://github.com/rzqllh/Yoru/actions/runs/41267545684) + [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41267545714) SUCCESS. Exact merged-main QA pending; this is fixture correctness, not live provider access. No new provider, key, resolver, migration or deployment.

### 2026-11-01 — Phase 05 first navigable detail URL slice

- **CODED IN DRAFT #131 / FULL PHASE NOT DONE:** strict shareable MAL `/anime/:malId`, route-aware detail fetch, browser Back/Forward, restore original browse scroll, mobile edge-to-edge visual view, negative ID tests. No AniList-only ID mapping, data migration, real device/browser-source sign-off, Supabase, provider or production changes. [PR #131](https://github.com/rzqllh/Yoru/pull/131) code `6199cdc`; [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41270943886) SUCCESS, [Browser](https://github.com/rzqllh/Yoru/actions/runs/41270943803) PENDING at documentation checkpoint. AC-DETAIL-01/02 and AC-VN-13 remain PARTIAL until exact-head browser and full semantic/document acceptance.

- **D04 QA update (#131):** initial head [Browser](https://github.com/rzqllh/Yoru/actions/runs/41271063462) FAILED due to focus return and old inner-dialog scroll assertion; corrections `afa79a5` / `0ecefba` passed [CI](https://github.com/rzqllh/Yoru/actions/runs/41271287694) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41271287681) on exact corrected code head. Keep full semantic document page, actual browse pagination restore, future AniList-only route and physical iPhone open. No production deploy.

- **D04 merged checkpoint:** [#131](https://github.com/rzqllh/Yoru/pull/131) main `fb66e65` adds strict MAL detail URL and visual mobile viewport with Back/Forward; final PR head `507c7f4` [CI](https://github.com/rzqllh/Yoru/actions/runs/41271498685) and [Browser](https://github.com/rzqllh/Yoru/actions/runs/41271498630) SUCCESS; merged-main checks [CI](https://github.com/rzqllh/Yoru/actions/runs/41271664626) and [Browser](https://github.com/rzqllh/Yoru/actions/runs/41271664619) PENDING at this record. Phase 05 remains PARTIAL, no production deploy.

### 2026-11-01 — Phase 05 return and public docs integration

- [#133](https://github.com/rzqllh/Yoru/pull/133) merged at main 83c973ad: loaded browse pages retained behind detail. Exact PR head 1b2391b7 [CI](https://github.com/rzqllh/Yoru/actions/runs/41272206603) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41272206606) SUCCESS. Two-page fixture PASS; full Phase 05 PARTIAL.
- [#134](https://github.com/rzqllh/Yoru/pull/134) merged at main bcb72fc: public documentation D02 no iframe Play, independent Stremio subtitle/stream vs direct APIs, D03=3A gated. Exact PR head 61533ca [CI](https://github.com/rzqllh/Yoru/actions/runs/41272281179) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41272281114) SUCCESS; documentation only.
- Open gates: semantic detail, broader return/filter/playback and physical iPhone tests; AniList ToU+identity reversible migration approval; #77/#78 two-user OTP/RLS privacy; authorized real media/subtitle samples; production current-SHA/health; #20 G1–G6 NO-GO. Production untouched by these PRs.

### 2026-11-01 — D03=3A external API terms risk gate

- **BLOCKED pending owner decision:** Official [AniList ToU](https://docs.anilist.co/guide/terms-of-use) restricts competing non-complementary anime/manga list/tracker applications, including media data. Yoru's collection/progress/backup makes the terms materially relevant; request written clarification/authorization or review a different compliant metadata-primary approach before migration.
- **Verified docs-only:** [AniList rate limits](https://docs.anilist.co/guide/rate-limiting) presently warn of degraded 30 requests/minute and burst limits; dynamically honor 429/Retry-After rather than assuming 90/min. This is not a live capacity/latency test.
- No upstream request, runtime source switch, bulk ingestion, database/backup rewrite, provider secrets or hosting change was made for this checkpoint.

### 2026-11-01 — Phase 05/06 native player return completed as independent slice

- [#139](https://github.com/rzqllh/Yoru/pull/139) MERGED main 8e931bb. Fixes remaining player-unmount gap after #133 and #136. App shell remains HTML-hidden during playback, preserving catalog pagination and Watch Guide graph/filter/focus. No API, dependencies, migration, database, provider or production changes.
- Exact final PR head 48c07be [CI](https://github.com/rzqllh/Yoru/actions/runs/41274184023) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41274184006) SUCCESS. First [browser run](https://github.com/rzqllh/Yoru/actions/runs/41273993615) FAIL on legacy DOM absence assertion; fixed to verify hidden background, rerun PASS. Fixture cases cover catalog page two, Guide filter/depth, native sample player, Back, focus and no refetch. Merged-main exact-SHA runs separate.
- REMAINING: semantic mobile full-page detail; live cross-provider media/subtitle; physical iPhone; D03 AniList API terms gate; cloud #77/#78 OTP/RLS; deployment/current-SHA hosted API verification; #20 G1-G6 NO-GO.


## 2026-11-01 — New isolated Phase 05 QA checkpoint

- [Draft #142](https://github.com/rzqllh/Yoru/pull/142), code `b2d0f88`: combined-filter, page-two Browse → detail → native player → Back regression added. Exact PR-head checks are **PENDING/NOT RUN**, not PASS. Maintains prior verified #139/#140 main `005aee1` and release NO-GO; no deployment or changes to cloud/live-provider architecture.

## 2026-11-01 — Integration checkpoint: filter and return navigation

### 2026-11-01 — Recovered player-return QA and browser navigation integrated

- **Verified repository snapshot:** `main c3f5af0996d5ebfff16c6280230c2de9142f53dd`, after merged [#141](https://github.com/rzqllh/Yoru/pull/141), [#142](https://github.com/rzqllh/Yoru/pull/142), [#143](https://github.com/rzqllh/Yoru/pull/143) and [#144](https://github.com/rzqllh/Yoru/pull/144). This is GitHub code, **not** the live Vercel production SHA.
- #141 canonical minimum-score URL handling, merged `da70a298`. PR head `d7f8df7` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41275437997) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41275438058) **SUCCESS**.
- #142 filtered Browse page-two → detail → native player → Back regression, merged `f16e8aee`. PR head `8bff196` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41275620079) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41275620076) **SUCCESS**; checks URL, genre/type/score/year/order, 25 loaded cards, scroll/focus and no redundant request.
- #143 Escape mirrors player Back route restoration, merged `f9872fa4`. PR head `1d77519` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41275780152) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41275780150) **SUCCESS**.
- #144 browser history Back dismisses active playback, merged `c3f5af09`. PR head `1ebf97d` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41275880037) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41275880052) **SUCCESS**.
- **Still PARTIAL:** these are deterministic browser fixtures. Full semantic document-page detail, physical iPhone Safari/PWA, live authorized HLS/MP4/provider/subtitle tests, AniList ToU clearance, cloud #77/#78 and production/release #20 require independent evidence. Exact combined `main c3f5af0` [CI](https://github.com/rzqllh/Yoru/actions/runs/41276006142) and [Browser](https://github.com/rzqllh/Yoru/actions/runs/41276006069) **PENDING at this checkpoint**. No deployment/paid action.

- **Final merged-main verification:** `c3f5af0996d5ebfff16c6280230c2de9142f53dd` [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41276006142) and [Chromium/WebKit Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41276006069) both **SUCCESS** (4/4 jobs). Earlier PENDING statements describe the original snapshot only; no physical device or live media acceptance is implied.

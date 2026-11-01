# Yoru — Current State & New-Chat Recovery

> **Historical snapshot (superseded by latest continuation checkpoint below):** 2026-11-01 Asia/Jakarta. **Verified main at this historical snapshot:** [`b4f35bd46b1d8a6ce3ae66193488ddd7783d7edd`](https://github.com/rzqllh/Yoru/commit/b4f35bd46b1d8a6ce3ae66193488ddd7783d7edd). This is **repository state, not proof of live production deployment**. The latest main exact `b4f35bd` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41225040383) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41225040380) completed SUCCESS (four checks).

## Read this first (simple)

| Status | What it means for Yoru |
| --- | --- |
| **DONE in main** | Project planning and phase handoffs; unverified external iframe video removed from playable choices; English subtitle requires consent; default native subtitle 90% / 50% background; malformed episode metadata rejected; clearly numbered season mismatch rejected; homepage hero supports swipe/pause instead of 1–10 controls; Anime Popular mobile cards use equal-width 2:3 posters. |
| **PARTIAL** | Correct season/cour mapping across every title/provider, actual subtitle availability and legibility on physical iPhone, remaining discovery/filter/detail/watch-guide polish, complete integrated end-to-end QA. CI fixtures are not live sign-off. |
| **BLOCKED / NEEDS OWNER INPUT** | Real authorized media/provider test assets and credentials where applicable; physical iPhone Safari tests; optional Torrentio resolver design/authorization; cloud-sync two-user OTP/RLS/privacy/device sign-off; Vercel production/deployment budget and owner GO; public release [#20](https://github.com/rzqllh/Yoru/issues/20). |
| **NEXT** | Prioritize live season/episode subtitle verification and real iPhone; then Phase 03/04 browse/detail refinements and Phase 08 integrated QA. Record exact SHA, PR, CI and observed results in planning handoffs after every slice. |

## Main integration evidence

| Change | PR | Integrated main SHA | Evidence and limits |
| --- | --- | --- | --- |
| Full planning baseline, Phases 00–09 | [#98](https://github.com/rzqllh/Yoru/pull/98) | `ab5f172` | Docs and deterministic CI; release not approved |
| Strict playable-source D02 | [#100](https://github.com/rzqllh/Yoru/pull/100) | `f021a85` | CI + browser 4/4; live playback unknown |
| Explicit English consent D01 | [#101](https://github.com/rzqllh/Yoru/pull/101) | `7a60868` | CI + browser 4/4; live providers unknown |
| Native subtitle 90%/50% D09 | [#103](https://github.com/rzqllh/Yoru/pull/103) | `6b13e00` | Fixture CI; actual iPhone caption not checked |
| Reject malformed episode identity | [#105](https://github.com/rzqllh/Yoru/pull/105) | `6b85d3c` | Code merged; correctness fixture and subsequent main builds |
| Reject explicit season mismatch | [#107](https://github.com/rzqllh/Yoru/pull/107) | `dc2bd45` | [CI](https://github.com/rzqllh/Yoru/actions/runs/41224226939) + [browser](https://github.com/rzqllh/Yoru/actions/runs/41224227162) on PR head; main CI passed in this session; not complete live season mapping |
| Swipe hero / Anime Popular heading | [#106](https://github.com/rzqllh/Yoru/pull/106) | `f21c4a8` | [CI](https://github.com/rzqllh/Yoru/actions/runs/41223942927) + [browser](https://github.com/rzqllh/Yoru/actions/runs/41223942739) on corrected code; later integration rechecked 4/4; real iPhone pending |
| Equal-width mobile poster grid 2:3 | [#108](https://github.com/rzqllh/Yoru/pull/108) | `b4f35bd` | [CI](https://github.com/rzqllh/Yoru/actions/runs/41224846356) + [browser](https://github.com/rzqllh/Yoru/actions/runs/41224846533) PASS on PR head; main exact SHA [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41225040383) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41225040380) SUCCESS |

Other previously merged work includes [#99](https://github.com/rzqllh/Yoru/pull/99) malformed provider response handling and [#104](https://github.com/rzqllh/Yoru/pull/104) handoff continuity. Cloud PR [#77](https://github.com/rzqllh/Yoru/pull/77) remains **DRAFT**, not deployed/merged.

## Status by phase

| Phase | Current status | Exit still needed |
| --- | --- | --- |
| 00 — Governance | Planning integrated; owner release approval distinct | Maintain current records |
| 01 — Sources | D02 integrated; other source coverage partial | Authorized real stream, correct mapping, owner decision if resolver |
| 02 — Subtitles | D01, D09, episode validation, season guard integrated | Live provider search/download, reliable MAL/season/cour mapping, physical Safari captions |
| 03 — Home & design | Hero controls, Anime Popular label and poster grid integrated | Physical device screenshots, broader design-system consistency |
| 04 — Browse & metadata | Partial existing Tenrai/MAL and AniList enrichment | Complete trustworthy genre taxonomy, filter/pagination/source provenance |
| 05 — Detail | Modal still used | Full-page /anime/:malId and deep-link/back/scroll acceptance |
| 06 — Watch Guide | Existing curated routes partial | Navigation hierarchy and editorial coverage tests |
| 07 — Storage/sync | Local storage exists; cloud #77 draft | Two real account OTP/RLS, privacy/device reconciliation, owner signoff |
| 08 — QA | CI fixtures available | Actual authorized cross-provider, iPhone, accessibility and performance evidence |
| 09 — Release | **NO-GO** | [#20](https://github.com/rzqllh/Yoru/issues/20) gates G1–G6, production ops and owner GO |

## Operational facts and restrictions

- `vercel.json` at snapshot has `git.deploymentEnabled:false`. **Merging main is not production deployment**. Latest deployed SHA, catalog health and quota must be reverified before any deployment claim.
- No torrent-only hash is automatically playable: it needs a compatible **owner-approved** resolution path and authorized content. No resolver, proxy or provider bypass added in these slices.
- #77 cloud sync remains draft; do not activate without real two-account and privacy/RLS testing.
- No claims about public video, subtitles or production availability follow from mocked tests alone.

## Resume instructions for another ChatGPT chat

1. Open this file, then [TRACKING](TRACKING.md), [ACCEPTANCE_MATRIX](ACCEPTANCE_MATRIX.md), [PHASE PLAN](PHASE_PLAN.md), and the matching [Phase 02](handoffs/PHASE_02_HANDOFF.md) / [Phase 03](handoffs/PHASE_03_HANDOFF.md) handoff.
2. Inspect **fresh** `main` HEAD, open PRs, exact SHA checks, relevant issues, Vercel deployment SHA and release gate #20. Do not assume this 2026-11-01 snapshot is still current.
3. Pick the highest-priority independent unfinished slice; use a separate branch/PR. Do not edit production, security policy, cloud auth, paid hosting or torrent engine without owner approval.
4. After **every actual accomplishment**, update the relevant phase handoff, tracker and acceptance matrix with PR/commit SHA, what changed, tests that actually ran, failures and unresolved blockers. Never mark NOT RUN as PASS. On restart, use the latest merged handoff, not chat history alone.
5. **For the owner:** end every progress report (including done/partial/blocker lists) with four extremely short, nontechnical lines: **Done / Partial / Blocker / Next**. Details and evidence stay above or in links. This is the owner's preferred reporting style, not a release gate.

## Latest work handoff

At `b4f35bd`, PRs #107, #106 and #108 have merged. Exact main `b4f35bd` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41225040383) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41225040380) passed 4/4 checks (fixtures; not live media/iPhone). Pending work should start with provider season and actual subtitle-source evidence, or an independent Phase 03/04 visual slice if live provider credentials/device are unavailable. **NO PUBLIC RELEASE.**

## Continuation audit — 2026-11-01 (verified via connected GitHub/Vercel)

- Newer exact `main` is [`bf3105da95c3068a812cf0de8cd8b9610a912f9c`](https://github.com/rzqllh/Yoru/commit/bf3105da95c3068a812cf0de8cd8b9610a912f9c) (docs-only PR #109 merged after the original snapshot). Its [CI](https://github.com/rzqllh/Yoru/actions/runs/41225489034) and [Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41225489043) both report SUCCESS; these are deterministic checks, not proof of live media or physical iPhone compatibility.
- Vercel's production alias `yoru-omega.vercel.app` currently targets READY deployment [`dpl_514E91c6XQkRCvF2wS5YumdgvgrU`](https://vercel.com/rzqllhs-projects/yoru/514E91c6XQkRCvF2wS5YumdgvgrU) built from `5496aae29a28c6c9a6f7ee572271869664059a54`. Its build event log confirms the build ran (not skipped), but the deployed SHA is behind `main`.
- Direct public checks for `/api/health`, `/api/anime/discover` and the root from this assistant environment returned no HTTP response (web tool inaccessible; container DNS resolution failed). Treat their live status as **UNKNOWN**, not passing or failing. A 30-minute production runtime-log query returned no entries; **absence of logs is not evidence of API health**. The current historical 402/ignored-build errors are not evidence of a current failed deployment.
- [Cloud sync #77](https://github.com/rzqllh/Yoru/pull/77) remains DRAFT; [#78](https://github.com/rzqllh/Yoru/issues/78) real OTP/two-account/device/consent checks and [release #20](https://github.com/rzqllh/Yoru/issues/20) remain open.
- GitHub branch search returned 16 branch names, including `main` and the draft cloud branch. This does not prove earlier [branch-cleanup #95](https://github.com/rzqllh/Yoru/issues/95) archived/deleted safely; its issue still has no completion proof. Verify archive and runtime workflow evidence before claiming cleanup.
- **Next:** verify hosted HTTP externally from a network with access, compare deployed API responses with current routes, and collect controlled media/subtitle/iPhone samples. Keep production deployment, Supabase activation, destructive branch deletion and final release separate from this documentation-only audit. No runtime, source or configuration changes here.

### 2026-11-01 — First safe Phase 04 browse slice merged after resumption

- [PR #111](https://github.com/rzqllh/Yoru/pull/111) **MERGED** into `main` as [`ae9bc81`](https://github.com/rzqllh/Yoru/commit/ae9bc81ae00ce61cba5abcdd4d1be34edb465327). Browse count now says **“N ditampilkan”**, explicitly counting loaded deduplicated titles instead of implying unknown total catalog size (AC-DATA-08). The default sort label now says **“Paling populer”** and corresponds to the existing popularity sort, rather than inaccurate “Relevansi”. No API/provider/config changes.
- Exact PR head `0f3db7a09cb366acac32857fb0905e6cbe6ebe44`: [CI Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41227101975) SUCCESS and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41227101983) SUCCESS. Browser fixture checked count after loading a second page with a duplicate; **not live hosted acceptance**. Recheck CI at merged `main` commit and before any release. The 12 static browse genres, real live filter coverage, and #20 release gates remain unresolved.

### 2026-11-01 — New Phase 04 independent API contract

- [PR #116](https://github.com/rzqllh/Yoru/pull/116) adds `GET /api/anime/genres`, an explicit source-labeled validated Tenrai/MAL genre list with bounded cache/timeouts and a safe 12-genre fallback if Tenrai fails. This is **API-only**: existing UI still offers 12 genre choices; newly returned genres are not yet permitted by the search backend. Code/test head `27eb458`: [CI](https://github.com/rzqllh/Yoru/actions/runs/41244040283) and [Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41244040288) SUCCESS on deterministic fixtures. Not live hosted or physical device evidence.
- Another independent source-picker improvement [#115](https://github.com/rzqllh/Yoru/pull/115) has merged into main `1217bcd`. Production remains on older SHA `5496aae`, and public release #20, cloud #77/#78, authorized live media/subtitles and iPhone still require evidence. Final #116 merge and exact-main CI must be verified separately.

### 2026-11-01 — Phase 04 genre filter follow-up branch (CODED/PENDING)

- [#116](https://github.com/rzqllh/Yoru/pull/116) merged as `ae43a69`: safe, source-labelled Tenrai genre-options API. Follow-up branch `feat/y04-genre-filter-ui-20261101` wires API options to Browse, preserves legacy URL names and validates added MAL numeric options server-side. Tests and PR checks are pending, so this is **not yet in main or production**. AniList tags, actual upstream and physical device verification remain separate blockers.

- **PR #117 code verification:** on branch `feat/y04-genre-filter-ui-20261101` head `9fa0143`, dynamic source-backed MAL genre options now route through UI/URL/server and deterministic [CI](https://github.com/rzqllh/Yoru/actions/runs/41244704532) + [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41244698662) report SUCCESS. No live Tenrai query/physical iPhone; public release and cloud remain gated. Final docs SHA and merge must be independently verified.

## Latest integration snapshot — 2026-11-01 (after PR #117)

- **DONE in main `4157fec`:** [#116](https://github.com/rzqllh/Yoru/pull/116) added safe, cached Tenrai canonical MAL genre options API; [#117](https://github.com/rzqllh/Yoru/pull/117) connected these options to Browse UI, URL state and server-side full-catalog filtering. Added genre values use validated `mal:<id>`; legacy `genre=Action` and other existing URLs remain compatible. Missing taxonomy falls back to original 12 options with a visible explanation. Invalid/adult/unknown numeric IDs are HTTP 400, never unfiltered matches.
- PR #117 code/docs head `f9982aa`: [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41244901215) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41244896643) both SUCCESS. Merged main `4157fec` checks are separate: [CI](https://github.com/rzqllh/Yoru/actions/runs/41245111173), [browser](https://github.com/rzqllh/Yoru/actions/runs/41245111417); record their final result only after completion.
- **PARTIAL/NOT DONE:** This implements Tenrai/MAL taxonomy rather than AniList `GenreCollection` or tags. Live upstream taxonomy, combined filter coverage, metadata source reconciliation and iPhone acceptance are not verified. Vercel production is still older `5496aae`; cloud #77/#78 and public release #20 remain blocked. No production deployment/promotion or paid change.
- **NEXT:** evidence-based AniList/MAL `idMal` mapping, separate AniList tags, actual live genre query/pagination+429 tests, and Phase 05 detail-page planning without changing production architecture without owner sign-off.


### 2026-11-01 — D08 navigation handoff and revised main baseline

- Latest audited `main` `50d80ed4f0ee4550f7175c72346d5a121f9d389e` (merged [#122](https://github.com/rzqllh/Yoru/pull/122)), with [CI](https://github.com/rzqllh/Yoru/actions/runs/41266056770) and [Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41266056746) SUCCESS. This supersedes older SHA claims elsewhere as a **dated checkpoint**, not by rewriting their evidence.
- [PR #123](https://github.com/rzqllh/Yoru/pull/123) implements D08's separated Akan Datang discover destination and two-category switch, including mobile navigation and refresh test. **Draft pending exact-head checks and merge**, not production. After merge, verify its resulting `main` SHA.
- Phase 04 MAL/Tenrai genres from #116/#117 are integrated, but AniList tag taxonomy and live filters are partial. Phase 05 D04 full-page detail still planned. [#77](https://github.com/rzqllh/Yoru/pull/77) cross-device sync is still draft, and [#20](https://github.com/rzqllh/Yoru/issues/20) public streaming release is NO-GO. Vercel live HTTP was inaccessible from public probe, so do not infer API response health.

## Latest continuation checkpoint — 2026-11-01, main `ce12d98`

- **MERGED:** [#123](https://github.com/rzqllh/Yoru/pull/123) → `84807c8a79873a0ebeefb48ad2e94acda75f847d`; Akan Datang is a standalone destination, not a third Browse category tab. Its exact PR head `2bda841` [CI](https://github.com/rzqllh/Yoru/actions/runs/41266399249) and [Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41266399337) both SUCCESS, and merged main `84807c8` [CI](https://github.com/rzqllh/Yoru/actions/runs/41266563101) and [Browser](https://github.com/rzqllh/Yoru/actions/runs/41266563069) SUCCESS.
- **MERGED:** [#124](https://github.com/rzqllh/Yoru/pull/124) → `ce12d98678f6e89cefd81516fb641c62df972572`; empty episode lists no longer manufacture Episode 1. Exact PR head `5643b43` [CI](https://github.com/rzqllh/Yoru/actions/runs/41266656368) and [Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41266656388) both SUCCESS. Merged main `ce12d98` [CI](https://github.com/rzqllh/Yoru/actions/runs/41266791512) and [Browser](https://github.com/rzqllh/Yoru/actions/runs/41266791496) started; **do not treat as PASS without checking their final outcomes**.
- **PARTIAL:** D08 broader design-system/Watch Guide hierarchy, MAL–AniList idMal/tag enrichment, Phase 05 full-page `/anime/:malId`, physical iPhone and live provider acceptance remain outstanding.
- **BLOCKED / NO-GO:** [#77](https://github.com/rzqllh/Yoru/pull/77) draft cloud cross-device and [#20](https://github.com/rzqllh/Yoru/issues/20) G1–G6 release. Production Vercel READY is still old deployed SHA `5496aae` at last verified inspection, not current `main`; live HTTP health/catalog could not be accessed from this environment. No deployment, cloud activation, branch deletion or release was performed.
- **NEXT:** Phase 05 D04 full-page detail with URL/Back/scroll state and tests, independently Phase 04 live taxonomy+429/combined filtering; prepare actual provider/iPhone/security evidence before any release approval.

**Simple:** Done — #123/#124 merged. Partial — Browse/detail and QA. Blocker — real provider/iPhone/cloud/hosting release. Next — full-page detail and live filter tests.

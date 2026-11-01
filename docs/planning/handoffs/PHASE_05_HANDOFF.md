# PHASE 05 — Full-page Anime Detail and Deep Links

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** CURRENT DETAIL IS DIALOG; D04 PLANNED. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Full-page Anime Detail and Deep Links. Dependencies: 01 source eligibility + 03 design tokens + 04 router/metadata contract. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Implement shareable mobile `/anime/:malId` full-page detail with persistent title and proper navigation.
- Preserve filtered browse/history scroll and Back/Forward, including direct-open and refresh.
- Show verified resume when possible; never imply Episode 1 or video metadata means a verified source.
- Separate facts, synopsis, franchise link, episode listing, source candidate and playable states.
- Handle images/long titles/lists/landscape/safe area and accessible keyboard/focus navigation.

## Existing implementation and evidence at snapshot

- `App.tsx` currently renders `DetailDialog` with `role=dialog` and modal backdrop; buttons include generic `Periksa sumber episode` targeting first episode.
- `router.ts` has browse/guide/library/settings but no full detail page route in the inspected code.
- Source picker offers legacy uncontrolled embed and must follow Phase 01 D02 gate.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

AC-DETAIL-01..05 + AC-SRC-06; no modal-era trap or broken deeplink.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** Routing change affects fullscreen player, focus restoration, saved scroll and browser history; avoid cross-PR App/router overlap.
- **Approval needed:** D04 accepted; owner approval only if larger router architecture/security/data change is proposed.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Define route and state ownership with migration from modal links.
2. Create detail shell and responsive content model.
3. Verify direct/open/reload/Back/Forward/scroll and live source state.

## Primary files and references

frontend/src/App.tsx, frontend/src/lib/router.ts, frontend/src/styles.css, frontend/src/components/Player.tsx, tests/browser/yoru.spec.mjs

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

## 2026-11-01 — Fail-closed empty episode detail, PR #124

- **Problem observed in main `50d80ed`:** the detail primary CTA had `displayed[0] || {number:1,...}` and could manufacture an Episode 1 when metadata and provider lists were empty. That is inconsistent with source truthfulness / AC-DETAIL-03.
- **Code:** [PR #124](https://github.com/rzqllh/Yoru/pull/124) removes the fabricated fallback; the main source-check CTA remains disabled while loading and if no episode is listed, with a clear **Episode belum tersedia** label. This does not create/play an unverified stream or alter source picker logic. A browser fixture returns empty metadata+provider episode lists, asserts button disabled, no episode rows and no stream lookup.
- **Status:** CODED IN ISOLATED DRAFT PR; exact-head Linux/Windows, Chromium/WebKit and merged-main checks **PENDING** until separately verified. Phase 05 D04 full-page route and browse-scroll/history persistence are still NOT IMPLEMENTED. No Supabase, Vercel, provider, schema, release or router modifications.

## 2026-11-01 vNext supersession — documentation scope

**2026-11-01 vNext owner supersession.** Inspected GitHub main [`ce12d98`](https://github.com/rzqllh/Yoru/commit/ce12d98678f6e89cefd81516fb641c62df972572); this is **DOCS ONLY**, not hosted/provider verification. D03=**3A AniList-primary** replaces archival D03=3B Tenrai/MAL-primary. D01=1A, D02=2B, D04=4A, D05=5A, D06–D09 retained. Existing Tenrai/MAL code remains until an approved reversible migration.

- Design mobile full-page detail with old `/anime/:malId` compatibility, distinct AniList-only route, query/history restoration, episode/source states, verified resume CTA and Watch Guide navigation; no modal-as-route shortcut.
- **Acceptance:** [AC-VN-01–16](../ACCEPTANCE_MATRIX.md) as relevant; exact SHA, browser/device, actual provider sample and result must be recorded. Previous tests are historical; no new PASS claims, live provider configuration, code changes, resolver activation or release from this documentation merge.

## 2026-11-01 — Empty episode guard MERGED and verified on PR

- [PR #124](https://github.com/rzqllh/Yoru/pull/124) → main `ce12d98678f6e89cefd81516fb641c62df972572`; eliminates synthetic Episode 1 fallback from the detail primary button when no episode exists. While loading or when episode lists are empty the button cannot launch source checks. Existing real provider-episode cases remain accessible.
- Exact integrated PR head `5643b43`: [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41266656368) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41266656388) SUCCESS. Exact merged-main `ce12d98` [CI](https://github.com/rzqllh/Yoru/actions/runs/41266791512) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41266791496) **SUCCESS on exact merged-main**.
- AC-DETAIL-03 negative fixture PASS on PR head, Phase 05 still **PARTIAL/PLANNED**: D04 full-page `/anime/:malId`, history/Back/scroll preservation, source/episode UI and physical iPhone not tested. No production change or release sign-off.

## 2026-11-01 — D04 canonical MAL deep link and mobile viewport slice (#131)

- **CODED / CI pending for final PR head:** [PR #131](https://github.com/rzqllh/Yoru/pull/131) branched from `main` `17dc46285223f4e6399870f918a672231bf2f264`. Adds strict `/anime/:malId` routing, source-card/library/guide entry points, direct metadata fetch on reload, Back/Forward restoration, and full-width edge-to-edge mobile detail styling. Invalid or noncanonical IDs (e.g. `1e3`, `01`, `0x10`) cannot select a different MAL title. Tests added in `tests/router.test.mjs` and `tests/browser/yoru.spec.mjs`.
- **Scope limits:** current detail content reuses the existing accessible desktop dialog and mobile full-viewport presentation as a reversible first slice. A fully semantic document-page detail component, preserved filters/scroll across all navigation paths, long episode datasets, source/resume UX polish, separate future AniList-only routes, actual iPhone and live provider acceptance remain **PARTIAL / NOT VERIFIED**. This is not AniList-primary migration, a new auth/source configuration, cloud activation, or production release.
- **Evidence status at checkpoint:** code head `6199cdc979f1116e25dba636cc1b2fee2519c0b7`; [CI](https://github.com/rzqllh/Yoru/actions/runs/41270943886) reported SUCCESS (Linux/Windows). [Browser E2E](https://github.com/rzqllh/Yoru/actions/runs/41270943803) was still running; **do not mark its result PASS until final conclusion**. Later documentation edits require new exact-head checks.

### D04 QA correction and verified code head — 2026-11-01

- Initial docs-integrated head `7e2837e` [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41271063462) **FAILED** overall: WebKit passed, Chromium reported two regressions: opener focus did not return after route Back, and legacy mobile test expected an inner modal scrollbar. CI [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41271063463) passed. Do not hide this failure.
- [PR #131](https://github.com/rzqllh/Yoru/pull/131) corrections: `afa79a5` restores focus to the new DOM instance of the originating anime card after history navigation; `0ecefba` tests the actual full-viewport mobile scrolling surface. Corrected code head `0ecefba8e156fac25cb1bd3366eac26f22111206`: [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41271287694) **SUCCESS**, [Chromium/WebKit browser](https://github.com/rzqllh/Yoru/actions/runs/41271287681) **SUCCESS**. This establishes deterministic acceptance only, not physical iPhone or real stream success.
- D04 **PARTIAL**: viewport-filling mobile detail still reuses the existing dialog component; a true semantic full-page document layout, all browse pagination/scroll restoration, and AniList-only ID namespace are NOT DONE. Additional docs commit changes the final PR SHA and needs new exact-SHA CI before merge.

## 2026-11-01 — PR #131 merged (post-implementation checkpoint)

- [PR #131](https://github.com/rzqllh/Yoru/pull/131) → main `fb66e65962586eab34bc9b9591278b1e7add5c8d`. Final head `507c7f48f2df2a29d97d7172954cb317d2117ef2` [CI Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41271498685) and [browser Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41271498630) SUCCESS. Main exact SHA [CI](https://github.com/rzqllh/Yoru/actions/runs/41271664626) / [browser](https://github.com/rzqllh/Yoru/actions/runs/41271664619) were pending when recorded.
- AC-DETAIL-01/02 partial deterministic slice merged; original modal focus restoration and changed mobile scroll test are repaired. **Not signed off**: full semantic document-page D04, comprehensive preserved filtered/paginated browse state, AniList-only route after D03 migration, physical iPhone, live media or PWA acceptance. No production or identity migration.

## 2026-11-01 — Browse-to-detail pagination retention (#133 merged)

- [PR #133](https://github.com/rzqllh/Yoru/pull/133) merged into main 83c973adfbe69d1446eceeffd5219b29de7bd3c8. On Browse-originated detail routes, keep the loaded Browse subtree mounted but hidden. Back returns to loaded page results without a new catalog fetch and preserves original-card focus/scroll. Direct external detail links remain unaffected.
- Exact PR head 1b2391b7 [CI Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41272206603) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41272206606) SUCCESS. Browser fixture covers two pages and 25 loaded items, return focus/scroll and request counts.
- AC-DETAIL-02/AC-VN-13 **partial deterministic coverage** only. Still NOT RUN: filter-combination return, returning after playback (player unmounts App subtree), real device, semantic full-page detail, live providers, AniList-only ID route. Phase 05 not complete; release #20 NO-GO.
## 2026-11-01 — Guide detail return is retained (#136 merged)

- [PR #136](https://github.com/rzqllh/Yoru/pull/136) merged into `main` `3334d74417b780878d194b5f6b302566099d6abb`. Its per-origin detail-return snapshot now also retains the Guide route and opener element. The original guide React subtree stays mounted and hidden behind detail, preserving graph/filter state. Existing Browse return behavior from #133 and direct detail link semantics remain unchanged.
- Exact PR head `e9ab54c6`: [CI](https://github.com/rzqllh/Yoru/actions/runs/41272983355), [Browser E2E Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41272983482) **SUCCESS** for fixed fixtures. No physical Safari or live provider verification. AC-DETAIL-02 / AC-GUIDE-02 **partial deterministic return coverage**. Full semantic detail document and playback-return remain open.

## 2026-11-01 — Detail → native player → Back retains Browse (#139 MERGED)

- [PR #139](https://github.com/rzqllh/Yoru/pull/139) merged main 8e931bb7a6a7dbd0754829fe13425d9955c5480e. Keep Browse and app shell mounted but HTML-hidden while player owns visible controls. Close from detail restores browser history and previously loaded catalog instead of forcing scroll-to-top.
- Exact PR head 48c07be: [CI](https://github.com/rzqllh/Yoru/actions/runs/41274184023) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41274184006) SUCCESS. One initial [browser FAIL](https://github.com/rzqllh/Yoru/actions/runs/41273993615) expected .app-shell removed; updated assertion now requires a hidden background. Fixture loads 25 titles across pages, opens native sample playback, returns with unchanged list, opener focus and no extra catalog fetch.
- AC-DETAIL-02 / AC-VN-13 PASS deterministic fixture only; Phase 05 PARTIAL. True semantic detail page, live providers and physical iPhone NOT RUN.


## 2026-11-01 — Phase 05 filtered Browse → Player → Back QA slice (#142)

- [Draft PR #142](https://github.com/rzqllh/Yoru/pull/142) code `b2d0f88` adds an automated Chromium/WebKit browser fixture starting at `/jelajahi?genre=Action&type=TV&minScore=8&year=2025&order=rating`, loading page two, playing a native test fixture and returning. It checks preserved URL, all five filters, 25 results, scroll, focus and zero redundant requests.
- **NOT YET PASS:** exact final-head browser and Linux/Windows CI pending; no physical Safari or live authorized provider. Existing #139 merged behavior was verified on its own head/main previously. No runtime, Vercel, auth, API, schema or release changes. AC-DETAIL-02/AC-GUIDE-04 coverage only, not phase signoff.

## 2026-11-01 — Player-return navigation QA integrated (#141–#144)

### 2026-11-01 — Recovered player-return QA and browser navigation integrated

- **Verified repository snapshot:** `main c3f5af0996d5ebfff16c6280230c2de9142f53dd`, after merged [#141](https://github.com/rzqllh/Yoru/pull/141), [#142](https://github.com/rzqllh/Yoru/pull/142), [#143](https://github.com/rzqllh/Yoru/pull/143) and [#144](https://github.com/rzqllh/Yoru/pull/144). This is GitHub code, **not** the live Vercel production SHA.
- #141 canonical minimum-score URL handling, merged `da70a298`. PR head `d7f8df7` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41275437997) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41275438058) **SUCCESS**.
- #142 filtered Browse page-two → detail → native player → Back regression, merged `f16e8aee`. PR head `8bff196` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41275620079) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41275620076) **SUCCESS**; checks URL, genre/type/score/year/order, 25 loaded cards, scroll/focus and no redundant request.
- #143 Escape mirrors player Back route restoration, merged `f9872fa4`. PR head `1d77519` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41275780152) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41275780150) **SUCCESS**.
- #144 browser history Back dismisses active playback, merged `c3f5af09`. PR head `1ebf97d` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41275880037) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41275880052) **SUCCESS**.
- **Still PARTIAL:** these are deterministic browser fixtures. Full semantic document-page detail, physical iPhone Safari/PWA, live authorized HLS/MP4/provider/subtitle tests, AniList ToU clearance, cloud #77/#78 and production/release #20 require independent evidence. Exact combined `main c3f5af0` [CI](https://github.com/rzqllh/Yoru/actions/runs/41276006142) and [Browser](https://github.com/rzqllh/Yoru/actions/runs/41276006069) **PENDING at this checkpoint**. No deployment/paid action.



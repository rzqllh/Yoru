# PHASE 06 — Franchise Relations and Editorial Watch Guide

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** RELATION GRAPH/CURATED ROUTES EXIST; FLOW POLISH PLANNED. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Franchise Relations and Editorial Watch Guide. Dependencies: 04 source & mapping consistency + 05 detail route. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Separate release order from reviewed editorial viewing recommendations; chronology only when story evidence exists.
- Differentiate sequel/prequel/side story/spin-off/OVA/special/movie and optional vs mandatory steps.
- Preserve edition-aware, spoiler-safe branches and citations; no universal canon assumptions.
- Clearly route Jelajahi -> Guide -> Franchise -> Route -> Detail -> Episode and Back with retained state.
- Maintain independent manual path progress and backup without claiming actual watch completion.

## Existing implementation and evidence at snapshot

- `frontend/src/components/WatchGuide.tsx` has release-year and gated chronology UI, curated route choice, source annotations and manual progress.
- Current guide details link into an App-level dialog rather than the future dedicated detail route.
- `backend/pipeline/watch-graph.ts` and curated edition files provide bounded relation data, not global story-order proof.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

AC-GUIDE-01..06 and AC-DETAIL-02; test branching titles and edition ambiguity.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** Metadata graph ≠ narrative chronology; linking different releases can accidentally spoil story or falsely order episodes.
- **Approval needed:** D05 accepted; any new curated canon claims need verifiable editorial sources and review.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Audit curated route coverage and attribution, not universalize it.
2. Redesign hierarchy and cross-route navigation when detail page exists.
3. Validate manual progress migration/import and spoiler-safe alternatives.

## Primary files and references

frontend/src/components/WatchGuide.tsx, frontend/src/lib/curated-watch-paths.ts, frontend/src/lib/watch-path-progress.ts, backend/pipeline/watch-graph.ts, docs/public/watch-order.md

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

## 2026-11-01 vNext supersession — documentation scope

**2026-11-01 vNext owner supersession.** Inspected GitHub main [`ce12d98`](https://github.com/rzqllh/Yoru/commit/ce12d98678f6e89cefd81516fb641c62df972572); this is **DOCS ONLY**, not hosted/provider verification. D03=**3A AniList-primary** replaces archival D03=3B Tenrai/MAL-primary. D01=1A, D02=2B, D04=4A, D05=5A, D06–D09 retained. Existing Tenrai/MAL code remains until an approved reversible migration.

- Use AniList relations after Phase 04 ID mapping; release order vs sourced editorial recommendation, optional/required editions and spoiler safety; preserve Guide → Detail → Episode → Back context.
- **Acceptance:** [AC-VN-01–16](../ACCEPTANCE_MATRIX.md) as relevant; exact SHA, browser/device, actual provider sample and result must be recorded. Previous tests are historical; no new PASS claims, live provider configuration, code changes, resolver activation or release from this documentation merge.
## 2026-11-01 — Guide → Detail → Back retention integrated (D05 / Phase 06 partial)

- [PR #136](https://github.com/rzqllh/Yoru/pull/136) merged to `main` as `3334d74417b780878d194b5f6b302566099d6abb`. Guide-originated detail routes now retain the mounted Watch Guide subtree while the detail is open. Browser Back/Close retains expanded depth=2 relation graph, chosen relationship-category filter, selected guide route and original opener focus; the original expanded network is not fetched again.
- Exact PR head `e9ab54c6c8bf298ce3e2be1352931c1ece1a8108` [CI Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41272983355) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41272983482) completed **SUCCESS**. Test uses deterministic AniList-shaped fixture and mapped related detail. These CI runs are for the PR head, not real upstream AniList or the exact merged-main SHA.
- **PARTIAL:** full Guide → episode → player → Back navigation remains untested; editorial citations/coverage, phone-native visual checks, long graphs, AniList policy authorization and the separate D03 identity bridge are not certified. No API, provider, cloud, database, dependency or production deployment was changed.

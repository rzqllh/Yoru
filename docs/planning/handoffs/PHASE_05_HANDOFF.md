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

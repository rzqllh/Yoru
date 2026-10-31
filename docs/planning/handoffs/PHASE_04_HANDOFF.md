# PHASE 04 — Discovery, Tenrai/MAL and AniList Hybrid

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** EXISTING TENRAI SEARCH/FILTERS; ANILIST FILTER ENRICHMENT PLANNED. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Discovery, Tenrai/MAL and AniList Hybrid. Dependencies: 00 + 03 component rules; coordinate route changes with 05. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Keep MAL IDs and Tenrai metadata canonical; enrich from AniList by verified `idMal` only.
- Load full supported AniList genre collection; treat tags as separate taxonomy; support metadata filter capabilities only when backend can execute them correctly.
- Maintain server-side pagination/sort/filter semantics and source attribution; never pretend first 24 loaded items are complete catalog.
- Use separate Akan Datang destination and separate clear entry to Watch Guide instead of mixing them into main filters.
- Preserve URL query, history, error and retry; handle 429, cache/inflight and source outages truthfully.

## Existing implementation and evidence at snapshot

- `backend/pipeline/jikan.ts` uses Tenrai for canonical browse/search, currently only 12 known genre IDs; `backend/api/app.ts` validates same 12.
- `frontend/src/lib/router.ts` sanitizes only 12 genre names, and Browse renders static options. AniList currently enriches daily trends/guide, not all browse filters.
- `/jelajahi/akan-datang` and `/jelajahi/panduan-urutan` routes exist but information hierarchy needs redesign.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

AC-DATA-01..09, including nonmatching `idMal`, 429 and multi-page combined filters.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** AniList rate limits, different popularity/score units, id mapping gaps and inconsistent ranks; never silently sort a hybrid result incorrectly.
- **Approval needed:** D03 already locked; owner approval for any destructive ID/data migration or new provider fees.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Draft canonical response/provenance and server hybrid-query strategy.
2. Implement dynamic genres/tags + server route validation and URL compatibility tests.
3. Refactor browse UI to consistent filter components; prove pagination, 429 and honest counts.

## Primary files and references

backend/pipeline/jikan.ts, backend/pipeline/daily-trends.ts, backend/pipeline/watch-guide.ts, backend/api/app.ts, frontend/src/App.tsx, frontend/src/lib/router.ts, tests/router.test.mjs

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

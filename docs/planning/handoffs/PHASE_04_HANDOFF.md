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

## 2026-11-01 — Continuation source/contract audit (READ-ONLY)

- `frontend/src/lib/router.ts`, `backend/api/app.ts` and `backend/pipeline/jikan.ts` each still constrain genre filtering to the same 12 static genre names. `browseAnime` converts those names to MAL/Jikan numeric IDs and performs server-side filtered requests. Merely adding AniList `GenreCollection` labels to the UI would be misleading because AniList genres/tags do not automatically map to Jikan's MAL taxonomy.
- Official references: [AniList GraphQL](https://docs.anilist.co/guide/graphql/) and [Jikan anime search / genre filters](https://github.com/jikan-me/jikan-rest/blob/master/storage/api-docs/api-docs.json). Full AniList genre/tag discovery and honest backend matching remain **PLANNED**, not implemented or tested.
- Next engineering slice: define a verified canonical filter-option contract and explicit support/mapping/provenance per provider, then add matched API/router/UI tests for filter combinations and pagination. Do not enable options unsupported by the backend or perform client-only first-page filtering. No files, endpoints, data, or provider settings were changed during this research audit.

## 2026-11-01 — Browse truthful-count and default-sort checkpoint (MERGED; LIMITED)

- [PR #111](https://github.com/rzqllh/Yoru/pull/111), reviewed change to `frontend/src/App.tsx` and regression to `tests/browser/yoru.spec.mjs`, merged main `ae9bc81ae00ce61cba5abcdd4d1be34edb465327`. The count label reports **loaded deduplicated titles**, not an unsupported catalog total. Default sorting is correctly labeled **Paling populer**, consistent with Jikan `order_by=popularity&sort=asc`.
- PR head `0f3db7a09cb366acac32857fb0905e6cbe6ebe44`: [Linux/Windows checks](https://github.com/rzqllh/Yoru/actions/runs/41227101975) SUCCESS, [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41227101983) SUCCESS. The browser fixture loads page two with an overlapping anime and verifies unique visible count. **Physical device, actual provider, full genre/combined filter QA NOT RUN.**
- Scope: **AC-DATA-08 partial UI correctness**, not whole Phase 04. Next: canonical supported genre/tag contract, mapping, filters and cross-page response evidence, plus hosted health and release gates.

## 2026-11-01 — Y04 Tenrai canonical genre-option contract (CODED, pending exact-head CI)

- Branch `feat/y04-tenrai-genre-options-20261101`, from main `e5812270`. New `backend/pipeline/anime-genres.ts`, API `GET /api/anime/genres` and `tests/anime-genres.test.mjs`. No deployment, cloud auth, paid provider, destructive data or source-picker edits.
- The endpoint reads Tenrai's documented `/v1/genres/anime?filter=genres` with 10s timeout, 15m successful cache/inflight deduplication and 1m fallback cache. It validates numeric MAL IDs, complete known baseline entries, safe names, removes duplicate and adult-only IDs 9/12/49, and returns `source:'Tenrai',status:'upstream'` when accepted. Failure returns the previous 12 known-safe genres with `source:'built-in',status:'fallback'`, not an invented complete list.
- **Not yet integrated into Browse UI or genre filtering.** AniList genres/tags remain a different taxonomy and are **not** represented as Tenrai/MAL genres; no unsupported filter is enabled. API contract and fixture tests alone do not prove live Tenrai availability, end-to-end genre queries, or production.
- Acceptance AC-DATA-05 is PARTIAL/CODED. New full-genre UI/backend validation + fallback behaviour, real upstream 429, cancellation and pagination need further slices. CI/Chromium/WebKit results MUST be recorded against exact PR head before merge.

### Y04 code/test verification — 2026-11-01

- [PR #116](https://github.com/rzqllh/Yoru/pull/116) code/test head `27eb45849c38e0af966ba8a3c34ca09cfdb21d7a`: [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41244040283) **SUCCESS**, [Chromium/WebKit E2E](https://github.com/rzqllh/Yoru/actions/runs/41244040288) **SUCCESS**. New tests check Tenrai genre name/ID safety, duplicate/adult exclusion, complete fallback, source provenance and one-fetch caching using fixtures; browser suite was existing regression, not live provider verification.
- Earlier failed head `356c74e` had **ERR_MODULE_NOT_FOUND** because native Node strip-types did not resolve TypeScript module imports using `.js` references; resolved in `27eb458` by using the already-installed `tsx` subprocess loader for isolated integration tests. Do not report initial failure as pass.
- PR #115 concurrently merged separately into `main` at `1217bcd` for source-picker security; no overlap with the six PR #116 files, but final merged-main CI still required. This source taxonomic endpoint is **not yet connected to the filter UI**, so AC-DATA-05 remains **PARTIAL**. Exact final docs-head CI/browser must be checked before merge.

## 2026-11-01 — Y04 dynamic MAL genre filter integration (CODED; TESTS PENDING)

- Continuation branch `feat/y04-genre-filter-ui-20261101` starts from main `ae43a698600d17f6d77e5149177e05b46a43c3b0` after [#116](https://github.com/rzqllh/Yoru/pull/116) merged. New Tenrai genre catalog is now fetched in Browse using validated `GET /api/anime/genres`. Existing 12 name-based choices/URLs remain backward-compatible.
- Additional source-backed genre options use canonical `mal:<numeric ID>` URL values. Server `/api/anime/browse` accepts these only after resolving them against the Tenrai validated/cached taxonomy, and passes the numeric ID to the upstream full-catalog Jikan-compatible query. Invalid, unknown and excluded adult IDs return HTTP 400 `INVALID_FILTER` and do not silently convert to unfiltered results.
- When taxonomy is unavailable, Browse retains the original twelve options and explicitly reports partial availability. Invalid bookmarked selections stay visible as unavailable rather than being silently replaced. Frontend validates source/status and typed options; tests cover backend combined server filters/pagination, router deep-link round-trip, browser selection/reload and fallback.
- **Scope:** MAL/ Tenrai *genres only*; no AniList tag/genre substitution, theme/demographic mixing, client-side first-page filtering, changes to user backups/Supabase/providers, Vercel configuration or production release. Real API, HTTP 429, physical iPhone and full combined live-filter matrix remain NOT VERIFIED. New tests, CI and browser suite **NOT RUN** at this checkpoint.

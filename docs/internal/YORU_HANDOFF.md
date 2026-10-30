# Yoru — Always-current cross-model handoff

**Snapshot:** 2026-10-30, Asia/Jakarta. **Authority:** current GitHub code, PR checks, [epic #44](https://github.com/rzqllh/Yoru/issues/44), [tracker](YORU_TASK_TRACKER.md), and [release gate #20](https://github.com/rzqllh/Yoru/issues/20). This document records a verified checkpoint, not a promise to do background work.

## New model: resume protocol

1. Inspect repository `rzqllh/Yoru`, latest preview ref `deploy/vercel-preview-20261029`, `main`, all open PRs, CI and Browser E2E checks for **exact HEAD**, plus epic #44 and release gate #20.
2. Read [YORU_TASK_TRACKER.md](YORU_TASK_TRACKER.md) and this handoff from the latest preview ref. If a PR is open and not merged, inspect that PR's updated copies instead of assuming these are the final state.
3. Pick the highest-priority **unblocked** task from the tracker; assess overlapping code paths before branch creation.
4. Implement on an independent feature branch targeting preview, add tests, ensure Linux/Windows CI and Chromium/WebKit E2E succeed on the **exact PR head**. A previous feature head's tests are **not** valid after rebasing.
5. After each meaningful PR/progress milestone, update BOTH internal files, epic #44, and a handoff checkpoint. Report verified CODED/TESTED/LIVE_VERIFIED independently. Public docs are updated once actual implementation evidence exists; don't promote to main/production.
6. At handoff, specify one exact next action and owner-controlled external blockers. Do not invent source availability, subtitle tracks, media rights, live view counts, release readiness, or test results.

## Explicit approved owner product decisions

- Anime-first, restrained glass-premium PWA, accessible mobile navigation, honest copy, local-first IndexedDB library/progress. Account/cloud sync deferred.
- Top 10: daily AniList activity with timestamp and source label; fallback clearly marked as catalog popularity, never fake watch counts.
- Hero auto-cycle every **8 seconds**, manual previous/next/pause, hidden-tab and reduced-motion respect.
- Indonesian subtitle: validated Stremio addon candidates first; then provider options, English only by allowed fallback preference. Manual Off/language overrides. Do not fabricate subtitles or translate automatically.
- Watch Guide: discover link in a **secondary** `/jelajahi/panduan-urutan` page and an anime-detail link. Modes: recommended newcomer route, chronological story, release date. Fate-style franchises branch; don't impose linear canon or expose spoiler traps.
- Full franchise routes across TV/OVA/special/movie and path progress are approved but **not fully implemented**; current app offers direct AniList relations and dated release ordering only. Recommended/Chronology are intentionally disabled.
- Subtitle font/size/text-background opacity/outline/position preview; only native WebVTT supports controls, native cue positioning conditional, hardsub/iframe unaffected. Safari device sign-off still pending.
- Quality = default adaptive HLS Auto. Only manifest-declared resolutions active, not fake 1080p labels; unsupported browser options disabled.
- Torrentio/YTS-style addon streaming UX was clarified: user wants addon-integrated source choices, not a separate torrent download-manager UI. Current implementation classifies `url` vs `infoHash/fileIdx` vs `externalUrl`; hash-only candidates visible **disabled** until an explicitly approved verified resolver/engine can provide playable media. No silent torrenting/seeding, no arbitrary proxy or guessed codecs.
- Workstreams may run parallel on independent files/branches; integrate to preview serially. This session did not have a real coding subagent invocation facility.
- **No merge to `main`, public deploy, final GitHub release or lowered protection until #20 and final owner approval.**

## Verified code checkpoint

- GitHub repo: `https://github.com/rzqllh/Yoru`.
- Preview ref after graph #58 and docs #59: `c5e7c66118b830efe16b072521406921da4a9e4d` (fetch live HEAD; a later checkpoint-only PR may advance it).
- `main` observed `8200bf235c56c866e30b2012d3b683b63dc7803e`; never infer unchanged after this date.
- PR #45 (`fbc7bf6b`), #48 (`8b82c1fd`), #50 (`0a184799`), #51 (`a7cacfe9`), #52 (`4e482f07`), #55 (`3bbc1437`), #56 (`ea4c9b45`) **merged to preview**, not `main`.
- Exact tested feature heads: #48 `b7219869`, #50 `ad000df0`, #51 `3c2d7115`, #52 `330b7abc`, #55 `40a2bb88`, #56 `d4aa24d7` (GitHub Linux/Windows CI and Chromium/WebKit Browser E2E PASS). Check current branch HEAD independently.
- Earlier conflicting PRs #46/#47/#49/#53/#54 were closed as superseded after tracker/feature squash rebases, not force-merged.
- Vercel project `yoru` had an SSO-protected preview deployment READY; that is **not** a passing HTTP smoke, subtitle live matrix, physical iPhone, or production acceptance.
- Public release issue #20 remains **BLOCKED**.

## Architecture & files

- `frontend/src/App.tsx`: Home/Browse/Library/Detail, candidate-source selection, direct resume.
- `frontend/src/components/Player.tsx`: HLS/MP4 + embed player, subtitle view/preferences, quality and recovery.
- `frontend/src/components/WatchGuide.tsx`: separate franchise discovery, 2-hop AniList graph and editorial sourced route choices.
- `frontend/src/lib/quality-options.ts`, `caption-appearance.ts`, `resume.ts`: verified-only quality levels, bounded subtitle style, resumable progress.
- `frontend/src/lib/db.ts`: IndexedDB + backup compatibility; use **versioned schema migrations** for new franchise progress.
- `backend/pipeline/watch-guide.ts`: fixed AniList GraphQL direct-relations explorer, strict MAL ID mapping. No complete franchise graph/curated path.
- `backend/providers/stremio-core.ts`, `stremio.ts`: allowlisted addon requests; direct HLS/MP4 entries vs torrent-only disabled metadata, explicit MAL-to-Stremio/IMDb mapping.
- `backend/api/app.ts`: `/api/anime/:id/watch-guide`, `/api/streams` with possible addon `unavailable` entries. Avoid server-side open proxy.
- `tests/*.test.mjs`, `tests/browser/*`, `.github/workflows/ci.yml`, `browser-e2e.yml`: test contracts and current CI evidence.
- Public docs: `README.md`, `DESIGN.md`, `docs/public/*`. Keep visitor language direct and state limitations accurately.

## Latest checkpoint — universal anime watch-order discovery (2026-10-30)

**Owner scope:** research recurring anime watch-order complaints from forums for **all titles**, rather than hand-curating only Fate, SAO, and Slime. [Research + evidence matrix](WATCH_ORDER_RESEARCH_2026-10-30.md) documents nonchronological broadcast, story/novel release mismatch, OVAs/specials/movies, recap/compilation, independent continuity branches, spoiler risks and missing catalog links.

- PR #58 `feat/yoru-universal-watch-graph-20261030` **merged to preview** as `dad6ed4e51ca1fa0070b54229e7180e7043b6c74`. Exact feature head `c5d94c741967fee3638024920452d76cbed1fad8`: GitHub CI Linux/Windows and Browser E2E Chromium/WebKit PASS. Not live-provider validation.
- General code: `backend/pipeline/watch-graph-core.ts` pure relation normalizer and `watch-graph.ts` bounded AniList retrieval; `/api/anime/:id/watch-guide?depth=2` opt-in; `frontend/src/components/WatchGuide.tsx` universal search/filter. No franchise-specific hardcoded viewing order, no claim that AniList media relations encode the episode-by-episode plot chronology.
- Controls: max 10 direct neighbors expanded, max 75 mapped nodes, visited/deduped graph cycles, 12 expansions/min process-local cap, 20min success cache, partial/upstream response labels, sorted known month/year with unknown last; categories TV, movie, OVA/Special/ONA, alternative paths, compilation and other.
- Documentation PR [#59](https://github.com/rzqllh/Yoru/pull/59) **MERGED** to preview `c5e7c66118b830efe16b072521406921da4a9e4d`. Its exact head `3f430e6521ec378d1118215116a9cd68d58124e2` passed CI (Linux/Windows) and Browser E2E (Chromium/WebKit). [Public user guide](../public/watch-order.md), README/DESIGN/usage/release/development/troubleshooting/production guides now reflect the bounded graph and correction process.
- **NOT COMPLETED:** all-series forum review or automatically reliable chronology; curated Fate/Monogatari/Gundam/Haruhi/OVA episode insertion routes; human-reviewed and cited `pathId` steps/optionality, rewatch/spoiler classifications, local path progress; real AniList queries and physical Safari. Keep Recommended/Chronology disabled pending editorial proof.
- **NEXT RESUME STEP:** read current preview HEAD and open PRs; implement generic **curated watch-path data schema** with source/edition/episode range/branch/spoiler verification and pilot across different forum issue categories. Keep unsupported Recommended/Chronology modes disabled. YX-02 honest source lifecycle and YX-12 browse URL persist remain independent lanes. No main/production promotion. No main/production promotion.

## Curated watch paths (2026-10-30, merged PR #62)
- PR #62 merged to preview `d5651b1a4c6e954a9326d56b56dbdaf9d60c0fdf`, exact tested head `ff104181f0344c3584af3ccb4b046dca8f75549b` Linux/Windows CI and Chromium/WebKit Browser E2E PASS. Original #61 closed as superseded after #59/#60 documentation merge.
- Added bounded, audited source registry in `frontend/src/lib/curated-watch-paths.ts` and adapted WatchGuide UI with editorial citations/dates, two Fate alternatives (newcomer and prequel-first) plus Monogatari starter route. Features are source-dependent suggestions **not universal chronological truth**.
- Entry cards use exact verified AniList IDs as anchors; show local details only if MAL ID from graph is available, otherwise AniList link. Every other franchise retains universal 2-hop metadata explorer; no fictitious canon.
- Unit and browser tests passed for this code; still NOT proof of live franchise editorial completeness or real source playback. Public docs updated as final follow-up; #20 remains BLOCKED. NEXT: add more sourced watch-path editions/episode insertion based on community complaints without publishing unreviewed canon, and implement YX-10 local path progress via safe IndexedDB schema.

## Exact current code checkpoint
- Preview after #62 feature merge: `d5651b1a4c6e954a9326d56b56dbdaf9d60c0fdf`. Verify current HEAD, do not assume unchanged.
- Published paths: Fate anime-modern newcomer; Fate prequel-first alternative; Monogatari introductory editorial. Source links, checked/reviewed date and explicit NOT-canon disclaimer. All other anime retain generic graph. Public documentation PR is **documentation-only** and must pass its own CI before merge.

## Latest verified YX-10: manual progress per editorial watch path (#64 merged)
- PR #64 merged to preview `27e87bdb3d8954195acc23da6cd2621b3d8098e4`, exact tested feature head `5f7c373e831f536e97271c09c710321cc2750f01` with Linux/Windows CI + Chromium/WebKit Browser E2E PASS.
- Local preference `watch-path:<id>` stores compact JSON completed-step count and updated timestamp; strict bounded parser clamps progress to path length. Existing IndexedDB `preferences` and v1 backup already include this key, **no schema migration**.
- In WatchGuide, each curated path has explicit next-step and undo actions. Progress is **manual**, not inferred from media playback or streaming availability, and independent between alternative routes.
- No real iPhone or live provider test. Local preferences and v1 backup path are covered by current compatibility design; unit and browser reload/independent-route acceptance PASS. Public user docs updated in separate final docs PR.
- Owner tasks OPEN: extensive sourced watch paths for community-reported franchises, episode insertion, YX-10 automatic player integration ONLY with verified session data, physical Safari and #20 public release gate.

## Verified source-lifecycle checkpoint (2026-10-30, merged #66)
- PR #66 preview merge `5460bec489e04399fad8b2fa6ab08a969d28d82f`; exact tested head `30184179cfb765eac6b8fb5a6de3b85e002e09d1`. Linux/Windows CI and Chromium/WebKit Browser E2E PASS.
- YX-02 TESTED code: isolated pure provider-summary module in `frontend/src/lib/source-lifecycle.ts`, separate outcomes for candidate metadata, no direct sources, provider errors, partial failure. Detail source picker shows search/check/verified/failed and preserves opt-in embed fallback after a single native candidate fails. Stale response guard per request.
- Node and deterministic browser tests for provider outage, healthy-but-empty and partial source failure PASS on exact head. No live media/provider availability, no physical iPhone sign-off.
- Next action: continue independent YX-06 persisted source-memory/recovery (after architecture review) or YX-09 wider source-backed editorial editions, then YX-12 browse URL state. Do not touch `main`/production or relax #20.

## Hard blockers

- **G1–G3 (#20):** real authorized source-provider endpoints with live video, strict season/episode mapping and actual subtitle credentials/download proof. Mocked provider fixtures are not live tests.
- **G4:** physical iPhone Safari playback, HLS fullscreen/PiP, WebVTT style/position and PWA installation/upgrade evidence.
- **G5:** hosted API and frontend over HTTPS, accessible health routes with protection respected, production secrets, ingress rate limiting, observability/rollback.
- **G6:** exact final commit acceptance, no open P0/P1, quantitative source coverage matrix, explicit owner go/no-go.
- **YX-09/10:** curated branching franchise paths + persisted path progress are independent non-secret engineering/editorial work and can be started without waiting for physical/production inputs.
- **YX-19:** no torrent/debrid resolver yet; first agree threat model and provider contract. Never route unknown magnet/hash into iframe or native video URL.

## Copyable handoff checkpoint template

```text
PROJECT: rzqllh/Yoru
TIME / TIMEZONE:
PREVIEW INTEGRATION HEAD (EXACT SHA):
MAIN HEAD (EXACT SHA; no write):
ACTIVE BRANCH + PR URL + HEAD SHA:
TASK IDS + STATUS (PLANNED/CODED/TESTED/LIVE_VERIFIED/BLOCKED):
WHAT CHANGED (files + visible behavior):
EXACT TEST EVIDENCE (CI/Browser E2E URLs and PASS/FAIL/NOT RUN):
LIVE PROVIDER / SAFARI EVIDENCE (or NOT VERIFIED):
BLOCKERS / OWNER INPUT NEEDED (never paste secrets):
OPEN PR CONFLICT CHECK:
PUBLIC DOCS STATUS:
NEXT ACTION (one exact next step):
DO NOT: merge main, promote production, invent provider/Subtitle Indonesia/release proof.
```

**Resume suggestion:** extend curated path evidence by verified franchise/edition, episode ranges, optionality, prerequisite relationships and public correction process; pilot Haruhi broadcast order, Re:Zero OVA placement, Gundam continuities. Local manual path-progress storage is already implemented (#64), but playback-linked automatic progress is NOT. Fate/Monogatari options already live in preview code but not production. In parallel, YX-12 browse URL-state task remains open, whereas YX-02 deterministic code acceptance is now tested. In parallel, YX-06 enhanced source memory and YX-12 browse URL persistence can be scoped into independent PRs.

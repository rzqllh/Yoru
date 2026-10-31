# Yoru — Master Project Plan

> **Version:** 1.0 planning baseline · **as of:** 2026-10-31 (Asia/Jakarta)  
> **Repository:** [rzqllh/Yoru](https://github.com/rzqllh/Yoru) · **audited main:** [`2b6c1d4`](https://github.com/rzqllh/Yoru/commit/2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b)  
> **Scope:** entire Yoru product and engineering lifecycle, not merely the current UX sprint.  
> **State:** PLANNED. Engineering preview exists; public streaming release [#20](https://github.com/rzqllh/Yoru/issues/20) is BLOCKED.

## 0. Purpose, authority, and maintenance

This persistent **owner-requested** planning directory records product, architecture, verification, blockers and handoffs. It complements rather than replaces canonical [#44 product epic](https://github.com/rzqllh/Yoru/issues/44), [#20 release gate](https://github.com/rzqllh/Yoru/issues/20), [#78 cross-device acceptance](https://github.com/rzqllh/Yoru/issues/78), code, PR discussion and exact-SHA CI.

- Decision priority: explicit current owner instructions > accepted Yoru contract > verified repository/runtime evidence > proposed enhancements. If inconsistent, log the conflict and seek decision before implementation.
- **This `docs/planning/handoffs/` folder is owner-requested persistent planning**, distinct from the **temporary `docs/handsoff/` folder** forbidden on merged `main` by #44. Do not recreate `docs/internal/`.
- Planning is not proof: labels `PROPOSED`, `CODED`, `TESTED`, `LIVE_VERIFIED`, `BLOCKED` and `UNKNOWN` must remain separate. `DONE` requires the specified acceptance and evidence.
- Each actual implementation PR updates relevant tracking rows, the acceptance matrix and its phase handoff. Historical snapshots are dated; never overwrite evidence with an unverified assertion.
- Review planned architecture, dependency, data/security and production changes with the owner before executing them. Docs alone do not authorize deployment, payment, credential use, resolver installation or release.

## 1. Product vision and user outcomes

Yoru is an anime-first, local-first progressive web application for finding titles, understanding franchise order, choosing **actually usable** video sources, handling subtitles transparently, and resuming personal progress. It is **not** a managed licensed streaming catalogue, a universal torrent client, a native app, or a guaranteed Sub Indo provider.

Core journeys: (a) discover/search/filter → open title → decide to watch/save, (b) inspect verified episode candidates → play where supported → select subtitles → resume, (c) understand franchise release order/reviewed paths → choose title/episode, (d) maintain library/progress locally → optionally transfer across own devices, and (e) recover from upstream outages without false claims.

Success prioritizes truthfulness, legibility, user control, keyboard/touch accessibility, data privacy and testable reliability over inflated item counts or fake availability.

## 2. Current implementation map (source-verified; not live certification)

| Capability | Code/contract | Current evidence boundary |
| --- | --- | --- |
| Frontend/PWA | React, Vite, TypeScript, `frontend/src/App.tsx`, `Player.tsx`, styles, service worker | Preview functionality; iPhone physical acceptance pending |
| Backend | Hono `backend/api/app.ts`, Node/local server, `api/index.ts` Vercel adapter | Local deterministic smoke exists; production endpoints require live check |
| Canonical metadata | Tenrai Jikan-compatible source, MAL IDs, search/discover/browse | Upstream is fallible; filters currently only 12 allowed genres |
| AniList enrichment | Daily activity, watch-guide graph, editorial path sources | Not a verified universal source for browse filters |
| Direct video | Browser HLS/MP4 native preflight, quality/state/resume | Browser/codec/CORS/rights and genuine episode coverage unverified broadly |
| Stremio/Torrentio-compatible | Explicit addon config + mapped Stremio stream/subtitles resources, hash classification | HTTPS HLS/MP4 candidates supported conditionally; torrent `infoHash` is NOT an HTTP playable URL |
| Other sources | Local JSON, optional Miruro-compatible API, external AnimeEmbed | Trust and source capability differ; uncontrolled iframe must be removed from playable options per D02 |
| Captions | Native style and preference controls, local VTT/SRT/limited ASS, SubDL/SubSource/OpenSubtitles/Stremio adapters | Provider credentials and real season/episode matching not live-signed |
| Library/backup | IndexedDB, resume, watch-path manual progress, versioned export/import | Browser storage may be evicted; cross-device sync not in main |
| Cross-device | [Draft PR #77](https://github.com/rzqllh/Yoru/pull/77) Supabase OTP/manual snapshots | Dedicated staging schema tested only in limited ways, real 2-user/device gates pending |
| Delivery | CI Linux/Windows + Chromium/WebKit; Vercel project | Full public release remains BLOCKED (#20) |

Verify implementation changes against the live tree and PRs before claiming these statements are still current.

## 3. Locked owner UX/CX decisions (2026-10-31)

- **D01 / 1A:** Indonesia subtitle first; English is offered **only after explicit confirmation**. Preference Off persists; a missing language is not fabricated.
- **D02 / 2B:** Hide **uncontrolled alternative playback** from playable source selection. An external iframe without proven subtitle control is not a supported playable route. If no qualified source remains, show honest unavailable state. Do not confuse this with hiding diagnostic candidate counts.
- **D03 / 3B:** Keep **Tenrai/MAL canonical**, enrich genre/tag/filter/relation from AniList where supported. Preserve MAL IDs, saved library and source references; no forced migration to AniList-only identities.
- **D04 / 4A:** Mobile anime detail becomes a full page with shareable `/anime/:malId`, Back/Forward and preserved browse context.
- **D05 / 5A:** Watch Guide offers **release order** and **reviewed curated viewing route** when available. A story chronology requires separate proof and must never be inferred from relation edges.
- **D06:** Hero rotates every 8s while eligible, pauses on hover/focus/interactions, supports touch swipe, removes numbered and old navigation controls; ensure accessible non-gesture control to stop/operate carousel.
- **D07:** Section title **Anime Popular**, uniform mobile two-column cards (2:3 poster, consistent badges/metadata).
- **D08:** Browse design-system cleanup; “Akan Datang” becomes a separate destination, not a third segmented filter; guide gets clear separate information hierarchy.
- **D09:** Subtitle native styling targets familiar sans, roughly 90% baseline, thin outline, limited backdrop and safe position, subject to actual browser renderer capability.

The above are **approved product direction**, NOT completed code. Any exception or conflict must be documented in tracking before PR.

## 4. Architecture and trust boundaries

`Browser/PWA (React/Vite, video, IndexedDB, SW) -> same-origin Hono API (validation, cache, mappings, bounded network) -> [Tenrai/MAL | AniList | configured source adapters | subtitle APIs]`.

Principles:
1. Canonical anime identity is `malId`; AniList enrichment requires validated `idMal` mapping and explicit unmatched handling. Never merge by title alone.
2. Separate `metadata`, `episode listing`, `candidate stream`, `native capability checked`, `playback confirmed`, and `subtitle matched/loaded` states. A cached poster or candidate does not equal playable media.
3. For Stremio resources, `stream.url` may be a direct playable video URL **only when** HTTPS and content/browser checks pass; `infoHash/fileIdx` identifies torrent data, not a URL; `externalUrl` is navigation, not native playback. `/subtitles` is an independent addon resource. Cross-check manifest and mapped season/episode. See [Stremio stream specification](https://stremio.github.io/stremio-addon-sdk/api/responses/stream.html) and [subtitles specification](https://stremio.github.io/stremio-addon-sdk/api/responses/subtitles.html).
4. Yoru currently **classifies Torrentio-style hashes as unavailable** (`backend/providers/stremio-core.ts`). Torrentio being configured or returning entries does not mean a browser, especially iPhone Safari, can decode/torrent them. Any opt-in torrent resolver/engine is a *separate owner-approved architecture, hosting, licensing and security decision*. No silent torrent start, arbitrary proxy, credential exposure, DRM bypass or presumptive rights.
5. For uncontrolled iframe/hard-sub, **D02** prevails over existing legacy external-embed fallback code; gate its removal in source selection and update user-facing documentation/tests. A verified controllable external integration may be re-evaluated through evidence and approval.
6. External providers and image domains are untrusted. SSRF/DNS/IP/redirect guards, bounded request size/time, secret isolation, quota protections, safe URL grants and cancellation remain baseline. Enforce abuse control at public ingress, not merely process-local counters.
7. Local-first IndexedDB stays usable without login. Optional cloud transfer is manual/consent-based unless independently approved. RLS/Auth, CAS revision, account isolation, deletion/privacy and device conflict evidence are release gates for sync.
8. PWA offline shell is not offline streaming. Physical iOS Safari/PWA proof is independent of Playwright WebKit.

## 5. System design and interaction standards

- Reuse established CSS/design tokens and UI components; one governing visual system. Goal: comfortable density, consistent 4/8/12/16/24/32px spacing, minimum ~44px mobile primary touch targets, WCAG-conscious focus/contrast, proper safe areas, readable long titles and empty states.
- Home: hero with honest source attribution, accessible rotation and swipe; Anime Popular uniform grid; seasonal discovery; continue watching from verified progress.
- Browse: clear search and 2–3 primary categories; dynamic supported genre collection (not 12-name hardcode), separate tags, status, format, score/year/sort; server-side correctness and shareable filters with truthful counts.
- Detail: mobile full-page, metadata-first, episode/source states, resume CTA when verified, guide deep link, preserved Back/history; desktop behavior can remain adaptive but cannot contradict deep-link semantics.
- Guide: separate franchise explorer, release ordering and cited editorial routes, optional/mandatory paths, edition distinctions and spoiler safety; never promise a canonical order for all anime.
- Player: native and controllable sources prioritized; Indonesian preferred; English opt-in prompt; Off persists; renderer capability gating; explain no source/subtitle rather than falling back to misleading content.
- Collection: local library sorting, explicit save/status/delete, backup import validation and no cross-user leakage.

## 6. Data/API contracts

Existing relevant routes: `/api/health`, `/api/anime/discover`, `/api/anime/search`, `/api/anime/browse`, `/api/anime/:id`, `/api/anime/:id/episodes`, `/api/anime/:id/watch-guide`, `/api/anime/:id/provider-episodes`, `/api/streams`, `/api/anime/:id/subtitles`, `/api/subtitles/file`, `/api/subtitles/status`, `/api/providers`. Keep contracts backward compatible until clients/migrations and tests are planned.

Future AniList hybrid filters require validated provenance, pagination/cursors, stable sort semantics, absent/mismatched `idMal` handling, 429/backoff, bounded caching and degradation policy. Never display `24 total titles` when 24 are only the loaded page. Future season mapping must avoid hardcoded `season_number=1` for sequel anime. Changes to API fields are PROPOSED, not already shipped.

## 7. Security, privacy, licensing and operational controls

- No secrets/tokens/service-role keys in Git, frontend builds, public docs, screenshots, issues or provider URLs.
- Use existing same-origin API and trusted HTTPS upstream allowlists; validate inputs and output shape. No unrestricted remote fetching.
- Before torrent resolution, verify content-use authorization and deployment/platform constraints. Do not infer rights from an addon response.
- Account cloud features require opt-in, RLS isolation, no provider URLs in snapshots, consent, delete/export and safe authentication lifecycle.
- Before public hosting: HTTPS frontend+API, CSP/CORS, observability, environment separation, resilient rate limiting, rollback and no unintended auto-deploy.
- Physical Safari and actual provider sign-off are mandatory for a public streaming claim.

## 8. Definition of done — by level

**Requirement DONE:** implemented in reviewed PR; relevant acceptance IDs pass on exact SHA and measured devices; error/recovery/compatibility tested; handoff references commit/results.  
**Phase DONE:** all required rows either DONE or explicitly approved deferred (none of P0 safety/rights), phase exit criteria and dependencies met; tracking and matrix updated.  
**Release GO:** [#20](https://github.com/rzqllh/Yoru/issues/20) G1 video coverage, G2 episode accuracy, G3 live subtitles, G4 physical iPhone, G5 public infrastructure and G6 final owner sign-off completed with dated evidence on exact released commit. **CI PASS alone never satisfies this.**

## 9. Source of truth, work protocol and scope map

- **Epics/gates:** [#44](https://github.com/rzqllh/Yoru/issues/44), [#20](https://github.com/rzqllh/Yoru/issues/20), [#78](https://github.com/rzqllh/Yoru/issues/78), [#3](https://github.com/rzqllh/Yoru/issues/3), [#95](https://github.com/rzqllh/Yoru/issues/95).
- **Actual code:** `frontend/src`, `backend`, `api/index.ts`, `configs`, `tests`, `scripts`, `vercel.json`, `DESIGN.md`.
- **Existing user/ops docs:** `docs/public/`; revise public docs only when capabilities change and are verified.
- **Planning index:** [CURRENT_STATE](CURRENT_STATE.md), [PHASE_PLAN](PHASE_PLAN.md), [TRACKING](TRACKING.md), [ACCEPTANCE_MATRIX](ACCEPTANCE_MATRIX.md), [handoffs](handoffs/PHASE_00_HANDOFF.md).
- PRs are isolated by dependency; avoid overlapping App/Player/styles changes; exact-head Linux/Windows and Chromium/WebKit checks before merging; release and deployment are separately authorized.
- No assumptions about agents/personas: assign real owners for work that is actually dispatched, not imaginary specialist execution.

# Yoru — Authoritative task tracker

Updated: **2026-10-30 (Asia/Jakarta)**. Product epic [#44](https://github.com/rzqllh/Yoru/issues/44); strict public release gate [#20](https://github.com/rzqllh/Yoru/issues/20); handoff [YORU_HANDOFF.md](YORU_HANDOFF.md).

## Current integration state

- Repository: `rzqllh/Yoru`.
- Preview integration: `deploy/vercel-preview-20261029`, verified post-public-docs head `c5e7c66118b830efe16b072521406921da4a9e4d`. **Fetch latest head before working.**
- Production branch `main`: `8200bf235c56c866e30b2012d3b683b63dc7803e` at last check. **No merge/release to main authorized.**
- Public docs alignment is the *final task of this implementation wave*; do not treat other unimplemented epic items as shipped.
- Status semantics: `PLANNED` = design backlog; `CODED` = implementation exists but acceptance incomplete; `TESTED` = exact-code CI/Browser E2E evidence; `LIVE_VERIFIED` = real upstream/device test; `BLOCKED` = real dependency. Tests with mocked provider metadata do not prove live source coverage.

## Delivery matrix

| ID | Priority | Scope | Current state | Evidence / remaining acceptance |
|---|---|---|---|---|
| YX-01 | P0 | One-tap resume | **TESTED code** | PR [#52](https://github.com/rzqllh/Yoru/pull/52), exact head `330b7abc` CI/E2E PASS; native source rechecked, saved episode position |
| YX-02 | P0 | Honest episode/source lifecycle | **TESTED code (#66), live sources pending** | Explicit candidate/check/verified/degraded/no-direct/error states, fallback opt-in; PR #66 exact head `30184179` CI Linux/Windows + Chromium/WebKit PASS; upstream media unverified |
| YX-03 | P0 | Verified HLS quality choices | **TESTED code** | PR [#48](https://github.com/rzqllh/Yoru/pull/48), head `b7219869` CI/E2E PASS; Auto default, manifest-backed options |
| YX-04 | P0 | Native subtitle styling | **TESTED code, live device pending** | PR [#55](https://github.com/rzqllh/Yoru/pull/55), head `40a2bb88` CI/E2E PASS; font, size, opacities, outline, conditional VTTCue position, preview |
| YX-05 | P0 | iPhone Safari physical acceptance | **BLOCKED** | Real iPhone OS/model and playback/fullscreen/PiP/subtitle/PWA validation |
| YX-06 | P0 | Source memory, recovery and smart next | **PLANNED** | Prior auto-next/recovery exists; new persisted source preference/enhancement not implemented |
| YX-07 | P0 | Franchise links from anime detail | **TESTED expanded metadata** | PR [#50](https://github.com/rzqllh/Yoru/pull/50) first-degree + [#58](https://github.com/rzqllh/Yoru/pull/58) two-hop, exact head `c5d94c7` CI/E2E PASS; not canon chronology |
| YX-08 | P1 | Secondary Watch Guide in Jelajahi | **TESTED expanded metadata** | PR #58, search plus opt-in two-hop graph and type filters, source and incomplete-result notices |
| YX-09 | P1 | Universal watch-order research, graph + curated pathways | **TESTED partial (#58/#62/#68)** | Generic graph; source-backed Fate/Monogatari; Haruhi 2006/2009 and Re:ZERO OVA episode-edition routes added #68; extensive franchise/source-episode coverage remains OPEN |
| YX-10 | P1 | Franchise-path progress & next entry | **TESTED partial (#64)** | Manual per-route completion, undo, next-step, backed up via existing preferences; exact feature head `5f7c373` CI+Browser E2E PASS. Automated playback-linked / episode-level tracking remains OPEN |
| YX-11 | P1 | Search suggestions/aliases | **PLANNED** | Need verified alias data and keyboard UX |
| YX-12 | P1 | Browse filter state in URL, chips and range | **TESTED (#70)** | PR #70 exact head `af1100d0` Linux/Windows CI + Chromium/WebKit E2E PASS; canonical shareable filter URLs, browser history, chips, 1950-year coverage; real catalog data beyond mock fixture unverified |
| YX-13 | P1 | Local personalized home/library enhancement | **PLANNED** | Existing watchlist/resume only; new product UX pending |
| YX-14 | P1 | Shareable anime detail/trailers | **PLANNED** | Respect available catalog metadata |
| YX-15 | P1 | Unified CSS tokens, antislop UX, accessibility | **CODED docs only** | `DESIGN.md` aligns effective token values; source CSS consolidation and full audit pending |
| YX-16 | P1 | Image/performance improvement | **PLANNED** | Responsive images, lazy load, LCP/INP/CLS real measurement pending |
| YX-17 | P1 | First-run, errors, backup reassurance | **PLANNED** | Current error UX exists but enhancement incomplete |
| YX-18 | P0 | Torrentio/Stremio source classification & UI | **TESTED partial** | PR [#51](https://github.com/rzqllh/Yoru/pull/51) head `3c2d7115` and [#56](https://github.com/rzqllh/Yoru/pull/56) head `d4aa24d7`; CI/E2E PASS; torrent-only **disabled**, not playable |
| YX-19 | P0 | Opt-in playable torrent resolver | **BLOCKED** | Requires trusted, explicit engine/resolver, credentials/security/rights review, browser/device verification |
| YX-20 | P0 | Live video/subtitle matrix | **BLOCKED** | Real source/episode coverage, subtitle provider keys, signed download, codecs, host authorization |
| YX-21 | P0 | Full release sign-off | **BLOCKED** | Issue #20 G1–G6; production must not be promoted |
| YX-22 | FINAL WAVE | Sync public docs and delivery status | **TESTED & MERGED (current wave)** | PR #57 initial docs + PR #59 universal guide and handoff merged `c5e7c661` after exact head `3f430e65` CI+Browser E2E PASS |

## Successfully integrated on preview (not main)

| PR | Preview merge SHA | Verified PR head | Evidence scope |
| --- | --- | --- | --- |
| #45 tracker/handoff | `fbc7bf6b` | CI + Browser E2E PASS | Durable issue/backlog and model transfer contract |
| #48 HLS quality | `8b82c1fd` | `b7219869` | Linux/Windows CI + Chromium/WebKit |
| #50 Watch Guide | `0a184799` | `ad000df0` | Linux/Windows CI + Chromium/WebKit |
| #51 Stremio/Torrentio metadata | `a7cacfe9` | `3c2d7115` | Linux/Windows CI + Chromium/WebKit |
| #52 one-tap resume | `4e482f07` | `330b7abc` | Linux/Windows CI + Chromium/WebKit |
| #55 native caption appearance | `3bbc1437` | `40a2bb88` | Linux/Windows CI + Chromium/WebKit |
| #56 disabled torrent source choices | `ea4c9b45` | `d4aa24d7` | Linux/Windows CI + Chromium/WebKit |
| #62 sourced editorial route options | `d5651b1a` | `ff104181` | Linux/Windows CI + Chromium/WebKit; editorial scope limited to pilot sources |
| #64 manual path progress | `27e87bdb` | `5f7c373e` | Linux/Windows CI + Chromium/WebKit; manual data and backup-compatible preferences |

| #66 source lifecycle | `5460bec4` | `30184179` | Linux/Windows CI + Chromium/WebKit; partial outage recovery and honest source labels |

| #68 episode-edition watch guide | `88e80a12` | `80fa57a4` | Linux/Windows CI + Chromium/WebKit; official Haruhi 2006/2009 and Re:ZERO OVA numbering |

These are code acceptance results. **None** are evidence that real torrent streaming works, an AniList franchise guide is complete, or Safari physical/prod is signed off.

## 2026-10-30 — universal watch-order graph verified checkpoint
- Owner: applies to recurring community watch-order problems across **all anime**, not only Fate/SAO/Slime; curated route coverage is distinct from automatic media-link exploration. Evidence taxonomy: [WATCH_ORDER_RESEARCH_2026-10-30.md](WATCH_ORDER_RESEARCH_2026-10-30.md).
- PR [#58](https://github.com/rzqllh/Yoru/pull/58) **MERGED to preview** `dad6ed4e51ca1fa0070b54229e7180e7043b6c74`. Exact tested feature head `c5d94c741967fee3638024920452d76cbed1fad8`: CI Linux/Windows and Browser E2E Chromium/WebKit **PASS**.
- Implemented: opt-in `?depth=2` AniList graph, fan-out 10 direct neighbors and 75-node cap, deduplicated relation edges including cycles, 12 expansions/min per-process budget, 20-min success cache, strict IDs, honest partial/upstream-failure notes; UI filter TV, movie, OVA/special, continuity branches, recap, other.
- **NOT LIVE VERIFIED / STILL OPEN**: real upstream AniList coverage per franchise, editorial broadcast-vs-source/chronological episode insertions, curated recommended paths, integrated forum correction process, iPhone physical tests. Do not infer canon or total franchise completeness from 2 hops.
- Public user guide `docs/public/watch-order.md` and alignment PR [#59](https://github.com/rzqllh/Yoru/pull/59) **MERGED** to preview `c5e7c66118b830efe16b072521406921da4a9e4d`; exact head `3f430e6521ec378d1118215116a9cd68d58124e2` CI+Browser E2E PASS. Issue #20 release gate remains BLOCKED; `main` unchanged.

## 2026-10-30 — editorial routes checkpoint (merged #62)
- PR [#62](https://github.com/rzqllh/Yoru/pull/62) merged to preview as `d5651b1a4c6e954a9326d56b56dbdaf9d60c0fdf`. Exact feature head `ff104181f0344c3584af3ccb4b046dca8f75549b` passed Linux/Windows CI and Chromium/WebKit Browser E2E. Original #61 closed as superseded after parallel docs #59/#60 merged.
- TESTED code: sourced editorial **options** (Fate stay-night newcomer and prequel-first alternative, Monogatari starter), reliable AniList anchors, dates and HTTPS citations, validated path registry; local frontend-only, no new backend or data-store schema.
- UI shows routes only for verified ID intersections in AniList metadata; if a step cannot map to a MAL detail it links to AniList or displays unavailable instead of pretending playback is ready. General two-hop graph still works for other anime.
- Open: comprehensive franchise coverage and edition-specific episode insertion; community correction submissions remain manual and need review; real upstream stream availability, Safari and production release remain unverified.
- Public docs updated in final documentation PR following #62 integration.

## 2026-10-30 — manual watch-path progress checkpoint (merged #64)
- PR [#64](https://github.com/rzqllh/Yoru/pull/64) merged preview as `27e87bdb3d8954195acc23da6cd2621b3d8098e4`; exact head `5f7c373e831f536e97271c09c710321cc2750f01` CI Linux/Windows and Browser E2E Chromium/WebKit PASS.
- YX-10 TESTED PARTIAL: manual step progress per curated `pathId`, label of next step, undo control, progress isolation across alternative routes, existing `preferences` store + v1 backup export/import (no IndexedDB schema migration).
- Does NOT assert any video has been played. No automatic mark-watched based on provider state. Existing library and episode progress remain untouched.
- New unit + browser persistence/undo/alternative-route tests PASS on the exact feature head; source/provider live testing and physical Safari not done.
- Next: complete editorial long-tail dataset, implement verified provider/episode integration if approved; manual path progress already backed up with v1. Public documentation updated in separate final docs PR.

## 2026-10-30 — YX-02 source truthfulness enhancement (merged #66)
- [PR #66](https://github.com/rzqllh/Yoru/pull/66) **MERGED preview** `5460bec489e04399fad8b2fa6ab08a969d28d82f`; exact head `30184179cfb765eac6b8fb5a6de3b85e002e09d1` CI Linux/Windows and Browser E2E Chromium/WebKit PASS.
- Source search consolidates successful and failed provider responses independently, distinguishes **no candidate** from **failed service**, and shows candidate status as unverified. Native verification starts only after user choice/auto-single candidate. Single-candidate failure keeps source picker with opt-in external fallback; no false Play or quality claims.
- Monotonic request ID prevents stale responses from changing the selected episode after a newer request; closing picker cancels current status updates.
- Unit and browser tests for total outage vs successful empty response and partial-provider failures PASS on exact head. No provider live coverage or Safari physical evidence.
- Public docs updated in separate documentation-only PR after feature merge. Main/prod remain blocked by #20.

## 2026-10-30 — edition-aware watch-order data (merged #68)
- [PR #68](https://github.com/rzqllh/Yoru/pull/68) MERGED preview `88e80a126aba9b044754a9bc1fbfcf6cde4168eb` after Linux/Windows CI and Chromium/WebKit Browser E2E PASS on exact feature HEAD `80fa57a4859c31bfa0c38beede79daa1b42bfb16`.
- Sourced editorial routes: Haruhi **2006** 14 episodes, Haruhi **2009** 28 episodes + 2010 movie, and Re:ZERO TV Season 1/OVA 1+2/Season 2 split/Season 3. Evidence at [WATCH_ORDER_EDITION_EVIDENCE_2026-10-30.md](WATCH_ORDER_EDITION_EVIDENCE_2026-10-30.md).
- Validator now permits repeated AniList IDs only for nonoverlapping episode ranges within the identical edition. Watch Guide displays edition number and avoids false direct-episode playback links. Local manual progress remains per route, with existing v1 backup.
- **TESTED CODE (#68)**. No claims of universal full franchise coverage, chronological canon, provider playback or iPhone Safari acceptance.
- Next: expand sourced edition/episode paths for other franchise types (Gundam alternative universes, Monogatari source-order, Haruhi chronology if episode-specific mapping can be reviewed), plus future alias and browsing UX. Public watch-order docs updated in final documentation PR.

## 2026-10-30 — YX-12 browse filters in URL (merged #70)
- PR [#70](https://github.com/rzqllh/Yoru/pull/70) merged preview `78b323d413927a3b0cc7385183566861ebe73a36`; exact feature head `af1100d00c8cfbba6c99c2a74bf375908021ed23` CI Linux/Windows + Chromium/WebKit Browser E2E PASS. Main remains unchanged.
- Router validates and round-trips genre, media type, minimum score, year, ordering and search query. Tabs retain selected category in URL even with query/filter. Noncanonical unsupported filters ignored rather than forwarded upstream.
- Browse controls use route state (not private React state), so reload, sharing, Back/Forward and reset work. Removable accessible chips, historical year selector back to 1950 (rather than 1990).
- Unit + browser acceptance PASS on exact tested head; no real live provider/source guarantee.
- Next: public docs and handoff alignment, then create a Vercel preview deployment at the exact current preview HEAD; verify Git SHA and READY, report SSO-protection to owner. Remaining tasks in delivery matrix unchanged.

## Next independently resumable lanes

1. **Guide editorial/data lane:** YX-09 curator schema (episode-level insertion, source-order, route provenance, spoiler safeguards), then YX-10. Source-backed branching paths with spoiler safeguards, distinction between recommended release viewing and in-universe chronology. Preserve disabled unsupported modes.
2. **Playback lane:** YX-02/YX-06, then YX-19 only after approved resolver architecture. Never treat `infoHash` as an HTTPS URL.
3. **Browse/library lane:** YX-11/12/13/14. Local-only preferences; minimal unnecessary API requests.
4. **Visual/reliability lane:** YX-05/15/16/17/20/21. Exact-SHA tests and real device/provider evidence.

Do not edit `App.tsx`, `Player.tsx`, or shared `styles.css` in competing PRs simultaneously. Parallel feature development uses isolated branches; integration is serialized into preview. Every PR updates this tracker and `YORU_HANDOFF.md`, with exact tests and next action. No more unverified claims or owner-signoff shortcuts.

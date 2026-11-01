# Yoru — Phase and Dependency Plan

> Superseded vNext contract baseline 2026-11-01, inspected main `ce12d98`. Old baseline remains in historical handoffs; D03=3A is current authority. Entire product phases 00–09 remain subject to #20 release gates.

## Dependency route

`00 Inventory & contracts -> 01 Source eligibility/Torrentio -> 02 Subtitle correctness -> 08 Integrated QA -> 09 Live hosting/release`

`00 -> 03 Design system/Home -> 04 Browse/metadata -> 05 Detail -> 06 Watch Guide -> 08`

`00 -> 07 Local data/cloud-sync decision -> 08`

Work inside a phase may be independent only where file/contract ownership and tests do not conflict. Do not merge speculative architecture as a workaround for a live-provider blocker.

| Phase | Priority | Scope and work packages | Depends on | Exit criteria | Handoff |
| --- | --- | --- | --- | --- | --- |
| **00 — Baseline & decisions** | P0 | Repo/PR/CI/Vercel/issue inventory; D01–D09; MAL identity; threat model; authoritative contract; define evidence rules | None | Requirements and risks mapped; no false DONE, no secrets; owner reviews changes requiring approval | [00](handoffs/PHASE_00_HANDOFF.md) |
| **01 — Sources & Torrentio** | P0 | Verified source/season/episode eligibility; optional Stremio/Torrentio manifest `stream` discovery; `url` vs `infoHash/fileIdx` vs `externalUrl`; D02 exclusions; **resolver proposal only, requiring separate approval** | 00 | Only real browser-safe native candidates Play-ready; torrents unavailable without approved resolver | [01](handoffs/PHASE_01_HANDOFF.md) |
| **02 — Subtitles/player** | P0 | Independent OpenSubtitles/SubSource/SubDL direct backend APIs plus optional Stremio addon `subtitles`; D01 English consent, D09 native readable captions, season/cour/release matching, consent/Off and provider failures | 01 verified candidate identity | Accurate language/episode/renderer states and error tests; live G3 remains separate | [02](handoffs/PHASE_02_HANDOFF.md) |
| **03 — UI foundations/Home** | P1 | Consolidate tokens/CSS/cards, 8s accessible hero pause/swipe D06, Anime Popular grid D07, navigation/mobile/safe area/performance | 00 | Hero/grid/keyboard/responsive screenshot tests pass; no duplicated design system | [03](handoffs/PHASE_03_HANDOFF.md) |
| **04 — Discovery & AniList-primary metadata** | P1 / gated architecture | D03=3A: AniList Media/GenreCollection/MediaTagCollection, genre/tag/format/status/season/year/score/sort and server filters; nullable validated MAL legacy bridge, backup/URL compatibility, ToU/429 safeguards, separate Upcoming, truthful counts | 00 + 03 and owner architecture approval | Source provenance, correct page/filter semantics and no ID/data regressions; live provider separate | [04](handoffs/PHASE_04_HANDOFF.md) |
| **05 — Full-page detail** | P1 | D04 mobile `/anime/:malId`, source lifecycle, resume/episode CTA, Back/history/deeplinks, information architecture | 01 + 03 + 04 route/metadata | Direct URL/reload/Back & modal removal/mobile states tested | [05](handoffs/PHASE_05_HANDOFF.md) |
| **06 — Watch Guide/franchise** | P1 | D05 release + evidence-backed editorial watch paths, branching/editions/optional steps, spoiler-safe flows, local route progress and return-to-detail | 04 + 05 | Source/canon distinctions, path links, progress and deep links validated | [06](handoffs/PHASE_06_HANDOFF.md) |
| **07 — Local data & opt-in cloud** | P0 privacy / P1 feature | IndexedDB backup/restore/resume/first-run and privacy regression; draft #77 OTP/RLS/two users/two devices/CAS/conflict/deletion and separate automatic-sync decision | 00, API/data compatibility decisions | Local unaffected; draft stays blocked until real OTP/auth/device test and privacy review; no cloud activation without approval | [07](handoffs/PHASE_07_HANDOFF.md) |
| **08 — Integrated verification** | P0 | Exact-head Linux/Windows tests, Chromium/WebKit, real iPhone acceptance, accessibility, perf measurements, API/security, recovery, docs | 01–07 applicable approved scope | Matrix evidence & unresolved exceptions classified; zero critical security/data blockers | [08](handoffs/PHASE_08_HANDOFF.md) |
| **09 — Hosting, release & operations** | P0 release | Validate production SHA and health/catalog, quotas and protected previews, live provider/subtitle matrix, hosting/gateway/rollback/observability, public docs, final release decision | 08 + #20 gates | G1–G6 proven, owner GO; otherwise explicit NO-GO. Never auto-release from a main merge | [09](handoffs/PHASE_09_HANDOFF.md) |

## Global stage gates

**G0 Scope:** explicit owner approval for architecture/security, installs, torrent resolver, schema migration or production configuration.  
**G1 Build/CI:** tests/lint/typecheck/build and Linux/Windows plus Chromium/WebKit on **same exact SHA**.  
**G2 Product UX:** D01–D09 and acceptance IDs with viewport, keyboard/reduced-motion, and error paths.  
**G3 Provider live:** actual independent media/sources and subtitle endpoints; actual episode correctness, rights and failure cases.  
**G4 Device:** real iPhone Safari installed-PWA/fullscreen/VTT/PiP, model/iOS/test result.  
**G5 Cloud:** real account OTP, cross-account RLS, CAS, corrupt import/remote deletion, two devices and consent if sync activation is in scope.  
**G6 Infrastructure:** running production HTTPS + Hono API, quotas, CSP/CORS, ingress protection, observability and rollback.  
**G7 Owner release:** explicit acceptance against [issue #20](https://github.com/rzqllh/Yoru/issues/20), **not** automatic because CI or PR is green.

## Release gates (#20, separate from phase numbers)

- **R-G1:** live native-video coverage with rights and device/codec/CORS.
- **R-G2:** actual episode/season/cour/special/movie identity; no misleading availability.
- **R-G3:** real subtitle providers and Indonesian/English match/download/offset/quota behaviour.
- **R-G4:** physical iPhone Safari and PWA.
- **R-G5:** public full-stack infrastructure, rate limiting, secrets, deployment URL and rollback.
- **R-G6:** representative sample, zero unresolved P0/P1, exact-SHA CI and owner GO.

A preview QA URL or `READY` deployment is not in itself a released, functioning service.

## Scheduling and change control

No speculative deadlines or person assignments. Phase 01/02 reliability takes precedence over cosmetics for a public watch claim. Phase 03/04 can proceed on isolated branches without touching protected player files. Cloud (#77) is its own review lane and must not be merged merely to make UX phases look complete. Coordinate integration touching `App.tsx`, `Player.tsx`, CSS, router, backup schemas or API contracts.

Per-phase handoff must record: baseline SHA, scope, actual changed paths/PR SHA, tested evidence URLs, decisions, incomplete items, risks, approval required, next command/PR, and phase status. Do not invent test logs. At the end align `docs/public/` and `DESIGN.md` to **verified** outcomes only.

## 2026-11-01 phase dependencies and owner gate update

**2026-11-01 vNext owner supersession.** Inspected GitHub main [`ce12d98`](https://github.com/rzqllh/Yoru/commit/ce12d98678f6e89cefd81516fb641c62df972572); this is **DOCS ONLY**, not hosted/provider verification. D03=**3A AniList-primary** replaces archival D03=3B Tenrai/MAL-primary. D01=1A, D02=2B, D04=4A, D05=5A, D06–D09 retained. Existing Tenrai/MAL code remains until an approved reversible migration.

### Planned Torrentio/Stremio stream + subtitle federation (not resolver activation)

- A configured Stremio addon declares `stream` and/or `subtitles` via its `manifest.json`. **Torrentio is a candidate video stream addon, not an automatic OpenSubtitles/SubSource/SubDL API gateway**. Use separate Stremio `/stream` and `/subtitles` resources where declared; direct OpenSubtitles, SubSource and SubDL APIs remain independent backend adapters, or a distinct subtitle-only Stremio addon can be configured.
- The current Yoru source files `backend/providers/stremio.ts`, `stremio-core.ts` and `backend/providers/subtitles.ts` already implement configured addon candidate classification, addon subtitle resources and independent direct API adapters. Label this **CODED/PARTIAL**; no live Torrentio/third-party API compatibility, actual playback, provider rights or physical iPhone PASS may be assumed.
- Exact validated anime identity, season/cour/movie/special, episode, language and subtitle release must match before joining candidates or ranking them. Rank by real native playability, source health, subtitle control/Indonesian match, then prior healthy source. D01 requires explicit English consent; Off persists. D02 excludes uncontrolled iframe/hard-sub from Play.
- An HTTPS HLS/MP4 `url` is only a **candidate** until safety and actual browser decoding checks. `infoHash`/`fileIdx` is a **torrent descriptor, not a Safari-playable video URL**. `externalUrl` is navigation, not native Play. A manifest or metadata listing is not playable-video proof.
- Any torrent resolver/engine, seed/peer access, arbitrary proxy, external service, credentials, hosting, cost, user-data exposure or content authorization requires an **isolated owner-approved architecture/security/licensing decision**. This docs change neither installs nor invokes a resolver.
- Require end-to-end provider contracts, 401/403/429/timeout/expired-source failures, bounded fetch/SSRF guards, signed subtitle grants, physical Safari tests and release gate #20 before public streaming claims.
- Reference: [Stremio resources](https://stremio.github.io/stremio-addon-sdk/api/README.html), [protocol](https://stremio.github.io/stremio-addon-sdk/protocol.html), [manifest](https://stremio.github.io/stremio-addon-sdk/api/responses/manifest.html), [stream object](https://stremio.github.io/stremio-addon-sdk/api/responses/stream.html).

### Approved D03=3A: AniList-primary metadata with MAL legacy compatibility

- **Future metadata primary key: `aniListId` (`Media.id`)**. Preserve `malId`/`Media.idMal` only as a validated, nullable external mapping for existing `/anime/:malId` links, provider queries, IndexedDB, resume, watch-guide progress and versioned backups. AniList-only titles need a distinct unambiguous route; never conflate numeric namespaces or join on title alone.
- Existing Tenrai/Jikan APIs and dynamic MAL genre additions #116/#117 are implemented **transitional** capabilities, not completion of the requested AniList-primary migration. No destructive rewrite of saved data, routes, provider IDs or cloud snapshot contracts.
- Plan provenance-aware GraphQL `Media`, `GenreCollection`, `MediaTagCollection`, genres/tags/status/format/year/season/score/sort and server-side pagination. Return truthful loaded vs total counts. Keep provider and exact episode availability independent of media metadata.
- Gate rollout on [AniList terms](https://docs.anilist.co/guide/terms-of-use) applicability to a tracking/library-like app and [current rate limit](https://docs.anilist.co/guide/rate-limiting) (degraded temporary 30 req/min at this checkpoint), batching/caching/429 handling, data migration rollback, source-outage behavior, tests, and owner approval. Never silently rebrand Tenrai data as AniList.

**Dependency order:** 00 contract/compliance → 01 source eligibility → 02 subtitle federation (P0); 00 → 03 UI foundations → 04 AniList metadata/ID bridge → 05 mobile full-page detail → 06 watch guide; 04 ↔ 07 legacy backup/cloud compatibility; 01–07 → 08 integrated QA → 09 release. PR #123 remains separately reviewed. No destructive or production changes authorized.

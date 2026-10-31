# Yoru — Phase and Dependency Plan

> Baseline `main 2b6c1d4`, 2026-10-31. The phases cover **entire product** from evidence/architecture to release. **PLANNED** unless evidence explicitly says otherwise; no phase is certified complete by creating this document.

## Dependency route

`00 Inventory & contracts -> 01 Source eligibility/Torrentio -> 02 Subtitle correctness -> 08 Integrated QA -> 09 Live hosting/release`

`00 -> 03 Design system/Home -> 04 Browse/metadata -> 05 Detail -> 06 Watch Guide -> 08`

`00 -> 07 Local data/cloud-sync decision -> 08`

Work inside a phase may be independent only where file/contract ownership and tests do not conflict. Do not merge speculative architecture as a workaround for a live-provider blocker.

| Phase | Priority | Scope and work packages | Depends on | Exit criteria | Handoff |
| --- | --- | --- | --- | --- | --- |
| **00 — Baseline & decisions** | P0 | Repo/PR/CI/Vercel/issue inventory; D01–D09; MAL identity; threat model; authoritative contract; define evidence rules | None | Requirements and risks mapped; no false DONE, no secrets; owner reviews changes requiring approval | [00](handoffs/PHASE_00_HANDOFF.md) |
| **01 — Sources & Torrentio** | P0 | Source capability taxonomy, exact episode/season mapping, native preflight, D02 exclusion of uncontrolled iframe, source-retry/memory, Torrentio `url/infoHash/externalUrl` truthfulness; design **separate opt-in resolver proposal**, not installation | 00 | No false Play; usable vs unavailable precisely separated; fixture regressions; real video sign-off stays G1/G2 | [01](handoffs/PHASE_01_HANDOFF.md) |
| **02 — Subtitles/player** | P0 | D01 confirmation, native style D09, provider contracts, season mapping, release/episode match, Off persistence, subtitle error/retry states, native/embedded capability labels | 01 eligible-source contract | Exact-match and provider failure tests pass; no unverified Sub Indo; live #20 G3 remains separate | [02](handoffs/PHASE_02_HANDOFF.md) |
| **03 — UI foundations/Home** | P1 | Consolidate tokens/CSS/cards, 8s accessible hero pause/swipe D06, Anime Popular grid D07, navigation/mobile/safe area/performance | 00 | Hero/grid/keyboard/responsive screenshot tests pass; no duplicated design system | [03](handoffs/PHASE_03_HANDOFF.md) |
| **04 — Discovery & hybrid metadata** | P1 | D03 canonical MAL, AniList dynamic genres/tags enrichment, server filter semantics, 'Akan Datang' separate, URL state/pagination, stable counts/error states | 00 + 03 component baseline | Real supported genre set; filters correct across pages and failures; no broken MAL IDs | [04](handoffs/PHASE_04_HANDOFF.md) |
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

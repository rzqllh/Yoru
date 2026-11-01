# Yoru — Acceptance Matrix and Evidence Templates

> vNext owner contract update 2026-11-01; source baseline main `ce12d98`. Older 3B acceptance records are historical. D03=3A; new cases below NOT RUN until exact-SHA/device/provider evidence.

## Evidence contract

For every case record: **ID · phase · test kind · exact SHA · environment/device/browser/OS · fixture or live title/episode · steps · expected · observed · PASS/FAIL/BLOCKED/NOT RUN · run URL/artifact · date/time · tester**. Record missing result as `NOT RUN`, not `PASS`. CI run plus commit link are required for PR handoff; live provider requires authorized URL/response metadata without secrets; iPhone requires actual device and OS version.

### Source and playback (Phase 01)

| ID | Level | Procedure | Expected result |
| --- | --- | --- | --- |
| AC-SRC-01 | Unit/browser | Save progress with valid episode/source; reload then resume and preflight | Correct episode/time; recheck; no silent unverified stream |
| AC-SRC-02 | Negative | Inject invalid/expired/stale source and invalid duration | Safe retry/error; no false resume or data overwrite |
| AC-SRC-03 | Contract | Provider yields valid, missing and malformed stream entries | Good candidates survive, bad entries rejected, user states distinct |
| AC-SRC-04 | Browser/live | Load representative real HLS/MP4 on supported devices | Only decoded verified sources get Play-ready, capability caveats visible |
| AC-SRC-05 | Contract | Simulate Stremio `url`, `infoHash`+`fileIdx`, `externalUrl` and addon `/subtitles` | Correct types; hash not treated as URL, subtitle resource separate |
| AC-SRC-06 | Browser | Supply only uncontrolled AnimeEmbed/iframe/hard-sub source | No playable external option; honest unavailable state; no auto iframe |
| AC-SRC-07 | Manifest/browser | Use real HLS adaptive variants + mislabeled bitrate/name fields | Auto/genuine renditions only; `2160kbps` not advertised as `2160p` |
| AC-SRC-08 | Design/security | Evaluate opt-in torrent resolver proposal with legal/hosting/security/device matrix | Explicit owner decision; no installation/deploy before approval |
| AC-SRC-09 | Live | Cover different season/cour/special/movie and wrong episode | Source identity verified or marked unavailable; no false Play claim |

### Subtitle & player (Phase 02)

| ID | Level | Procedure | Expected result |
| --- | --- | --- | --- |
| AC-SUB-01 | Browser | Episode has Indonesian subtitle | Indonesian selected if compatible and user has not chosen Off |
| AC-SUB-02 | Browser | Episode has only English; inspect auto selection | Explicit English prompt; no silent fallback; decline leaves subtitles off |
| AC-SUB-03 | Browser | Toggle Off; switch episode/reload/source | Off persists per user preference and no background auto-enable |
| AC-SUB-04 | Browser/a11y | Use caption presets, size/font/outline/opacities, safe positioning and reduced motion | Readable native text; styles only when renderer/browser supports |
| AC-SUB-05 | Contract | Season 3 E1 with provider season one and season three responses | Only correct verified season/episode considered for auto-selection |
| AC-SUB-06 | Negative | Incorrect release, mismatched subtitle language, stale URL | No wrong-file auto-selection; recoverable explanation |
| AC-SUB-07 | Contract | Simulate provider 401/403/429/timeout/invalid response and retry | Bounded retry/state; signed grant and quota preserved |
| AC-SUB-08 | Live gate | Real authorized provider search+download on id/en for representative episodes | Verified file language, episode match and display; record errors/entitlement |

### Home/design (Phase 03)

| ID | Level | Procedure | Expected result |
| --- | --- | --- | --- |
| AC-HOME-01 | Fake timer/browser | Keep home visible and idle for >=8s | Hero advances at specified interval without layout shift |
| AC-HOME-02 | Browser | Hover/focus/interact; hide tab; reduced-motion enabled | Auto-rotation stops under each applicable condition |
| AC-HOME-03 | Touch/browser | Horizontal swipe then vertical page scroll | Swipe changes hero, scroll remains native; no accidental click |
| AC-HOME-04 | Keyboard/a11y | Search hero controls at 320–390px, Tab/Space/Enter, screen reader | Old number/navigation UI absent; accessible pause/navigation remains |
| AC-HOME-05 | Visual | Home Anime Popular at 320/375/390/768/1440 widths | Exact section name; stable 2:3 poster, 2 columns mobile, consistent rows |
| AC-HOME-06 | Visual | Long titles, absent image, badges/ratings | No collision, horizontal overflow or card height jump |
| AC-UX-01 | Visual | Compare Home/Browse/Detail/Library forms/cards/tokens | Shared consistent spacing, radius and typography |
| AC-UX-02 | A11y | Keyboard/focus/contrast/target/zoom/landscape/safe-area | Usable without pointer; documented exceptions |
| AC-UX-03 | Performance | Capture Core Web Vitals from measured hosted runs | Values recorded with device/network; targets approved before PASS |

### Browse & metadata (Phase 04)

| ID | Level | Procedure | Expected result |
| --- | --- | --- | --- |
| AC-DATA-01 | Unit/API | Resolve valid `AniList.idMal` for known MAL ID | Canonical MAL identity retained; provenance logged |
| AC-DATA-02 | Negative | AniList absent/idMal missing/conflicting duplicate title | Do not merge speculative title-only matches |
| AC-DATA-03 | API | Tenrai available, AniList 429 or offline | Core metadata preserved; enrichment unavailable clearly indicated |
| AC-DATA-04 | API | Pages, sorting, cache and upstream rate errors | Stable page semantics; bounded requests/retry |
| AC-DATA-05 | API/UI | Query AniList genre collection and select genres outside old 12 | Dynamic supported options appear; backend accepts supported filters |
| AC-DATA-06 | API/UI | Combine genre/tag/year/format/status/score and paginate | Correct server-side result semantics; no first-page-only filtering |
| AC-DATA-07 | Router/browser | Reload/back/share URL with filters | State preserved; old browse URLs compatible |
| AC-DATA-08 | UX | First page returns 24 of unknown total | “24 ditampilkan” (or true total), not fabricated full catalogue count |
| AC-DATA-09 | UX | Visit Akan Datang and Watch Guide | Separate discovery destinations, coherent hierarchy, no third filter tab |

### Detail & Watch Guide (Phases 05–06)

| ID | Level | Procedure | Expected result |
| --- | --- | --- | --- |
| AC-DETAIL-01 | Router/browser | Open `/anime/:malId` directly; reload | Correct full-page detail on mobile |
| AC-DETAIL-02 | Browser | Open from filtered Browse then Back/Forward | Original query, scroll/context recoverable |
| AC-DETAIL-03 | UX | Show episode metadata with no verified source | Distinct metadata/candidate/ready labels |
| AC-DETAIL-04 | Browser | Resume verified prior episode or no resumable source | Appropriate CTA, no universal Episode 1 assumption |
| AC-DETAIL-05 | Visual | Long synopsis, poster error, 100 episodes, orientation/safe area | No broken modal, cut content or inaccessible controls |
| AC-GUIDE-01 | Data/UI | Anime has AniList relation graph but no curated order | “Urutan rilis” and relation labels; no invented canon |
| AC-GUIDE-02 | Data/UI | Curated path has alternative/optional/edition-specific entries | Clearly labeled branches, edition and required/optional |
| AC-GUIDE-03 | Data/UI | Request chronology unsupported by sources | Disabled/explained, not invented |
| AC-GUIDE-04 | Router | Guide → detail → episode → Back | Context and selected route preserved |
| AC-GUIDE-05 | Content/a11y | Potential spoilers and source provenance | Spoiler-safe labels, source attribution |
| AC-GUIDE-06 | Data | Manual path progress saved, backed up and imported | Manual completion distinct from watched playback, bounded values |

### Storage, cloud, cross-browser and release (Phases 07–09)

| ID | Level | Procedure | Expected result |
| --- | --- | --- | --- |
| AC-LOCAL-01 | Browser | Offline revisit shell + local Library | Safe offline shell; no fake offline video |
| AC-LOCAL-02 | Data | Import malformed/oversized/legacy backup; export/reimport valid | Fail closed, preserve existing data on error |
| AC-LOCAL-03 | Browser | Save/remove/resume/library sort after reload | Predictable persistence; privacy maintained |
| AC-LOCAL-04 | Recovery | Storage denied/evicted, provider config missing | Recoverable UI; no silent data loss claim |
| AC-SYNC-01 | Live Auth | Request OTP via real configured email, expiry/rate error | Correct verification and error behaviour |
| AC-SYNC-02 | Live RLS | Anonymous + separate user A and B read/write/delete each other's records | All cross-account/anonymous denied |
| AC-SYNC-03 | Live RPC | Concurrent CAS revision write and conflict | No overwrite; actionable conflict resolution |
| AC-SYNC-04 | 2 devices | Upload from device A, import device B and observe consent | Exact validated snapshot transfer |
| AC-SYNC-05 | Negative | Tamper snapshot, injected URL/token, corrupt backup | Import rejected, no credential leak |
| AC-SYNC-06 | Live | Remote snapshot delete + logout + repeat login | User-authorized deletion and session/data boundaries |
| AC-SYNC-07 | Review | Decide manual vs automatic sync | Explicit product/architecture approval; automatic sync deferred otherwise |
| AC-DEVICE-01 | Physical iPhone | Safari fullscreen, subtitles, PiP, landscape/portrait | Actual device model/iOS and observed result recorded |
| AC-DEVICE-02 | Physical iPhone | Install/open/update PWA, safe areas, offline shell | No inaccessible controls or loss of local data |
| AC-DEVICE-03 | Browser | Chromium/WebKit automated viewports and keyboard | Exact SHA CI success, not substituted for iPhone |
| AC-SEC-01 | Security | Invalid URLs, private DNS/IP, oversized payload, redirects, CORS/CSP | SSRF and input rejection; bounded requests |
| AC-SEC-02 | Security | Local secrets, provider URLs in persisted snapshots/logs, auth grants | No exposure; explicit user consent |
| AC-REL-01 | Live G1 | Representative authorized native source and actual play | Playback evidence; coverage/sample documented |
| AC-REL-02 | Live G2 | Cross-episode/season/cour/specials/movie | No wrong-content availability |
| AC-REL-03 | Live G3 | Real SubDL/SubSource/OpenSubtitles + Stremio where configured | Search/download/language/offset/quota verified |
| AC-REL-04 | Physical G4 | Device sign-off | iPhone Safari/PWA checked |
| AC-REL-05 | Production G5 | Deploy exact SHA; test `/api/health` and `/api/anime/discover`, logs, security, rollback | Running HTTPS full-stack and operational readiness |
| AC-REL-06 | Owner G6 | Review zero P0/P1 unresolved, quantitative sample, exact-SHA evidence | Explicit owner GO before public release |

## Test record template (append per executed check or link PR artifact)

```
ID: AC-...
Status: NOT RUN | PASS | FAIL | BLOCKED
Commit SHA:
Environment / browser / device / OS:
Fixture or actual provider / title / season / episode:
Procedure performed:
Expected:
Observed:
Evidence URL (CI, video, screenshot, sanitized log):
Run timestamp:
Tester / reviewer:
Known limitations / next action:
```

## Acceptance policy

At the original planning baseline, new-contract rows were **NOT RUN**. Rows below are updated only after measured work on specific SHAs. Historical CI and implemented fixtures may be cited as earlier evidence in [TRACKING](TRACKING.md), but cannot satisfy user-approved D01–D09 by implication. A new release candidate requires re-executing applicable tests against the exact release SHA, including real-provider/device checks and explicit sign-off [#20](https://github.com/rzqllh/Yoru/issues/20).

## New-contract execution log — 2026-10-31

| Case | Commit tested | Environment | Status | Result / next evidence |
| --- | --- | --- | --- | --- |
| AC-SRC-06 D02 | `a91e7ec` (PR #100) | Linux/Windows + Chromium/WebKit fixture | PASS (deterministic) | [CI](https://github.com/rzqllh/Yoru/actions/runs/41220260198), [Browser](https://github.com/rzqllh/Yoru/actions/runs/41220260118). Live source and iPhone NOT RUN; revalidate final docs SHA. |
| AC-SRC-05 Torrentio | unchanged existing main and D02 branch | live addon | NOT RUN | Hash classification persists; no torrent engine or playable URL inferred. |
| AC-SUB-01/02 D01 | `d02aef2` PR #101 head | External English-only + native English-only fixtures, Linux/Windows + Chromium/WebKit | PASS (deterministic) | [CI](https://github.com/rzqllh/Yoru/actions/runs/41221159658), [Browser](https://github.com/rzqllh/Yoru/actions/runs/41221159599). No live provider or physical iPhone. Documentation follow-up requires final exact-head rerun. |

**D01 first PR head `0ec7183` — FAIL (lint).** [CI](https://github.com/rzqllh/Yoru/actions/runs/41221002621), [browser workflow](https://github.com/rzqllh/Yoru/actions/runs/41221002597). Two lint errors corrected; `d02aef2` rerun PASS for exact PR code/test head. Final docs SHA requires additional verification.

| AC-SUB-04 D09 | `b56cae5` PR #103 | Node unit + Chromium/WebKit fixture, Linux/Windows | PASS (deterministic) | [CI](https://github.com/rzqllh/Yoru/actions/runs/41222013660), [Browser](https://github.com/rzqllh/Yoru/actions/runs/41222013653). Saved old settings retained. Actual Safari caption styling, contrast and physical visual legibility NOT RUN. |

| AC-SUB-03 season/cour | `758d97d` branch | SubDL/OpenSubtitles/SubSource fixtures with season 3, 1, absent, malformed | NOT RUN (CI pending) | Season 3 title must never silently accept season 1 or unknown season; unnumbered titles must not invent season 1; live provider mapping remains BLOCKED. |

| AC-HOME-01/02 D06–D07 | `184536a` on Phase 03 branch | Browser: gesture, hover, focus, reduced motion and keyboard | NOT RUN (CI pending) | 8-second rotation, hover/focus/touch pause, horizontal swipe, vertical scroll, no numbered controls and Anime Popular heading; physical iOS NOT RUN. |

**D06/D07 initial head `c441e28`: FAIL (lint).** Two accessibility lint findings corrected by semantic section and existing-button keyboard focus, pending exact-head test. [CI](https://github.com/rzqllh/Yoru/actions/runs/41223790513).

**D06/D07 `3134282` — PASS (fixtures):** [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41223942927), [Chromium/WebKit E2E](https://github.com/rzqllh/Yoru/actions/runs/41223942739). Full iOS swipe/scroll interaction NOT RUN; final docs SHA pending.

| AC-HOME-05/06 D07 | `fix/y03-anime-popular-grid-20261101` | Browser mobile 320px/390px card layout | NOT RUN | All rank-card widths equal grid cells, posters 2:3 with stable dimensions, rank and score badges separate, no horizontal overflow; physical iPhone NOT RUN. |

## Verified engineering checkpoint — 2026-11-01

| Acceptance case | Evidence SHA | Status | Evidence / limitation |
| --- | --- | --- | --- |
| AC-SUB-03/05/06 explicit season guard | PR #107 `a21586a`, main `dc2bd45` | PASS (deterministic only) | [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41224226939) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41224227162); actual provider season/cour mapping NOT VERIFIED |
| AC-HOME-01/02 hero interaction | PR #106 combined head `4de07e3`, main `f21c4a8` | PASS (deterministic only) | Hover, swipe, keyboard, reduced-motion tests; physical iPhone NOT RUN |
| AC-HOME-05/06 popular grid | PR #108 head `0bde4a1`, main `b4f35bd` | PASS (deterministic PR head only) | [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41224846356) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41224846533); physical iPhone screenshot NOT RUN; main `b4f35bd` [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41225040383) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41225040380) PASS 4/4 (fixtures only) |

## 2026-11-01 — Continuation acceptance checkpoint (read-only)

| Case | Evidence | Status | Reason / next verification |
| --- | --- | --- | --- |
| AC-REL-05 | Vercel production deployment `dpl_514E91c6XQkRCvF2wS5YumdgvgrU` READY at `5496aae`; GitHub `main` `bf3105d` | **BLOCKED / LIVE HTTP NOT VERIFIED** | Root, `/api/health`, and `/api/anime/discover` requests could not resolve/reach the target from the assistant environment; obtain real HTTPS status/JSON and inspect logs before claiming API healthy. No new deployment was initiated. |
| AC-DATA-05/06 | Static 12-genre allowlists verified in frontend router, backend HTTP validator and Jikan pipeline | **NOT RUN / PLANNED** | Verified source limitation; no dynamic AniList genre/tag implementation or multi-page filter acceptance executed. |

| AC-DATA-08 visible-results count | PR #111 head `0f3db7a`, main merge `ae9bc81` | **PASS (deterministic browser only); LIVE NOT RUN** | [CI](https://github.com/rzqllh/Yoru/actions/runs/41227101975) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41227101983) SUCCESS. Label `N ditampilkan` counts deduped loaded titles across page 1 and page 2; no unsupported total count. Real hosted data/pagination not verified. |

| AC-DATA-05 Tenrai canonical genre options (independent initial API contract) | `feat/y04-tenrai-genre-options-20261101` | **CODED / TESTS NOT RUN** | API endpoint, strict source validation, adult-only genre exclusion, known 12 fallback and cache fixture added. UI, live Tenrai response, AniList genres/tags and full server-side filter support remain NOT VERIFIED. |

| AC-DATA-05 source-backed MAL genre-options API (no UI integration) | PR #116 code head `27eb458` | **PASS (fixture/API contract only), PHASE PARTIAL** | [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41244040283) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41244040288) SUCCESS. Verified malformed/partial/adult/duplicate payload rejection and explicitly labeled fallback/cache. Full UI/new genre filter queries, live Tenrai, AniList tags, iPhone and hosted API NOT RUN. |

| AC-DATA-05/06 Tenrai validated genre filter UI/server | `feat/y04-genre-filter-ui-20261101` | **CODED / NOT RUN** | Numeric MAL URL `mal:46`, legacy name compatibility, source-validated backend lookup, 400 on invalid/adult IDs, actual server-side combined filters and browser reload/fallback covered by fixtures. Full AniList taxonomy, live upstream, iPhone and release remain NOT RUN. |

| AC-DATA-05/06 numeric MAL filter integration | PR #117 code head `9fa0143` | **PASS (deterministic fixtures only), PHASE PARTIAL** | [CI](https://github.com/rzqllh/Yoru/actions/runs/41244704532) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41244698662) SUCCESS. Verified combined pagination/query server mapping, invalid/adult fail-closed, URL reload, legacy names and fallback. Actual Tenrai/AniList live, full tags, WebKit physical device and release NOT RUN. |

| AC-DATA-05/06 merged MAL genre filter feature | PR #116 main `ae43a69`, PR #117 main `4157fec` | **PASS deterministic / PARTIAL overall** | #117 PR head [CI](https://github.com/rzqllh/Yoru/actions/runs/41244901215) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41244896643) SUCCESS. Exact main [CI](https://github.com/rzqllh/Yoru/actions/runs/41245111173) + [Browser](https://github.com/rzqllh/Yoru/actions/runs/41245111417) pending conclusion. Live upstream genre list, real pagination+429, AniList tags, physical iPhone and release NOT RUN. |


### 2026-11-01 — Phase 04 D08 pending verification

| Case | Scope / procedure | Status | Evidence / limitation |
| --- | --- | --- | --- |
| AC-DATA-09 / D08 | Browse `/jelajahi`: two category tabs; dedicated `Akan Datang` CTA opens `/jelajahi/akan-datang`, reload preserves destination and return action leads to Browse; separate Watch Guide CTA persists | **CODED IN PR #123 / NOT YET VERIFIED** | [PR #123](https://github.com/rzqllh/Yoru/pull/123) browser regression added; inspect exact-head Chromium/WebKit result. This checks hierarchy/navigation only, not broader design-system/a11y or physical iPhone evidence. |

## New 2026-11-01 D03=3A + Stremio/Torrentio acceptance delta

All rows are **NOT RUN** for this docs-only update. Historical CI/fixture PASS does not certify these new contracts. Each run must record exact SHA, environment, actor, real/fixture media identity, expected vs observed, timestamp and sanitized evidence.

| ID | Phase | Scenario | Required PASS | Status |
| --- | --- | --- | --- | --- |
| AC-VN-01 | 01 | Addon manifest advertises stream-only, subtitles-only or both | Query only declared `stream`/`subtitles` resources; direct subtitle APIs stay independent | NOT RUN |
| AC-VN-02 | 01 | Torrentio-compatible URL, infoHash/fileIdx, externalUrl, malformed/unsafe endpoints | Only safe verified HLS/MP4 can be Play-ready; torrent/external remain unavailable; no torrent resolver invoked | NOT RUN |
| AC-VN-03 | 01 | Mismatched anime/season/cour/episode and stale candidates | Reject/label unavailable; never silently substitute source or claim Play-ready | NOT RUN |
| AC-VN-04 | 01 | Only uncontrolled embed or fixed hard-sub source | D02 ineligible for Play; truthful unavailable/retry | NOT RUN |
| AC-VN-05 | 02 | Real OpenSubtitles/SubSource/SubDL APIs and separate Stremio subtitle addon | Backend-only secrets, independently validated media ID, signed bounded downloads and error reporting | NOT RUN |
| AC-VN-06 | 02 | Indonesian, English-only, Off, reload/source change | Indonesian first; English only with explicit consent; Off persisted | NOT RUN |
| AC-VN-07 | 02 | Physically test Safari font 90%, outline, background, fullscreen/landscape | Native subtitle legible, no UI collision, unsupported controls hidden | NOT RUN |
| AC-VN-08 | 04 | AniList Media.id to nullable idMal mapping, duplicate titles | No title-only merge; old MAL routes, provider refs and backups preserved | NOT RUN |
| AC-VN-09 | 04 | AniList GenreCollection/tags and combined filters across pages | Real supported taxonomy, server filters and truthful loaded count | NOT RUN |
| AC-VN-10 | 04 | AniList 429, Terms, cache/provenance and outage | Usage eligibility and throttling verified; no falsely relabeled data | NOT RUN |
| AC-VN-11 | 03 | Hero 8s rotation, hover/focus/swipe/reduced motion and keyboard | No numeric nav, accessible pause/navigation, no touch-scroll hijack | NOT RUN |
| AC-VN-12 | 03/04 | Anime Popular, filter components, upcoming/guide destinations | Mobile 2-column 2:3 posters, no badge overlap; consistent spacing and correct routes | NOT RUN |
| AC-VN-13 | 05 | Open detail mobile link direct/reload/Back and AniList-only identity | Full-page route, preserved query/scroll, old URL compatibility | NOT RUN |
| AC-VN-14 | 05/06 | Resume / source / watch-guide return flows | Verified episode CTA, source status truthful, guide sources and branches clear | NOT RUN |
| AC-VN-15 | 07 | Legacy IndexedDB, backup v1, optional cloud snapshot and ID migration | Versioned reversible data transform; no loss, cross-account leakage or secrets | NOT RUN |
| AC-VN-16 | 08/09 | Authorized real video and subtitle providers, iPhone and production release gate | Actual exact-SHA device and provider evidence plus #20 G1–G6 and explicit owner GO | NOT RUN |

Torrent-only playback/resolver requires separate architecture, rights, safety, hosting and owner approval. Never treat manifest availability, a bitrate label, metadata, fixtures or Vercel READY as live decoded playback.

### 2026-11-01 — Post-merge contract evidence for phases 04 and 05

| Case | Evidence SHA and environment | Status | Verified behaviour and limitations |
| --- | --- | --- | --- |
| AC-DATA-09 / D08 navigation | PR #123 `2bda841`, main `84807c8` | **PASS deterministic browser navigation slice / PHASE PARTIAL** | [PR CI](https://github.com/rzqllh/Yoru/actions/runs/41266399249), [PR Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41266399337), [main CI](https://github.com/rzqllh/Yoru/actions/runs/41266563101), [main browser](https://github.com/rzqllh/Yoru/actions/runs/41266563069) SUCCESS. Two tabs, separate Akan Datang CTA, mobile reload/return and overflow regression. Full design-system/physical iPhone not checked. |
| AC-DETAIL-03 / no fabricated Episode 1 | PR #124 `5643b43`, main `ce12d98` | **PASS PR fixture negative case / PHASE PARTIAL** | [PR CI](https://github.com/rzqllh/Yoru/actions/runs/41266656368) and [PR browser](https://github.com/rzqllh/Yoru/actions/runs/41266656388) SUCCESS. When metadata and provider lists are empty, primary CTA disabled, no episode/source request. Full-page D04/direct link, live provider and physical Safari NOT RUN. Main `ce12d98` checks must be separately confirmed. |

### 2026-11-01 — Alias-normalization fixture checkpoint

| Contract | Exact evidence | Status | Scope and exclusions |
| --- | --- | --- | --- |
| AC-SUB-01/02, AC-VN-05/06 (Stremio language identity) | [PR #128](https://github.com/rzqllh/Yoru/pull/128) head `454f90f`: [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41267363857), [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41267363890) SUCCESS; merged main `659265f` | **PASS deterministic alias fixtures only / LIVE NOT RUN** | Embedded and addon subtitle language `id/ind/id-ID` and `en/eng/en-US` recognized. No English without consent, no live subtitle file evidence, physical iPhone NOT RUN. |
| AC-VN-05/06 (direct provider aliases) | [PR #129](https://github.com/rzqllh/Yoru/pull/129) head `c6d3c08`: [CI](https://github.com/rzqllh/Yoru/actions/runs/41267545684) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41267545714) SUCCESS, main `ceff755` | **PASS strict language fixtures only / LIVE NOT RUN** | OpenSubtitles/SubDL/SubSource regional aliases and unsupported-language rejection; does NOT certify API auth/download, precise season/release, or iPhone styling. |

### 2026-11-01 — Phase 05 routed-detail engineering checkpoint

| Case | Exact evidence | Status | Remaining acceptance |
| --- | --- | --- | --- |
| AC-DETAIL-01/02; AC-VN-13 (first MAL detail route slice) | [PR #131](https://github.com/rzqllh/Yoru/pull/131), code head `6199cdc`, [CI](https://github.com/rzqllh/Yoru/actions/runs/41270943886) SUCCESS, [Browser](https://github.com/rzqllh/Yoru/actions/runs/41270943803) pending at checkpoint | **CODED / PHASE PARTIAL; LIVE NOT RUN** | Canonical MAL deep link + invalid IDs + Back/Forward and edge-to-edge mobile visual implemented with deterministic tests; full semantic document detail, non-MAL future route, all scroll/filter flows, real phone and provider source acceptance remain NOT VERIFIED. |

| AC-DETAIL-01/02 first routed MAL slice | #131 code head `0ecefba8e156fac25cb1bd3366eac26f22111206` | **PASS deterministic route/browser slice; PHASE PARTIAL** | [CI](https://github.com/rzqllh/Yoru/actions/runs/41271287694) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41271287681) SUCCESS after initial [Chromium failure](https://github.com/rzqllh/Yoru/actions/runs/41271063462) fixed (opener focus, mobile scroll). Real device, retained pagination, semantic page and AniList-only IDs not verified. |

| AC-DETAIL-01/02 first-phase integration | Main `fb66e65` from #131, code+docs PR head `507c7f4` | **MERGED; DETERMINISTIC PASS AT PR HEAD; FULL PHASE PARTIAL** | [Final PR CI](https://github.com/rzqllh/Yoru/actions/runs/41271498685) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41271498630) SUCCESS; main exact SHA [CI](https://github.com/rzqllh/Yoru/actions/runs/41271664626)/[browser](https://github.com/rzqllh/Yoru/actions/runs/41271664619) still running when recorded. True semantic mobile document, preserved pagination, live and iPhone acceptance NOT RUN. |

### 2026-11-01 — Browse/detail return and D02 documentation checks

| Case | Exact evidence | Status | Limit |
| --- | --- | --- | --- |
| AC-DETAIL-02 / AC-VN-13 browse return | [PR #133](https://github.com/rzqllh/Yoru/pull/133) main 83c973ad, [CI](https://github.com/rzqllh/Yoru/actions/runs/41272206603) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41272206606) SUCCESS | **PASS deterministic two-page fixture; phase PARTIAL** | 25 loaded titles, no refetch, focus and scroll after back. Other filter, playback and device routes NOT RUN. |
| D02 public doc alignment | [PR #134](https://github.com/rzqllh/Yoru/pull/134) main bcb72fc, [CI](https://github.com/rzqllh/Yoru/actions/runs/41272281179) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41272281114) SUCCESS | **DOCS UPDATED, not live acceptance** | Six public docs clarify no unverified iframe Play, separate addon subtitle resources, and AniList-primary planning. Provider runtime unchanged. |
### 2026-11-01 — Guide detail return checkpoint

| Case | Evidence | Result | Remaining |
| --- | --- | --- | --- |
| AC-GUIDE-02 / AC-DETAIL-02 / D05 guide return | [#136](https://github.com/rzqllh/Yoru/pull/136) head `e9ab54c6`, merged `3334d74` | **PASS deterministic PR-head browser fixture / PHASE PARTIAL** | [CI](https://github.com/rzqllh/Yoru/actions/runs/41272983355) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41272983482) SUCCESS. Expanded graph and branch filter persist across mapped related-title detail and Back, opener focus returns, no duplicate fetch. Actual AniList provider, long/ambiguous graphs, player-return and physical iPhone NOT RUN. |

### 2026-11-01 — Player return retention acceptance

| Case | Evidence | Status | Limits |
| --- | --- | --- | --- |
| AC-DETAIL-02 / AC-VN-13 player-to-Browse Back | [#139](https://github.com/rzqllh/Yoru/pull/139), head 48c07be, main 8e931bb, [CI](https://github.com/rzqllh/Yoru/actions/runs/41274184023) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41274184006) SUCCESS | PASS deterministic native fixture / PHASE PARTIAL | 25 results retained, focus restored, no catalog refetch; real provider/physical iPhone not run. |
| AC-GUIDE-02 / AC-VN-13 player-to-Guide Back | Same #139 CI/browser | PASS deterministic relation fixture / PHASE PARTIAL | Two-hop guide branch filter and graph retained; opener focus, no graph refetch. Live provider, story order and iPhone not run. |
| Player exclusivity regression | [first browser FAIL](https://github.com/rzqllh/Yoru/actions/runs/41273993615), [corrected browser SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41274184006) | PASS after test update | Background DOM remains mounted but is HTML-hidden, non-visible and noninteractive; legacy absent-DOM requirement superseded. |


## 2026-11-01 — Pending AC-DETAIL-02 expanded browser evidence

- [Draft PR #142](https://github.com/rzqllh/Yoru/pull/142) code `b2d0f88`: deterministic combined genre/type/minScore/year/order + page-two Browse → detail → native player → Back regression authored. Expected: all filter values, 25 loaded results, original canonical URL, scroll, focus, unchanged API request count. **Result: NOT RUN/PENDING until exact-head Chromium/WebKit CI returns**, then record SHA/run/result; not a substitute for live provider/iPhone acceptance. Phase 05 remains PARTIAL.


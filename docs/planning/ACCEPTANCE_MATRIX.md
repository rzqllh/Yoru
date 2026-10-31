# Yoru — Acceptance Matrix and Evidence Templates

> Baseline 2026-10-31, `main 2b6c1d4`. **All newly proposed UX requirements are NOT RUN**. Historical code/CI is not automatic PASS for new requirements.

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

# Yoru vNext — Acceptance Matrix v1 (proposed / not run)

**Authority:** [Decision Register](DECISION_REGISTER.md). **Test status of all NEW DF-v1 cases below = NOT RUN (or BLOCKED on access/definition)**; implementation already present in old source or passed historical CI does **not** automatically make the new contract PASS.

## Evidence ledger for each executed case

Record **case ID, owner decision IDs, tested exact commit SHA, environment/provider, device model/OS/browser version, fixture or live, relevant anime/season/cour/episode, steps, expected, observed, PASS/FAIL/BLOCKED/NOT RUN, artifact URL, operator and UTC timestamp**. Logs and screenshots must redact tokens, private URLs, cookies and user histories.

## Source/video and episode cases

| ID | Decisions | Test / expected observable result | State |
|---|---|---|---|
| DF-SRC-01 | P27/P59 | Discovered URL shows Coba Putar and not 'confirmed' before actual playback | NOT RUN |
| DF-SRC-02 | P17/P27/P55 | Real authorized episode ID matches title/season/cour/special/movie; video decodes | BLOCKED live |
| DF-SRC-03 | P09/P43 | Bad URLs, 403/404/429/5xx/timeout/expiry yield bounded retry/failover, no false ready | NOT RUN |
| DF-SRC-04 | P20 | Quality 360/720/1080/4K labels only if real rendition proven; otherwise unverified | NOT RUN |
| DF-SRC-05 | P02/P11/RG08 | Consent once then real target-device iframe fallback; wrong episode/unavailable fails | BLOCKED live |
| DF-SRC-06 | P03/P15 | Hardsub labeled, Off and soft subtitle styling never misrepresented | NOT RUN |
| DF-SRC-07 | P05 | Stremio hash, externalUrl and direct stream distinctly typed; no torrent/DRM auto-start | NOT RUN |
| DF-SRC-08 | P34/P43/P62 | Failing provider cooldown and healthy alternative retained; quotas and alerts | NOT RUN |
| DF-SRC-09 | P69 | Approved emergency switch disables only targeted provider with audit, cannot enable unrelated provider | NOT RUN |
| DF-SRC-10 | RG02/RG09 | Approved host, allowed access method, anti-bot authorization and entitlement proven before activation | BLOCKED upstream |
| DF-SRC-11 | P39 | Real iPhone Safari HLS/MP4 or approved iframe segment/seek/audio/fullscreen observed | BLOCKED device |
| DF-SRC-12 | P36 | Exact next episode verified, countdown 8 s cancellable, no wrong auto-next | NOT RUN |

## Catalog, metadata and 100% coverage

| ID | Decisions | Test / expected observable result | State |
|---|---|---|---|
| DF-DATA-01 | P18/P38 | Field-level AniList/MAL precedence/provenance, absent mapping and rate-limit degradation | BLOCKED provider terms |
| DF-DATA-02 | P17/P38 | AniList and MAL numeric collisions never conflated; no title-only join | NOT RUN |
| DF-DATA-03 | P53 | Upstream API down / stale cache uses validated alternative and labels stale | NOT RUN |
| DF-DATA-04 | P16/P19 | Browse paging/genre/status/year/sort honest count, no synthetic episodes | NOT RUN |
| DF-DATA-05 | P21 | Legacy `/anime/:malId`, library/progress, backups survive reversible ID migration | NOT RUN |
| DF-COV-01 | P19/RG07 | Upcoming excluded from first-release eligible already-aired title denominator with audit | BLOCKED definition |
| DF-COV-02 | P55/P64/P68 | Officially aired but missing-provider episodes cannot vanish into 100% provider-only denominator | BLOCKED conflicting P68 |
| DF-COV-03 | P55 | Zero-source and 0/0 titles cannot pass; unknown eligible count produces UNKNOWN/BLOCKED | BLOCKED definition |
| DF-COV-04 | RG08 | Each counted episode really plays correct content in native or consented iframe on target devices | BLOCKED live |
| DF-COV-05 | P67 | After public launch, new episode unavailable is truthfully labeled without automatic site shutdown | NOT RUN |
| DF-COV-06 | RG04 | First-public-release all required episodes verified on dated catalog snapshot; private beta labeled separately | BLOCKED complete proof |

## Subtitle, player and accessibility

| ID | Decisions | Test / expected observable result | State |
|---|---|---|---|
| DF-SUB-01 | P12/P14 | Indonesian auto-selected where supported, Off saved and never silently re-enabled | NOT RUN |
| DF-SUB-02 | P12 | English prompted explicitly, rejected means remains unavailable/off | NOT RUN |
| DF-SUB-03 | P35/P54 | Search provider-independent tracks, wrong release/season not auto-selected | BLOCKED live |
| DF-SUB-04 | P44/P58 | Offset/alternative/preset/manual style work when renderer supports and fail closed otherwise | NOT RUN |
| DF-SUB-05 | P13/P03 | No subtitles still allows playback; hard subtitle irreversible label | NOT RUN |
| DF-SUB-06 | P35 | Real OpenSubtitles/SubDL/SubSource/Stremio configured search and downloaded track visible on iPhone | BLOCKED live |
| DF-PLAY-01 | P49 | Playback controls work natively; unsupported iframe control disabled/explained | NOT RUN |
| DF-PLAY-02 | P49 | Intro/recap skip only when trusted bounds exist; no guessed timestamps | NOT RUN |
| DF-PLAY-03 | P22 | Resume exact saved episode/time, revalidates candidate, no unverified source reuse | NOT RUN |
| DF-UX-01 | P21 | Desktop and mobile detail are full-page with correct Back/Forward/scroll/focus | NOT RUN |
| DF-UX-02 | P24 | Hero rotates every 8s, pauses on hover/focus/touch/reduced motion | NOT RUN |
| DF-UX-03 | P56 | Two-column mobile and explicit Compact toggle with persisted state | NOT RUN |
| DF-UX-04 | P57 | Main filters visible, advanced filters expandable, URL/filter state retained | NOT RUN |
| DF-UX-05 | P23 | Curated route when reviewed, otherwise release; no invented chronology/spoilers | NOT RUN |
| DF-UX-06 | P37 | Offline shell, library and cached detail/metadata; no false offline-video claim | NOT RUN |
| DF-UX-07 | P39 | Physical iPhone PWA install/update, safe areas, keyboard, captions/fullscreen/PiP | BLOCKED device |

## Account, privacy, backups, operations

| ID | Decisions | Test / expected observable result | State |
|---|---|---|---|
| DF-SYNC-01 | P32/P52 | Guest works, users A/B isolated locally even after logout/login | NOT RUN |
| DF-SYNC-02 | P33/RG05 | Auto-sync uploads only records owned by authenticated account; guest never silently joins | NOT RUN |
| DF-SYNC-03 | P41 | Concurrent CAS merge when safe; ambiguous case asks user; no silent overwrite/resurrection | NOT RUN |
| DF-SYNC-04 | P60/P70 | Versioned cloud snapshots, retention limit, manual export/import, restore previous version | NOT RUN |
| DF-SYNC-05 | P46 | Logout retains owned local records; confirmed account deletion removes appropriate cloud records | NOT RUN |
| DF-SYNC-06 | P32 | Real email OTP delivery, expiry/rate error, two real users and devices | BLOCKED auth |
| DF-SEC-01 | P09 | SSRF rejects private IP, DNS rebinding, redirect, encoded addresses, open proxy and oversize payload | NOT RUN |
| DF-SEC-02 | P48/P65 | No secrets/cookies/private media links/viewing histories in bundle, network logs, snapshots | NOT RUN |
| DF-SEC-03 | L01 | Local preview uses local/test data and credentials; no production DB reads/writes in default workflow or accidental connection | NOT RUN |
| DF-SEC-04 | L01/P48 | No hosted preview site or preview deployment required; no production service keys or real user records in local build, logs or CI | NOT RUN |
| DF-SEC-05 | P50/P69 | Alert/incident workflow; production rollback owner-approved, emergency disable-only provider audit | NOT RUN |
| DF-REL-01 | P26/P27 | Same exact SHA lint/typecheck/unit/build + Chromium/WebKit; live proof separately recorded | NOT RUN |
| DF-REL-02 | P39 | Physical iPhone Safari and desktop Chrome signed off against actual candidate SHA | BLOCKED device |
| DF-REL-03 | P29 | Actual production HTTPS full-stack, API, limits, CSP, secrets, monitoring, recovery, rollback | BLOCKED infrastructure |
| DF-REL-04 | RG04/P55 | Quantified eligible catalog and **every** required episode playback evidence, no P0 unresolved | BLOCKED coverage |
| DF-REL-05 | P29/P50 | Explicit owner GO for production deploy/release/rollback, not inferred from passing tests | NOT RUN |

## Execution gates, not phase status claims

- G0 contract + security/access permissions: all critical conflicts resolved in writing.
- G1 source: correct playable native/fallback for actual authorized episodes; no false status.
- G2 metadata/release: stable identity, independent denominator, verified full eligible coverage.
- G3 subtitle: live id/en search/download/matching/renderer.
- G4 physical devices: iPhone Safari/PWA and Chrome desktop.
- G5 cloud/data: RLS, OTP, two users/devices, recovery, privacy, local-only preview data isolation and production credential protection.
- G6 infrastructure: exact-SHA app and API, ingress protection, quotas, logs, rollback.
- G7 owner GO: final explicit production/release approval.

Existing Yoru [ACCEPTANCE_MATRIX](../ACCEPTANCE_MATRIX.md), [Issue #20](https://github.com/rzqllh/Yoru/issues/20), and [Issue #78](https://github.com/rzqllh/Yoru/issues/78) remain evidence sources. This sheet is **not** a report of executed new tests.

## Fail-closed rule

If measurement method, provider entitlement, local/prod isolation, cloud data safety, identity, real playback, device proof or explicit owner approval is missing: label BLOCKED/NOT RUN. Never estimate a PASS, 100% coverage or delivery date from documentation or fixtures.

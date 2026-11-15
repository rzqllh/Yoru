# Yoru vNext — Product Requirements & Architecture Contract (draft)

**Status:** OWNER CHOICES CAPTURED / IMPLEMENTATION NOT AUTHORIZED. See [decision register](DECISION_REGISTER.md). All current capability claims must be separately source- and live-verified.

## 1. Goal, users and promise

Anime-first, mobile-focused progressive web app for discovery, safe episode identity, independently sourced playback, subtitles, curated franchise guides, resume, and account-optional library. Core journeys:

1. Discover/search/filter → full-page detail → save/watch.
2. Select anime/season/cour/episode → find distinct source candidates → attempt video → verify playback or truthful error → try safe fallback.
3. Prefer Sub Indo; explicitly ask before English; Off persists; subtitle matching independent of video source.
4. Resume verified episode and timestamp; exact auto-next with cancellable 8-second countdown.
5. Use locally without account; optionally sync account-owned state across devices.
6. Explore reviewed franchise paths without fabricating canon/chronology.

**Non-promises:** Every discovered URL is not guaranteed to work; a torrent hash is not native video; subtitles may be absent; offline shell is not offline video; iframe controls depend on remote player; source availability is not guaranteed by metadata.

## 2. UX acceptance contract

- Home: hero rotates every 8s when allowed, pauses on focus/hover/touch/interactions and reduced-motion, has non-gesture accessible controls; sections for Anime Popular, upcoming, continue watching. Personalized suggestions supplement neutral discovery.
- Cards: mobile two columns, 2:3 poster and consistent title/badges; explicit Compact view control; preserve accessibility and 44px touch targets.
- Browse: search, main filters visible, advanced filters expandable. Include genre/tag/status/type/year/score/sort only when metadata authority supports correct pagination and semantics. Preserve URL/query/back/filter state and show truthful loaded/total counts. 'Akan Datang' is its own route; not third Browse segment.
- Detail: **full page on mobile and desktop** with deep links, Back/Forward, preserved scroll/focus, independent episode/source states, safe resume. Never fake episode numbers or wrong season/cour.
- Watch Guide: curated reviewed viewing route by default when available; release order otherwise. Branch/edition/OVA/movie/special are marked and attributed; no invented story chronology.
- Player: native HLS/MP4 prioritized. Play/pause, seek, volume, speed, fullscreen, PiP, supported qualities, caption/quality menus, keyboard/accessibility, auto-next 8s, intro/recap skipping **only from trustworthy timing evidence**. No fake controls on iframe. Error, timeout, quota, unsupported codec and external provider failures must be recoverable.
- Subtitle: Indonesian preferred; English requires clear consent; missing subtitle allowed and labeled; Off persists. Search SubDL, SubSource, OpenSubtitles, configured Stremio subtitles where authorized and tested. Match title, release, episode, season; doubtful candidates manual. Support VTT/SRT and supported ASS subsets where actual parser supports them. Presets and manual font/size/contrast/outline/position/offset only when renderer supports them.
- Video embedded fallback: one-time opt-in; hardsub visible and labeled; iframe with demonstrated playback may satisfy RG08 coverage but **must not be called native verified video**. Controls/auto-next unavailable to iframe must be disabled/explained.

## 3. Playback state machine

`METADATA_ONLY → EPISODE_KNOWN → SOURCE_DISCOVERED → ATTEMPTABLE → LOADING → PLAYBACK_CONFIRMED`.

Failures: `UNAVAILABLE | WRONG_IDENTITY | UNSUPPORTED | EXPIRED | PROVIDER_FAILED | BLOCKED`.

- P59 overrides P04's false-ready wording. Offer **Coba Putar** as soon as a candidate is known, but `PLAYBACK_CONFIRMED` requires observed content.
- Native source: HTTPS + allowed host + provider identity + safe response + device/CORS/codec/segment decode evidence. Preflight itself does not prove entire stream/episode continuous.
- Iframe: verified correct episode, playable UI on target device, user consent; limitation clearly differentiated.
- Explicit quality label from provider is **unverified** until genuine rendition selection can be proved.
- Direct stream should not be conflated with `externalUrl`, download link, Stremio `infoHash` or proxy request.
- Player UI states are distinct from release-wide coverage evidence.

## 4. Provider integration and safety

- Built-in + configured providers, isolated adapters; new candidates researched broadly and enabled gradually (P07/P62/RG02).
- Ranking considers real playability, exact identity, provider health, subtitle suitability, prior success. Bounded timeouts/retries; cooldown of failed providers; non-failing peers remain available.
- A configured provider is not automatically proven working. Audit source behavior, permissions, API/mapping, host policy, format, duration, CORS, codec, source expiry and iPhone parity before activation.
- Public gateway must reject arbitrary URL forwarding, dangerous DNS/IP ranges, redirects to internal networks, oversized payloads, token leakage, unfettered budgets and unsolicited credentials.
- Owner's RG09 request for automatic bypass does not supersede upstream permissions; no unauthorized challenge evasion, DRM circumvention, cookie exfiltration, or access-control bypass in approved work. Where permitted access is unavailable, source status BLOCKED.
- Emergency provider kill switch is limited to disabling a previously integrated dangerous provider, with audit/notification; no automatic promotion/DB migration/release.
- Torrent resolver is deferred under P05 and remains a separately gated optional design only.

## 5. Canonical catalog and release coverage

- Hybrid AniList/MAL **with per-field authority**, title/ID provenance, durable `mal:<id>` and `anilist:<id>` namespaces. Existing URLs and backups migrate reversibly; no title-only identity join.
- A catalog source error falls back to validated cache and alternative source; stale information labeled. Do not fabricate completeness or total counts.
- Discovery catalog includes nonplayable titles, with `Bisa Ditonton` filter. Upcoming visible but excluded from **first-release mandatory playable denominator** by RG07.
- Every **already-aired** eligible title must have real playback, and every eligible released episode must play on the target device set before first public release; private beta can remain available.
- P68 C counts an episode as released once a provider carries video, but this definition is **not independently reliable** for proving all officially aired episodes. It is preserved as owner choice and remains an **open metric conflict**. Do not silently use a provider-derived denominator to show 100%.
- RG08 allows native OR actually demonstrated fallback playback for release proof. Record mode and device; don't imply identical quality/control.
- P67: after public release a newly aired episode that is not yet playable is honestly labeled; service need not immediately shut down. Track coverage regressions and resolution.
- Coverage scope must be a dated, signed, exact-SHA, source-grounded audit snapshot. Unknown episode totals/identity cannot be counted as passing.

## 6. Local-first, account, sync, privacy

- Account optional; guest remains functional offline; browser IndexedDB stores library, progress and preferences.
- Separate each account's local namespace and guest data. Logout retains owned local data, destroys session; account deletion offers explicit cloud deletion/device erase workflows.
- Auto-sync applies only to records **already tied to the authenticated account** (RG05). Unowned guest data is never silently uploaded or merged; explicit import/claim is a separate operation.
- Concurrent edits: CAS or equivalent revision guard; merge when unambiguous, prompt otherwise; tombstones and device identity as needed to prevent resurrection.
- Auto versioned snapshot and manual export/import; validate schema, owner, canonical ID, size and integrity; wrong/corrupt import must not destroy existing data. Bound retention (P70 cites 30d example; number/count still to approve).
- Privacy: backend-only provider secrets (P48); do not put session keys, signed media URLs, private watch history in operational logs; technical error monitoring (P65) uses minimized data.

## 7. Single hosted production; preview and QA local only (L01)

**Latest owner directive (2026-11-15):** Yoru has **only one remotely deployed environment: production.** All pre-production preview/testing happens **locally**, on a local development server and/or local production build. Do not create a separate hosted preview/staging deployment or production database connection merely to achieve preview parity.

- Local testing aims to reproduce production **behavior, routes, feature flags, API contracts, and builds** where safe; it does not demand production credentials or private user records.
- Default planned local dev and tests to **local/test data, controlled fixtures, and separate test credentials**. No production DB reads/writes, privileged keys, production account login or imported personal records unless separately explicitly authorized and reviewed.
- A single remotely hosted production deployment is the only release destination; code is integrated through source review, test CI, local preview and owner-approved promotion.
- Production secrets stay in production and must never be committed, copied into local docs, exposed in browser bundles or transmitted through source-control workflows.
- Earlier hosted preview/shared-production-DB decisions P29/P40/P42/P51/P61/P71/RG03/RG06 are **superseded for preview architecture** by L01. Historical selections remain in the decision register; their earlier production-read privilege is not carried into local testing.
- If future tests **need** real production data or credentials, treat that as a separate security change requiring explicit owner authorization, privacy assessment and least-privilege proof. Do not assume permission from L01.

**Local preview is not production deployment.** Its errors can inform release readiness, but physical-device, authorized live source, cloud/RLS and production full-stack acceptance still need separately documented evidence.

## 8. Operations and release

- Feature tests while building, full integration later, exact-SHA CI/unit/browser/physical-device and **live authorized source tests**.
- Monitoring detects provider failures without collecting viewing histories or secrets.
- Only production is remotely hosted; local preview/test checks run before owner-approved production deployment or rollback. The only preapproved narrow exception is emergency disable-only provider kill switch.
- Private beta may run under previously authorized constraints; **public release NO-GO** until security/access/coverage conflicts, live source+subtitle tests, iPhone physical, cloud security if deployed, infrastructure, and final signoff.
- No automatically activating provider, source, migration, production data access, or production deployment from approval of this document. Local preview is allowed only within previously authorized local development scope.

## 9. Acceptance

Acceptance cases, evidence fields and measurable gates are in [ACCEPTANCE_MATRIX_V1.md](ACCEPTANCE_MATRIX_V1.md). Unverified = NOT RUN/BLOCKED, never PASS.

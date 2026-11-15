# 01 — Product Requirements Document (PRD)

**Product:** Yoru — anime-first PWA. **State:** DRAFT / OWNER REVIEW. **Scope:** desired product, not current feature claims. **Authority:** [Decisions](../planning/owner-freeze-2026-11-15/DECISION_REGISTER.md), [L01](../planning/owner-freeze-2026-11-15/README.md), [AGENTS](../../AGENTS.md), [Open conflicts](../planning/owner-freeze-2026-11-15/OPEN_CONFLICTS.md).

## Product problem and opportunity

Anime discovery metadata alone does not tell a viewer whether a *correct* episode will play on their device with understandable subtitle and reliable resume. Sources can be absent, misidentified, expired, geographically restricted, unsupported or merely external links; an interface that treats URL discovery as success gives users false confidence. The product also needs local-first watch progress and optional cross-device continuity without mixing guest and account data.

**Target users (not researched personas):** Indonesian-first anime viewers browsing/playing on iPhone Safari and desktop Chrome; users without accounts; users with accounts syncing progress; editorial/watch-order explorers. No demographic, market-size or conversion claims are established.

**Value promise:** one coherent journey from discover → correct title/episode → permission-aware source attempt → observed playback → subtitles → progress/resume, with honest fallback when unavailable.

## Outcomes and measurable evidence

| ID | Outcome | Metric/evidence | Gate |
|---|---|---|---|
| OBJ-01 | Correct anime and episode | Canonical ID and season/cour/movie/OVA mapping; wrong-title tests | DF-DATA-02 / DF-SRC-02 |
| OBJ-02 | Actually playable video | Count of verified correct episodes by browser/device, source type and timestamp; errors not counted | DF-SRC-02/05/11 |
| OBJ-03 | Sub Indo-first playback | Verified Indonesian subtitle display or clearly signaled absence; explicit consent for English | DF-SUB-01..06 |
| OBJ-04 | Resume and optional sync | Exact saved episode/time; guest ownership respected; two-account/two-device tests | DF-PLAY-03 / DF-SYNC-01..06 |
| OBJ-05 | Usable PWA | Mobile/desktop full-page detail, accessible inputs, PWA offline shell and tested physical iPhone | DF-UX-01..07 |
| OBJ-06 | Safe release | No critical data/access issues; independently audited catalog coverage; owner sign-off | DF-COV-01..06 / DF-REL-01..05 |

**No fabricated KPI targets.** Baseline ratios (success rate, startup time, source health, subtitle availability and resume failures), dataset sampling, confidence and numeric SLOs remain `PROPOSED/NEEDS APPROVAL`. **100% first public release target is owner-selected**, but P68's provider-defined release denominator conflicts with all-aired coverage: public coverage sign-off remains **BLOCKED**.

## Core scope

1. **Discovery:** broad anime catalog, Home hero 8 seconds pause-on-interaction, Anime Popular, search, Browse filters and separate Upcoming, accurate total/loaded counts.
2. **Detail:** full page on mobile and desktop, canonical IDs, accurate episodes, watch guide, save and continue watching.
3. **Sources:** built-in/configurable federated adapters with validation/health/ranking/failover; direct video prioritized, permitted iframe after one-time consent, hardsub labeled. Torrent deferred.
4. **Player:** observed native video or verified fallback, quality when evidenced, seek/speed/fullscreen/PiP if supported; 8-second cancelable auto-next; intro/recap skip only with real timing metadata.
5. **Subtitles:** Indonesian-first, English explicit consent, Off persistence, independent federated subtitle search and confident episode matching; manual and preset styles as renderer supports.
6. **Library:** browser local-first and optional accounts; automatic cloud sync of account-owned data only, safe conflict merge, manual export/import and bounded versioned backup.
7. **Reliability:** cache shell/catalog/library (not full offline video), safe metadata fallback, provider cooldown, emergency disable-only switch; minimal technical telemetry.
8. **Verification/release:** local preview only under **L01**; only production remotely hosted; exact-SHA tests, iPhone physical Safari and Chrome desktop; user-data safeguards; explicit owner GO.

## Explicit non-goals / deferred scope

- Nintendo/game porting or unrelated projects.
- Native IPA/APK release in this scope.
- Torrent runtime/resolver or offline downloaded video (P05/P37).
- Guaranteed copyright license for every third-party anime; use and access entitlement must be verified.
- Guaranteed that all third-party sources or AniList/MAL endpoints remain reachable.
- FlyStream runtime provider (RG01: **reference-only**).
- Separate hosted preview/staging environment (superseded by L01).
- Arbitrary URL media proxy, DRM circumvention, unpermitted anti-bot bypass, client-exposed provider tokens.
- Public launch merely because GitHub CI or Vercel READY status appears green.

## Product lifecycle and release policy

- **Development/local preview:** inspect app locally, mocked/fixture tests and authorized source probes clearly marked. This is not a second hosted environment.
- **Private beta:** allowed within previously approved bounds, with unavailable labels and no false 100% claim.
- **First public release:** owner requires all eligible already-aired catalog titles and released episodes to play (RG04/RG07/RG08). Official release vs P68 provider-based definition unresolved (C02); no PASS until clarified. Upcoming separate.
- **Post-release:** newly airing episode can remain unavailable with truthful label while service continues (P67); no concealment of episode existence.
- **Production promotion and rollback:** always explicit owner approval except narrowly preapproved provider disable-only kill switch; approval of documents is not approval to deploy.

## Dependencies and risks

| ID | Dependency/risk | Status |
|---|---|---|
| PRD-B01 | Eligible episode denominator, 100% reproducible audit | **BLOCKED C02** |
| PRD-B02 | External provider allowed access, ownership, source format and real decoding | **BLOCKED where unverified/C03** |
| PRD-B03 | AniList/MAL eligibility/terms and per-field metadata authority | **BLOCKED where unapproved/C04** |
| PRD-B04 | Account isolation, OTP/RLS/CAS and backup recovery | NOT IMPLEMENTED/NOT RUN on inspected main |
| PRD-B05 | Physical iPhone and live subtitle/media verification | NOT RUN |
| PRD-B06 | Local test isolation / production credential access | L01 fixed topology; testing boundaries still need validation |
| PRD-B07 | Design-system detailed tokens/sizing and production launch metrics | NEEDS OWNER/RESEARCH EVIDENCE, not invented |

## Product acceptance

A feature is `DONE` only when its [requirements](03-REQUIREMENTS.md), [business rules](06-BUSINESS_RULES.md), [test cases](12-TESTING.md) and actual recorded evidence agree on the **same SHA**, environment and supported devices. New targets remain proposals until implementation and independent verification. Existing [Issue #20](https://github.com/rzqllh/Yoru/issues/20) remains release NO-GO.

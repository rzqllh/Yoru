# 08 — API Contract and Change Control

**Status:** Distinguishes **OBSERVED endpoints in main** from **PROPOSED conceptual interfaces**. Observed surface sampled from [backend/api/app.ts](../../backend/api/app.ts) at historical inspected main `b2fd85a`; re-verify exact current source before generating SDK/requests. **No endpoint, response schema, credential or operation may be invented as implemented.**

## A. Observed Hono routes

| Method | Path | Purpose and current contract notes |
|---|---|---|
| GET | `/api/health` | Health payload; HTTP 200 only proves this endpoint responded |
| GET | `/api/anime/discover?kind=season\|top\|upcoming&page=N` | Catalog page from MAL/Tenrai-compatible API; kind validation |
| GET | `/api/anime/daily-trends` | AniList daily trend feed; optional and can fail |
| GET | `/api/anime/search?q=...&page=N` | Search anime, query validation |
| GET | `/api/anime/genres` | Source-labeled MAL genre options/fallback |
| GET | `/api/anime/browse?kind=...&page=...&...` | Server-side Browse filter; use current validator for exact query list |
| GET | `/api/anime/:id/watch-guide?depth=1\|2` | AniList relation/graph, not universal chronology |
| GET | `/api/anime/:id` | Anime metadata using canonical numeric MAL ID currently |
| GET | `/api/anime/:id/episodes?page=N` | Metadata episodes with pagination |
| GET | `/api/providers` | Configured local/Stremio/Miruro plus unverified `public-embed` descriptor; registry ≠ playable |
| GET | `/api/anime/:id/provider-episodes` | Provider episode candidates; source identity may be incomplete |
| GET | `/api/streams?episodeRef=...&start=N` | Provider candidate streams or unavailable kinds; no automatic playback proof |
| GET | `/api/subtitles/status` | Configured subtitle adapter availability |
| GET | `/api/anime/:id/subtitles?episode=N` | Federated subtitle candidates, guarded by quota |
| GET | `/api/subtitles/file?provider=...&ref=...&expires=...&token=...` | Signed subtitle grant; VTT response or validated error |

**Current implementation facts:** `/api/streams` validates provider episode reference format; does not accept arbitrary proxy URLs. Subtitle download checks provider allowlist and signature; throttles may return 429 `Retry-After`. Metadata endpoints return structured `error` codes on invalid/missing upstream responses. Exact body shape comes from source and tests, **not inferred** from endpoint names.

## B. Proposed target contracts — NOT implemented endpoints

These are **logical capabilities** that need approved design before selecting REST path, transport or persistence:

| Proposal ID | Capability | Inputs/outputs as design requirements | Status |
|---|---|---|---|
| API-P01 | Canonical anime/episode identity bridge | namespaced IDs, season/cour/edition mapping, provenance | PROPOSED; no route chosen |
| API-P02 | Per-source playback status and verification evidence | candidate/attemptable/confirmed/failure, device and timestamp | PROPOSED; do not claim HTTP 200 = playing |
| API-P03 | Controlled provider health and disable-only kill switch | approved provider identity, action reason, audit | PROPOSED; production security gate |
| API-P04 | Account auth/session and account-owned sync | authentication, ownership, revision/CAS, conflict | PROPOSED; draft cloud #77 needs audit |
| API-P05 | Versioned snapshots and restore | owner-scoped version, checksum, retention, restore | PROPOSED; policy approval |
| API-P06 | Catalog eligibility/coverage evidence ledger | independent title/episode denominator and proof refs | **BLOCKED C02** |
| API-P07 | Metadata per-field authority/fallback | MAL/AniList mapping with allowed access/terms | **BLOCKED C04** |

**Do not generate `/api/sync`, `/api/login` or any table-backed route as though it already exists**. Treat any sample contract as illustrative pending approval, and inspect PR #77 before changing cloud surfaces. Existing URLs must remain backward-compatible or have a reviewed migration.

## C. General API safety

- Validate input type/length, canonical decimal IDs, URL host and path, payload limits, MIME and JSON schema. Never treat TypeScript types alone as runtime validation.
- Bounded timeout/abort and retries; safe 429/rate handling; independent provider results.
- Do not expose server cookies, access tokens, user watch history, signed media URLs or sensitive provider configuration to unauthorized clients or logs.
- No arbitrary provider URL fetch, redirect to RFC1918/metadata/private hosts, open proxy, anti-bot challenge circumvention or DRM bypass. Signed subtitle grants do not authorize other URLs.
- Fail closed on ambiguous season/episode mapping; a response that merely includes stream candidates is not evidence they play.
- Separate `SOURCE_DISCOVERED`, `PLAYBACK_ATTEMPTABLE`, `PLAYBACK_CONFIRMED` and failure states at the client level; update API shapes only with compatibility and tests.
- All production-facing API deploys require owner approval; L01 mandates local preview only, one remotely hosted production target.

## D. API error/state handling checklist

| Scenario | Expected response/client behavior |
|---|---|
| Invalid numeric ID, query, source ref | 400 or documented validation response; no upstream fetch |
| Metadata unavailable | clear 503 or documented unavailable response; cache fallback if verified |
| Provider HTTP 401/403, 429, 5xx | safely signal source unavailable or cooldown; do not bypass |
| Expired subtitle grant | 403 and recoverable retry through authorized signing path |
| No source | empty candidate list and explicit unavailable state, not PLAYBACK_CONFIRMED |
| Wrong episode | reject/mark ambiguous; don't play as confirmed |
| Account A requesting B data | deny with RLS/API guard; do not rely on frontend |
| Local dev without approved cloud access | use test/local adapter, or mark cloud QA BLOCKED |

## E. Contract change procedure

1. Read live `backend/api/app.ts`, `frontend/src/lib/api.ts`, validators and tests at exact SHA.
2. Identify affected requirement IDs and callers; list current versus proposed request/response shapes.
3. Check auth, RLS, budgets, SSRF, provider entitlement, cache, and legacy compatibility.
4. Request owner permission for new auth/database/production/data policy or cross-boundary changes.
5. Implement only approved scope and test positive/negative cases; record observed response and browser behavior.
6. Keep [Testing](12-TESTING.md) evidence separate by fixture vs live/device; do not mark API design DONE because docs exist.

**If route/schema unknown → `BLOCKED` with evidence under [AGENTS.md](../../AGENTS.md).**

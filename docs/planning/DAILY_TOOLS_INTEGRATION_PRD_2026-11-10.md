# Yoru — Daily-Tools Integration PRD, Technical Plan and Acceptance Contract

> Version: 0.1 · Planned: 2026-11-10 Asia/Jakarta · Owner intent: Otakudesu = FULL target, other files audited and triaged.
>
> Evidence: Daily-Tools main ef0e7b52048a856dd39d2b75e11b11e6982e057e; Yoru main ff9575f891085d68d22492287b28daa73c2b636c at read-only inspection. Do not treat these hashes as deployed or tested.
>
> State: DOCS-ONLY specification. Agent implementation is delegated only AFTER safe remote/local reconciliation, source permission checks and the applicable approvals. Public release remains NO-GO under Yoru #20.

## 1. Purpose and product requirements

Extend Yoru's anime discovery with an opt-in Otakudesu source and, only if proven, browser-native playback for accurately matched episodes. No fake Play-ready status, arbitrary iframe playback, torrent resolver, uncontrolled proxy, API-key publication or changes to subtitle consent. This is an additive provider, not a replacement for the existing MAL/AniList catalog and existing provider ranking.

User journeys:
1. Find a canonical anime in Yoru -> inspect source availability from approved providers -> view actual, correctly mapped episodes.
2. Open an episode -> show independently verified HLS/MP4 candidates -> preflight and play using existing player if browser-supported and authorized.
3. If upstream breaks/403s/429s/redirects or offers only iframe/download links -> show unavailable/degraded/external-navigation information, not a fake native Play button.
4. Recover via existing other providers without erasing local library, subtitle Off, language consent or resume.
5. Optionally discover donghua through Anichin and show verified release schedules; these are BACKLOG/NOT AUTHORIZED FOR CODE until independently approved.

## 2. Scope, non-goals and disposition

P0 planned full contract: Otakudesu catalog mapping, latest/search/detail data adaptation, episode list, source reference, safe resolution, native-player validation, user-facing source state, observability, rate limiting, tests and rollback.
P1 conditional: scheduled/latest-feed enrichment; reuse AniList/Jikan metadata only where it improves canonical identity and agrees with D03=3A.
P2 separately approved candidates: Anichin (donghua search/details/episodes), Bstation (search), Kusonime (catalog/download metadata), wibu (search).
Not goals: source mirroring, copying media to Yoru servers, bypassing rights/DRM/anti-bot, using arbitrary third-party iframe as native Play, relying on download links as video streams, adding novel engines or paid services.

Relevant upstream references: https://github.com/KiyoEditz/Daily-Tools/blob/main/otakudesu.js ; https://github.com/KiyoEditz/Daily-Tools/blob/main/anichin.js ; https://github.com/KiyoEditz/Daily-Tools/blob/main/needs%20to%20check/jadwal-anime.js .

## 3. Existing contracts that must survive

- Preserve backend/api/app.ts provider discovery, /api/anime/:id/provider-episodes and /api/streams, local/stremio/miruro support, degradation isolation and frontend player/source lifecycle.
- Preserve D01 Indonesian preference, explicit English consent, persistent subtitle Off and track matching; D02 excludes uncontrolled iframe playback.
- D03=3A plans AniList-primary catalog and nullable MAL legacy bridge. Today /api/anime/:id expects numeric MAL IDs. Never title-join blindly; record ambiguity explicitly and do not invent MAL IDs.
- Only approved HTTPS hosts with DNS/IP, redirect, response size and time budgets; no open fetch/proxy. Validate final media URL, media type, HLS manifest and segments, MP4 range/codec/CORS, expiry and device support.
- Keep release #20 blocked until live authorized playback, subtitles, physical iPhone/Safari, production security and owner release signoff. No enabling hosted streaming by adding a scraper.

## 4. Proposed component ownership and normalized provider data

- backend/providers/otakudesu.ts (proposed): isolated typed adapter, source host allowlist, input/path validation, parse-only functions and bounded request client using existing Yoru security facilities where suitable.
- backend/pipeline/ (existing): reconcile source title/season/cour/movie/special and episode to canonical IDs, preserving source provenance and ambiguity states.
- backend/api/app.ts: register provider only after integration contract tests; preserve existing routes and response shape. Do not create a raw arbitrary-URL API.
- frontend: keep Player, source-ranking, source-readiness and source-lifecycle; show eligible native media separately from external/unavailable data.
- tests/: fixture-driven parser and failure tests; avoid copying full third-party media.

Proposed internal fields (NOT asserted as current exported TypeScript types): sourceId, canonicalAnimeId, optional malId/aniListId, sourceAnimeRef, episodeNumber, episodeRef, sourceUrlProvenance, sourceHealth, candidateFormat (hls/mp4/iframe/download/unknown), candidateUrl, subtitleTracks, verifiedAt and failureReason. Align names with real types before code. Browser Play-ready requires positive live evidence, not a metadata property alone.

## 5. Functional backlog / acceptance

| ID | Requirement | Exit evidence |
| --- | --- | --- |
| YOR-DT-00 | Remote/local reconcile before any code | Git HEAD, branch, dirty/untracked inventory, protected backup and zero-discard alignment |
| YOR-DT-01 | Provenance/rights and host approval | Source ownership, ToS/robots/license review, approved host/traffic policy; or BLOCKED |
| YOR-DT-02 | Deterministic latest/search/detail parsing | Sanitized HTML fixtures, selectors, encoding, empty/malformed tests |
| YOR-DT-03 | Canonical identity mapping | Exact MAL/AniList reconciliation, duplicate/ambiguous/cour/movie tests, no title-only join |
| YOR-DT-04 | Episode discovery and stable refs | Ordered deduped episodes, accurate specials/seasons, invalid IDs rejected |
| YOR-DT-05 | Safe candidate resolution | URI/host/IP/DNS/redirect/size/timeout checks; videoData broken regex not copied |
| YOR-DT-06 | Native player eligibility | Real authorized HLS/MP4, manifest/segments, browser/CORS/codec tests; iframe/download stay non-playable |
| YOR-DT-07 | Source lifecycle/fallback | 403/404/429/5xx/timeout/changed DOM/expired URL; unaffected providers still work |
| YOR-DT-08 | Subtitles and resume invariants | Indonesian preference, English consent, subtitle Off, position/episode resume preserved |
| YOR-DT-09 | Accessibility and performance | Loading/empty/degraded states; keyboard/touch/reduced-motion and budget regression |
| YOR-DT-10 | Release rollback and documentation | Flag/off switch, request budgets, no secret logs, reproducible rollback and #20 NO-GO unless approved |

Suggested trace: unit parser and API fixtures -> npm run lint -> npm run typecheck -> npm test -> npm run build -> browser integration -> consented live source checks -> physical Safari evidence -> explicit separate production release decision. Only mark PASS for observed commands and exact SHAs.

## 6. Dependency phases and hard gates

S0 BASELINE: inspect remote/local both repos, active branches, worktrees, linked identities and dirty states. Snapshot uncommitted/untracked user data outside worktree, do not force-reset. Download/fetch and align safely. Never execute an old local copy while alignment is incomplete.
S1 DESIGN: confirm source license/rights/terms/host policy and mapping contract. If unavailable, limit work to fixtures/isolated design and report BLOCKED.
S2 IMPLEMENT PARSERS: minimal TypeScript adapter; no global deps without owner approval; fixtures + unit tests; no production activation.
S3 EPISODE/CANDIDATE: mapping, fallback and secure resolver, native eligibility gate. Explicit approval before touching provider security boundaries, transport/CSP or adding external hosts.
S4 INTEGRATE: existing provider aggregation, UI states, subtitling and resume invariants; no degradation regression.
S5 QA: deterministic + live authorized verification, browser/device evidence and security review.
S6 RELEASE: requires #20 G1-G7 and explicit owner GO; failure means NO-GO with rollback ready.

STOP if license/authorization, local merge conflict, secrets, unsupported site policy, invalid URL security, or rights are unresolved. Do not bypass anti-bot restrictions with stealth cookies/proxies.

## 7. Risk register and decision log

| Risk | Likelihood/impact | Required mitigation / current disposition |
| --- | --- | --- |
| Broken private-use regex and no export | High/high | Reimplement small parse contract; fixture-test; do not import CLI side effects |
| DOM/domain drift or 403/429 | High/high | Approved host inventory, budget, timeout, cache, degradation and backoff |
| Iframe/download mistaken for native media | High/high | Separate formats, native Play only after verified media and device checks |
| Wrong MAL/AniList, specials and season mapping | High/high | Stable identity bridge; ambiguous = unavailable, not guessed |
| Media rights and source terms | Unknown/critical | Legal/provenance gate; no unauthorized playback or copying |
| SSRF/redirect and remote code evaluation | High/high | Fail-closed outbound controls; never run remote scripts |
| D03 migration / existing resume regression | Medium/high | Backward-compatible routes and saved data; regression/rollback |
| Provider/source disclosure and credentials | Medium/high | Server-only approved config, redact logs, no hosted credentials committed |

Existing approved intent: Otakudesu FULL target (not a declaration that third-party content is authorized or live). New domains, architecture/security controls, dependencies, license exceptions and deployment require separate owner approval.

## 8. Executor handoff

AGY must perform: DISCOVER remote/local -> PROTECT local changes -> FETCH/DOWNLOAD -> RECONCILE exact source and documentation SHAs -> READ this PRD plus MASTER_PLAN, PHASE_PLAN, ACCEPTANCE_MATRIX, TRACKING, CURRENT_STATE, docs/public/providers.md, docs/public/security.md and issue #20 -> only then implement approved bounded slices -> QA + evidence and explicit release gate. Prefer fresh worktrees/branches, never destructive alignment. If conflicts, stop and ask for a decision, retaining both copies. Reporting format: initial HEADs/status, local preservation, remote HEADs/status, doc versions, changed files, commands and exit codes, test evidence, blockers, next approval.


## Appendix A — Daily-Tools audit scope and Yoru-relevant source inventory

The read-only research inspected **177 JavaScript files** in the upstream Daily-Tools Git tree at commit ef0e7b52048a856dd39d2b75e11b11e6982e057e. Exactly **9** were shortlisted for Yoru source discovery, metadata, episode or schedule evaluation; the remaining **168** are excluded from this Yoru integration plan. The excluded upstream files are deliberately not enumerated in this product document. Being inventoried does not authorize installing, importing, or distributing upstream code.

| File | Role | Integration decision |
| --- | --- | --- |
| otakudesu.js | Anime latest, search, detail, episodes, candidate media extraction | Primary FULL target, live native playback unverified |
| anichin.js | Donghua metadata, popular, episodes, downloads | Candidate only; separate approval |
| kusonime.js | Anime search, detail, download metadata | Candidate only; not native playback |
| lib/wibu.js | Anime search | Discovery-only candidate |
| needs to check/anilist.js | AniList metadata queries | Review against existing Yoru D03 contract |
| needs to check/bstation.js | Bstation search | Discovery-only; not verified video |
| needs to check/info-anime.js | Jikan metadata | May duplicate existing catalog |
| needs to check/jadwal-anime.js | Release schedule | Optional schedule feature |
| needs to check/kusonime.js | Alternative metadata/download scraper | Compare with primary variant before any code |

**General upstream reliability findings:** the original entrypoint points at absent index.js, the npm test script is a failing placeholder, CommonJS and ESM are mixed, and several generated wrappers reference nonexistent local modules. Specific unrelated files contain obfuscation, runtime evaluation of fetched scripts, or embedded credentials. Never wholesale-import the collection. The Otakudesu videoData regex contains private-use U+E001 markers and is not verified to resolve working HLS/MP4. A package license declaration alone does not prove rights to every contributed snippet.

**Evidence limits:** metadata and source-file inspection only. No upstream live availability, source permission, real native playback, browser/device verification, installation or integration tests were established. Follow the PRD's rights, provenance, security, owner-approval, exact-SHA QA and release gates.


## 9. Document maintenance

This document is the scoped source-integration PRD, not a replacement for docs/planning/MASTER_PLAN.md or archival handoffs. Append dated evidence to the existing planning tracker and acceptance matrix at actual implementation time, and preserve prior tickets/UX decisions.

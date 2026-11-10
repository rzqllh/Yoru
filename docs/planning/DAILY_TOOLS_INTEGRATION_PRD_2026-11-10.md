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


## Appendix A — Exhaustive Daily-Tools JavaScript inventory (177 files)

Audit method: read-only enumeration of the complete recursive Git tree and static inspection of the source files. A category is an integration disposition, not a malware finding or live-test PASS. Names after a folder header are relative to that folder. Counts reconcile to 177.

### A1. Yoru source-related — 9
- anichin.js; kusonime.js; otakudesu.js
- lib/: wibu.js
- needs to check/: anilist.js; bstation.js; info-anime.js; jadwal-anime.js; kusonime.js

### A2. Yomirra source-related — 4
- nhentai.js
- needs to check/: harimanga.js; info-manga.js; komikcast.js

### A3. Yomirra adjacent / novel / experiments — 6
- lib/: wattpad.js
- needs to check/: wattpad-list.js; wattpad-read.js; wattpad-search.js
- scratch/: test_komikcast_v3.js; test_komikcast_v3_full.js

### A4. Block direct adoption / high-maintenance or unsuitable — 22
- lib/: hdvid.js; hehe.js; nekopoi.js; spotify.js; tiktok.js
- needs to check/: enhance.js; fakektp.js; hdvid.js; nekopoi-search.js; qcr.js; qcs.js; removenoise.js; resizevideo.js; rule34.js; togif.js; tomp3.js; topdf.js; toptt.js; tovideo.js
- root: rule34.js; z-library-copy.js; z-library.js

### A5. Shared helpers (selective reuse of concepts only) — 26
- root: check_duplicate_files.js; check_local_downloads.js; display_metadata.js; drop_metadata.js; gdrive.js; group_lookup_duplicates.js; justpaste.js
- lib/: gdrive.js; krakendl.js; pixeldrain.js; scrape-old.js; scrape.js; terabox.js; uploadFile.js; uploadImage.js
- needs to check/: base64.js; fetch.js; gdrive.js; krakendl.js; mediafire.js; pastebin.js; pixeldrain.js; qrcode.js; sfile.js; terabox.js; translate.js

### A6. Optional creative/image-related, out of approved integration scope — 35
- backup/: pinterest.js
- lib/: bingimage.js; huggingFace.js; moewalls.js; pixiv.js; wallq.js
- needs to check/: _openaiimage.js; bingimg.js; bingimg2.js; brat.js; chord.js; editimage.js; faceswap.js; hytam.js; jadianime.js; logogen.js; moewalls.js; nulis.js; photooxy.js; pinterest.js; pinterest2.js; pixivid.js; postimg.js; putih.js; randomimage.js; remini.js; removebg.js; ssweb.js; stablediffusion.js; styletext.js; toanime.js; txt2img.js; wallpaperanime.js; wallq.js
- root: pinterest.js

### A7. Optional audio/video/social, out of approved integration scope — 35
- lib/: YTDL.js; igstalk.js; threads.js; voiceba.js; xminus.js; y2mate.js
- needs to check/: _autodl.js; _kobovoice.js; applemusic.js; capcut.js; downloader-spotify.js; fb.js; ig.js; ighightlight.js; igstalk.js; igstory.js; play-musekk .js; play.js; playstore.js; playtiktok.js; search-spotify.js; threadsdl.js; tiktok2.js; tiktokimg.js; tiktokstalk.js; tts.js; tts2.js; twitter.js; voiceBA.js; yta.js; yts.js; ytv.js
- root: playstore.js; playtiktok.js; search-spotify.js

### A8. Other utility / no Yoru-Yomirra product fit — 40
- lib/: aielaina.js; chatbot.js; lyrics.js; npmstalk.js; randomm.js; sasangeyouu.js; steam.js; wuwa.js
- needs to check/: _openai-character-ai.js; aillama.js; alkitab.js; blackbox.js; brainly.js; calc.js; cocstalk.js; cookpad.js; corona.js; cuaca.js; dongeng.js; gemini.js; gemini2.js; gitclone.js; githubstalk.js; gmaps.js; google.js; gpt4.js; honkai-star-rail.js; jadwalsholat.js; kbbi.js; kodebahasa.js; kodepos.js; lirik.js; mahasiswa.js; npmsearch.js; npmstalk.js; steam.js; toimg2.js; wikipedia.js; yahoo.js
- scratch/: convert_all_plugins.js

Reconciliation: 9 + 4 + 6 + 22 + 26 + 35 + 35 + 40 = **177**.

### A9. Concrete findings, not runtime results
- Daily-Tools main tree: ef0e7b52048a856dd39d2b75e11b11e6982e057e (2026-11-10 inspection). Package entry references an absent index.js; npm test is a non-test error placeholder; CommonJS/ESM and wrapper forms are mixed.
- Otakudesu: videoData regular expression contains private-use U+E001 markers; native video extraction cannot be considered working. The module invokes runCLI without an export. Its output may be iframe, download URL, or unverified candidate, not a validated native source.
- nhentai: gallery-ID details/pages and PDF export exist; full search, popular, latest and filter contracts do not.
- Komikcast: search/detail/chapter metadata exists, but its PDF path is not a chapter-pages scraper. Harimanga also lacks a complete page-reader contract.
- lib/hdvid.js is obfuscated; lib/hehe.js begins with invalid JavaScript syntax; lib/tiktok.js evaluates remotely obtained script with Function; lib/spotify.js embeds application credentials; several generated wrappers import modules absent from the tree.
- z-library files use public proxy rotation and locally persisted account/cookie material; file/image helpers send payloads to third-party hosts. No wholesale import, open proxy or credential reuse.
- The package declares ISC in package.json, but no root LICENSE file was in the inspected tree; third-party contributions may have independent rights. Do not verbatim-copy until provenance and reuse permissions are checked.
- No fresh upstream live probe, permission confirmation, install, static analyzer, unit tests, browser tests, device tests or production verification was performed as part of this research.


## 9. Document maintenance

This document is the scoped source-integration PRD, not a replacement for docs/planning/MASTER_PLAN.md or archival handoffs. Append dated evidence to the existing planning tracker and acceptance matrix at actual implementation time, and preserve prior tickets/UX decisions. Link the paired Yomirra contract: https://github.com/rzqllh/Yomirra/blob/main/docs/planning/DAILY_TOOLS_INTEGRATION_PRD_2026-11-10.md .

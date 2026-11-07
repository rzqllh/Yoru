# Yoru — Bugs & Refinement Register

**Updated:** 2026-11-07 (Asia/Jakarta). **Default baseline:** `main@464e7a7c46f869675a07c4f2bbf27b8e541bb3af`. Candidate PR #158/159 is separate; **PR #159 head `ba3daa471e6a...` is NOT main**.

**Evidence statuses:** CI_REPRODUCED means deterministic GitHub workflow produced failure; SOURCE_CANDIDATE is source read on unmerged feature branch; PATCH_DRAFT is a proposed unmerged fix; ACCEPTANCE_OPEN/LIVE_BLOCKED means real device/source/vendor proof missing; REFINEMENT is optional/partial and not necessarily a regression. Do not mark all candidate findings active on main. No third-party media requests were executed for this report.

**Latest gate truth:** [Linux/Windows CI run](https://github.com/rzqllh/Yoru/actions/runs/42320029286) **SUCCESS** for `ba3daa47`; [Chromium/WebKit browser run](https://github.com/rzqllh/Yoru/actions/runs/42320029272) **FAILURE** (Chromium 5/87, WebKit 2/6). This is a release blocker until exact-head verification passes. Real provider playback, legal usage and physical iPhone remain unverified independently.

## P0 — Urgent

### YOR-P0-01 — Stream proxy sebelumnya melakukan follow redirects + DNS check terpisah

- **Status:** PATCH_DRAFT / CODE_CONFIRMED.
- **Batas bukti:** Pada PR #158, `isPublicHost` hanya melakukan DNS check sebelum `fetch(..., redirect:'follow')`, berisiko redirect ke host tidak diizinkan/rebinding. PR #159 menambah exact allowlist, pinned TLS destination, reject redirects/IP literal dan byte limits, tetapi belum merged.
- **Rujukan:** [PR #158](https://github.com/rzqllh/Yoru/pull/158), [draft security #159](https://github.com/rzqllh/Yoru/pull/159).
- **DoD:** Security review terhadap redirect, DNS rebinding, IPv4/IPv6/mixed answers, TLS, Referer, segment-size, unauthorized hosts dan egress cost. Jangan aktifkan allowlist sebelum host/rights tervalidasi.

### YOR-P0-02 — Chromium Browser E2E gagal 5/87 pada PR #159

- **Status:** CI_REPRODUCED / CURRENT_BRANCH.
- **Batas bukti:** Exact SHA `ba3daa47`—82 passed, 5 failed: narrow player toolbar/settings; playback speed/subtitle offset persistence; subtitle Off persistence; next-episode auto-next; caption style persistence. Perlu membedakan klik yang tidak stabil dari bug fungsional nyata.
- **Rujukan:** [Browser E2E run 42320029272](https://github.com/rzqllh/Yoru/actions/runs/42320029272), [artifact](https://github.com/rzqllh/Yoru/actions/runs/42320029272/artifacts/13552397915).
- **DoD:** Repro masing-masing dengan trace, screenshot/video dan browser console; minimal targeted tests+fix. Jangan merger PR #159 sampai exact-head browser gates green.

### YOR-P0-03 — WebKit smoke gagal 2/6: detail episode & mobile bottom settings click

- **Status:** CI_REPRODUCED / CURRENT_BRANCH.
- **Batas bukti:** Exact SHA `ba3daa47`: WebKit desktop `episode-row` dan 390px mobile `Pengaturan` click timeout meski locator ada. 4 tests passed. Root cause belum dibuktikan; bisa viewport/reflow/overlay, fixture atau browser scheduling.
- **Rujukan:** [same run](https://github.com/rzqllh/Yoru/actions/runs/42320029272), [WebKit artifact](https://github.com/rzqllh/Yoru/actions/runs/42320029272/artifacts/13552851307).
- **DoD:** Triage layout hit targets/scroll/overlay/interaction lifecycle pada WebKit; physical iPhone perlu signoff tersendiri.

### YOR-P0-04 — SRC-R01: episode sintetis bukan bukti playable source

- **Status:** SOURCE_CANDIDATE / RECHECK.
- **Batas bukti:** Candidate `getUniversalEpisodes` pernah membuat episode berdasarkan metadata count atau fallback 12 untuk ongoing/null. Penggunaan `provider-episodes` di UI harus menjelaskan synthetic/unverified; jangan tampilkan Play bila provider tak bisa stream.
- **Rujukan:** `backend/providers/universal.ts`, `tests/universal-stream.test.mjs`, [PR #158](https://github.com/rzqllh/Yoru/pull/158).
- **DoD:** Pisahkan MAL metadata episode dari provider-verified playable episode; unknown count tidak memunculkan 12 playable items; no phantom resume/auto-next.

### YOR-P0-05 — SRC-R02/R03: kualitas 1080p BD dan mirror URL belum terverifikasi decoding

- **Status:** SOURCE_CANDIDATE / ACCEPTANCE_OPEN.
- **Batas bukti:** Test sebelumnya menilai URL/label untuk archive.org/1080p, bukan measured video quality, codec, CORS, ownership atau complete playback. Sumber live juga bisa time out.
- **Rujukan:** `backend/providers/universal.ts`, [release #20](https://github.com/rzqllh/Yoru/issues/20).
- **DoD:** Buat verified per-episode stream matrix: sampled decode/duration/resolution, redirects, byte range, codec, Safari, expiry, actual permissions. Jika gagal, unavailable bukan generated fallback.

### YOR-P0-06 — SRC-R04: subtitle asli vs placeholder, bahasa dan Arabic hardsub

- **Status:** SOURCE_CANDIDATE / ACCEPTANCE_OPEN.
- **Batas bukti:** Endpoint `/api/subtitles/vtt` memiliki generic VTT fallback `Episode N`; itu bukan terjemahan riil. Subtitle hardcoded pada video asing bisa menghalangi soft subtitle Bahasa Indonesia.
- **Rujukan:** `backend/api/app.ts`, `backend/providers/subtitles.ts`, [release #20](https://github.com/rzqllh/Yoru/issues/20).
- **DoD:** Jangan jadikan placeholder sebagai pilihan subtitled; verifikasi sub Indo/English per season, language detect hardsub dan user Off; missing means missing.

### YOR-P0-07 — SRC-R06: player subtitle clearance dan interaksi tidak boleh overlap controls

- **Status:** ACCEPTANCE_OPEN.
- **Batas bukti:** Owner planning sudah mencatat resiko subtitle overlay vs toolbar dan glass player. Browser failures sekarang memperkuat kebutuhan uji layout/interaction, bukan bukti semua viewport rusak.
- **Rujukan:** [PR #158](https://github.com/rzqllh/Yoru/pull/158), [browser failures](https://github.com/rzqllh/Yoru/actions/runs/42320029272).
- **DoD:** Trace tests caption/overlay at 320/375/390/430px and desktop, captions size/position/opacity, reduced motion; no duplicated settings, no covered tap targets.

### YOR-P0-08 — G1–G6 public release: actual source/media/subtitle/device/hosting/go-no-go

- **Status:** RELEASE_BLOCKED.
- **Batas bukti:** Release issue #20 masih open: G1 live native media, G2 strict availability, G3 subtitle contracts, G4 physical Safari, G5 public infra, G6 quantified final acceptance. Unit CI green tidak menutup satupun.
- **Rujukan:** [issue #20](https://github.com/rzqllh/Yoru/issues/20), [enterprise #3](https://github.com/rzqllh/Yoru/issues/3).
- **DoD:** Tetap NO-GO sampai masing-masing punya tested sample, permission, exact deploy SHA, physical device, no unresolved P0/P1 dan owner approval.

### YOR-P0-09 — Sumber video independent >=5 dan fallback embed/iframe belum disepakati dalam source contract

- **Status:** ACCEPTANCE_OPEN / DESIGN_DECISION.
- **Batas bukti:** Planning 4 Nov mengklasifikasi aggregator APIs, extractor, framework, reference implementations. Menghitung lima mirror dari upstream sama sebagai lima sumber independen adalah misleading.
- **Rujukan:** [planning master](../planning/MASTER_PLAN.md), [release #20](https://github.com/rzqllh/Yoru/issues/20).
- **DoD:** Definisikan independence & authorized playback, provider IDs, observed per-title coverage, supported format/browser and explicit iframe decision. Jangan memigrasi ke Workers hanya untuk mengejar count.

### YOR-P0-10 — Signed media grants, proxy leakage dan arbitrary upstream request masih memerlukan live negative testing

- **Status:** SECURITY / OPEN_GATE.
- **Batas bukti:** Proxy grant memakai HMAC 5 menit; allowlist draft sengaja OFF secara default. Network tests dengan redirect/private DNS, key URI, signed URL log exposure/abuse belum diterima live.
- **Rujukan:** `backend/api/proxy.ts` di [PR #159](https://github.com/rzqllh/Yoru/pull/159).
- **DoD:** Fuzz unauthorized targets/TTL/redirect, check TLS pin and memory/bytes; require opt-in authorized origin and token-safe request logging.

## P1 — High

### YOR-P1-01 — 5 menit HLS segment/key grant dapat expire saat playlist panjang

- **Status:** SOURCE_CANDIDATE / RECHECK.
- **Batas bukti:** `grantProxyStreamUrl` memakai TTL lima menit dan manifest rewriting menandatangani URI segments/keys. Long playback bisa meminta segmen terlambat, lalu 403; belum ada repro live.
- **Rujukan:** `backend/api/proxy.ts` pada [PR #159](https://github.com/rzqllh/Yoru/pull/159).
- **DoD:** Uji 15–60 menit VOD/live HLS, seek, manifest refresh/key rotation dan user reauthorization; jangan sekadar memperpanjang token tanpa threat model.

### YOR-P1-02 — HLS playlist rewrite tidak otomatis meliputi semua URI attributes/protocol variants

- **Status:** SOURCE_CANDIDATE / RECHECK.
- **Batas bukti:** Tag parsing candidate menangani sebuah `URI="..."` per tag; playlist advanced `EXT-X-MAP`, multi URI, key URI, LL-HLS/byterange/relative redirects mungkin memerlukan parser dan fixtures.
- **Rujukan:** `backend/api/proxy.ts` pada [PR #159](https://github.com/rzqllh/Yoru/pull/159).
- **DoD:** Playlist corpus regression + sample authorized HLS, abort/backpressure, range 206 and correct content length. Fail closed unsupported variants.

### YOR-P1-03 — Video season/cour/special/movie mapping tidak boleh diturunkan dari MAL count saja

- **Status:** ACCEPTANCE_OPEN.
- **Batas bukti:** Season 3 dan franchise continuation, OVA/ONA/specials dan title aliases berpotensi salah episode/source mapping; sebagian guard merged tetapi real mapping terpisah.
- **Rujukan:** [issue #44](https://github.com/rzqllh/Yoru/issues/44), [#20](https://github.com/rzqllh/Yoru/issues/20).
- **DoD:** Per-provider real season/cour matrix with source citations, trace title ID and edition, no silent cross-season fallback.

### YOR-P1-04 — Live subtitle API contracts: SubDL/SubSource/OpenSubtitles/Stremio

- **Status:** ACCEPTANCE_OPEN.
- **Batas bukti:** Signed download fixtures ada; real credentials, quotas, entitlements, language/episode correctness and downloads not comprehensively verified.
- **Rujukan:** [release #20](https://github.com/rzqllh/Yoru/issues/20), `backend/providers/subtitles.ts`.
- **DoD:** Backend-only credentials, real sample test, 429/401/expiry/retry, no key leak and subtitle Off persistence.

### YOR-P1-05 — Cloud sync opt-in PR #77: real OTP, two-account RLS dan two-device transfer

- **Status:** DRAFT / LIVE_BLOCKED.
- **Batas bukti:** Dedicated project and migrations pernah diperiksa, anonymous denial terbukti; zero real Auth users/snapshots saat audit issue #78. Tidak berarti cloud sync bug pada main sebab fitur tetap draft.
- **Rujukan:** [issue #78](https://github.com/rzqllh/Yoru/issues/78), [PR #77](https://github.com/rzqllh/Yoru/pull/77).
- **DoD:** Two real OTP identities + browsers, cross-account deny, share snapshot, conflict CAS, delete consent, corrupted import and secret-safe logs.

### YOR-P1-06 — Vercel deploy target dan public Hono API/SPA parity tidak terbukti pada SHA terbaru

- **Status:** RELEASE_BLOCKED.
- **Batas bukti:** Old production READY bukan candidate terbaru; historical HTTP 402/deploy protection dan health/discover mismatch. Tidak boleh mengklaim preview published.
- **Rujukan:** [release #20](https://github.com/rzqllh/Yoru/issues/20).
- **DoD:** Owner-authorized exact-SHA deployment and verify `/api/health`, catalog, asset fallback, CORS/CSP and rollback; avoid quota bypass/auto deploy.

### YOR-P1-07 — Physical iOS Safari player HLS/PiP/fullscreen/subtitle/PWA

- **Status:** ACCEPTANCE_OPEN.
- **Batas bukti:** Playwright WebKit CI (saat ini failed) tidak sama dengan physical iPhone; overlay/accessibility/codec/airplane resume perlu data nyata.
- **Rujukan:** [release #20](https://github.com/rzqllh/Yoru/issues/20), `tests/browser/webkit.spec.mjs`.
- **DoD:** Collect iOS version, device, exact SHA, signed media rights, rotated screen, native captions, PiP, service-worker updates.

### YOR-P1-08 — Provider error, expiry dan fallback harus tetap truthful

- **Status:** SOURCE_CANDIDATE / RECHECK.
- **Batas bukti:** Configured provider/list/mirror metadata is not playback proof; stale stream/local/Stremio/Miruro errors should not leave enabled CTA or infinite loading.
- **Rujukan:** `backend/providers/`, [issue #44](https://github.com/rzqllh/Yoru/issues/44).
- **DoD:** Inject 429/503 malformed/timeout/expired URL and all-fail state; honest error/retry and no fabricated proxy HLS.

### YOR-P1-09 — Torrentio/Stremio URL vs infoHash vs externalUrl tidak saling substitutable

- **Status:** OPEN_DECISION.
- **Batas bukti:** Torrent `infoHash/fileIdx` tidak otomatis playable melalui Safari/Vite Hono; legal/consent/bandwidth implications significant.
- **Rujukan:** [epic #44](https://github.com/rzqllh/Yoru/issues/44).
- **DoD:** Classify stream kind; optional opt-in only after owner approves architecture, rights and real browser-backed resolver. No auto torrent.

### YOR-P1-10 — HERO-D01..D06: peringkat daily/seasonal dan original data provenance

- **Status:** DRAFT / RECHECK.
- **Batas bukti:** Planning menuntut AniList daily trending yang benar, MAL all-time tidak disamakan daily, JST/UTC tepat, Top 10 bukan data fabricated, dedup, refresh dan fallback terpisah. Belum semuanya independently verified pada candidate.
- **Rujukan:** `backend/pipeline/daily-trends.ts`, [planning tracking](../planning/TRACKING.md), [PR #158](https://github.com/rzqllh/Yoru/pull/158).
- **DoD:** Data provenance snapshots across JST boundary, list source attribution, cache TTL, no fake ranking and exact count.

### YOR-P1-11 — Browser native player source selection memory dan continuation states

- **Status:** ACCEPTANCE_OPEN.
- **Batas bukti:** Source identity seharusnya disimpan tanpa media URL/key; verified source remembered, resume/auto-next only to actual available episode. Lima Chromium E2E gagal pada candidate terbaru.
- **Rujukan:** [browser run](https://github.com/rzqllh/Yoru/actions/runs/42320029272), `frontend/src/`.
- **DoD:** Regress per-anime source, wrong episode, resume progress/offline, keyboard focus and next; verify real long-duration streams.

### YOR-P1-12 — Per-stream host allowlist dapat memutus provider valid sebelum konfigurasi

- **Status:** SECURITY / ACCEPTANCE_OPEN.
- **Batas bukti:** PR #159 sengaja fail-closed jika `STREAM_PROXY_ALLOWED_HOSTS` kosong dan blok IP literals/IPv6-only targets; bukan bukti provider kompatibel atau intent menghapus semua playback.
- **Rujukan:** [draft PR #159](https://github.com/rzqllh/Yoru/pull/159), `configs/.env.example` candidate.
- **DoD:** Per-provider authorization/host header matrix, include subdomains only by explicit approval, safe rollout, IPv6-only support if needed with verified pinning.

### YOR-P1-13 — Exact-head CI hijau belum cukup karena browser suite merah

- **Status:** QUALITY / CI_BLOCKED.
- **Batas bukti:** [CI 42320029286](https://github.com/rzqllh/Yoru/actions/runs/42320029286) success pada head `ba3daa47`, namun [browser 42320029272](https://github.com/rzqllh/Yoru/actions/runs/42320029272) failure. Dua hasil tidak boleh dirata-ratakan.
- **Rujukan:** [PR #159](https://github.com/rzqllh/Yoru/pull/159).
- **DoD:** Require all mandated CI/Chromium/WebKit jobs green on final head and no unrelated flake dismissal without trace.

### YOR-P1-14 — Rights/source permission dan content/asset licensing belum signoff

- **Status:** ACCEPTANCE_OPEN.
- **Batas bukti:** Metadata source public ≠ authorization embed/proxy/transcode/rebroadcast. Argon style claims (95% tied to IP) tidak berdasar dan tidak boleh masuk acceptance.
- **Rujukan:** [release #20](https://github.com/rzqllh/Yoru/issues/20), [security epic #44](https://github.com/rzqllh/Yoru/issues/44).
- **DoD:** Human legal/product review for each selected provider and user-visible limitations, backend secrets only.

## P2 — Medium

### YOR-P2-01 — YX-01/YX-06: source-memory, one-tap resume dan reliable next-in-franchise

- **Status:** REFINEMENT / PARTIALLY_IMPLEMENTED.
- **Batas bukti:** Existing UI has local-first progress and source memory; refine error/empty state, don't reimplement merged behavior or claim full real-provider coverage.
- **Rujukan:** [epic #44](https://github.com/rzqllh/Yoru/issues/44), [PR #158](https://github.com/rzqllh/Yoru/pull/158).
- **DoD:** Behavior-driven tests per stream freshness, rejected source and visited-only progress.

### YOR-P2-02 — YX-03/YX-04: quality Auto and complete caption styling

- **Status:** REFINEMENT / PARTIALLY_IMPLEMENTED.
- **Batas bukti:** Quality UI must show measured supported manifest levels, not regex label. Subtitle font/size/position/opacity/outline presets need native renderer feasibility checks.
- **Rujukan:** [epic #44](https://github.com/rzqllh/Yoru/issues/44), [browser failures](https://github.com/rzqllh/Yoru/actions/runs/42320029272).
- **DoD:** Audit accessibility, read persistence and cross-browser overlay safety without assuming all controls can work on native iOS.

### YOR-P2-03 — YX-07–YX-10: edition-aware Watch Guide, branching and backup progress

- **Status:** REFINEMENT / PARTIALLY_IMPLEMENTED.
- **Batas bukti:** Curated guides were implemented incrementally; edge-case branch/canon uncertainty, optional specials, edition overlap and imported progress need evidence.
- **Rujukan:** [epic #44](https://github.com/rzqllh/Yoru/issues/44), `frontend/src/lib/`.
- **DoD:** Review real anime franchise fixtures, spoiler-safe ordering, no invented canon, backup v1 compatibility.

### YOR-P2-04 — YX-11/YX-12: smart search/aliases, filters URL sync dan honest totals

- **Status:** REFINEMENT / PARTIALLY_IMPLEMENTED.
- **Batas bukti:** Feature exists in parts; user count of loaded cards must not be presented as global verified total; URL invalid combinations recover.
- **Rujukan:** [epic #44](https://github.com/rzqllh/Yoru/issues/44), `tests/browser/yoru.spec.mjs`.
- **DoD:** Test 0/result partial/fetch failures, Back/Forward filter chips, aliases and taxonomy provenance.

### YOR-P2-05 — YX-13/YX-14: personalized homepage, library sort/history, trailer/deep links

- **Status:** REFINEMENT / PARTIALLY_IMPLEMENTED.
- **Batas bukti:** Local-first library and navigation behavior has substantial existing tests; refine from screenshots/actual UX rather than duplicating architecture.
- **Rujukan:** [epic #44](https://github.com/rzqllh/Yoru/issues/44), `frontend/src/`.
- **DoD:** Audit content density, deep-link invalid ID, resume CTA, duplicate title/episode and link safety.

### YOR-P2-06 — YX-15: consistent shared design tokens, mobile density, motion and WCAG AA

- **Status:** REFINEMENT / PARTIALLY_IMPLEMENTED.
- **Batas bukti:** CSS/design system already exists; work should be screenshot/keyboard-based not speculative glass redesign.
- **Rujukan:** [epic #44](https://github.com/rzqllh/Yoru/issues/44), `frontend/src/styles.css`.
- **DoD:** Audit 320/360/390/430/iPad, focus outlines, roles, text overflow, reduced motion and contrast.

### YOR-P2-07 — YX-16: poster loading/reserved ratio, images and measured Web Vitals

- **Status:** REFINEMENT / PARTIALLY_IMPLEMENTED.
- **Batas bukti:** Poster lazy/decoding and failed placeholders have browser tests passing on candidate. That does not establish production image uptime or measured LCP/CLS.
- **Rujukan:** `tests/browser/webkit.spec.mjs`, [browser run](https://github.com/rzqllh/Yoru/actions/runs/42320029272).
- **DoD:** Measure real thumbnails, cache policy and offline fallback without replacing working image placeholders.

### YOR-P2-08 — YX-17 first-run, backup, restore and privacy understanding

- **Status:** ACCEPTANCE_OPEN.
- **Batas bukti:** IndexedDB/PWA/backup tests exist but real corruption/import/forced-close and reader explanation are separate gates.
- **Rujukan:** [epic #44](https://github.com/rzqllh/Yoru/issues/44), [cloud #78](https://github.com/rzqllh/Yoru/issues/78).
- **DoD:** Two-browser local-only restore, invalid legacy backups, consent/deletion, privacy no provider URLs.

### YOR-P2-09 — HERO-D05/D06: cache expiry/dedupe, resilience and 10-second carousel interval

- **Status:** PARTIAL / AUDIT_GAP.
- **Batas bukti:** Old planning distinguishes ranking API refresh from carousel interval; not all data design details are checked against candidate UI.
- **Rujukan:** `backend/pipeline/daily-trends.ts`, [PR #158](https://github.com/rzqllh/Yoru/pull/158).
- **DoD:** Boundary and clock fixtures; avoid duplicated title, misleading time/source, battery-heavy polling.

### YOR-P2-10 — External source/provider API statuses / rate limits need real thresholds

- **Status:** ACCEPTANCE_OPEN.
- **Batas bukti:** Configured status endpoint != readiness; process-local rate limit not global quota; retries and public Hono abuse/observability remain live gaps.
- **Rujukan:** [issue #20](https://github.com/rzqllh/Yoru/issues/20), `backend/api/app.ts`.
- **DoD:** Configured backend-only secrets, 429, disconnected provider, concurrent requests, response schema and trace IDs.

### YOR-P2-11 — Cloud sync manual-vs-auto semantics, user consent and delete rights

- **Status:** DRAFT / PARTIAL.
- **Batas bukti:** Owner wanted optional cross-device, not local-only; syncing automatically would introduce tombstone/device identity contract not automatically authorized.
- **Rujukan:** [issue #78](https://github.com/rzqllh/Yoru/issues/78).
- **DoD:** Set explicit manual snapshot scope; decide auto as separate product approval and conflict policy.

### YOR-P2-12 — Unused branch cleanup prepared but not demonstrated complete

- **Status:** MAINTENANCE_OPEN.
- **Batas bukti:** Issue #95 says archive+checksum, retention 90d, expected-SHA leases and protected/open-PR exclusion before deletion. Older notes conflict; follow newer explicit owner instruction with safety gates.
- **Rujukan:** [issue #95](https://github.com/rzqllh/Yoru/issues/95).
- **DoD:** Archive verified before any deletion, re-enumerate active PR branches, approval and rollback; no destructive cleanup from this docs PR.

### YOR-P2-13 — Native player on Safari support matrix (PiP, VTT, autoplay, fullscreen)

- **Status:** RELEASE_GATE.
- **Batas bukti:** Different browser feature support can make controls visually present but unusable; no physical proof.
- **Rujukan:** [release #20](https://github.com/rzqllh/Yoru/issues/20), `tests/browser/`.
- **DoD:** Capability-detect and gray out unsupported controls; record actual iPhone behavior.

## P3 — Light

### YOR-P3-01 — Source taxonomy: aggregation API/extractor/framework/reference bukan semuanya provider

- **Status:** PROPOSED_REFINEMENT.
- **Batas bukti:** Planning 4 Nov menyebut lima kategori; count source candidates independen harus transparan.
- **Rujukan:** [planning](../planning/MASTER_PLAN.md).
- **DoD:** Tag provider evidence class, permissions and real health; hide synthetic totals.

### YOR-P3-02 — Copy dan status badges Play-ready vs candidate/unknown/unavailable

- **Status:** PROPOSED_REFINEMENT.
- **Batas bukti:** Avoid misleading 1080p, subtitle language, Top 10, provider IDs. Empty state must permit graceful retry.
- **Rujukan:** [epic #44](https://github.com/rzqllh/Yoru/issues/44).
- **DoD:** UX copy audit with real screenshots and accessibility labels.

### YOR-P3-03 — Document exact version of hosted deployment vs tested source

- **Status:** PROPOSED_REFINEMENT.
- **Batas bukti:** Old READY alias should not be shown as latest app behavior without immutable SHA.
- **Rujukan:** [release #20](https://github.com/rzqllh/Yoru/issues/20).
- **DoD:** Keep README/current-state evidence ledger updated after real deployment only.

### YOR-P3-04 — Regulate visual QA screenshots and artifacts retention

- **Status:** PROPOSED_REFINEMENT.
- **Batas bukti:** Browser workflows upload traces/artifacts 14 days, not permanent acceptance evidence.
- **Rujukan:** [Browser run](https://github.com/rzqllh/Yoru/actions/runs/42320029272).
- **DoD:** Store sanitized durable summary + link to exact SHA, avoid exposing provider URLs/tokens.

### YOR-P3-05 — Performance battery/idle fetch/animation budget

- **Status:** PROPOSED_REFINEMENT.
- **Batas bukti:** 10s carousel/metadata refresh should not become background network polling; reduced-motion and visibility gates important.
- **Rujukan:** `frontend/src/`, `backend/pipeline/daily-trends.ts`.
- **DoD:** Use RUM when consented; test visibility change, battery low, data saver, no fabricated performance claims.

### YOR-P3-06 — Keep route naming, episode labels and subtitle toggles localized and accessible

- **Status:** PROPOSED_REFINEMENT.
- **Batas bukti:** Mixed Bahasa Indonesia/English labels and deep-link fallbacks should not hide usability defects.
- **Rujukan:** `frontend/src/`, [epic #44](https://github.com/rzqllh/Yoru/issues/44).
- **DoD:** Audit screenreader/keyboard, live region, RTL caption case and consistent source names.

### YOR-P3-07 — Documentation tracks approved decisions vs 4 Nov DRAFT separately

- **Status:** PROPOSED_REFINEMENT.
- **Batas bukti:** A planning document or AI-generated approval is not permission to migrate infra, enable stream provider or choose Torrentio resolver.
- **Rujukan:** [planning](../planning/TRACKING.md), [epic #44](https://github.com/rzqllh/Yoru/issues/44).
- **DoD:** Use Decision/PROPOSED/VERIFIED markers per source and acceptance, keep older plans as historical.

## Release / governance checklist

- **G1:** authorized real source inventory and playable HLS/MP4 coverage; **G2:** strict episode/season/source availability; **G3:** real subtitle language/API signoff; **G4:** physical Safari/PWA; **G5:** source-compatible public hosting, abuse controls, rollback; **G6:** final acceptance and owner GO.
- **Never conflate:** metadata ≠ playable video; label ≠ measured resolution; WebKit CI ≠ real iPhone; draft provider ≠ configured independent source; RLS schema ≠ two real-account authorization; CI green ≠ Browser E2E green.
- Maintain one source of truth [release #20](https://github.com/rzqllh/Yoru/issues/20), [epic #44](https://github.com/rzqllh/Yoru/issues/44), [cloud #78](https://github.com/rzqllh/Yoru/issues/78); avoid duplicate implementations and all automatic production enablement.

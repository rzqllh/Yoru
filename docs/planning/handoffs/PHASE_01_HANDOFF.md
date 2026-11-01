# PHASE 01 — Source Eligibility, Watch Continuity and Torrentio

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** PARTIAL EXISTING CODE; NEW D02 BEHAVIOUR NOT IMPLEMENTED. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Source Eligibility, Watch Continuity and Torrentio. Dependencies: 00; optional torrent engine has separate explicit authorization. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Classify every stream candidate as native direct HTTPS HLS/MP4, torrent `infoHash/fileIdx`, external link, unsupported, unverified embed, and verified controllable alternate.
- Apply D02: an iframe with unproven subtitle-control ability cannot be a playable choice; provide truthful no-source state without silent fallback.
- Preserve checked episode identity, exact season/cour/movie/special mapping, stale-request cancellation, source memory, safe retry and precise resume.
- Do not infer quality resolution from bitrate labels; only genuine HLS levels count as selectable renditions.
- Evaluate Torrentio-compatible addon discovery and `url` vs `infoHash` vs `externalUrl`. A torrent-only response needs an owner-approved opt-in resolver/engine. This phase can draft a proposal but not install or activate one.
- Produce a representative authorized source matrix including iOS Safari, codec, CORS, source expiry and subtitles, without inventing availability.

## Existing implementation and evidence at snapshot

- `backend/providers/stremio.ts` reads explicit configured Stremio addons and handles stream/subtitles resources with pinned DNS/size/time bounds.
- `stremio-core.ts` parses approved HTTPS `.m3u8`/`.mp4`; torrent hashes are classified as unavailable with reason. This is source discovery, not playback.
- Existing native preflight and source-memory code present; PR #97 fixed quality-label parsing in main. Legacy AnimeEmbed fallback remains in App/Player and conflicts with new D02.
- Automated PR #97 tests documented at https://github.com/rzqllh/Yoru/actions/runs/41218153012 and https://github.com/rzqllh/Yoru/actions/runs/41218152990, not live streaming evidence.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

AC-SRC-01..09, #20 R-G1/R-G2 when live sample exists.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** Removing uncontrolled iframe reduces apparent playability; a Torrentio torrent hash is not Safari-playable HTTP media; arbitrary resolver/proxy creates security, rights and hosting risks.
- **Approval needed:** Owner MUST approve any new resolver/engine, hosting/third-party service, token model, legal content-use strategy and related dependencies before implementation.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Create isolated source-eligibility PR implementing D02 and tests with no resolver.
2. Design proposal comparing browser capabilities, server-side resolver, optional external resolver and no-resolver baseline; request owner decision.
3. Verify real authorized representative media before calling any source Play-ready.

## Primary files and references

backend/providers/stremio-core.ts, backend/providers/stremio.ts, backend/providers/public-embed.ts, backend/api/app.ts, frontend/src/App.tsx, frontend/src/components/Player.tsx, tests/stremio-contract.test.mjs, tests/source-readiness.test.mjs

## Actual changes / PR / test log

| Field | Current entry |
| --- | --- |
| Phase implementation PR | NOT CREATED for this phase |
| Modified app files | NONE as part of this planning task |
| Implemented SHA | NOT APPLICABLE; baseline only |
| New phase CI / browser tests | NOT RUN |
| Live provider / device verification | NOT RUN in this planning task |
| Phase sign-off | PENDING |
| Next handoff update | On first actual implementation PR or new verified blocker |

**Update protocol:** append dated checkpoint below after each real phase slice. Include PR, diff paths, exact SHA, test URLs, blockers resolved/new, any owner decisions, and follow-up instructions. Do not rewrite an incomplete checkpoint as DONE.

## Checkpoint history

- **2026-10-31 — BASELINE / PLANNING:** handoff initialized from repository, epic/gate and user-approved UX/CX decisions. No code, cloud, production configuration or release change in this handoff.

- **2026-10-31 — PHASE 01 SLICE D02 CODED / NOT TESTED:** engineering branch `fix/y01-uncontrolled-embed-gate-20261031` from documentation-integrated main `ab5f1723267570cecc63ea765332dccabc6c9a76`. App source picker no longer manufactures an AnimeEmbed fallback when no native source exists or native preflight fails. `checkAndWatch` rejects unexpected `format:'embed'` calls; provider result summarizer drops unverified iframe entries while preserving native and disabled Torrentio metadata. Visible empty state says no controllable source; no claims of real media or subtitles. **Code SHA:** `bf79c92cef6f8e799370c5f7156542edd617ff34`. **Test SHA:** `36d34d0cdedea0b10560cc0b1b920cfe557fe606`. Files: `frontend/src/App.tsx`, `frontend/src/lib/source-lifecycle.ts`, `tests/source-lifecycle.test.mjs`, `tests/browser/yoru.spec.mjs`, `tests/browser/webkit.spec.mjs`, `tests/browser/animeembed-player.spec.mjs`. Previously embed-positive browser test cases have been changed to negative/fail-closed assertions. **Verification:** GitHub CI/Browser E2E pending; physical iPhone/live provider NOT RUN. **Still open:** explicit subtitle-control capability handshake for any future alternative source, fully retire exposed backend `public-embed` diagnostic route after compatibility review, no Torrentio resolver/engine approved or added, G1/G2 release gate blocked. **Next:** get exact-head CI results, fix regressions if any, update this handoff and tracking with immutable URLs before merge. Do not deploy production.
- **2026-10-31 — STATIC REVIEW FOLLOW-UP:** after opening [PR #100](https://github.com/rzqllh/Yoru/pull/100), adjusted two browser assertions to use the first matching status message because both source feedback and empty-state copy can contain the D02 explanation. This prevents Playwright strict-locator ambiguity. Earlier PR-head checks are superseded by this new commit; **repeat exact-head checks before merge**. No application source changes in this follow-up.

- **2026-10-31 — EXACT CODE/TEST HEAD CHECKED:** [PR #100](https://github.com/rzqllh/Yoru/pull/100) head `a91e7eca36ebdd9de2203041b222c76b78e437e2`: [Linux/Windows CI SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41220260198) (jobs `validate`, `Windows / Node 22 / production smoke`) and [Browser E2E SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41220260118) (Chromium, WebKit). **AC-SRC-06 fixture/browser deterministic tests PASS for this SHA**; no live provider, actual iPhone or torrent resolver sign-off. A later documentation-only update changes head SHA and requires a fresh exact-head CI check before merge. Source gate D02 is coded and tested, **not yet merged/production-deployed**. Remaining Phase 01 SRC-01–09 and #20 G1/G2 remain partial/blocked.

- **2026-10-31 — D02 MERGED:** [PR #100](https://github.com/rzqllh/Yoru/pull/100) successfully merged to `main` [`f021a85658895123cbc17e02e0ba55d43cf11d7f`](https://github.com/rzqllh/Yoru/commit/f021a85658895123cbc17e02e0ba55d43cf11d7f). PR final head `6e3af5572d2c21b274ead47391f5783fa7f73e5b` passed [CI Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41220492467) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41220492441). Exact merge-commit checks [CI](https://github.com/rzqllh/Yoru/actions/runs/41220660439) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41220660473) were running when this checkpoint was written; verify before claiming merged-main PASS. PR #99 provider-validation changes merged independently immediately before #100; no file conflict. Production not deployed, #20 remains BLOCKED. Next: Phase 02 D01 explicit English consent and no silent fallback; Phase 01 full source coverage remains incomplete.

- **2026-10-31 — MERGED MAIN VALIDATED:** on exact merge commit `f021a85658895123cbc17e02e0ba55d43cf11d7f`, [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41220660439) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41220660473) completed SUCCESS (four checks). Phase 01 D02 slice accepted at merged-code level. **Phase 01 overall remains PARTIAL**, because real provider, Torrentio resolver architecture and G1/G2 device/media gates remain pending. No production deployment.

## 2026-11-01 vNext supersession — documentation scope

**2026-11-01 vNext owner supersession.** Inspected GitHub main [`ce12d98`](https://github.com/rzqllh/Yoru/commit/ce12d98678f6e89cefd81516fb641c62df972572); this is **DOCS ONLY**, not hosted/provider verification. D03=**3A AniList-primary** replaces archival D03=3B Tenrai/MAL-primary. D01=1A, D02=2B, D04=4A, D05=5A, D06–D09 retained. Existing Tenrai/MAL code remains until an approved reversible migration.

- Audit existing configured Stremio manifest `stream` path and Torrentio-like `url` / torrent `infoHash/fileIdx` / `externalUrl` classification. Only verified native HTTPS video may be Play-ready. Do not install resolver; D02 forbids uncontrolled iframe Play.
- **Acceptance:** [AC-VN-01–16](../ACCEPTANCE_MATRIX.md) as relevant; exact SHA, browser/device, actual provider sample and result must be recorded. Previous tests are historical; no new PASS claims, live provider configuration, code changes, resolver activation or release from this documentation merge.

## 2026-11-01 — Stremio stream-track language compatibility (#128)

- **MERGED code:** [PR #128](https://github.com/rzqllh/Yoru/pull/128) → main `659265fd42f823292b37bfe2e4e47641d274d772`. Embedded Stremio stream subtitles now normalize strict ISO `ind`/`eng` and regional `id-ID`/`en-US` aliases to Yoru native player language `id`/`en`. Other native-language tracks retain their identity without pretending to be Indonesian/English.
- Exact PR code head `454f90f4577b2b11a28033fd61f0a83f507f5c93`: [CI](https://github.com/rzqllh/Yoru/actions/runs/41267363857) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41267363890) SUCCESS. The PR tests are deterministic fixtures; actual addon manifest, real media, physical Safari, source/resolver and public streaming release remain unverified. No addon config, network host, resolver or deployment change.

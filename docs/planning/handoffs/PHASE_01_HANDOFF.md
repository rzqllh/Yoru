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

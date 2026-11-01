# PHASE 08 — Integrated QA, Security, Performance and Devices

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** PRIOR CI GREEN; NEW CONTRACT AND PHYSICAL DEVICE TESTS NOT RUN. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Integrated QA, Security, Performance and Devices. Dependencies: 01–07 approved implementation slices. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Run combined lint/typecheck/unit/build and exact-commit Linux/Windows and Chromium/WebKit.
- Exercise entire flow Home -> Browse -> Detail -> Guide -> Player -> Library and offline/backup/error paths.
- Test accessibility keyboard/focus/contrast, 320/375/390/768/1440, zoom/safe-area and reduced motion.
- Measure real hosted Core Web Vitals and runtime failures rather than declare unmeasured target PASS.
- Perform physical iPhone Safari/PWA installation, HLS/VTT, fullscreen/PiP, landscape and upgrade regression.
- Review SSRF/CSP/CORS, external-source rights, subtitle rate/secret controls and authenticated cloud isolation if enabled.

## Existing implementation and evidence at snapshot

- CI Linux/Windows and Browser E2E workflows exist; exact main `2b6c1d4` reported success via PR #97.
- Automated WebKit is not a physical iPhone. User screenshots demonstrate UX concerns but are not device-playback acceptance results.
- Security guards exist but release-level ingress observability and distributed abuse control remain to be verified.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

AC-DEVICE-01..03, AC-SEC-01..02, AC-UX-01..03, all phase-specific tests on exact release candidate.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** False green from fixtures, wrong production SHA, nonrepresentative devices, upstream and paid quota limits.
- **Approval needed:** Owner or authorized tester for physical iPhone and allowed live provider sample; no external action on private accounts without consent.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Freeze candidate SHA and execute all matrix cases with pass/fail evidence.
2. Record real device and performance artifacts, including limitations.
3. Return P0/P1 failures to responsible phase before release gate.

## Primary files and references

.github/workflows/ci.yml, .github/workflows/browser-e2e.yml, tests/browser/*, scripts/verify-hosted-catalog.mjs, docs/public/quality-gates.md

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

## 2026-11-01 vNext supersession — documentation scope

**2026-11-01 vNext owner supersession.** Inspected GitHub main [`ce12d98`](https://github.com/rzqllh/Yoru/commit/ce12d98678f6e89cefd81516fb641c62df972572); this is **DOCS ONLY**, not hosted/provider verification. D03=**3A AniList-primary** replaces archival D03=3B Tenrai/MAL-primary. D01=1A, D02=2B, D04=4A, D05=5A, D06–D09 retained. Existing Tenrai/MAL code remains until an approved reversible migration.

- Run AC-VN-01–16 exact-SHA unit/browser/live and real iPhone Safari where applicable. Separate addon stream/subtitle, direct subtitle API, 429, wrong-season, unsupported torrent, source security, AniList ToU and backup regression evidence.
- **Acceptance:** [AC-VN-01–16](../ACCEPTANCE_MATRIX.md) as relevant; exact SHA, browser/device, actual provider sample and result must be recorded. Previous tests are historical; no new PASS claims, live provider configuration, code changes, resolver activation or release from this documentation merge.

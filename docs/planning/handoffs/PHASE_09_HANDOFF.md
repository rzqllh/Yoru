# PHASE 09 — Hosting, Live Sign-off, Operations and Public Release

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** PRODUCTION READY OLD SHA; #20 RELEASE BLOCKED. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Hosting, Live Sign-off, Operations and Public Release. Dependencies: 08 and mandatory #20 G1–G6. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Verify Vercel actual current production alias, deployment SHA, linked frontend+Hono API and both `/api/health` and `/api/anime/discover` with sanitized logs.
- Investigate ignored build step/quota 402 only through official options; no stealth bypass, upgrade or auto-deploy change without approval.
- Prove actual independently authorized native video samples, strict episode mapping, correct Indonesian/English subtitle search and downloads, Safari/PWA device compatibility.
- Require public ingress security, secrets, rate limiting, CSP/CORS, observability, rollback and incident response.
- Recheck exact release SHA CI, #20 G1–G6, zero unresolved P0/P1 and owner explicit release GO.
- Update README, docs/public and DESIGN.md to reflect ONLY implemented/tested/live-verified capabilities.

## Existing implementation and evidence at snapshot

- `vercel.json` currently contains `git.deploymentEnabled:false`; main merge is not a production deployment.
- Vercel deployment listing showed READY production `dpl_514E91c6XQkRCvF2wS5YumdgvgrU` on `5496aae`; current inspected main is newer `2b6c1d4`. Health/catalog response for that deployment not re-proven here.
- Previous attempts encountered `Ignored Build Step exit 0` cancellation and rate-limit history; these are historical events, not current proof of quota/blockage.
- [Issue #20](https://github.com/rzqllh/Yoru/issues/20) remains OPEN/BLOCKED despite code and CI accomplishments.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

AC-REL-01..06; release cannot be GO until actual live, physical, operational and owner evidence.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** Using old production SHA for current feature claims, real source false positives, uncontrolled iframe exclusion reducing coverage, host quota and lack of backup/rollback.
- **Approval needed:** Any production configuration change/deploy, payment, secret setup, hosting change and final public release require owner authorization.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Run sanctioned full-stack hosted health/catalog and inspect actual production SHA and logs.
2. Resolve live media/subtitle/iOS hosting gates with documented matrix results.
3. Prepare release notes and rollback; obtain explicit owner GO/NO-GO.

## Primary files and references

vercel.json, api/index.ts, docs/public/production-readiness.md, docs/public/operations.md, docs/public/releases.md, issue #20

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

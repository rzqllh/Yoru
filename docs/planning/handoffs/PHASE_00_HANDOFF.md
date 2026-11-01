# PHASE 00 — Baseline, Governance and Decisions

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** PLANNING BASELINE DOCUMENTED; PHASE EXIT NOT YET SIGNED. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Baseline, Governance and Decisions. Dependencies: None. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Recheck `main`, active PRs, CI, #44, #20, #78, #95, hosting and provider config before every new implementation batch.
- Record D01–D09 as locked product decisions without treating them as merged implementation.
- Record canonical MAL ID, source state definitions, browser/iframe boundary, trust rules and approval gates.
- Distinguish temporary `docs/handsoff/` (excluded from main) from owner-requested persistent `docs/planning/handoffs/`.
- Make the matrix/tracker trustworthy: one evidence link, environment and SHA per success claim.

## Existing implementation and evidence at snapshot

- Inspected repository tree at `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`, including providers, browse, player, router, docs and CI references.
- Observed only draft PR #77 is open in sampled PR inventory; #97 is merged. Snapshot is date-scoped.
- Existing full-stack preview, metadata, source classification, local data and automated tests are implemented in varying degrees.
- PR #97 reports exact merged-main CI/E2E SUCCESS; no new test executed by this documentation work.
- Vercel production deployment `dpl_514E91c6XQkRCvF2wS5YumdgvgrU` reported READY for older `5496aae`; actual health/catalog and release status still unverified.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

GOV-01, BASE-01; require owner review of scope, accurate current SHA, no secrets, no false release GO.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** Snapshot can stale; source-of-truth issue #44 contains older lines, so prefer dated latest commit/runtime over historical prose.
- **Approval needed:** Review docs PR and any new architecture/security/deployment proposal; this docs change does not authorize production.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Review four core planning files and sign off D01–D09 as baseline.
2. Compare each tracker status to actual code and PR evidence before coding.
3. Start Phase 01 as isolated implementation PR with explicit source eligibility tests.

## Primary files and references

README.md, DESIGN.md, docs/public/*, frontend/src, backend, api/index.ts, vercel.json, .github/workflows/*

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

- **2026-10-31 — VERIFIED DOCUMENTATION INTEGRATION:** [PR #98](https://github.com/rzqllh/Yoru/pull/98) merged to main at [`ab5f1723267570cecc63ea765332dccabc6c9a76`](https://github.com/rzqllh/Yoru/commit/ab5f1723267570cecc63ea765332dccabc6c9a76). Exact PR head `e89c8878a2fb982710c6d04f1e09ab406c5ff493` [CI](https://github.com/rzqllh/Yoru/actions/runs/41219416064) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41219416053) completed SUCCESS. 14 planning Markdown files added, no application changes. The recorded CI runs validate the PR head, not the merged commit. Baseline planning is now persisted on main. This is **Phase 00 documentation integrated**, not certification of all release/architecture checks. Next: Phase 01 D02 source-choice gating in isolated branch `fix/y01-uncontrolled-embed-gate-20261031`; #20 remains BLOCKED.

## 2026-11-01 vNext supersession — documentation scope

**2026-11-01 vNext owner supersession.** Inspected GitHub main [`ce12d98`](https://github.com/rzqllh/Yoru/commit/ce12d98678f6e89cefd81516fb641c62df972572); this is **DOCS ONLY**, not hosted/provider verification. D03=**3A AniList-primary** replaces archival D03=3B Tenrai/MAL-primary. D01=1A, D02=2B, D04=4A, D05=5A, D06–D09 retained. Existing Tenrai/MAL code remains until an approved reversible migration.

- Record D03=3A supersession; AniList ToU/30 req/min degraded rate-limit review, ID migration/rollback authority, and separate resolver approval before any implementation.
- **Acceptance:** [AC-VN-01–16](../ACCEPTANCE_MATRIX.md) as relevant; exact SHA, browser/device, actual provider sample and result must be recorded. Previous tests are historical; no new PASS claims, live provider configuration, code changes, resolver activation or release from this documentation merge.

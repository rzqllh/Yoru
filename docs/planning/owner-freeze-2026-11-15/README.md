# Yoru — Owner Decision Freeze v1 (15 November 2026)

> **Status: DRAFT / OWNER REVIEW — documentation only.** This folder records the owner's 71 numbered decision slots (P66 resolved by RG05), ten re-grill decisions and unresolved engineering/access/security issues. **No decision in this folder is permission to deploy, use production credentials, modify user records, enable providers, bypass provider access controls, or release publicly.**

## Owner topology amendment L01 — 2026-11-15 (latest)

**Only one remotely hosted environment: PRODUCTION.** Preview/testing is **LOCAL ONLY**, on the developer's machine (local dev server / local production build). No separate hosted Vercel preview, staging deployment, or remote preview website is requested. Local preview is **not** a second deployment environment.

This latest owner decision supersedes previously proposed **hosted preview** arrangements in P29, P40, P42, P51, P61, P71, RG03 and RG06 to the extent they concerned preview's topology, production-secret sharing, database access and branch restrictions. Historical selections remain in the register. **It does not grant a local process permission to read/write the production DB or use production credentials.** Unless separately authorized, local checks use local/test data and secrets. Access to real production data remains a separately gated/undecided security action. Production release/deployment and rollback still require explicit owner approval (P29/P50).

See [Decision Register](DECISION_REGISTER.md), [Product Contract](PRODUCT_CONTRACT.md), [Open Conflicts](OPEN_CONFLICTS.md), and [Acceptance Matrix](ACCEPTANCE_MATRIX_V1.md).

## Read in this order

1. [DECISION_REGISTER.md](DECISION_REGISTER.md) — complete P01–P71 and RG01–RG10 selections, precedence and supersession.
2. [PRODUCT_CONTRACT.md](PRODUCT_CONTRACT.md) — PRD and target behavior by user journey.
3. [OPEN_CONFLICTS.md](OPEN_CONFLICTS.md) — unresolved conflicts, owner intent, technical blockers, proposed safe boundaries.
4. [CODE_ALIGNMENT_AUDIT.md](CODE_ALIGNMENT_AUDIT.md) — read-only source-level audit against current main; code paths, evidence and corrective backlog.
5. [UPSTREAM_REGISTRY.md](UPSTREAM_REGISTRY.md) — source inventory and permission/technical status, including FlyStream **reference-only**.
6. [EXECUTION_PLAN.md](EXECUTION_PLAN.md) — P0/P1/P2, dependencies, planned change sequence; not authorization.
7. [ACCEPTANCE_MATRIX_V1.md](ACCEPTANCE_MATRIX_V1.md) — tests, measurable evidence, and public release rules.

## Scope and baseline

- GitHub repository: https://github.com/rzqllh/Yoru
- Read-only inspected main SHA: `b2fd85a23f9f41003ef328a8a9b9220fd2f68b5c`.
- Source review: repository tree, backend/frontend modules, selected existing tests/configuration, [MASTER_PLAN](../MASTER_PLAN.md), [PHASE_PLAN](../PHASE_PLAN.md), [ACCEPTANCE_MATRIX](../ACCEPTANCE_MATRIX.md), [Issue #20](https://github.com/rzqllh/Yoru/issues/20), [Issue #44](https://github.com/rzqllh/Yoru/issues/44), [Issue #78](https://github.com/rzqllh/Yoru/issues/78).
- No local repository checkout, tests, physical-device tests, live media, login, database inspection, provider activation, or deployment was performed. Static code observations are **not runtime proof**.
- This is a **proposed owner-vNext contract**, not a rewrite of previously accepted live-test evidence. Historical docs and acceptance remain intact until a separately approved reconciliation is implemented.

## Working truth labels

- `DECIDED`: owner selected a requirement, not proof it works.
- `SUPERSEDED`: subsequent owner decision explicitly refines or replaces a prior option.
- `ALIGNED IN SOURCE`: inspected code contains the specified mechanism; runtime/device proof can still be missing.
- `PARTIAL`: only some target behaviors have inspected implementation.
- `MISMATCH`: inspected source contradicts target behavior.
- `UNKNOWN/NOT RUN`: evidence insufficient.
- `BLOCKED`: do not implement/activate until prerequisite and authorization are resolved.

**Release stance:** private beta may continue within its separately authorized scope; public streaming release remains **NO-GO** until all release gates and explicit owner sign-off.

## Change control

This documentation branch proposes a PR for owner review. No main merge, upstream changes, account/DB operations, security/config changes or production promotion are implied. Do not label a decision, fixture, commit, or HTTP 200 as live verified playback.
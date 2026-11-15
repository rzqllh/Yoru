# Yoru — Twelve-Document Agent/Harness Specification Pack

**State:** PROPOSED, docs-only, owner review. **Not a claim of implemented features, verified tests, or implementation permission.** Root [AGENTS.md](../../AGENTS.md) is the operational guardrail for agent execution. Latest [L01 amendment](../planning/owner-freeze-2026-11-15/DECISION_REGISTER.md) requires **production-only hosting, local-only preview**.

The names map one-to-one to the 12-document structure requested by the owner; filenames use zero-padded prefixes for predictable ordering and tooling.

| Order | Document | Responsibility |
|---|---|---|
| 01 | [PRD](01-PRD.md) | Problem, audience, outcomes, success, non-goals, release gating |
| 02 | [DESIGN](02-DESIGN.md) | Information architecture, UI behavior, interaction and accessibility contract |
| 03 | [REQUIREMENTS](03-REQUIREMENTS.md) | Requirement IDs, priority, dependency, acceptance/evidence |
| 04 | [FEATURES](04-FEATURES.md) | Functional inventory and gap/status against inspected source |
| 05 | [USER_FLOW](05-USER_FLOW.md) | End-to-end paths, alternatives, empty/errors, privacy consent |
| 06 | [BUSINESS_RULES](06-BUSINESS_RULES.md) | Cross-feature invariants and forbidden shortcuts |
| 07 | [DATABASE](07-DATABASE.md) | Observed IndexedDB plus proposed logical data/sync/RLS contract |
| 08 | [API](08-API.md) | Observed backend endpoints and proposed interfaces clearly separated |
| 09 | [ARCHITECTURE](09-ARCHITECTURE.md) | React/Vite/Hono and provider boundaries, local QA → production-only |
| 10 | [SECURITY](10-SECURITY.md) | Threat model, privacy, access controls, blocked external operations |
| 11 | [ROADMAP](11-ROADMAP.md) | P0/P1/P2 phases, dependencies and handoff gates |
| 12 | [TESTING](12-TESTING.md) | Unit/contract/browser/live/device/security matrix and evidence rules |

## Source of authority

- [Decision Register](../planning/owner-freeze-2026-11-15/DECISION_REGISTER.md) — exact owner choices P01–P71 and RG01–RG10 plus L01 supersession.
- [Open Conflicts](../planning/owner-freeze-2026-11-15/OPEN_CONFLICTS.md) — C01 historical hosted preview superseded; C02 episode denominator, C03 provider restrictions, C04 metadata terms unresolved.
- [Code Alignment Audit](../planning/owner-freeze-2026-11-15/CODE_ALIGNMENT_AUDIT.md) — prior read-only static audit; requires recheck at current SHA.
- [Acceptance Matrix v1](../planning/owner-freeze-2026-11-15/ACCEPTANCE_MATRIX_V1.md) — detailed DF-* cases all NOT RUN/BLOCKED until individually evidenced.
- [Master Plan](../planning/MASTER_PLAN.md), [Release #20](https://github.com/rzqllh/Yoru/issues/20), [Cloud acceptance #78](https://github.com/rzqllh/Yoru/issues/78).

## Specification discipline

Every requirement must map to an owner decision ID or be labeled `PROPOSED/NEEDS APPROVAL`. Distinguish **implemented**, **partial**, **missing**, **unknown** and **blocked**, never imply a doc is executable. Names for proposed tables, TS types, API routes and UI states are conceptual until approved and verified in source. Do not fabricate external providers, data fields, success metrics or test results.

If spec ambiguity or missing permission affects an action, the harness reports `BLOCKED [YOR-BLK-###]` with evidence, impact, options and one precise owner question, per [AGENTS.md](../../AGENTS.md). **It must not resolve conflicts with its own guesses or suppress the blockers to achieve an artificial 100% completion.**

## Existing implementation

At prior inspected main SHA `b2fd85a23f9f41003ef328a8a9b9220fd2f68b5c`, source included native preflight, local storage, some subtitles, source adapters and 8-second native auto-next; desktop modal, blocked iframe playback from detail, MAL-centric metadata, and absent merged cloud sync were notable gaps. This is historical static evidence, **not a new live runtime/test result**. Verify again before engineering work.

## Change control

This folder and AGENTS.md are documentation additions in draft PR #161. They do not add schema/API/code or alter Vercel, production, provider access, authentication, or the repository's running behavior. Owner review and separate implementation scope required.

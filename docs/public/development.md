# Development and Contribution Guide

**Purpose:** reproducible local engineering, focused pull requests and evidence-backed promotion. Default-branch integration is not proof that a public streaming release is approved.

## Repository layout

- `frontend/`: React/Vite PWA, player, Watch Guide and IndexedDB helpers.
- `backend/api/`: Hono API, HTTP safeguards and budgets.
- `backend/pipeline/`: metadata/catalogue normalization and Watch Guide graph.
- `backend/providers/`: local, external embed, Miruro-compatible, Stremio and subtitle adapters.
- `configs/`: tracked examples only; private local configurations are ignored.
- `tests/` and `tests/browser/`: unit, contract and Playwright tests.
- `scripts/`: dev/build/start and opt-in verification utilities.
- `docs/public/`: supported public guidance; private handoff notes are not part of the public documentation contract.

## Reproduce locally

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run check
```

The supported runtime is Node 22.12+. Do not upgrade dependencies or rewrite the lockfile incidentally to an unrelated feature. CI also runs Linux/Windows validation and Chromium/WebKit-family browser tests; physical Safari is a separate release gate.

## Pull-request contract

1. Branch from current canonical base and document the **exact base and head SHAs**.
2. Describe user-observable behaviour, scope, risks and fallback. Keep changes small enough to review; avoid simultaneous divergent edits to `App.tsx`, `Player.tsx` and global CSS.
3. Add deterministic unit/contract tests plus browser tests for stateful UX. Tests using fixtures are explicitly **not** live provider or real-device evidence.
4. Report command results and link exact-head GitHub Actions runs. Do not state PASS while jobs are queued, skipped, failed or cancelled.
5. Update public docs for changed capabilities, and release gate notes when a deployment-facing behaviour changes.
6. Review security, accessibility, privacy and backwards compatibility; never relax source-verification rules to make tests easier.

## Code and dependency discipline

Prefer typed pure functions, conservative URL/ID validation, timeout and cancellation of network work, explicit error states, independent provider failures and bounded fan-out. Sanitize untrusted media/metadata. Store no credentials in browser bundles. Avoid copying third-party copyrighted source into this MIT project without compatible licensing.

## Release governance

Maintain a change log or PR summary, exact commit test evidence, data migration plan if needed, rollback path and [G1–G6 acceptance](production-readiness.md). Require human owner approval for production deployment and final public release. Consult [Architecture](architecture.md), [Security](security.md) and [Quality gates](quality-gates.md).

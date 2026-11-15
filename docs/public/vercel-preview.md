# Local Preview and Production Deployment — Vercel Adapter

> **Owner update, 15 November 2026 (L01):** Yoru has **only one remotely hosted target: PRODUCTION**. All preview, QA and release-candidate inspection takes place **locally**. Do not create a separate branch preview, staging project, hosted preview URL, or deployment just to inspect changes. This is a proposed target workflow, not confirmation of current Vercel settings.

The filename `vercel-preview.md` is retained so existing documentation links remain valid. The older branch-preview runbook was superseded by this owner decision.

## Local preview workflow

1. Checkout the exact reviewed SHA while preserving dirty/untracked work.
2. Use local/test configurations only. Never copy production database credentials, service-role keys, real users' personal data or signed media links into local files, client bundles or logs without separately approved access.
3. Run `npm ci`, `npm run check` and the project browser tests in the local environment as appropriate. Run `npm run dev` for local development, or `npm run build` and the locally served build for production-like preview. These are **planned checks, not results of this documentation edit**.
4. Verify local frontend and Hono API together: `/api/health`, real route refresh/back, assets, manifest, service worker, local demo content, CSP/CORS, player behavior, subtitle and error paths.
5. Report exact SHA, environment, test fixture/live provenance, observed failures and evidence. Local Playwright/WebKit is not a physical iPhone Safari acceptance.
6. Keep external/live provider calls opt-in and authorized. No unapproved production data connection, provider activation or hosted preview deployment.

## Single production deployment

- `vercel.json` currently has `git.deploymentEnabled: false`, deliberately preventing **automatic Git deployments**; do not turn it on as part of a local preview workflow.
- Deploy **production only** after review, exact SHA checks, approved runtime configuration, [production gates](production-readiness.md), [security review](security.md), [operations/rollback](operations.md) and explicit owner authorization.
- The frontend/Vite output and Hono API function must remain aligned. HTTPS ingress, provider permissions, secrets, quotas, health, alerts and rollback remain production requirements.
- A Vercel `READY` status, HTTP 200 or local demo playback is not proof of live media coverage, Subtitle API validity, iPhone support or public release GO.
- A manual CLI/API deployment can still exist despite Git automatic deployment being disabled. **Whether historical hosted preview deployments currently remain active is unverified**; do not assert they were deleted.

## Historical hosting notes — not a new preview plan

Earlier Yoru checkpoints used branch-preview terminology, documented protected preview/SSO, Ignored Build Step `exit 0`, and Vercel deployment quota errors such as `api-deployments-free-per-day`. Those observations remain historical and must not be used to justify re-enabling branch preview deployments. When quotas or protected deployment errors occur on an **authorized production operation**, stop repeated attempts and follow the platform's current policies rather than using alternate accounts or bypasses.

See [development](development.md), [releases](releases.md), [production readiness](production-readiness.md), [security](security.md), and the [owner Decision Freeze v1](../planning/owner-freeze-2026-11-15/README.md).

References: [Vercel Git deployment configuration](https://vercel.com/docs/project-configuration/git-configuration), [Vercel limits](https://vercel.com/docs/limits).

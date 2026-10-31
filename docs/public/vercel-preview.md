# Vercel Preview — Deployment Adapter

**Status:** Automatic Git deployments are disabled for every branch (`git.deploymentEnabled: false`). Engineering merges to `main` do not authorize production. Preview deployment is a separate, deliberate operation; production deployment/promotion requires explicit owner approval. The repository has a Vercel-compatible Node function adapter for Hono API paths plus Vite SPA output. A successful production deployment does **not** complete public release acceptance or issue #20.

## Preconditions

Use an approved Vercel project and access-controlled preview environment with deployment credentials stored in the host's secret management. Do not commit local provider JSON, subtitle keys, signed media URLs or user data. Confirm the target branch and exact Git SHA before deploying.

## Verification after deployment

1. Assert build output and declared Git SHA match the requested commit.
2. Confirm READY **and** authenticated HTTPS `/api/health` on that exact deployment.
3. Open direct SPA paths, refresh, and test static files, manifest, service worker and local demo video.
4. Validate relevant CSP/CORS/iframe restrictions, provider reachability and no accidental secret exposure.
5. Test rollback to a previously verified immutable deployment.

Preview deployments may require SSO authentication. Do not bypass it to satisfy a smoke test. Git-hosting integration and daily API deployment quotas can block a new SHA: for example, HTTP 402 `api-deployments-free-per-day` means no latest-HEAD deployment exists until quotas or billing are addressed. An older READY URL is **not** proof for newer code.

## Constraints

The Hono API and frontend must remain functionally aligned. Hosted shared endpoints need gateway protections, identity-aware distributed request budgets, proper logging, DNS/SSRF review and incident response. Browser media playback remains subject to CORS, permissions and actual provider availability.

Before any public promotion, complete the [production gate ledger](production-readiness.md), [security model](security.md), [operational runbook](operations.md) and an explicit owner go/no-go. Deployment metadata must not be represented as live content coverage.

## Engineering without automatic deployment

Keep `git.deploymentEnabled` set to `false` while engineering continues. This blocks automatic Git deployments for main and feature branches, preserving deployment quota. CI and local browser tests still run for pull requests and main. It does not disable deliberate CLI/API deployments: confirm the target and exact tested SHA before every manual operation. No workflow in this repository deploys or promotes production.

The Yoru project also has a defensive Ignored Build Step, `exit 0`, set during the 31 October 2026 audit. Keep that guard while older branches still contain automatic deployment settings. It skips Git builds but is not a quota solution: skipped builds may count toward limits. Only clear/override it for a deliberately authorized deployment; do not restore automatic main deployment as part of an engineering merge.

## HTTP 402 / daily deployment limit

`api-deployments-free-per-day` is the official owner-scoped limit: 100 deployments in 86,400 seconds on Free/Hobby. Stop creating deployments after this error. Preserve the reported retry/reset information; retry one reviewed preview only after the platform permits it. Do not assume local midnight resets a rolling window. If the reset is unclear or the error persists after the stated interval, the owner can contact [Vercel support](https://vercel.com/help). No alternate account/project, retry loop, quota workaround or paid upgrade is part of this runbook.

References: [Git deployment control](https://vercel.com/docs/project-configuration/git-configuration), [Vercel limits](https://vercel.com/docs/limits), [Ignored Build Step](https://vercel.com/docs/project-configuration/project-settings#ignored-build-step).

# Vercel Preview — Deployment Adapter

**Status:** preview-only deployment option. The repository has a Vercel-compatible Node function adapter for Hono API paths plus Vite SPA output. A successful deploy does not provide public release approval.

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

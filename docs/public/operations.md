# Operations Runbook (Preview)

**Scope:** local and preview environments. Production hosting is **not** signed off; this runbook defines prerequisites rather than claiming an active 24/7 operations team.

## Pre-deployment checklist

Identify operator, target commit SHA, branch, build logs, exact CI/browser test links, approved provider host inventory, secrets owner, rollback target, deployment change window and access rules. Verify `npm ci && npm run check`. Do not publish a static-only frontend: the Hono `/api` is required.

## Local smoke

```bash
npm ci
npm run build
npm start
```

From the same machine, check `http://127.0.0.1:8787/api/health`, root SPA, deep routes, headers and local demo media. A response of `status: ok` proves a process endpoint, **not** upstream provider health or browser media decoding.

## Hosted preview verification

Record: exact Git commit in deployment metadata; HTTPS URL; access control state; authenticated `/api/health`; SPA deep-link rewrite; static assets/manifest/service worker; CSP/CORS; API and subtitle routes; rollback version. Vercel READY alone is not enough. HTTP 402 quota exhaustion is an infrastructure blocker; do not bypass SSO or claim an older deployment matches a new SHA.

## Observability and alerting requirements

Instrument request volume/status/latency, gateway throttling, upstream error categories, source-preflight failure categories, build/deploy outcomes and resource saturation **without** storing keys, subtitle grants, full protected URLs or viewing histories. Define alert owners, escalation destinations, log retention and periodic review **before** production approval. No measured SLO is currently published.

## Incident and rollback procedure

1. Classify severity: secret exposure or SSRF possibility; API outage; catalogue degradation; media availability regression; corrupted local backup.
2. Reduce blast radius: disable affected provider/ingress, revoke tokens and stop unsafe deployments while retaining safe user data.
3. Capture sanitized time, SHA, known-good artifact, impact and reproduction; never paste secrets into a GitHub issue.
4. Roll back to an already validated exact SHA using the hosting provider's controlled mechanism. Validate health, browser routes and source truthfulness after rollback.
5. Document root cause, corrective PR, owner and follow-up tests. Browser storage is per-origin; do not recommend wiping it as a routine rollback.

## Maintenance and ownership

Use GitHub Issues for public work, maintain a reviewed change log and release ledger, audit orphaned branches/retained CI artifacts and rotate secrets. Cleanup must exclude open PR heads, protected/default refs and any unique unmerged changes. Read [Production readiness](production-readiness.md), [Security](security.md) and [Vercel preview](vercel-preview.md).

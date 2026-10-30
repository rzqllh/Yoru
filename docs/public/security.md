# Security and Privacy Model

**Status:** engineering safeguards exist, but no independent penetration test, security certification, SOC 2/ISO 27001 attestation, managed identity layer or public abuse-resilience sign-off is claimed.

## Assets and trust boundaries

Protected assets include server-side provider credentials, signed subtitle grants, user-local viewing history and authorized video endpoints. Trust boundaries exist between the browser, Hono API, approved hosts and independent external media/metadata/subtitle providers. Treat upstream payloads and user-supplied addon configurations as untrusted.

## Implemented safeguards

- Loopback-only Node bind by default; explicit operator action needed for network exposure.
- HTTP headers for content type, framing, referrer, permission policy and a constrained CSP. A header is a mitigation, not a complete threat model.
- Backend input validation, constrained URL schemes/hosts, request timeouts and source-level failures. Review DNS and redirect checks when adding source adapters.
- Subtitle download grants, conservative process-local request budgets and server-environment credentials. Process-local throttling is **not** sufficient against distributed public abuse.
- Browser-local IndexedDB with validated import/export. No server-side user accounts or cloud history.

## Required operator controls before internet exposure

1. HTTPS/TLS termination, HSTS, upstream firewall and secure DNS/egress.
2. Authentication/authorization **at the gateway where necessary**, distributed rate limiting, quotas, secret rotation, least-privilege access and protected CI credentials.
3. Observability with redacted logs, bounded retention, alerting and evidence of rollback.
4. SSRF review across DNS rebinding, private/loopback destinations, redirects, encoded addresses and host re-resolution. Never enable arbitrary URL proxying.
5. Software supply-chain review, dependency vulnerability triage, signed provenance where feasible, code review and branch protections.
6. Copyright/entitlement and provider terms review for every external media source. Never persist or disclose protected media URL credentials to public documentation.

## User data and privacy

Library, progress, watch-path steps and preferences reside in the current browser's IndexedDB. Users must export backups before clearing storage. A local backup can expose viewing preferences to anyone with file access; store it securely and delete exported copies as appropriate. Catalog and media requests are sent to third-party hosts subject to their own policies. No app account/cloud synchronization is implemented.

## Vulnerability intake and response

Do not publish exploitable vulnerabilities, API keys, signed downloads, private URLs or personal exports in public issues. Use a private owner-approved reporting channel, revoke exposed credentials promptly and record an incident timeline. See [Operations](operations.md), [Production readiness](production-readiness.md) and [Quality gates](quality-gates.md).

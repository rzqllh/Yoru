# 10 — Security, Privacy and External Access Contract

**Status:** Security requirements and risk ledger; not a penetration test, compliance certification or authorization to use real user data. Use with [owner conflicts](../planning/owner-freeze-2026-11-15/OPEN_CONFLICTS.md), [database](07-DATABASE.md), [architecture](09-ARCHITECTURE.md) and [AGENTS.md](../../AGENTS.md).

## 1. Trust boundaries and threats

| Boundary | Threat | Mandatory protection | Verification |
|---|---|---|---|
| Browser ↔ Hono API | XSS, unsafe parameters, rogue media links | Runtime validation, security headers/CSP review, no client secrets | Negative input, static bundle and browser security tests |
| Backend ↔ provider sites | SSRF, rebinding, unsafe redirects, arbitrary proxy | Approved HTTPS hosts, DNS/public IP recheck/pinning where applicable, timeout/size limits | Private IP, redirects, mixed encodings, DNS negative tests |
| Provider ↔ media player | Wrong episode, malicious embed/scripts, source expiry | Canonical mapping, user consent, sandbox/permissions, verified observed playback | Correct/wrong episode and iframe isolation tests |
| Backend ↔ subtitle API | Secret exposure, signed URL replay, wrong file | Backend keys only, scoped HMAC grants, expiry, MIME/size checks, quotas | 403/429/expired grant/oversize negative cases |
| Local browser ↔ user data | Guest/account mixing, stale progress, stored XSS | Account namespace, ownership, schema validation, non-destructive migration | A/B/shared-device tests |
| Auth/cloud ↔ database | Cross-account read/write, service-role leak | RLS and least privilege, OTP/rate/expiry, CAS revision, deny anonymous | Two accounts, anonymous denied, admin bypass audit |
| Local preview ↔ production | Unapproved secrets/data access | **L01** local/test data default; no implicit production DB credentials | Local env/config, network and secret scans |
| Production operations | Runaway providers/deploys, exposed logs | Owner GO, audit, alerts, emergency disable-only kill switch | Recovery/kill switch rehearsal |

## 2. Hard prohibitions

- No unrestricted proxy, arbitrary HTTP destination, private-IP/CDN metadata access, DNS rebinding, unsafe redirects, excessive payloads or request storms.
- No deliberate unauthorized anti-bot bypass, DRM circumvention, credential/cookie theft, stealth evasion, source access in violation of site permissions, or republishing media without rights. **RG09** is recorded as owner intent, not third-party permission.
- No forcing AniList/MAL service to violate provider rules or rate limits. **RG10** is an unmet objective where terms restrict use; request provider authorization or use compliant alternatives.
- No production service-role secrets in frontend, local preview, docs, fixtures, GitHub comments, artifacts, logging or backup files.
- No client-visible or operator logs of private watch histories, account tokens, signed media links, cookie headers or personal identifiers unnecessary for troubleshooting (P65).
- No cloud login/sync enablement without tested account ownership, RLS negative tests, safe deletion/snapshot policy.
- No production deployment, manual preview deploy, schema change, RLS changes, provider enablement or branch cleanup based on documentation approval alone.

## 3. Environment/access — L01

The owner **removed remote preview architecture**. Only production may be hosted remotely; local machine is the preview/QA environment. Historical P42/P61/P71 hosted-preview read/write privileges are superseded in topology and **do not transfer to local testing**. Local tests default to test/local data and isolated keys.

**If production data is requested for a local debugging task:** STOP and escalate with exact desired data category, access need, duration, identity, privacy basis, least-privilege mechanism, logging, recovery plan and owner authorization. Until resolved, `BLOCKED`. No automatic import of production database snapshots, even when developer is owner.

## 4. Source/content permissions

- Maintain per-provider provenance, license/terms/source owner, user-agent/rate rules and supported interface.
- Approved integration must be allowed by the provider and compatible with browser Safari/Chrome (protocol, manifest, codec, CORS, subtitle).
- FlyStream RG01 is **reference-only**. Do not run its scraper or seek protected sessions merely to build an adapter.
- Don't assume open-source client code grants licenses to redistribute media or APIs.
- Account and content access restrictions, geographic availability, age restrictions and provider quotas must be respected; tests use authorized sample content.

## 5. Data retention and privacy

- Local-first use without login; guest records separated from authenticated records.
- Automatic cloud sync only for records clearly tied to authenticated account (RG05).
- RLS must deny anonymous and cross-user reads/writes; don't rely on UI row filtering.
- Backup export/import validates owner, version, episode identity, size, integrity, and supports safe rollback; never includes tokens/media grants.
- Snapshot history bounded; precise retention/count and deletion policy require approval (P70 is example only).
- Logout retains owned local records while revoking session (P46); account deletion is separate explicit workflow.
- Consent once for iframe as product preference (P11) does not authorize arbitrary cross-domain tracking; record provider/site purpose, allow revocation if designed, and respect limitations.

## 6. Threat-model question set for any new capability

1. Who is actor, who owns data, which identities can read/write, and what consent exists?
2. What third-party hosts, redirects, scripts, sessions, cookies, or auth tokens are involved?
3. Is metadata/media access permitted and what rate/availability constraints apply?
4. What breaks if a provider sends the wrong episode, a 403/429, an HTML challenge, or hostile URL?
5. How are logs, backups, exports, screenshots and CI artifacts redacted?
6. Can the operation affect production users, schema, costs, account deletion, or release gates?
7. What rollback and negative tests demonstrate containment?
8. Does the task explicitly authorize this exact operation?

Missing any material answer → `BLOCKED` for that operation, with an owner question. Do not silently implement a risky default.

## 7. Open security gates

| ID | Risk | State |
|---|---|---|
| SEC-B01 | P68 coverage denominator is not independent of provider | **BLOCKED C02** |
| SEC-B02 | RG09 automatic bypass of protection where site disallows it | **BLOCKED C03** |
| SEC-B03 | RG10 forced AniList/MAL usage when terms restrict | **BLOCKED C04** |
| SEC-B04 | Current local IndexedDB per-account segregation missing | NOT IMPLEMENTED/NOT RUN |
| SEC-B05 | Cloud auth/OTP/RLS/account deletion/sync not verified | BLOCKED for production activation |
| SEC-B06 | Physical Safari/media provider/real subtitle proof missing | BLOCKED for public launch |
| SEC-B07 | Current hosted deployment/preview inventory and actual Vercel settings not re-audited | UNKNOWN/VERIFY |
| SEC-B08 | Production readiness, monitoring/kill switch/rollback unverified | BLOCKED release |

**C01 historical shared-production preview:** superseded by L01; no blanket production-data access. Do not reintroduce it without new approval.

## 8. Incident management

- Detect provider health failures and unsafe content without recording watch histories.
- For **preapproved emergency disable-only provider switch**, document cause, affected provider, exact change, audit and owner notification; reactivation demands validation.
- Production rollback/deploy remains owner-approved. During incident, protect data, isolate affected provider safely, preserve redacted evidence and report unresolved unknowns.
- Use [root AGENTS blocker report](../../AGENTS.md) for missing access or unclear authority. Security gate FAIL/BLOCKED is not bypassable by 'finish everything today' instructions.

## 9. Proof versus intent

Threat model approval, static source checks, mock tests, RLS fixtures, Vercel READY, and domain HTTP 200 are **different proof categories**. Public release requires the relevant exact-SHA, live/user-data and physical-device evidence. No compliance certification or end-to-end security PASS is claimed by this file.

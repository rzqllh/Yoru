# Public Production Readiness — Gate Ledger

**Decision on 30 October 2026: NO-GO / BLOCKED.** Source integration into `main` is permitted as engineering work but **does not imply** a hosted production launch, a general anime streaming service, or final release authorization. The authoritative issue is [#20](https://github.com/rzqllh/Yoru/issues/20); progress planning is in [#44](https://github.com/rzqllh/Yoru/issues/44).

## Release gates

| Gate | Required evidence | Current verdict |
| --- | --- | --- |
| G1 — Native media | Authorized real HLS/MP4 hosts, titles/episodes, CORS, codec, redirects, expiry and failure coverage | **BLOCKED** |
| G2 — Availability integrity | Correct season/cour/OVA/movie matching, no false Play state, failed/empty-provider matrix | **BLOCKED** live verification |
| G3 — Real subtitles | Authenticated OpenSubtitles/SubDL/SubSource search and downloads, language, quotas, grants, sync | **BLOCKED** |
| G4 — Physical iPhone | Actual model and iOS, native HLS, fullscreen, PiP, WebVTT styling and PWA install/upgrade | **BLOCKED** |
| G5 — Public infrastructure | Approved HTTPS domain, frontend+Hono API, CSP/CORS, secret storage, gateway protection, logs, rollback | **BLOCKED** |
| G6 — Acceptance decision | Exact final SHA tests, quantified coverage, zero unresolved P0/P1, approved release owner go/no-go | **BLOCKED** |

No gate may pass based on CI fixtures alone. GitHub Actions, a Vercel READY marker or an accessible URL prove neither authorized media nor device compatibility.

## Infrastructure minimum

The default Node backend binds `127.0.0.1:8787`. Public binding requires controlled HTTPS ingress, HSTS, firewall, CSP evaluation, abuse controls beyond process-local budgets, least-privilege credentials and DNS/redirect/SSRF testing for approved provider targets. The frontend and Hono API must deploy together. Configure branch protections, required checks and a human review gate. Keep `configs/*.local.json` and all tokens outside Git and browser bundles.

## Live subtitle verification

Run `npm run verify:subtitles:live` only in a controlled environment with approved real credentials and an untracked `YORU_LIVE_SUBTITLE_FIXTURES` file. The fixture file must contain explicit provider/title/type/episode/language samples; review each provider's authenticated search, signed grant, bounded download and actual WebVTT cue. Log only status and synthetic identifiers, not credentials or subtitle text. A PASS means the *specified fixtures* worked, not comprehensive coverage.

## Go/no-go package

Record release candidate SHA, asset provenance, dependency review, exact Linux/Windows/Chromium/WebKit checks, sample counts and exceptions, iPhone evidence, infrastructure/security sign-off, rollback drill, on-call ownership and a dated explicit owner approval. If any blocker persists, status stays **NO-GO**. See [Operations](operations.md), [Security](security.md), [Quality gates](quality-gates.md) and [Releases](releases.md).

# Yoru Documentation

**Audience:** end users, contributors, maintainers and prospective operators. **Product stage:** local-first web preview; not production-approved streaming infrastructure.

| Start here | Audience | Purpose |
| --- | --- | --- |
| [Getting started](getting-started.md) | Users, developers | Node prerequisites, local demo, installable PWA |
| [Using Yoru](using-yoru.md) | Users | Search, source states, player, progress, backup |
| [Providers](providers.md) | Operators | Authorized HTTPS media, addon setup and subtitles |
| [Watch Guide](watch-order.md) | Users, editors | Release-year vs verified chronology, route provenance |
| [Troubleshooting](troubleshooting.md) | Everyone | Decision-tree diagnosis and safe data recovery |
| [Development](development.md) | Contributors | Repository commands, review and testing |
| [Architecture](architecture.md) | Engineers | Components, data flows, dependencies and trust boundaries |
| [Security](security.md) | Maintainers, operators | Threat model, secrets, SSRF, abuse controls |
| [Operations](operations.md) | Operators | Deployment, observability, incident and rollback runbooks |
| [Quality gates](quality-gates.md) | Reviewers | Automated and real-world evidence requirements |
| [Production readiness](production-readiness.md) | Release approvers | G1–G6 acceptance matrix and go/no-go |
| [Releases](releases.md) | Everyone | Supported artifacts, versioning and distribution |
| [Vercel preview](vercel-preview.md) | Operators | Preview-only deployment limitations |
| [Design system](../../DESIGN.md) | Product, engineering | UX and accessibility principles |

## Source-of-truth hierarchy

Runtime behaviour and CI logs establish implementation. [Issue #20](https://github.com/rzqllh/Yoru/issues/20) is the public release evidence gate; [Issue #44](https://github.com/rzqllh/Yoru/issues/44) tracks broader features. These documents describe verified implementation and known limitations; they do not elevate proposed features to shipped status.

Keep credentials, private provider endpoints, personal data, incident secrets and working drafts outside public documentation. Public documentation describes **controls and responsibilities**, not unsupported claims of security certification, compliance, SLA or licensed catalogue access.

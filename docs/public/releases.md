# Releases, Versioning and Distribution

**Current designation: engineering preview. Public production release remains BLOCKED** by [G1–G6](production-readiness.md) and [Issue #20](https://github.com/rzqllh/Yoru/issues/20).

## What repository artifacts mean

| Artifact | Definition | Installation/production meaning |
| --- | --- | --- |
| Git source checkout or GitHub source ZIP | Developer source files | Requires Node, npm, build and backend |
| GitHub Actions build artifact | Temporary CI output from a particular SHA | Engineering evidence, not a consumer installer |
| Local built PWA | Vite frontend and Hono API served together | Local developer preview |
| Hosted preview | Branch-specific HTTPS deployment subject to access control/quota | Not publicly production-certified |
| APK/IPA/Windows installer | Not currently released | Do not advertise as available |

Historical release-candidate tags and archives may exist but are not evidence of a signed native installer or live source availability.

## Version and release procedure

1. Define a scoped change list and immutable Git SHA.
2. Confirm exact-head lint/typecheck/unit/build and Linux/Windows/Chromium/WebKit evidence.
3. Document provider, subtitle, device and public infrastructure results separately.
4. Update compatibility notes, migrations, third-party dependencies and rollback procedure.
5. Obtain a recorded owner approval against every gate before producing a public release tag, installer or production deployment.
6. Keep published notes precise about supported features and limitations; never silently swap an older READY deployment into a latest-SHA announcement.

## Not included

No managed user accounts, cloud sync, signed native mobile packages, integrated torrent engine, licensed content distribution guarantee, independent enterprise compliance certification, or supported production SLA.

For building locally see [Getting started](getting-started.md), for operator deployment see [Operations](operations.md) and [Production readiness](production-readiness.md).

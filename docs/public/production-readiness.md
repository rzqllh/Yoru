# Production readiness — Yoru

Yoru is a local-first anime catalog and PWA. A passing CI build does **not** make this a multi-tenant, enterprise-certified service. The current browser stores watch history and library data locally in IndexedDB; there is no account system, operator identity, cloud sync, or availability SLA.

## Required deployment controls

1. Build and validate: `npm ci && npm run check` and the Chromium browser workflow; review dependency audit and open security findings.
2. Default `npm start` binds to `127.0.0.1:8787` only. This is deliberate, so the local preview is not exposed on a network.
3. For an approved external deployment, set `HOST=0.0.0.0` explicitly **behind an HTTPS reverse proxy**. The Node server speaks HTTP; do not expose it directly to the internet. Enforce TLS and HSTS at the reverse proxy, with a narrowly scoped firewall and health probes.
4. Deploy the frontend and API together; routing requires the production Hono backend as well as the static frontend. A static-only site cannot serve the API.
5. Confirm CSP, external player framing, stylesheet/fonts, poster images, subtitle tracks, HLS segments, and IndexedDB in the **actual** hosted environment. Yoru's HTTP response headers restrict script sources and embedding while allowing HTTPS media and metadata artwork.
6. Test the service worker on HTTPS, SPA direct routes, offline shell, reloads and updates. Offline shell does not mean offline anime playback.
7. Keep `configs/*.local.json` off Git and out of public assets. Audit approved media and addon hosts, credentials, DNS behavior and source licensing separately. No token-bearing media URLs should be committed.
8. Verify cross-browser behavior, physical iOS Safari, actual playback across multiple anime/episodes and actual subtitle tracks before claiming full streaming support.
9. Capture immutable commit, CI run links, dependency report, deployment URL, version, and rollback artifact. Use a rollback procedure that restores the previous known-good version without erasing users' browser storage.
10. Configure branch protection (required CI/Chromium checks, review gate and no force pushes) in GitHub repository settings. This requires repository administrator action and is not covered by CI alone.

## Verification matrix

| Area | Local/CI evidence | Before public release |
| --- | --- | --- |
| Node Hono server + web build | Build, HTTP smoke, security headers | HTTPS proxy, domain, logs, uptime/alerting |
| Metadata catalog | Endpoint and browser tests | Upstream reliability, rate limits, degradation |
| Local HLS + Sub Indo sample | Chromium playback and subtitles | Device/browser compatibility |
| External anime embed | Origin-checked protocol and iframe tests | Real titles/episodes, origin redirects, actual subtitles |
| Local data | IndexedDB persistence and backup tests | Recovery instructions, quota/privacy review |
| PWA | Manifest, offline shell in Chromium | Install on real devices and upgrade behavior |
| CI | Unit, typecheck, lint, build, Chromium, dependency audit | Signed/verified deployment provenance and rollback drill |

## Release and operational policy

- Publishing a tag, GitHub Release, public hosting, native installer or app-store build requires separate owner approval.
- The historical `v0.9.0-rc.1` release is a source preview. Do not treat its archives as an installer.
- The historical release-cleanup workflow is **manual-only**, so pushing to `main` cannot silently modify older release notes.
- Security response headers apply to production responses, including the API; API routes are marked `Cache-Control: no-store`.
- To report vulnerabilities, do not paste credentials or private media URLs into public issues.

**Current release stance:** release-candidate source awaiting public infrastructure and real-device/third-party streaming verification, not enterprise-certified production hosting.

## Q12 strict source availability — implementation gate (29 October 2026)

A configured source, provider episode mapping, metadata listing, or constructed embed URL is **not** proof of a playable episode. Candidate streams are browser-preflighted to the decoded-first-frame stage before the native player is opened. A successful probe is valid only in that browser and at that moment; actual playback can still fail afterward. The player must surface the error rather than silently claiming success.

The fixed AnimeEmbed route is an **explicit, unverified external fallback**, not a verified catalogue provider. It requires a deliberate user action; native HLS/MP4 candidates may fail the probe because of codec, origin policy, networking, or availability. A pending or failed probe must never become a green availability badge. Strict verification for external embeds is still an unsolved release blocker unless a trustworthy playback confirmation protocol is established.

**Not release-ready until**: a verified multi-adapter native provider roster, dedicated OpenSubtitles/SubSource/SubDL subtitle discovery and rendering, source/quality/episode recovery, Q6–Q11 player controls, real iPhone Safari sign-off, configured HTTPS hosting, and repeatable provider/availability measurements. The above Q12 UI fix does not satisfy those gates independently.

## Subtitle integration verification

The three subtitle adapters are opt-in backend integrations and may be **unconfigured**. CI mocks only validate response parsing, fixed-domain request construction, SRT/ASS dialogue conversion, and picker behavior. Do not mark the real-provider availability gate PASS until each key and official endpoint has been exercised with real anime/episode fixtures, rate-limit handling, denied/expired download cases, and verification on the intended devices. Server-side download endpoints require request throttling/authentication controls before untrusted public traffic is allowed to consume provider quotas.

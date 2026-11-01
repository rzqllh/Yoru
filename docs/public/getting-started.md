# Getting Started

**Scope:** locally running Yoru with the shipped demonstration player. The procedure does not enable a real anime streaming catalogue.

## Supported developer baseline

- Node.js 22.12+ and npm; Git for cloning.
- A modern browser; Chromium is used for automated browser acceptance, WebKit for Safari-family smoke. Physical iPhone Safari is not signed off.
- Network for installation and external metadata. The demo HLS fixture is local after installation.

## Install and verify

```bash
git clone https://github.com/rzqllh/Yoru.git
cd Yoru
node --version
npm ci
npm run check
npm run dev
```

Browse to `http://127.0.0.1:5173`. Under Pengaturan, open the **local test player**. This fixture is a short sample with Indonesian WebVTT subtitles, **not** a licensed external title.

## Production-style local preview

Stop the development servers, then run:

```bash
npm run build
npm start
```

Open `http://127.0.0.1:8787`. API health: `http://127.0.0.1:8787/api/health`. The server defaults to loopback (`127.0.0.1`); exposing it externally requires an approved HTTPS gateway and additional security controls.

## Optional real sources

For an authorized HTTPS HLS/MP4 source, copy the checked-in example into the corresponding ignored local file:

```powershell
Copy-Item configs/providers.local.json.example configs/providers.local.json
```

Existing Stremio/Torrentio addon settings can be checked without publishing their URLs: run `npm run verify:stremio:config` in the environment containing `STREMIO_ADDONS_JSON` or the ignored `configs/stremio.local.json`. This reports configuration validity and mapping counts only, **not live stream readiness**.

Follow [Providers](providers.md). Do **not** place API keys or media entitlement tokens in Git, query strings, screenshots or public issues. Static metadata or addon availability does not guarantee actual playback.

## Install PWA

A built version can be installed where the browser supports PWA installation in a secure context. Loopback usually qualifies; another device on a LAN generally requires trusted HTTPS. The offline service worker caches the application shell, not newly discovered anime or media.

## Verify installation and recover

Run `npm run check` before reporting a defect. For failures, check Node version, dependency installation, the local health endpoint, browser console and [Troubleshooting](troubleshooting.md). Local library data lives in IndexedDB and may disappear when site storage is cleared; export a backup before resetting browser data.

Next: [Using Yoru](using-yoru.md), [Development](development.md), and [Production readiness](production-readiness.md).

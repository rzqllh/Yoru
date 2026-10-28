# Yoru — Anime, your way.

Local-first anime discovery and streaming PWA built with React, Vite, TypeScript and a Hono backend. It includes Jikan anime metadata, season/top/upcoming catalogs, search, anime details and episode guide, local provider configuration, HLS/MP4 playback, subtitle tracks, personal library, resume progress, data backup, and offline-capable PWA shell.

**Status:** Browser-tested web preview. GitHub Actions runs lint, typecheck, 16 native unit tests, production build, dependency security audit, and Chromium E2E for local HLS, Indonesian subtitles, desktop/mobile viewports, library persistence and multi-source selection. External anime playback, Safari iOS and native packaging are **not** yet validated. Do not treat this as production-certified or native-app-ready. The source does not bundle unverified anime streaming providers.

## Requirements

Node.js 22.12+ and npm, internet access to install dependencies and retrieve Jikan metadata. Local streaming requires an actual working HTTPS media source configured by you; no third-party anime streams are bundled.

## Run on Windows / macOS / Linux

```sh
npm ci
npm run check
npm run dev
```

Open http://127.0.0.1:5173. The Hono backend runs on http://127.0.0.1:8787. If you want to test the installable production PWA:

```sh
npm run build
npm start
```

Then open http://127.0.0.1:8787. A secure context is necessary for service workers; `localhost` counts as a secure context in browsers. For iOS testing from another device, use an HTTPS tunnel or trusted local HTTPS endpoint; plain `http://<LAN_IP>` is insufficient for service-worker testing.

## What works / limitations

- **Discovery:** Jikan metadata is fetched via the Hono backend. Requires network; Jikan rate limits and availability apply. UI explains temporary failures.
- **Playback:** A small, self-made HLS H.264 test clip and Indonesian WebVTT are bundled. Settings → Test player. Safari native HLS, hls.js fallback for browsers supporting MediaSource.
- **Real anime stream:** Optional. Requires local `configs/providers.local.json`, with valid MAL IDs, episode numbers, HTTPS URLs, formats, and subtitle tracks. No embedded unofficial provider, scraper, arbitrary JS rules, torrent, cloud sync, or native build. Opt-in local Stremio addon configuration is also supported for direct HTTPS HLS/MP4 only.
- **Library:** IndexedDB watchlist (planned/watching/completed), playback progress, backup export/import; no sign-in required. Statuses can be changed in the library interface.
- **PWA:** Manifest, icons and offline app shell via service worker on production builds. API and anime images are not cached, so discovery requires connectivity.
- **Future native:** Shared React UI is suitable for evaluation with Capacitor/Tauri; neither is packaged or verified here.

## Local stream provider

1. Copy `configs/providers.local.json.example` to `configs/providers.local.json`.
2. Replace MAL ID `1`, episode number, and placeholder URLs with your own authorized HTTPS stream/subtitle URLs.
3. Restart backend if needed, then Settings → refresh provider. Open the corresponding anime → pick an episode.
4. Do not commit `configs/providers.local.json`. It is gitignored.

### Opt-in Stremio addon configuration

Copy `configs/stremio.local.json.example` to `configs/stremio.local.json`. Configure a **HTTPS** addon manifest URL, the MAL-to-Stremio ID mapping, season and explicit episode numbers. The file is gitignored and no remote addon is enabled by default.

Only remote `stream/series/<id>:<season>:<episode>.json` JSON is requested. The backend pins a validated public IPv4 address and rejects local/reserved addresses, credentials, redirects, oversized responses and timeouts. **No torrent/magnet streams, executable plugins, or automatic media proxy** are supported. HTML manifests requiring login and addons with incompatible stream IDs are unsupported. Each episode can offer multiple configured sources; browser source selection aggregates them.

The player fetches the resulting video URL directly. Real addon playback must be independently verified before use on a public deployment.

The backend does not fetch or proxy remote streams. Media is fetched by the user's player, so your host must support the device's codecs, CORS where applicable, and subtitle access. HTTPS URL validation rejects credentials, IP literals and localhost-style hostnames. This is a local configured adapter, **not** a hardened public proxy.

## Commands

```sh
npm ci              # Install exact locked dependency versions
npm run dev         # Vite + Hono, separate local ports
npm test            # Node native test runner (no external test framework)
npm run lint        # Biome
npm run typecheck   # Frontend + backend TS
npm run build       # Static frontend + compiled backend
npm run check       # Lint + typecheck + test + build
npm start           # Production frontend + API from same localhost port
```

## Structure

- `backend/api` REST API; `backend/pipeline` Jikan + normalizers and security validation; `backend/providers` local adapter.
- `frontend/src` React screens, HLS player, IndexedDB library; `frontend/public` icons, VTT, HLS demo and service worker.
- `configs` provider example; `docs/public` user docs; `docs/internal` project notes; `scripts` local runners; `tests` pure logic tests.

## Manual verification checklist

1. `npm run check` finishes with exit code 0.
2. Open Home, Browse, Search and anime detail with working network. Confirm real Jikan data, or useful error states when offline.
3. Settings → Test player. Verify 9-second local HLS video, working audio/video controls and Indonesian sample subtitles (clip is silent).
4. Configure a permitted HTTPS anime stream. Check episode mapping, source selection, play, pause, close, and resume.
5. Save an anime to library; reload browser; verify saved state remains. Export and import backup.
6. `npm run build && npm start`; install PWA in Chromium and iOS Safari, check offline shell.
7. On iPhone/iPad: manually verify native HLS, WebVTT, fullscreen, PiP if offered, and resume after reopening. No iOS test has been conducted remotely.

## Web preview release

The automated GitHub release candidate is tagged `v0.9.0-rc.1` and includes a runnable web ZIP only after the complete CI and real Chromium E2E pipeline succeed. This is not a verified native application or a preconfigured streaming service. Extract the ZIP, run `npm ci --omit=dev` and `npm start`, then open `http://127.0.0.1:8787`.

## License

MIT — see `LICENSE`. React/Vite/Hono/hls.js/idb and other packages retain their own licenses. Demo HLS clip generated by this project.

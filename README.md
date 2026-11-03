# Yoru

**Status: engineering preview; public streaming release is blocked.** Yoru is an open-source, local-first anime discovery and viewing PWA. It combines metadata discovery, a browser-native HLS/MP4 player, opt-in third-party source adapters, local library/progress, and an evidence-limited Watch Guide. It is **not** a managed streaming catalogue, an enterprise-certified service, or a native Windows/Android/iOS application.

The default repository includes a **local demonstration video and Indonesian subtitle fixture**. Real anime playback requires a separately configured, authorized, browser-compatible source. Metadata, an external embed, or a Stremio torrent hash does not prove playback availability.

## Quick start

Prerequisites: Node.js **22.12 or later**, npm, Git.

```bash
git clone https://github.com/rzqllh/Yoru.git
cd Yoru
npm ci
npm run check
npm run dev
```

Open `http://127.0.0.1:5173`. For an installable production-style local PWA shell, run `npm run build && npm start` and open `http://127.0.0.1:8787`. The default backend binds to loopback; this is not a public hosting configuration.

## Capability and evidence matrix

| Capability | Implemented scope | Not established |
| --- | --- | --- |
| Anime catalogue and search | Transitional Tenrai/MyAnimeList metadata; browse and deep-linked filters; AniList-primary D03=3A is planned/gated | Full AniList-primary migration, 100% catalogue or upstream availability |
| Browser player | Native HTTPS HLS/MP4 and local sample; truthful source checks | Universal media, DRM, CORS or codec compatibility |
| External sources | Opt-in local JSON, Stremio-compatible stream metadata and Miruro-compatible adapter; uncontrolled external iframe is non-playable under D02 | Licensed or reliable third-party streaming coverage |
| Subtitles | Local VTT/SRT; conditional ASS dialogue conversion; opt-in SubDL, SubSource and OpenSubtitles adapters | Live provider-wide Indonesian coverage, correct sync |
| Library and resume | Browser-local IndexedDB, backup/import and verified-source retry | Multi-device account sync |
| Watch Guide | AniList relationship explorer; reviewed curated recommendations and editions | Universal canonical story chronology; unreviewed orders |
| PWA | Manifest, service worker and browser installation where supported | iPhone physical acceptance; APK, IPA or desktop installer |
| Testing | Automated lint, typecheck, unit/build, Chromium and WebKit-family CI | Physical iPhone, real provider matrix, production SLO |

The Watch Guide exposes **Tahun rilis** and **Kronologi**. Chronology remains disabled unless an explicitly reviewed, sourced story-order route exists; broadcast or recommendation order is not automatically story chronology.

## Documentation

Start from the [documentation portal](docs/public/README.md). Core references: [Getting started](docs/public/getting-started.md), [User guide](docs/public/using-yoru.md), [Optional device sync](docs/public/cloud-sync.md), [Provider configuration](docs/public/providers.md), [Watch Guide](docs/public/watch-order.md), [Architecture](docs/public/architecture.md), [Security](docs/public/security.md), [Operations](docs/public/operations.md), [Quality gates](docs/public/quality-gates.md), [Production readiness](docs/public/production-readiness.md), [Releases](docs/public/releases.md) and [Design system](DESIGN.md).

## Release policy

The default branch is an integration baseline, **not** an authorization to publish a live service. Public release is **BLOCKED** by [issue #20](https://github.com/rzqllh/Yoru/issues/20): empirical media and subtitle checks, physical iPhone Safari testing, approved HTTPS infrastructure and explicit release acceptance are outstanding. Do not publish provider credentials, claim unavailable media or enable arbitrary torrent/proxy behaviour.

## License and contributions

Licensed under [MIT](LICENSE). Review [development and contribution guidance](docs/public/development.md). Third-party metadata, artwork, media and subtitles remain subject to their owners' terms and applicable law. External providers are neither bundled content rights nor an endorsement.

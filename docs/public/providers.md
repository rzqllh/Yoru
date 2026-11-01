# Providers and Subtitle Integrations

**Scope:** operator-approved, lawful access to browser-compatible media. **No built-in licensed anime streaming library is supplied.**

## Local HTTPS sources

Copy `configs/providers.local.json.example` to the Git-ignored `configs/providers.local.json`. Use the example schema without introducing new keys. Each anime must identify the correct numeric MAL ID and episode; a native stream needs a supported `hls` or `mp4` format, a directly accessible HTTPS URL, and optional language-labelled subtitle tracks. Place actual authorization only in approved backend configuration and do not commit protected URLs or credentials.

Native video still depends on CORS, codec support, manifest validity, segment accessibility, expiring signatures and end-user permissions. Metadata and preflight success do not establish a permanent playback guarantee.

## Optional Stremio-compatible addons

Copy `configs/stremio.local.json.example` to the corresponding ignored local JSON file and configure approved HTTPS manifest URLs with explicit ID/season/episode mapping. Distinguish three Stremio stream forms:

| Form | Interpretation | Browser capability |
| --- | --- | --- |
| `url` | Direct HTTPS media candidate | May be checked for native HLS/MP4 compatibility |
| `externalUrl` | Third-party destination | Not offered as native Play; no verified playback/subtitle control |
| `infoHash` / `fileIdx` | Torrent metadata | **Not playable** in native Safari/HLS/MP4 without a separately approved resolver |

### Verify the configuration already on this machine

Before trying live sources, run `npm run verify:stremio:config` from the Yoru repository root. This **read-only, offline** audit uses the existing backend configuration loader. It checks `STREMIO_ADDONS_JSON` first, otherwise the ignored `configs/stremio.local.json`; it does not overwrite either or query third-party addon endpoints.

The output reports whether a configuration is present/valid, its source (`server-env` or `local-file`), addon IDs, mapped anime and episode counts. It deliberately **never prints full manifest URLs, addon path segments, tokens or raw config**. Exit code `0` means valid nonempty local configuration, not working live playback; exit code `2` means missing, empty or invalid configuration. Run this command in the actual environment containing the existing source list. Do not paste the original JSON or credentials into issues or chat.

A configured manifest alone does not map every MAL title: each configured addon currently needs explicit MAL ID / Stremio ID / season / episode entries, with bounded config limits. Subtitle addon capability requires a separate manifest/resource check; torrent `infoHash` candidates still need an independently approved resolver. A passing offline audit is **not** a successful HTTPS manifest, video or subtitle test.

A Torrentio-like video addon does not automatically provide the OpenSubtitles/SubSource/SubDL APIs. Stremio `stream` and `subtitles` are separate resources; subtitle-only addons require explicit configuration and verification. Uncontrolled iframe candidates are excluded from Play under D02. Do not assume magnet links can be played directly, enable automatic torrenting or turn the backend into an arbitrary URL proxy. Host, redirect, IP and DNS restrictions must stay enabled.

## Optional Miruro-compatible endpoint

`MIRURO_API_BASE` configures an approved HTTPS origin and is disabled when unset. Deterministic parser and mapping tests do not verify third-party service uptime, authorized content or every release/episode. Do not enable unreviewed endpoints in a public gateway.

## Subtitle adapters

The backend supports opt-in OpenSubtitles, SubDL and SubSource contracts. Configure `OPENSUBTITLES_API_KEY`, `OPENSUBTITLES_ACCESS_TOKEN`, `SUBDL_API_KEY` and `SUBSOURCE_API_KEY` in the **server environment** only. Include a stable `YORU_SUBTITLE_SIGNING_SECRET` in multi-instance deployments if enabled. Never use frontend `VITE_*` variables for secrets.

Search, signed downloads, subtitle languages and actual synchronization require real provider tests. A configuration-status endpoint reports presence, **not** provider health. Process-local budgets (20 search and 30 download requests/minute per Node process) are not public ingress abuse protection; add distributed, identity-aware controls at the gateway.

For live subtitle acceptance, `npm run verify:subtitles:live` requires real operator-approved credentials and untracked fixtures; see [Production readiness](production-readiness.md). Never commit fixtures with entitlement data or publish downloaded subtitle text.

## Provenance, security and troubleshooting

Maintain an approved source inventory with host owner, licensing/permissions, expected formats, codec/CORS evidence, rate limits, expiration behaviour and a revocation contact. Report source failures truthfully; unauthorized/unknown hosts are rejected instead of retried through an open proxy. Read [Security](security.md), [Operations](operations.md) and [Troubleshooting](troubleshooting.md).

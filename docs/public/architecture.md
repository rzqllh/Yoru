# Architecture and Trust Boundaries

**Classification:** documented implementation of the current local-first preview, **not** an audited enterprise platform.

## Logical architecture

```text
Browser / PWA
  React + Vite UI
  Browser-native video / explicit external iframe
  IndexedDB (library, preferences, resume, manual route progress)
  Service worker (application shell)
        |
        v  same-origin /api over loopback or approved HTTPS ingress
Hono API (Node; optional Vercel-compatible function adapter)
  Metadata pipeline       -> Tenrai/MAL and AniList relationships
  Source adapter boundary -> configured local/Stremio/Miruro-compatible sources
  Subtitle boundary       -> configured OpenSubtitles/SubDL/SubSource endpoints
  HTTP guards             -> response headers, input validation, local budgets
        |
        v
External metadata/media/subtitle systems (separate trust domains)
```

A separate HTTPS ingress, identity-aware throttling, authorization, logs and operational monitoring are **not** furnished by the local app. Browser playback requests may contact media hosts directly; CORS, codec, origin and entitlement constraints are enforced by external systems and the client.

## Data flow invariants

1. Catalogue title/episode metadata is never treated as a verified stream.
2. Source candidates are classified and preflighted for the current browser before native playback. Failed providers cannot silently cancel healthy providers; stale requests must not replace a newer episode choice.
3. `infoHash` represents torrent metadata, not a direct video URL. Unverified embeds need explicit user consent and cannot promise subtitles/progress.
4. AniList relation edges enable discovery only. Story chronology needs separately reviewed episode/edition evidence.
5. Library, resume, manual watch-path completion and preferences persist locally and are included in versioned backup; no account backend or cross-device sync exists.

## Runtime and delivery

`npm run dev` runs dev processes; `npm run build` prepares frontend and backend output; `npm start` binds the Node server to loopback by default. A public installation requires **frontend and API together**, HTTPS, protected secrets and an independently approved gateway configuration. [Vercel preview](vercel-preview.md) is a deployment adapter, not production acceptance.

## Failure modes

Upstream catalogues may fail or rate-limit; providers may return empty candidates, invalid mapping, unavailable codecs, expired URLs or partial outages; IndexedDB may be evicted. Surface uncertainty, bounded retries and user-controlled recovery. Use [Troubleshooting](troubleshooting.md) and [Operations](operations.md).

## Explicit non-goals at this stage

No managed account, RBAC, SSO, cloud sync, SLA, certified compliance, universal catalogue, integrated torrent engine, DRM bypass, native mobile packages or full canonical franchise chronology.

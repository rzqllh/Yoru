# Yoru upstream inventory — owner freeze v1

**Purpose:** Candidate catalog and capability audit, not a provider enable list. RG02 chooses breadth of research plus staged activation; RG01 restricts FlyStream to **reference-only**. Source permission, rights/entitlement, host security, runtime and physical Safari evidence are separate gates.

| Candidate | Intended use | What source code/repo shows | Decision/disposition | Missing evidence |
|---|---|---|---|---|
| Tenrai/Jikan MAL-compatible | Existing discovery/browse/detail/episodes | MAL primary in `backend/pipeline/jikan.ts`, fixed Tenrai in `catalog-sources.ts` | Existing transitional catalog, not final hybrid | Field provenance, alternate metadata fallback, provider rights/limits, migration |
| AniList GraphQL | Enrichment, watch graph, MAL ID mapping; proposed hybrid authority | `backend/pipeline/id-mapping.ts` and daily trends exist | P18/P38 desired; RG10 request cannot override terms | Review [AniList terms](https://docs.anilist.co/guide/terms-of-use), [rate limits](https://docs.anilist.co/guide/rate-limiting), suitability and permission |
| Otakudesu / Daily-Tools | Candidate anime source/episode mapping, potential Sub Indo | [Integration PRD](../DAILY_TOOLS_INTEGRATION_PRD_2026-11-10.md) planned; no backend adapter in inspected main | Priority candidate **research**; not activated | License/rights/host, stable mapping, real HLS/MP4, CORS/codec, actual Safari, 403/429 |
| Local configured providers | Browser-safe explicit HLS/MP4 source mapping | `backend/providers/local.ts`; validation and fixtures | Existing opt-in mechanism | Real authorized inventory and device proof |
| Stremio/addons including Torrentio-like | Optional stream/subtitles resources | `stremio.ts`, `stremio-core.ts`; handles direct URL vs `infoHash` vs external | Conditional; torrent postponed P05 | Configured manifests, exact episode, stream segments, subtitle addon and host security |
| Miruro-compatible API | Optional secondary source resolver | `backend/providers/miruro.ts` enabled only with approved env | Existing conditional adapter | Live API, provider mapping, rights, media decode |
| OpenSubtitles, SubDL, SubSource | Independent subtitle APIs | `backend/providers/subtitles.ts` backend-only credential contracts | Existing optional adapters | Real credentials, entitlement, matching file, quota, live caption and iPhone |
| AnimeEmbed | Fixed external embed fallback | Backend `public-embed.ts`/Player iframe, but App D02 exclusion | RG08 permits consented **verified** fallback; integration blocked by mismatch | Provider access, user consent, exact episode, real player behavior, browser controls |
| [anime-sdk](https://github.com/hexxt-git/anime-sdk) | Architecture/provider adapter/identity study | External candidate; not integrated | Read-only evaluation; potential reusable patterns | License, trust, maintenance, provider terms, platform fit |
| [AniStream](https://github.com/iamroidev/anistream) | Gateway and source lifecycle reference | External candidate; not integrated | Read-only architectural evaluation | License, APIs, source rights and independent tests |
| [FlyStream](https://flystream.net) | Study stream selection and multi-source UX | External [direct-streams-providers](https://github.com/phuanh004/direct-streams-providers) documentation describes a companion session/cookie architecture intended for ExoPlayer | **RG01 C: REFERENCE ONLY; DO NOT INTEGRATE** | Do not assume stable public API, authorized scraping or Safari PWA support |
| Other future sources | Candidate unique episode coverage | Must be discovered/reviewed independently | Audit first; activation only after separate authorization | Source owner, permission, URL/DNS/SSRF, accurate episodes, live device playback |

## Source acceptance workflow (planned)

1. **Inventory & provenance:** identify exact project/domain/version, ownership, code license, published provider access rules and authorized content use.
2. **Identity:** confirm canonical anime, season, cour, OVA, specials, movies and release; ambiguity fails closed.
3. **Capabilities:** identify URL type (HLS/MP4/embed/external/torrent), subtitle controls, playlists, CORS, codec, platform support and expiring credentials.
4. **Reliability:** measure healthy/failed/429/timeout patterns and bounded retry/failover. Do not harvest secrets, store protected links in logs or proxy arbitrary destinations.
5. **Live evidence:** actual authorized episode playing in target Safari/Chrome; record SHA/provider/version/browser/OS, observed results, and date.
6. **Decision:** ACCEPT FOR SEPARATELY APPROVED ACTIVATION / REFERENCE ONLY / BLOCKED / REJECTED. A candidate can be useful as a pattern without permission to stream its content.

## Open safety constraints

- RG09's request to automatically overcome anti-bot controls **does not constitute permission** to bypass site access restrictions. Investigate allowed APIs/integrations or keep blocked.
- RG10's demand for always-on AniList/MAL **does not change provider terms or availability**.
- FlyStream must not be treated as an intended Yoru provider merely because a third-party repository contains code for it.
- Do not silently install resolvers, expand proxy allowlists, forward session cookies, bypass DRM or activate torrent.
- The aim is **unique real playable episode coverage**, not the maximum number of configured providers.

**Status:** all named candidates remain either existing conditional adapters, reference-only, or planned/research. No new provider was activated during this documentation work.

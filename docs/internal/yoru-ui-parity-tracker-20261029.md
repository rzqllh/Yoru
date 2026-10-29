# Yoru UI/UX and source parity tracker — 2026-10-29

Owner contract: Glass premium; dedicated watch screen; embed remains *explicit* fallback; one subtitle menu with upload; numbered video choices; hybrid cinematic home; custom responsive controls. Preserve Q1–Q12, no public promotion before release gates.

| Requirement | Delivered in this branch | Release status |
|---|---|---|
| First-party player | Native HLS/MP4 transport with seek, volume, speed, PiP, fullscreen, subtitle panel | Browser E2E verification required |
| Embed fallback | Distinct mode, user-visible subtitle limitation; never claim iframe controls can be restyled | Real embed playback remains unverified |
| Indonesian subtitles | Per-anime and global language preference, local SRT/VTT upload, existing external SubDL/OpenSubtitles/SubSource adapters | Stremio addon path added, with Indonesian/English original tracks only; live files and provider credentials still need proof, no machine translation or dubbing |
| Nuvio/Stremio addon parity | Validated opt-in server-side Stremio mapping via `STREMIO_ADDONS_JSON`, streams via existing whitelist | Mapped /subtitles/series resource and pinned-HTTPS download implemented; manifest-based discovery, addon credentials, remote content live tests, and Nuvio-specific plugin runtime remain out of parity |
| Navigation | Header has a single discover action, search input stays in browse | Browser accessibility verification required |
| Browse | Load-more with backend-wide genre/format/minimum score/year/sort filtering and page reset | Deep pagination needs live catalog verification; upstream rate limits may apply |
| Ratings | Public catalog score + detail /10 and age rating where present | User voting/reviews and daily view counts not present |
| Hero | Uses upstream popularity ranking instead of fixed seasonal first item | Actual most-viewed-today requires persisted trustworthy per-day views; cannot claim it yet |
| Settings | Grouped sections, local guest identity (no fake login), subtitle default, source and data controls | Real sign-in and multi-device sync require a separate authenticated data architecture |
| Source ranking | Declared video resolution and Indonesian subtitle cues with stable ties | Declared metadata rank is not measured feed quality. Actual browser preflight is still required; sustained reliability needs real-source telemetry |
| Source parity reference inventory | Kazumi, CloudStream AnimeX/Indonesia, anime-sdk, Wajik, Nonton Indo, Tatap, Stremio protocol, Nuvio addon spec | API behavior and license/source legality must be individually checked; do not copy incompatible code |
| Production | Only preview deployments on separate branch | Issue #20 strict release gates remain open; do not merge into production-triggering main prematurely |

Nuvio supports Stremio-compatible HTTP addon resources including subtitles, whereas Nuvio-specific QuickJS plugins are a distinct runtime. Stremio subtitle resource accepts a file URL, language and label. Matching a MAL anime ID to an addon-specific IMDB/TMDB/season/episode ID requires explicit mapping and cannot be guessed. Never fabricate a Subtitle Indonesia track, translation, dubbed audio, daily view count, or source-quality result.

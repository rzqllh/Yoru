# Yoru UI/UX and source parity tracker — 2026-10-29

Owner contract: Glass premium; dedicated watch screen; embed remains *explicit* fallback; one subtitle menu with upload; numbered video choices; hybrid cinematic home; custom responsive controls. Preserve Q1–Q12, no public promotion before release gates.

| Requirement | Delivered in this branch | Release status |
|---|---|---|
| First-party player | Native HLS/MP4 transport with seek, volume, speed, PiP, fullscreen, subtitle panel | Browser E2E verification required |
| Embed fallback | Distinct mode, user-visible subtitle limitation; never claim iframe controls can be restyled | Real embed playback remains unverified |
| Indonesian subtitles | Per-anime and global language preference, local SRT/VTT upload, existing external SubDL/OpenSubtitles/SubSource adapters | Real providers need credentials and live episode evidence; no machine translation or dubbing |
| Nuvio/Stremio addon parity | Validated opt-in server-side Stremio mapping via `STREMIO_ADDONS_JSON`, streams via existing whitelist | Subtitle addon resource, manifest-based discovery and safe remote subtitle download NOT yet implemented; Nuvio plugin runtime is a different protocol |
| Navigation | Header has a single discover action, search input stays in browse | Browser accessibility verification required |
| Browse | Load-more with genre/format/score/year/sorting filters for **loaded** results | Catalog-wide server-side filtering and deep pagination remain open |
| Ratings | Public catalog score + detail /10 and age rating where present | User voting/reviews and daily view counts not present |
| Hero | Uses upstream popularity ranking instead of fixed seasonal first item | Actual most-viewed-today requires persisted trustworthy per-day views; cannot claim it yet |
| Settings | Grouped sections, local guest identity (no fake login), subtitle default, source and data controls | Real sign-in and multi-device sync require a separate authenticated data architecture |
| Source ranking | Declared video resolution and Indonesian subtitle cues with stable ties | Actual network throughput/reliability weighting needs playback telemetry and real providers |
| Source parity reference inventory | Kazumi, CloudStream AnimeX/Indonesia, anime-sdk, Wajik, Nonton Indo, Tatap, Stremio protocol, Nuvio addon spec | API behavior and license/source legality must be individually checked; do not copy incompatible code |
| Production | Only preview deployments on separate branch | Issue #20 strict release gates remain open; do not merge into production-triggering main prematurely |

Nuvio supports Stremio-compatible HTTP addon resources including subtitles, whereas Nuvio-specific QuickJS plugins are a distinct runtime. Stremio subtitle resource accepts a file URL, language and label. Matching a MAL anime ID to an addon-specific IMDB/TMDB/season/episode ID requires explicit mapping and cannot be guessed. Never fabricate a Subtitle Indonesia track, translation, dubbed audio, daily view count, or source-quality result.

# Using Yoru

Yoru is a browser-first anime discovery and viewing preview. It does not guarantee streaming, subtitles, user accounts or synchronization across devices.

## Discover and inspect

Use Beranda or Jelajahi to browse catalogue metadata, search titles and open anime details. Discovery filters for category, genre, media type, score, year and sorting can be represented in the URL; browser Back/Forward and reload should preserve supported filter state. Metadata can be incomplete or unavailable if an upstream service fails.

## Understand source states

1. **Candidate / belum diverifikasi:** a configured provider returned metadata; playback is not established.
2. **Checking:** Yoru is checking a native source against browser capability.
3. **Verified for the current check:** an accessible native stream passed the browser preflight; this is not future uptime or license evidence.
4. **No candidate:** a healthy provider returned no source; distinguish this from a failed provider.
5. **Provider failed / unavailable:** network, rate-limit, mapping, codec or media problems require explicit recovery.
6. **External embed / hard-sub:** an unverified third-party iframe is **not a playable Yoru option** under D02, even if a provider lists it. Subtitle controls, progress events and Indonesian language are not assumed.

No automatic or manual in-player fallback may turn an unverified iframe into a playable source. Torrent hash-only choices remain non-playable without a separate approved resolver.

## Player and subtitles

Use native HLS/MP4 where supported. Quality starts at **Auto**; specific resolution choices appear only when the actual media manifest supports them. Subtitle tracks, VTT styling, offsets, fullscreen and PiP are limited by the source and browser. Hard subtitles and third-party iframes cannot be restyled by Yoru as native subtitle cues. Subtitle language preference can be saved locally; real track compatibility is still source-specific.

## Watch Guide

Open Jelajahi → Panduan urutan anime or a title's story link. **Tahun rilis** orders mapped entries by release metadata. **Kronologi** is unavailable until a reviewed story chronology exists for the selected title. Curated Fate, Monogatari, Haruhi and Re:ZERO routes are editorial recommendations/edition-specific arrangements, not a universal canonical chronology. A route step opens a detail page, not automatically the mapped episode. See [Watch Guide](watch-order.md).

## Library, resume and backup

Collections, progress, route progress and preferences use local browser storage (IndexedDB). The collection page supports filtering by watch status and sorting by recently saved, title A–Z, known score or release year; that sort choice is remembered in this browser. Unknown scores/years sort last, rather than inventing metadata. Manual route completion is not evidence of video watched. Source memory and resume are subject to re-verification; previous stream URLs may expire.

Use the in-app backup export/import controls before changing devices, reinstalling the browser or clearing site data. Backups are local files containing library/progress/preferences; treat them as personal data. No account-based sync is implemented.

## Privacy and support

Yoru does not provide managed accounts or cloud backup. External catalogue, media and subtitle requests reveal information to their respective providers. See [Security and privacy](security.md) and [Troubleshooting](troubleshooting.md).

# Yoru Design System

**Status:** living design specification for the preview application; design compliance is measured through code and accessibility testing, not inferred from this document.

## Product principles

1. Anime-first information hierarchy. A user can discover a title, evaluate source readiness, open a verified player when possible, and return to a locally saved library.
2. Honesty over simulated completeness. A source candidate is not a playable video; a linked story relation is not chronological canon; a subtitle option is not proof of a synchronized Indonesian track.
3. Local-first privacy. Persist only necessary viewing and preference data; provide backup, import and removal guidance.
4. Progressive enhancement. Browser WebKit and mobile ergonomics are in scope; unsupported OS/media controls must be disabled with plain-language explanations.
5. Accessible by design. Keyboard-operated controls, visible focus, discernible names, contrast, responsive text, reduced-motion accommodations and modal focus management are acceptance requirements, not marketing claims.

## Information architecture

Current canonical sections: Beranda (`/`), Jelajahi (`/jelajahi`) with **Musim ini** and **Populer** categories, independent **Akan Datang** (`/jelajahi/akan-datang`), secondary Panduan urutan (`/jelajahi/panduan-urutan`), Koleksi (`/koleksi`) and Pengaturan (`/pengaturan`). Watch Guide and Akan Datang are destinations, not genre tabs. Preserve reload and Back/Forward context. A shareable full-page mobile anime Detail route remains planned (Phase 05), not implemented.

## Visual language

Glass surfaces may provide depth but must preserve legible text and controls. Use existing design tokens in `frontend/src/styles.css` as implementation source of truth. Avoid arbitrary one-off colors, excessive blur, fake metrics, decorative cards without functions and exaggerated product copy. Test at narrow mobile widths, safe-area insets, text zoom and landscape orientation.

## Core components

- Catalogue cards: image alt text or decorative handling; title, type and available metadata; no misleading Play badges. Home **Anime Popular** uses consistent 2:3 mobile posters; visible item counts are not total catalog counts. AniList-primary D03=3A is an approved planning contract, but existing Tenrai/MAL data is transitional until a reversible migration is authorized.
- Source selector: candidate/checking/verified/unavailable/error states; unverified external iframe/hard-sub has **no playable fallback** under D02. A torrent-only `infoHash` remains unavailable without separately approved resolver. Never label candidate availability as decoded media.
- Player: native Auto quality when manifest-backed; video and subtitles controls conditional on actual capabilities.
- Watch Guide: exactly two timeline choices; disable unsourced chronology; keep editorial route, edition and spoiler context explicit.
- Dialogs: initial focus, focus return, Escape behaviour and error messaging.

## Design QA checklist

Check keyboard order, accessible labels, status announcements, contrast, zoom, touch targets, overflow, reduced motion, mobile safe areas, subtitle overlay compatibility, and actual physical Safari acceptance. Use [quality gates](docs/public/quality-gates.md) for test evidence and [production readiness](docs/public/production-readiness.md) for release blockers.

Do not claim blanket WCAG AA compliance without an independently documented audit.

## Current contract and evidence boundaries (2026-11-01)

- D03=3A: AniList-primary future metadata with verified nullable MAL aliases, not a completed migration. Preserve existing links, local library/backup and provider identity until tested and separately approved.
- Stremio addon `stream` and `subtitles` are independent declared resources; OpenSubtitles, SubSource and SubDL direct adapters remain separate. Default to Indonesian, require explicit English consent, preserve Off; native caption defaults are compact and browser-capability aware.
- Phase 03 hero supports eight-second eligible rotation, hover/focus/touch pause, and swipe; real iPhone and production evidence remain outstanding. Phase 05 shareable full-page mobile Detail is still planned.
- A design change is **CODED** when merged; fixture-tested CI, actual live provider and physical iPhone acceptance are different evidence levels. Public release #20 G1–G6 remains NO-GO.

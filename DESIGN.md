# Yoru Design System

**Status:** living design specification for the preview application; design compliance is measured through code and accessibility testing, not inferred from this document.

## Product principles

1. Anime-first information hierarchy. A user can discover a title, evaluate source readiness, open a verified player when possible, and return to a locally saved library.
2. Honesty over simulated completeness. A source candidate is not a playable video; a linked story relation is not chronological canon; a subtitle option is not proof of a synchronized Indonesian track.
3. Local-first privacy. Persist only necessary viewing and preference data; provide backup, import and removal guidance.
4. Progressive enhancement. Browser WebKit and mobile ergonomics are in scope; unsupported OS/media controls must be disabled with plain-language explanations.
5. Accessible by design. Keyboard-operated controls, visible focus, discernible names, contrast, responsive text, reduced-motion accommodations and modal focus management are acceptance requirements, not marketing claims.

## Information architecture

Canonical sections: Beranda (`/`), Jelajahi (`/jelajahi`), discovery categories, secondary Panduan urutan (`/jelajahi/panduan-urutan`), Koleksi (`/koleksi`) and Pengaturan (`/pengaturan`). The Watch Guide is a secondary discovery flow, not a global filter. Route state must support reload and browser Back/Forward.

## Visual language

Glass surfaces may provide depth but must preserve legible text and controls. Use existing design tokens in `frontend/src/styles.css` as implementation source of truth. Avoid arbitrary one-off colors, excessive blur, fake metrics, decorative cards without functions and exaggerated product copy. Test at narrow mobile widths, safe-area insets, text zoom and landscape orientation.

## Core components

- Catalogue cards: image alt text or decorative handling; title, type and available metadata; no misleading Play badges.
- Source selector: candidate/checking/verified/unavailable/error states; explicit opt-in for unverified embed fallback.
- Player: native Auto quality when manifest-backed; video and subtitles controls conditional on actual capabilities.
- Watch Guide: exactly two timeline choices; disable unsourced chronology; keep editorial route, edition and spoiler context explicit.
- Dialogs: initial focus, focus return, Escape behaviour and error messaging.

## Design QA checklist

Check keyboard order, accessible labels, status announcements, contrast, zoom, touch targets, overflow, reduced motion, mobile safe areas, subtitle overlay compatibility, and actual physical Safari acceptance. Use [quality gates](docs/public/quality-gates.md) for test evidence and [production readiness](docs/public/production-readiness.md) for release blockers.

Do not claim blanket WCAG AA compliance without an independently documented audit.

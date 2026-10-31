# Yoru checkpoint — source picker untrusted metadata

Date: 2026-11-01 (Asia/Jakarta)
Branch: `feat/source-picker-untrusted-metadata-20261101`
Base main: `e5812270dd13843a04bbb4bb15fe921520917856`

## Audit
- Main HEAD matches base; main CI https://github.com/rzqllh/Yoru/actions/runs/41238271758 and Chromium/WebKit https://github.com/rzqllh/Yoru/actions/runs/41238271636 both completed SUCCESS (four jobs).
- PR #77 remains draft; Issues #44 and #78 remain open; release #20 blocked. No live acceptance claimed.
- `summarizeSourceSearch` accepts candidates with `tracks` null/missing and non-string `quality`. The source picker renders `stream.tracks.some(...)` and interpolates `stream.quality`; malformed provider metadata can crash React despite a valid media URL.

## Scope and gates
- Isolated frontend source metadata normalization and unit regressions; do not alter Supabase, provider live, resolver, Vercel, production or release.
- Await exact-HEAD CI Linux/Windows + Chromium/WebKit on PR, then publish evidence to PR/#44, remove this entire handoff folder before merge.

## Status
CODED: normalization now removes malformed tracks/quality, enforces native candidate URL safety, and adds three deterministic regression tests. Local execution unavailable (repository Git transport inaccessible in this runtime). Exact-head CI and browser results PENDING.

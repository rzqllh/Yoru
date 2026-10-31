# YX-16 poster loading — 31 October 2026

Base main dfd1f5baa5ec0bbbcfe9a05c636e14b0b0548981. #92 merged and exact main CI/browser verified. #93 remains draft, prepared SQL correction not applied. Production remains 74144ef with quota blocked; automatic Git deployment disabled.

CODED: replace eager CSS poster requests with native lazy/async-decoded images in the existing size-constrained wrapper, retain accessible wrapper label and fallback on image load failure. Hero cover remains unchanged; no claim of measured Core Web Vitals. Browser regressions check visible image decode and error fallback without layout collapse in Chromium and WebKit.

PENDING: unit/lint/typecheck/build plus exact-SHA Linux/Windows/Chromium/WebKit. Move evidence to PR/#44 and delete handsoff before merge. No architecture, data store, Supabase, provider, deployment or release change.

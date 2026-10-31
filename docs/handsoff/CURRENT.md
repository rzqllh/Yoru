# Yoru engineering checkpoint — YX-06 source-memory privacy projection

Date: 2026-10-31
Base main: `18075c4affa62c1d4f1b39ab1452a79a9cb58f5b`
Branch: `fix/yx06-source-memory-projection-20261031`
Status: CODED, UNTESTED (awaiting exact-head GitHub Actions).

Implementation: explicit projection in `parseSourceMemory`; regression checks malformed imported URL/token/header fields are dropped. No tests claimed yet.

Scope: ensure parsed persisted source memory exposes only version/providerId/format/updatedAt even when a backup or IndexedDB record contains extra URL/token-like keys. Preserve version 1 and legacy anime-wide fallback, never assume a remembered provider is playable. Only source-memory helper and focused regression test are in scope.

Verification gates: unit and Linux/Windows CI plus Chromium/WebKit E2E at exact final clean HEAD; delete this handoff folder before merge. No live provider, Supabase, hosting, production, release or secret changes.

# Yoru — temporary engineering checkpoint (2026-11-01)

- Baseline main: `005aee1f1015fbc0f7bd70c329922716a0edb9d0`; CI #41274566351 and Browser #41274566390 each completed SUCCESS (two jobs). This is fixture evidence, not live provider/iPhone acceptance.
- Open PR: #77 remains DRAFT (cloud). Issues #44/#78 remain OPEN. Release #20 BLOCKED.
- Isolated branch: `fix/y04-canonical-minscore-20261101`. Code/test head before this handoff: `a5348a36ef29eec36853b1f51ee859619aeae9e9`.
- Scope: reject noncanonical `minScore` URL encodings (exponent, hex, padding, whitespace, duplicated parameters) rather than silently selecting score 7/8/9. Canonical 7/8/9 and numeric UI state remain supported.
- Files: `frontend/src/lib/router.ts`, `tests/router.test.mjs`, `tests/browser/yoru.spec.mjs`.
- Unit, Linux/Windows CI and Chromium/WebKit: PENDING for this branch head. No PASS claim yet.
- No Supabase, provider, resolver, secret, hosting, release, branch cleanup or production change.
- Before merge: publish exact CI evidence in PR and #44, remove both temporary handoff files, rerun checks on final cleanup head, verify main has no handoff directory.

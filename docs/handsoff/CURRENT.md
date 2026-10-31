# Yoru isolated engineering checkpoint — 2026-11-01

Status: AUDITED / IMPLEMENTATION PENDING. Work branch: `fix/subtitle-file-id-validation-20261101`.

## Audited baseline
- main HEAD `bb9c95ae1611f10e83e525c287e10654eb7e28d7` (#112).
- Main exact-head CI Linux/Windows SUCCESS: https://github.com/rzqllh/Yoru/actions/runs/41229828524
- Main exact-head Chromium/WebKit SUCCESS: https://github.com/rzqllh/Yoru/actions/runs/41229828494
- Open PR: #77 draft (OTP/RLS live acceptance deferred).
- #44 open engineering epic; #78 open live sync acceptance; #20 release BLOCKED.
- No `docs/handsoff/` in audited main tree. No production deployment authorized.

## Scoped defect
- `normalizeOpenSubtitles` uses `Number(file.file_id)`, coercing booleans and arrays into valid file IDs.
- `normalizeSubSource` uses `String(value.id)`, coercing arrays into valid-looking IDs.
- Fix only malformed provider file-ID normalization; retain legitimate positive integer and decimal-string identifiers.

## Next gates
- Add regression tests and guard both ID parsers.
- CI Linux/Windows and Chromium/WebKit on exact PR head; record actual results, not assumptions.
- Move evidence to PR/#44, delete temporary handoff files before merge, recheck exact-head gates and main after merge.
- External blockers (live providers, physical iPhone, Supabase OTP/RLS, hosting, release, historical branches) remain deferred.

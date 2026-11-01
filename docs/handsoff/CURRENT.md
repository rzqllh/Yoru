# Yoru engineering checkpoint — 2026-11-01

- Baseline main: `18f3694eb9440d3eeb9a9a873f548354de084ed1`; baseline [Linux/Windows CI SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41253384007) and [Chromium/WebKit SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41253383991).
- Audit: PR #121 open and isolated, PR #77 draft; Issue #44/#78 open, release gate #20 BLOCKED.
- Scope: strict primitive numeric MAL IDs/episode numbers and enum subtitle mode validation in local JSON provider only. No provider-live or cloud changes.
- Code: `backend/pipeline/validate.ts`; four regression cases in `tests/local-provider-validation.test.mjs`.
- PR #121 original head `596f326250ebe859b0d0a25d10411eff25036266`: [Linux/Windows CI SUCCESS, 2/2 jobs](https://github.com/rzqllh/Yoru/actions/runs/41256811876), including unit tests.
- [Chromium/WebKit workflow](https://github.com/rzqllh/Yoru/actions/runs/41256811874) attempt 1 CANCELLED, both browser jobs cancelled during `playwright install --with-deps`; logs show stalled Ubuntu apt repository fetch and no browser tests executed. Attempt 2 requested; NOT VERIFIED. Do not merge until exact final head browser and CI SUCCESS.
- Next: preserve factual evidence in PR #121 and Issue #44, remove this temporary handoff folder, recheck exact final head workflows, merge only if all pass, verify main.
- Deferred: OTP/RLS two users, physical iPhone, authorized live media/subtitles and resolver, production hosting, release gate #20, historical branches. No Supabase/secret/production/release operations.

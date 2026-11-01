# Yoru — temporary checkpoint tracker (2026-11-01)

| Slice | State | Evidence / remaining work |
| --- | --- | --- |
| Main baseline | VERIFIED | `005aee1`, CI 41274566351 and browser 41274566390 SUCCESS 4/4 |
| Browse URL score parser | CODED / NOT YET TESTED | Branch `fix/y04-canonical-minscore-20261101`, code/test commit `a5348a36ef29eec36853b1f51ee859619aeae9e9`; canonical-only score 7/8/9 |
| Unit regression | TESTED on `a4b4ce7` | Linux/Windows [CI #41275235040](https://github.com/rzqllh/Yoru/actions/runs/41275235040) SUCCESS 2/2; malformed and canonical URL cases |
| Browser regression | TESTED on `a4b4ce7` | [Chromium/WebKit #41275235061](https://github.com/rzqllh/Yoru/actions/runs/41275235061) SUCCESS 2/2; deterministic deep-link fixture, not physical iPhone |
| Handoff cleanup | PENDING | Transfer proof to PR/#44, delete these files, final-head checks |
| External acceptance | DEFERRED | #77/#78 OTP/RLS, physical iPhone, live source/subtitle, resolver permission, hosting and #20 |

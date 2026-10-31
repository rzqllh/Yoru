# Yoru checkpoint tracker — 2026-11-01

| Item | Status | Evidence |
| --- | --- | --- |
| Audit main/PR/CI/#44/#78 | VERIFIED | Base `f36e95c`; base CI + browser SUCCESS |
| Fractional/unsafe upstream MAL anime ID guard | CODED, UNTESTED | `backend/pipeline/normalize.ts` |
| Fractional/unsafe episode number guard | CODED, UNTESTED | `backend/pipeline/normalize.ts` |
| Unit regression tests | TESTED on PR head | `tests/catalog-identity.test.mjs`; CI 41252952889 SUCCESS |
| PR CI Linux/Windows + Chromium/WebKit | TESTED on PR head `dee12f8` | CI 41252952889 + Browser 41252952890 SUCCESS (4 jobs) |
| Live provider, iPhone, cloud, production, #20 | DEFERRED | External gates; not in scope |

After CI, update these records on work branch; copy evidence to PR/issues; delete `docs/handsoff/` before merge.

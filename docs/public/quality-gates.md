# Quality and Acceptance Gates

**Principle:** every acceptance claim is tied to a concrete code commit, environment, sample and evidence URL. A mocked contract test cannot certify a real provider or physical Safari.

## Engineering pipeline

| Layer | Evidence | Interpretation |
| --- | --- | --- |
| Lint/typecheck | `npm run lint`, `npm run typecheck` | Static conformance, not product behaviour |
| Unit/contract | `npm test` | Deterministic logic and adapter fixtures |
| Build | `npm run build` | Compiled frontend and Hono backend |
| Combined check | `npm run check` | Local aggregate gate |
| Browser | Chromium Playwright, WebKit-family smoke | Tested browser/fixture only |
| CI | Linux/Windows workflows and exact SHA | Reproducible checks for that commit |
| Live provider | Approved titles, real HTTP search/download and playback evidence | Per-sample external compatibility |
| Physical Safari | Real iPhone model/iOS/browser, playback/PiP/subtitles/PWA upgrade | Device-specific evidence, not Linux WebKit |

## Required PR evidence

Each PR records scope, base/head SHA, changed paths, quality/security impact, exact CI run links and pass/fail outcome. Do not mark **TESTED** until all required workflows for the *same SHA* complete successfully. Canceled, pending or failed jobs are not successes. When merging, repeat acceptance on the merge commit if integration risk or CI requirements demand it.

## Release evaluation

Separate **CODED**, **TESTED**, **LIVE_VERIFIED** and **BLOCKED** statuses. Follow the six public release gates in [Production readiness](production-readiness.md) and [Issue #20](https://github.com/rzqllh/Yoru/issues/20). Each gate needs evidence, owner, timestamp, environment, coverage sample and known exclusions. Security and accessibility evaluation must document exceptions instead of declaring universal compliance.

## Anti-regression invariants

Never equate AnimeList metadata with playable episodes; do not turn torrent hashes into video URLs; exclude unverified iframe fallback from Play under D02; do not fabricate subtitle language, rendition, automatic watch progress or in-story canon; protect local backups and provider configuration. Test source-outage vs empty-response cases, stale-request cancellation, deep links, alternative watch paths, focus behaviour and user-visible errors.

## Sign-off order

Review PR → verify exact SHA CI/browser → merge into integration branch → validate integration → run live/device/infrastructure gates → obtain explicit owner go/no-go → only then consider production deployment or public release.

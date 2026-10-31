# PHASE 02 — Subtitle Correctness, Language Consent and Player UI

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** ADAPTERS/STYLING PARTIAL; NEW D01 FLOW NOT IMPLEMENTED; LIVE BLOCKED. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Subtitle Correctness, Language Consent and Player UI. Dependencies: 01 eligibility; correct source+season identity before subtitle auto selection. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Indonesian subtitle first; if none, prompt explicitly before English; decline/Off remains Off across episode/remount/source.
- Provide familiar system sans baseline approximately 90%, outline/backdrop, safe-area placement, native renderer presets and disabled unsupported controls.
- Use correct MAL ↔ provider season/cour/episode mapping; never hardcode season one for season-three title.
- Validate actual release match, language, subtitle provider status, search/download quota, signed grants and errors.
- Keep external embed without verified subtitle controls ineligible under D02; do not offer cosmetic buttons that cannot affect its iframe.
- Run provider fixture and actual authorized search/download checks for SubDL, SubSource, OpenSubtitles, mapped Stremio addon.

## Existing implementation and evidence at snapshot

- `backend/providers/subtitles.ts` contains adapters and grants; `Player.tsx` has native style/picker, local files and stored preferences.
- Current subtitle search uses `season_number=1` in non-movie queries and native automatic fallback can select English; both conflict with new requirements.
- Embed path bypasses native subtitle search and native caption renderer; hard-subs cannot be re-styled from Yoru parent.
- Live provider G3 has NOT been established; `/api/subtitles/status` reports configuration, not successful download.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

AC-SUB-01..08; do not close #20 G3 with only unit/browser fixtures.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** Episode ambiguity, quota/entitlement, wrong dubbed/hard-sub tracks, third-party formats and grant expiry.
- **Approval needed:** Owner/provider credentials only in server secrets; live authorized test asset; no secrets in docs or PR.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Implement season-aware provider lookup + false-match rejection tests.
2. Implement English opt-in dialog and persisted Off/preference semantics.
3. Verify native styling across Chromium/WebKit then physical Safari; complete three-provider live sign-off.

## Primary files and references

backend/providers/subtitles.ts, frontend/src/components/Player.tsx, frontend/src/lib/caption-appearance.ts, tests/subtitle-providers.test.mjs, tests/stremio-addon-subtitles.test.mjs, scripts/verify-live-subtitles.mjs

## Actual changes / PR / test log

| Field | Current entry |
| --- | --- |
| Phase implementation PR | NOT CREATED for this phase |
| Modified app files | NONE as part of this planning task |
| Implemented SHA | NOT APPLICABLE; baseline only |
| New phase CI / browser tests | NOT RUN |
| Live provider / device verification | NOT RUN in this planning task |
| Phase sign-off | PENDING |
| Next handoff update | On first actual implementation PR or new verified blocker |

**Update protocol:** append dated checkpoint below after each real phase slice. Include PR, diff paths, exact SHA, test URLs, blockers resolved/new, any owner decisions, and follow-up instructions. Do not rewrite an incomplete checkpoint as DONE.

## Checkpoint history

- **2026-10-31 — BASELINE / PLANNING:** handoff initialized from repository, epic/gate and user-approved UX/CX decisions. No code, cloud, production configuration or release change in this handoff.

- **2026-10-31 — D01 SUBTITLE LANGUAGE SLICE CODED / TEST PENDING:** from main `f021a85658895123cbc17e02e0ba55d43cf11d7f`, branch `fix/y02-english-subtitle-consent-20261031`. Change `frontend/src/components/Player.tsx`: external subtitle auto search now selects only Indonesia unless the user has **explicitly stored** English as preference; native <track> and textTracks no longer silently fall back to English. Subtitle panel offers explicit **Gunakan subtitle English** or **Tidak sekarang** when only English is available, preserving Off and manual track choice. English acceptance persists per anime via existing preference path. Code SHA `963b686a0363ed27bdcffbea47a7f47bb0dd564e`. Browser regression tests for English-only external and native-decline in `tests/browser/yoru.spec.mjs` at `528f70a25b405bf4605fbe799364d7d81d600b5a`. **CI/Browser E2E not yet run for this slice; do not claim PASS.** Known issue remains season_number=1 in provider searches (Phase 02 separate slice), live OpenSubtitles/SubDL/SubSource unavailable, 90% caption default and mobile styling not yet delivered. Next: open isolated PR, collect exact-head CI/Chromium/WebKit, correct regressions, append immutable evidence here before merge. No credentials, Supabase, API, hosting or release changes.

- **2026-10-31 — FIRST CI FAILED, FIX PENDING NEW CHECK:** PR #101 at `0ec71831fc1a3baddcf71bfa0d1b805703e7286f` failed [CI lint](https://github.com/rzqllh/Yoru/actions/runs/41221002621) and [browser workflow](https://github.com/rzqllh/Yoru/actions/runs/41221002597). Exact job log Biome errors: `lint/a11y/useSemanticElements` for `div role=group`, `lint/correctness/useExhaustiveDependencies` for reset effect. Replaced with semantic `fieldset` and keyed per-episode dismissal; eliminated effect. Status CODED / RETEST REQUIRED; do not call PASS. No production/provider change.

- **2026-10-31 — D01 FIX VERIFIED ON PR HEAD:** code/test + semantic correction commit `d02aef24e8dfe6a371efd22a148460120987087a`. [Linux/Windows CI](https://github.com/rzqllh/Yoru/actions/runs/41221159658) SUCCESS and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41221159599) SUCCESS (four exact-head checks). Browser fixtures verify English-only external subtitle requires explicit click before download, accepting it loads the track, and declining a native-English offer keeps English inactive. Existing Off/Id behaviours remain in regression suite. **AC-SUB-01/02 = TESTED (fixture only)**; actual provider/iOS verification NOT RUN, Phase 02 incomplete. This documentation-only follow-up changes SHA and requires *final* exact-head checks before merge. No deployment/release.

- **2026-10-31 — D01 MERGED (MAIN CI PENDING):** [PR #101](https://github.com/rzqllh/Yoru/pull/101) merged at [`7a6086880b89c83a854b79165d7b6e1897b38660`](https://github.com/rzqllh/Yoru/commit/7a6086880b89c83a854b79165d7b6e1897b38660). Exact final PR head `e0efbe40d414c6432b7c179977132d947badd219`: [CI Linux/Windows SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41221351877) and [Chromium/WebKit SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41221351895). Historical first lint failure remains recorded. Merged-main [CI](https://github.com/rzqllh/Yoru/actions/runs/41221513226) and [browser](https://github.com/rzqllh/Yoru/actions/runs/41221513384) are still in progress at this writing; verify exact SHA before claiming merged-main PASS. This only completes **D01 fixture-verified slice**; Phase 02 remains PARTIAL: provider season/cour/episode matching, live subtitle APIs, caption appearance/physical Safari and #20 G3 pending. Next safe work: inspect mapping design, avoid hardcoded `season_number=1` and do not auto-select subtitles of unverified season. No hosting, cloud, resolver, credentials or release changes.

- **2026-10-31 — D09 CAPTION DEFAULTS CODED, UNTESTED (NEXT SLICE):** branch `fix/y02-native-caption-defaults-20261031` based on merged-main handoff `36176a11191f475eec1fe8b5b78464c94d8c4aae`. Proposed native subtitle preset keeps Arial/system sans and thin outline, changes default size 100→90% and background 75→50%, adds supported 90% option/CSS cue and regression for persisted legacy 100%/75% values. Files: `frontend/src/lib/caption-appearance.ts`, `frontend/src/components/Player.tsx`, `frontend/src/styles.css`, `tests/caption-appearance.test.mjs`. This does NOT style hard-sub/iframe or certify physical Safari; limited to browser native WebVTT cues, preserving saved per-anime/global settings. **Status CODED, CI NOT RUN YET.** Next: exact-head CI/Linux/Windows/Chromium/WebKit and screenshot/actual device typography acceptance. No production, API, secrets, provider/renderer replacement, or new dependencies.

- **2026-10-31 — D09 CAPTION PRESET TESTED ON EXACT CODE HEAD:** [PR #103](https://github.com/rzqllh/Yoru/pull/103) code/unit/docs head `b56cae508600eb90df086e3cd31d466a054d5d55` passed four CI jobs: [Linux/Windows SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41222013660) and [Chromium/WebKit SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41222013653). Deterministic tests validate defaults, saved legacy options and existing browser regression; they **do not prove physical iPhone native-cue appearance**. This evidence update creates a later docs-only SHA and exact-head CI must be rechecked before PR merge. Remaining Phase 02: provider season/cour correctness, live provider G3, actual iPhone caption legibility and subtitle provider availability.

- **2026-10-31 — D09 CAPTION DEFAULTS MERGED:** [PR #103](https://github.com/rzqllh/Yoru/pull/103) merged to main [`6b13e0016670ab443ebd6cb1d212534656dff44b`](https://github.com/rzqllh/Yoru/commit/6b13e0016670ab443ebd6cb1d212534656dff44b). Final PR head `643b00a115e416831186db59d73187b57ee6a750` passed [CI Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41222189020) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41222188893) (4/4 SUCCESS). Native 90% caption option/default and 50% backdrop implemented; existing saved choices preserved. Exact merge-commit CI must be checked separately. **Phase 02 overall PARTIAL:** no physical iPhone caption appearance sign-off, no verified season/cour/episode mapping, and no live SubDL/OpenSubtitles/SubSource evidence or #20 G3. No production deployment, torrent resolver or provider change. **NEXT:** prioritize fail-closed episode/subtitle season mapping (hardcoded season=1), then cross-provider live sign-off; do not assume season 3 subtitle matches season 1.

- **2026-11-01 — D01 SEASON-IDENTITY FAIL-CLOSED GUARD CODED / NOT TESTED:** branch `fix/y02-explicit-season-subtitles-20261101` based on main `6b85d3c2a5b7a5990e025c8e901c039dbc870fd2` (PR #105 merged episode-identity validation). Code `92a2fd4a4534f2afa62939b81beea402ab9cef05` removes hardcoded `season_number=1` from SubDL/OpenSubtitles requests. Explicit numeric forms `Season 3` or `3rd Season` are recognized only without split Part/Cour ambiguity; provider season is added to supported search query when explicit. For these explicitly titled seasons, SubDL/OpenSubtitles/SubSource candidate normalization now discards missing, malformed and wrong provider season metadata even if episode matches; older season-1 subtitle is never accepted for explicit season 3. Unnumbered/split cour entries do not invent a season number. Regression tests `758d97dc15d3cd623595b72db69ee090efb16bf3` cover 3 vs 1, null metadata, episode matching and query parameters. **CODED; CI NOT RUN.** Important limitation: title parsing is a protective hint, NOT verified MAL↔provider season/cour mapping. It may temporarily suppress subtitles where providers omit season metadata, by design. Live SubDL/OpenSubtitles/SubSource and physical Safari acceptance still BLOCKED. No secrets/config/network host/production or provider deployment changed. Next: exact-head CI, review provider schema; confirm real season/cour mapping with authorized live samples, and keep #20 G3 NO-GO until evidence.

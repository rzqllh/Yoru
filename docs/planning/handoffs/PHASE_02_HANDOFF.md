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

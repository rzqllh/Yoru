# PHASE 03 — Design System, Homepage and Anime Popular

> **Handoff type:** owner-requested persistent project planning, not temporary `docs/handsoff/`.  
> **Snapshot:** 2026-10-31 (Asia/Jakarta) · inspected main `2b6c1d4bb518c4345d50e7849af5f8f7ef53aa1b`.  
> **Status:** EXISTING UI; D06/D07 NOT IMPLEMENTED. **No implementation or tests were executed for this planning-only artifact.**

## Objective and dependency

Design System, Homepage and Anime Popular. Dependencies: 00 design baseline; avoid conflicts with Phase 04/05 editing App/styles. Refer to [Master Plan](../MASTER_PLAN.md), [Phase Plan](../PHASE_PLAN.md), [Tracker](../TRACKING.md) and [Acceptance Matrix](../ACCEPTANCE_MATRIX.md).

## Scope / intended changes (NOT YET DONE)

- Consolidate tokens, spacing, cards, buttons and responsive typography while preserving one visual system and accessible focus.
- Make hero advance at eight-second idle intervals and pause on hover, focus, interaction, hidden tab and reduced motion.
- Remove number 1–10 UI and old arrows/pause UI; support swipe while preserving vertical scroll and keyboard accessible non-gesture navigation/stop.
- Rename section exactly Anime Popular; mobile two-column consistent 2:3 poster, aligned metadata/score/rank without overlap.
- Check safe areas, screen reader, slow network, image fallback and no layout shift.

## Existing implementation and evidence at snapshot

- `App.tsx` already contains an 8,000ms interval, hero number buttons and 3 legacy navigation buttons.
- `styles.css` has multiple mobile card-grid/browse/hero overrides; the user’s iPhone screenshots show inconsistent poster layout and overly dominant controls.
- Design system document `DESIGN.md` exists; visual polish and accessibility are NOT verified for requested updates.

These are baseline observations, not proof that proposed modifications are complete or that public release gates pass.

## Acceptance and quality gate

AC-HOME-01..06 and AC-UX-01..03, screenshots and focus/swipe testing.

Every future check requires **exact SHA**, browser/device/environment, input fixture or live sample, observed result and evidence URL. Do not mark PASS merely because CI once succeeded on another SHA. No production promotion is implied.

## Risks, blockers and owner decisions

- **Risks / blockers:** Removing visual controls may fail accessible carousel operation; replace with minimal accessible pattern rather than fake compliance.
- **Approval needed:** D06/D07 already decided; get owner approval if accessibility-driven visible control differs materially.
- **Responsibilities:** product owner for scope/approval; engineering assignee TBD; QA reviewer TBD. Do not name an agent or person without actual dispatch.

## Next authorized work

1. Establish shared card/grid token component specification.
2. Implement hero behaviour and comprehensive interaction tests in isolated PR.
3. Implement Anime Popular grid and viewport 320/375/390/768/1440 snapshots.

## Primary files and references

frontend/src/App.tsx, frontend/src/styles.css, DESIGN.md, tests/browser/yoru.spec.mjs

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

- **2026-11-01 — D06/D07 HERO INTERACTION SLICE CODED / NOT YET TESTED:** branch `feat/y03-swipe-hero-20261101` from main `503212d1f52a2a07f0014ba3e6fcca87a1d67aa6`. App code `e2e4729f973d61c34de90804397593200fe4f817` removes the 1–10 buttons and legacy previous/pause/next toolbar; keeps eight-second auto advance but pauses on hover, keyboard focus, touch contact, hidden tab, reduced motion and modal/player state. Native horizontal swipe (48px threshold, vertical scroll retained) and keyboard arrows remain available; keyboard focus ring added in CSS commit `d85538c74bf5940454bd2748ddd4b3122a43deea`. Mobile/browser fixture regressions in `184536ab42f50b22ac0a0fdfc88fd286b55a270f` cover auto/hover, touch swipe, no legacy controls and reduced-motion keyboard. Section is renamed **Anime Popular**, with original AniList attribution where relevant. **Current status CODED; CI NOT RUN; not merged.** Next: exact-head CI and browser checks, repair any failures; preserve accessibility. No new packages, source/provider, infra, Supabase, Vercel or deployment changes.

- **2026-11-01 — INITIAL PR #106 CI FAILED; SEMANTIC FIX PENDING RETEST:** first head `c441e289f6ab926c01296b8244f3d89bbc962e6f` failed Biome `lint/a11y/useSemanticElements` on `div role=region` and `lint/a11y/noNoninteractiveTabindex` on focusable `div` ([CI](https://github.com/rzqllh/Yoru/actions/runs/41223790513), [browser](https://github.com/rzqllh/Yoru/actions/runs/41223790489)). These results are **FAIL**, not PASS. Follow-up uses a native named `section` landmark and keyboard arrow actions from existing focusable hero buttons; no artificial tab stop, no new visible controls. Browser tests updated to focus the existing primary action. Exact-head rerun is mandatory. No production changes.

- **2026-11-01 — HERO PR #106 HEAD QA SUCCESS:** code/test head `31342824456901bff7b320af5f7c0f38a5c330e2` passed 4 checks: [CI Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41223942927) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41223942739). Browser tests cover 8-second auto advance, pause on hover, swipe, keyboard arrows via existing hero action button, reduced motion, removal of numbered controls and Anime Popular label. Initial lint failure above remains FAIL historical evidence. **Status TESTED DETERMINISTIC, MERGE PENDING; physical iOS NOT RUN.** New docs-only head must be rechecked before merge.

- **2026-11-01 — PR #107 INTERLEAVING MERGE RESOLVED:** PR #107 subtitle-season guard merged to main `dc2bd4583cdbd410f1a712319e526e66c4bf147b` while PR #106 was open. GitHub rejected the first PR #106 merge due to common edits in `TRACKING.md` and `ACCEPTANCE_MATRIX.md`; no code failure. A two-parent integration commit preserves **all** #107 provider/test/handoff content from main and combines the #106 hero code/tests, Phase 03 handoff and distinct docs rows. Explicit exact-head CI/Chromium/WebKit rerun required; never treat preceding 4/4 as verification of combined head. No force-push, no dropped changes, no production deployment.

- **2026-11-01 — D07 MOBILE POSTER GRID SLICE CODED / CI PENDING:** branch `fix/y03-anime-popular-grid-20261101` from hero-merged main `f21c4a8b2c27705d42dfcc835759c8901a6a2c7f`. Targeted `styles.css` rules make every `.ranked-anime > .anime-card` fill its grid cell, force poster box to consistent **2:3** ratio, preserve full-width title/metadata, and keep rank/score anchored separately. Browser regression checks iPhone-like 320px/390px widths, equal poster/card column widths, 2:3 aspect, non-overlap of score and rank badges, and absence of horizontal overflow. This responds to user-provided uneven poster sizes in Anime Popular screenshot. **CODED, NOT TESTED;** physical iPhone screenshot and real data still not verified. No new assets, packages, routes, data providers, backend or production changes. Hero PR #106 merged; stage remains PARTIAL for other browse/detail UX work.

- **2026-11-01 — HERO + GRID MERGED:** [PR #106](https://github.com/rzqllh/Yoru/pull/106) merged to main `f21c4a8b2c27705d42dfcc835759c8901a6a2c7f`; final merged code includes PR #107 season changes and passed 4/4 CI/Chromium/WebKit checks. [PR #108](https://github.com/rzqllh/Yoru/pull/108) merged to main `b4f35bd46b1d8a6ce3ae66193488ddd7783d7edd`; PR head `0bde4a1857d40cd46ff59cf5ffd66b58c3e68e6b` passed [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41224846356) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41224846533) 4/4. Browser grid fixture exercises 320/390px, 2:3 poster, equal widths and separate badges. **Physical iPhone NOT RUN**, actual production preview NOT VERIFIED; new browse/detail polish remains incomplete. Previous pending notes above are historical and superseded here. [Current recovery state](../CURRENT_STATE.md) is the concise snapshot.

- **2026-11-01 — EXACT MAIN GRID MERGE QA PASS:** on main `b4f35bd46b1d8a6ce3ae66193488ddd7783d7edd`, [Linux/Windows](https://github.com/rzqllh/Yoru/actions/runs/41225040383) and [Chromium/WebKit](https://github.com/rzqllh/Yoru/actions/runs/41225040380) completed **SUCCESS 4/4**. This verifies integrated desktop/automated WebKit fixtures, **not physical iPhone rendering** or public Vercel deployment. Relevant PRs #106/#108 remain integrated; Phase 03 as a whole PARTIAL.

## 2026-11-01 vNext supersession — documentation scope

**2026-11-01 vNext owner supersession.** Inspected GitHub main [`ce12d98`](https://github.com/rzqllh/Yoru/commit/ce12d98678f6e89cefd81516fb641c62df972572); this is **DOCS ONLY**, not hosted/provider verification. D03=**3A AniList-primary** replaces archival D03=3B Tenrai/MAL-primary. D01=1A, D02=2B, D04=4A, D05=5A, D06–D09 retained. Existing Tenrai/MAL code remains until an approved reversible migration.

- Validate merged #106 swipe 8s hero and #108 Anime Popular 2:3 grid at mobile widths; consolidate CSS tokens and spacing with Browse and Detail; physical Safari and accessibility evidence outstanding.
- **Acceptance:** [AC-VN-01–16](../ACCEPTANCE_MATRIX.md) as relevant; exact SHA, browser/device, actual provider sample and result must be recorded. Previous tests are historical; no new PASS claims, live provider configuration, code changes, resolver activation or release from this documentation merge.

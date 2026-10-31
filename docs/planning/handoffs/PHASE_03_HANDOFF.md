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

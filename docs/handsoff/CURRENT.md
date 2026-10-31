# Yoru isolated checkpoint — YX-02 malformed provider candidate items

Date: 2026-10-31. Base main `eac228f6d2a059165ed2beed298cd6c4d7ebd258`.

Scope: validate each item of a fulfilled provider `items` array before returning candidate metadata. Discard malformed entries without dropping healthy streams. Preserve successful empty-result semantics; no claim of playable media. No provider network, Supabase, hosting, release, production or secret changes.

Status: AUDITED; implementation and exact-head CI/browser pending. PR #90 deployment isolation must be resolved before any merge to main. Delete this file and TRACKER.md before merge; transfer evidence to PR/#44.

Implementation checkpoint: `frontend/src/lib/source-lifecycle.ts` now filters malformed entries per item; valid provider records remain visible, malformed-only successful arrays report no-direct, never playable. Unit regressions in `tests/source-lifecycle.test.mjs`. CODED; CI/browser not yet verified.

Pre-cleanup verification: branch HEAD `587ac31ba0940f60c03863479858fdeee3af0387` Linux/Windows CI SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41204637679; Chromium/WebKit SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41204637590. This is deterministic candidate-metadata validation, NOT live playback verification. Remove temporary docs next and rerun exact-head checks.

# Yoru isolated checkpoint — YX-02 malformed provider candidate items

Date: 2026-10-31. Base main `eac228f6d2a059165ed2beed298cd6c4d7ebd258`.

Scope: validate each item of a fulfilled provider `items` array before returning candidate metadata. Discard malformed entries without dropping healthy streams. Preserve successful empty-result semantics; no claim of playable media. No provider network, Supabase, hosting, release, production or secret changes.

Status: AUDITED; implementation and exact-head CI/browser pending. PR #90 deployment isolation must be resolved before any merge to main. Delete this file and TRACKER.md before merge; transfer evidence to PR/#44.

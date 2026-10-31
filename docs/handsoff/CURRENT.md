# Yoru — isolated engineering checkpoint

Date: 2026-11-01 (Asia/Jakarta)
Branch: `fix/y06-guide-mal-id-decimal-20261101`
Base main: `a2c2549a4dc93fbce99309afa533c832295a6631`

## Audit
- GitHub main HEAD: `a2c2549a4dc93fbce99309afa533c832295a6631` (#118 docs/planning integration).
- Exact-main CI: [Linux/Windows SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41245353448) and [Chromium/WebKit SUCCESS](https://github.com/rzqllh/Yoru/actions/runs/41245353371). This does not verify live media or production.
- Open PR: #77 (draft cross-device sync). Issue #44 and #78 remain open; #20 is release gate, deferred.
- No production promotion, Supabase operation, provider live check, or historical branch deletion authorized.

## Slice
Phase 06 canonical Watch Guide deep-link MAL ID. The current `Number(params.get('anime'))` accepts exponent and hex syntax (e.g. `anime=1e3`, `anime=0x10`) and silently opens a different numeric ID. Accept only canonical decimal MAL IDs, preserve valid IDs and no-ID guide landing state. Round-trip serializer should not emit malformed IDs.

## Status
Audit VERIFIED; implementation PENDING; CI/Chromium/WebKit NOT RUN on this branch. Temporary files must be removed before merge. Evidence will be transferred to PR and #44.

## Implementation checkpoint (2026-11-01)
- CODED: `frontend/src/lib/router.ts` rejects exponent, hex, whitespace, leading zero, fractions and overlong MAL IDs in guide URL; `routeToPath` does not emit invalid guide IDs.
- TEST ADDED: `tests/router.test.mjs` and Chromium fixture in `tests/browser/yoru.spec.mjs`.
- Branch code/test HEAD: `be9e83607645f649f7ab7db4abcdba7aee50a234`.
- CI Linux/Windows and Chromium/WebKit: PENDING, not claimed PASS.
- Scope excludes external media, Supabase, hosting, production and release.

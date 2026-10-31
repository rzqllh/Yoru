# Sync validation preparation — 31 October 2026

Base PR #77 HEAD 8b1898fdcd7d22699185dde47c6fb4352432b2f8. Dedicated Yoru ospwrqyfvfxnippknire read-only audit: active, zero users/snapshots, RLS SELECT owner policy, SELECT-only authenticated table grant; public INVOKER/private DEFINER wrappers, empty search_path. Security advisor empty. Applied ledger only 20261031072944 yoru_device_sync_initial.

VERIFIED defect: missing required JSON keys produce NULL in current CHECK and RPC rejection predicates. No database mutation performed.

PREPARED: additive migration with IS TRUE + IS DISTINCT FROM; preserve rows/grants/policies. Align original filename to observed applied ledger (SQL unchanged); portable real PostgreSQL regression with simulated auth roles; strengthen live harness malformed and direct modification rejection and PASS only after cleanup. Automatic Git deployments disabled on proposal branch.

PENDING local checks and Linux/Windows/Chromium/WebKit CI. BLOCKED applying database correction (explicit review/approval), actual OTP/two-account/anon sessions/device acceptance; PR #77 stays draft. No production/release/provider/iPhone action.

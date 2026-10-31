# Yoru deployment checkpoint — 2026-10-31

Branch: fix/vercel-main-auto-deploy-20261031
Base main: 9fab4f11f1975d1a0e6848ee50377d47f970d629

Change: enable Vercel Git production deployments on main in vercel.json. Preserve the blocked historical docs branch.

Evidence: production currently READY on old main 74144ef, while main moved ahead. /api health and catalog production responses not yet verified. CI Chromium/WebKit and unit tests pending PR workflow evidence. No secrets or Supabase changes.

Before merge: transfer evidence to PR/Issue #44 and remove docs/handsoff files. Do not claim release gate #20 complete.

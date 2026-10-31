# 31 October 2026 — deployment safety checkpoint

Base main eac228f6d2a059165ed2beed298cd6c4d7ebd258. Existing exact-head CI Linux/Windows and Chromium/WebKit succeeded. Production remains 74144ef694cd1b452516d424124348e72e05cf5f (dpl_BD2k9vdbtdXw8A65qcAaV28YChe2). Main Vercel status is failure: deployment rate limited, retry in 24 hours.

VERIFIED: production commit has no api/index.ts or API rewrite; public /api/health and /api/anime/discover return 404; direct Tenrai top/seasons return 200. These explain why production metadata cannot load. Current adapter is not deployed there.

Safety: Vercel project update acknowledged commandForIgnoringBuildStep=exit 0. This branch disables all automatic Git deployments using documented git.deploymentEnabled=false; no production operation authorized.

PENDING: exact-head CI and browser checks on this branch. BLOCKED: hosted latest-SHA verification under quota; dedicated Yoru Supabase, OTP/two-user RLS, physical iPhone, live providers/subtitles, release #20. Move this evidence to PR/#44/#20 and remove docs/handsoff before merge.

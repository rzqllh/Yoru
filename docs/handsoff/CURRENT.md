# Yoru engineering checkpoint — 31 October 2026

- Baseline main: `9fab4f11f1975d1a0e6848ee50377d47f970d629`.
- PR #88: https://github.com/rzqllh/Yoru/pull/88
- YX-01 CODED: reject negative/non-finite media duration as a resume target; zero remains unknown and resumable, valid positive durations retain prior threshold.
- Unit regression included in repository `npm run check` CI.
- Pre-cleanup feature HEAD `4f4aa823a8d933a2de61f3b07924625e499dfc5c`:
  - Linux/Windows CI SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41198221079 (validate + Windows).
  - Chromium/WebKit SUCCESS https://github.com/rzqllh/Yoru/actions/runs/41198221064 (chromium + webkit-smoke).
- **Not final-head evidence:** remove handoff and rerun CI/browser on final clean commit before merge.
- PR #77/#78 and #20 remain blocked; no Supabase, live media/iPhone, hosting, secrets or production action.

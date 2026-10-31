# Yoru engineering checkpoint — source quality label safety

- Base main: `5496aae29a28c6c9a6f7ee572271869664059a54` (2026-10-31).
- Open PR: #77 draft; Issue #44 epic open; #78 cross-device live acceptance open.
- Base main CI Linux/Windows: https://github.com/rzqllh/Yoru/actions/runs/41212085773 — SUCCESS.
- Base main Chromium/WebKit: https://github.com/rzqllh/Yoru/actions/runs/41212085760 — SUCCESS.
- Scope: `rankNativeStreams` metadata ranking only; reject bitrate/other numeric labels masquerading as height while preserving explicit 720p/1080p and stable ties.
- Acceptance: unit regression for `1080kbps`, `2160kbps`, `1080px`, explicit `1080p60`, no provider calls; exact-head PR CI + Chromium/WebKit required before merge.
- State: VERIFIED on pre-cleanup branch SHA `18aefb6999d91fbda3b9720ae065816295c74507` — Linux/Windows CI https://github.com/rzqllh/Yoru/actions/runs/41217706937 SUCCESS; Chromium/WebKit https://github.com/rzqllh/Yoru/actions/runs/41217706789 SUCCESS. Final cleanup SHA requires fresh checks before merge.. Do not infer actual stream playability from quality labels.
- Guardrails: no Supabase, provider live, Vercel deployment, release, secrets or historical branch deletion. `vercel.json` disables Git deployments.
- Before merge: transfer evidence into PR and Issue #44, remove this folder, recheck exact head and `main` CI.

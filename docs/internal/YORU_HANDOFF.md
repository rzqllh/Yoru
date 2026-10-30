# Yoru — Durable cross-model handoff
Last updated: 2026-10-30, Asia/Jakarta. Source of truth: **GitHub**, not remembered conversational output.

## First actions for any new model/agent
1. Fetch https://github.com/rzqllh/Yoru/issues/44 and https://github.com/rzqllh/Yoru/issues/20.
2. Fetch `docs/internal/YORU_TASK_TRACKER.md` and THIS file from latest `deploy/vercel-preview-20261029`. If not yet merged, use the currently open continuity-tracker PR.
3. Inspect exact preview HEAD, latest 10 commits, open PRs, CI+Browser E2E on matching SHA, and Vercel preview status.
4. Resume the highest priority unblocked task. Never repeat code already merged. Change only isolated feature branch. Never assume a preview deploy is healthy merely because status=READY.
5. Before ending any coding segment: update tracker statuses, this handoff, epic issue #44; include PR URL, SHA, tests **actually run**, blockers, next resume step. Complete documentation changes **after** feature work, not in early slices.

## Owner decisions (APPROVED)
- Yoru: anime-focused, glass-premium but restrained mobile-first PWA, local-only library/progress; accounts/cloud explicitly deferred.
- Top 10: AniList daily activity with source attribution, safe catalog popularity fallback (PR #43 merged on preview).
- Hero: rotates every 8 seconds with manual previous/next/pause; respects reduced motion.
- Sub Indo: real Stremio subtitle candidates first, Indonesian alternatives, English fallback when appropriate; manual user preference must be respected.
- Watch guide: detail-page connections between TV/OVA/Special/Movie; order modes **recommended for new viewers**, **in-universe chronology**, **release order**.
- Fate-like franchises: **branching paths**, not one linear false chronology; spoiler-safe, owner-curated or verifiably sourced, optional vs required labels, no invented canonical sequence.
- Discover: standalone secondary guide `/jelajahi/panduan-urutan` without disrupting season/popular/upcoming primary browse.
- Subtitle customization: typography, size, position, text/background opacity, stroke/backdrop and preview; control only if supported by native subtitle pipeline; iframe/hardsub controls must clearly be unavailable.
- Source fallback: **Torrentio/YTS-style Stremio addon ecosystem**, **not a separate download-manager UX**. Distinguish direct playable HTTPS streams from torrent hashes; feature-gate opt-in engine/resolver. Do not invent torrent playback in iOS Safari.
- Quality/controls: unsupported choices hidden or disabled; do NOT display clickable 1080p absent a valid representation. Auto ABR default when available.
- Parallel work allowed in isolated nonoverlapping branches; user requested subagents if available. This session has no independent coding subagent invoker; parallel GitHub reads and nonconflicting PR branches are possible.
- No main/prod/release promotion before #20 release gates; update public docs at END.

## Current checked facts (2026-10-30)
- Repo: `rzqllh/Yoru`; `main` was `8200bf235c56c866e30b2012d3b683b63dc7803e`.
- Preview integration branch `deploy/vercel-preview-20261029` was `c80150ddfed5e82a86791cbf582157a06ad5f169`; #43 merged into preview and its CI+Browser E2E completed successfully at feature SHA `54c51e8`.
- Vercel project `yoru` connected; preview build of `c80150d` READY but SSO-protected. /api/health, real source+subtitle downloads and physical iPhone **not freshly verified**.
- #33 hosting adapter PR is draft and targets `main`; do not merge by accident.
- Backend `stremio-core.ts` currently rejects `infoHash`-only streams and only admits direct .m3u8/.mp4 HTTPS. `stremio.ts` requires explicit MAL-to-Stremio season/episode mapping; do not infer arbitrary IDs.
- UI current `Continue Watching` card opens anime detail rather than episode+resume.
- CSS tokens in `DESIGN.md` and late `styles.css` overrides drift; fix carefully.
- The tracker documents tasks, not completed promises. Expect changes since this timestamp; VERIFY repo HEAD first.

## Current in-flight code slices
- `feat/yoru-honest-quality-20261030`: automatic HLS quality baseline, exact-manifest options, disabled manual-quality when unsupported, unit tests. Not merged or CI-verified until linked PR checks finish.

## Architecture boundaries
- `frontend/src/App.tsx`: UI state, home, browse, library, detail. `frontend/src/components/Player.tsx`: direct media player and subtitle controls.
- `backend/pipeline/jikan.ts`: Jikan/Tenrai catalog API; separate AniList relations may need new fixed-host API with strict timeouts.
- `backend/providers/stremio-core.ts` and `stremio.ts`: allowlisted addon parsing/HTTPS fetching with SSRF protection.
- `frontend/src/lib/db.ts`: versioned IndexedDB; exported backup schema is user data, must preserve compatibility on migration.
- `.github/workflows/ci.yml` + `browser-e2e.yml`: Linux/Windows/Chromium/WebKit; verify exact PR head.
- User-facing docs live in `README.md`, `docs/public/*`, `DESIGN.md`; update them only as last completed phase.

## Status protocol / handoff template to append at each milestone
```text
CHECKPOINT DATE/TZ:
INTEGRATION BRANCH + EXACT SHA:
WORKING BRANCH / PR URL / EXACT HEAD:
TASK IDS: [PLANNED/CODED/TESTED/LIVE_VERIFIED/BLOCKED]
CHANGES: concise file-level summary
EVIDENCE: tests/CI/deployment, exact links + PASS/FAIL/NOT RUN; distinguish mocked from live
BLOCKERS: internal vs owner-provided, no secrets
DECISIONS: approved vs still undecided
CONFLICT CHECK: pending overlapping PRs/shared paths
NEXT ACTION: one exact resumable step
DO NOT DO: merge main, prod deploy, live claims without #20 go
```

# 12 — Testing, Evidence, Quality Gates and Blocker Handling

**Status:** Proposed testing contract; **NOT a test-execution report**. Actual repo has `npm run check`, Node tests, Playwright/Chromium/WebKit fixture suites, scripts for optional live subtitles/Stremio config. This documentation operation does not run those commands. See [DF Acceptance Matrix](../planning/owner-freeze-2026-11-15/ACCEPTANCE_MATRIX_V1.md), [release issue #20](https://github.com/rzqllh/Yoru/issues/20), [cloud #78](https://github.com/rzqllh/Yoru/issues/78).

## 1. Evidence categories must remain distinct

| Label | Sufficient evidence | Does NOT prove |
|---|---|---|
| STATIC_REVIEW | Source file, line, SHA, validated requirement | Runtime works |
| UNIT_PASS | Actual deterministic unit/contract command and output | Third-party streams/device |
| BROWSER_FIXTURE_PASS | Browser automation against mocked provider/demo stream at SHA | Live streaming catalog or actual iPhone |
| LOCAL_BUILD_PASS | Node/Vite/backend build and local server smoke at SHA | Hosted production deployment |
| LIVE_PROVIDER_VERIFIED | Authorized video for correct title/edition/episode visibly decodes, with log/evidence | Other titles/providers/devices |
| LIVE_SUBTITLE_VERIFIED | Authorized real subtitle search/download + visible render, language/release matched | Every episode/subtitle host |
| PHYSICAL_DEVICE_VERIFIED | Actual iPhone Safari/PWA model/iOS and Chrome desktop case evidence | Other untested devices |
| CLOUD_SECURITY_VERIFIED | Real auth RLS negatives, CAS and backup recovery under approved test identity | Broad production read/write permission |
| RELEASE_APPROVED | Exact-SHA owner sign-off after all gates | Unconditional third-party availability |
| NOT_RUN/BLOCKED | Missing commands/permission/proof explicitly recorded | Never PASS |

## 2. Required per-test record

```text
AC-ID:
Requirement + owner decision IDs:
Exact repository SHA:
Branch / PR / worktree:
Environment: LOCAL | PRODUCTION
Test origin: FIXTURE | AUTHORIZED_LIVE | PHYSICAL_DEVICE
Device/browser/OS version:
Provider + canonical title/edition/episode:
Procedure, expected and observed:
Result: PASS | FAIL | NOT RUN | BLOCKED
Artifacts: screenshots/log references (redacted), commands, UTC time:
Reviewer/operator:
Open blockers and owner decisions:
```

No guessed test timestamp, download, device, provider success or deployment SHA. Public release acceptance demands a reproducible ledger, not summary adjectives.

## 3. Test pyramid and commands

- **Static:** inspect current source/decisions/AGENTS, dependency versions, lint/type errors, secrets in artifacts, spec links.
- **Unit/contract:** source URL/ID validation, episode mapper, release denominator, subtitle language/season confidence, provider response, merge/CAS and backup corrupt input, role permission.
- **Build:** `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, or `npm run check` where approved and available. Report command exits and logs, never imply previously run.
- **Browser:** actual configured Playwright scripts for Chromium and WebKit, route/deep-link/resume, subtitle settings, iframe consent, history focus, offline shell, responsive layout. Existing old D02 no-iframe tests must be updated **only in approved implementation scope with both positive and negative cases**.
- **Local preview:** run app locally per L01, with local/test data; no hosted branch preview or automatic production credentials. Check Hono API + frontend built together.
- **Authorized live:** permitted stream format, correct episode, continuous audio/video/segment/seek, expired/429/403, source fallback; subtitle real provider. Never bypass access controls to satisfy QA.
- **Physical:** iPhone Safari/PWA real model/iOS, orientation/safe area/video/caption/PiP/offline/keyboard as supported, desktop Chrome. WebKit emulator is supplemental.
- **Production:** only after owner approval, verify exact SHA, backend/frontend/API, secrets isolation, monitoring/rollback and release gates. No assumption that a READY deployment is current.

## 4. Contract case suites

| Suite | Representative cases | Required before |
|---|---|---|
| T-ID | MAL/AniList numeric collision, homonymous titles, season/cour/special/movie, unknown episode | Source matching |
| T-SRC | HTTPS/MIME/manifest/codec/CORS, 401/403/429/5xx/expired, failover/cooldown, SSRF/redirect | Live streaming |
| T-EMB | Consent once, revoke/decline, wrong content, external frame sandbox, limited controls | Fallback acceptance |
| T-SUB | Indonesian-first, English prompt, Off, wrong release, file validation, subtitle overlay + hardsub | Subtitle acceptance |
| T-PLY | Resume exact time, native auto-next 8sec cancel, next identity, reliable intro/recap markers | Player release |
| T-UX | Full-page detail desktop/mobile, 2-col Compact, advanced disclosure, hero pause/reduced motion | UX signoff |
| T-CAT | Catalog completeness snapshot, upcoming excluded, 0/0 FAIL, provider-missing aired episodes | 100% gate; currently BLOCKED P68 |
| T-ACC | Guest/A/B separation on shared device, login/logout, upload ownership, CAS conflict | Cloud enablement |
| T-BAK | Versioned retention, corrupted import, data migration, restore, deletion | Cloud enablement |
| T-SEC | Secrets, SSRF, abuse, roles, no local-prod access, provider legal permissions | Public exposure |
| T-INF | Local build parity, CI exact SHA, only production hosted, owner deploy/rollback | Production gate |
| T-DEV | Safari physical + desktop Chrome authorized live videos | Public release |

## 5. Critical adversarial cases

1. Same anime title but different MAL/AniList IDs → no false join.
2. `season 2 episode 1` candidate for `season 1 episode 1` → fail closed.
3. Provider lists zero episodes for already-aired title → **not 100%**; P68 conflict BLOCKED.
4. Site returns HTTP 200 HTML anti-bot page, not HLS → not playable, do not bypass.
5. Native preflight `loadeddata` but wrong episode/media ends immediately → not eligible broad-live proof.
6. Iframe URL resolves but video unavailable, region blocked, or user declines consent → not playable.
7. Sub Indo unavailable, only English → prompt; decline leaves subtitle absent/Off.
8. Hardsub video → subtitle Off/styling not falsely enabled.
9. Next video is OVA/another cour → no naive auto-next.
10. User A library stored in same browser then user B logs in → no shared local records.
11. Guest records exist before first login → never auto-upload them (RG05).
12. Two devices write same anime simultaneously → no silent conflict overwrite.
13. Corrupt backup/import → no existing data loss.
14. Local preview configured with production key accidentally → detect and stop before network use.
15. New hosted preview deployment requested by automation → reject per L01.
16. Provider unpermitted challenge/ToU and forced AniList access → BLOCKED, alternative research only.

## 6. G0–G7 exit gates

| Gate | Requirements | What blocks |
|---|---|---|
| G0 — Scope/authority | Current owner register, L01, security/terms decisions, code baseline | Unknown requirements, unapproved change, C02–C04 |
| G1 — Sources | Correct authorized playable native/fallback episodes, safe resolver & failover | URL-only, wrong episode, missing rights, provider 403 |
| G2 — Catalog | Independent eligible titles/episodes and per-episode proof ledger | P68 denominator conflict, 0/0, missing official data |
| G3 — Subtitles | Real search/file/render, correct id/en consent/Off | Only mock or mismatched tracks |
| G4 — Devices | Physical Safari iPhone/PWA + Chrome desktop | Only CI WebKit |
| G5 — Data/security | OTP/RLS two users/devices, sync ownership, snapshots, secrets, local-prod isolation | Admin-only tests, unknown data access |
| G6 — Infrastructure | One approved production deployment exact SHA, Hono API, quotas/alerts/rollback | Hosted preview mistaken for prod; READY only |
| G7 — Owner release | Explicit GO after prior gates; #20 updated by authorized team | No signoff or outstanding P0 |

All current **new spec cases** should be treated `NOT RUN` or `BLOCKED` unless a test ledger provides newer evidence. Historical CI results remain historical, not silently invalidated nor expanded.

## 7. Blocker and triage protocol

If a test needs unavailable credentials/provider/device/permission, unclear data owner, unknown result, unsupported environment or contradictory requirement:

- Record `BLOCKED [YOR-BLK-###]` using [AGENTS.md](../../AGENTS.md), with exact source/decision ID and **what was/wasn't run**.
- Report bounded independent progress; **do not** disable validation, fabricate fixtures as live, or mark missing coverage 100%.
- Ask one high-value owner question with two or three options and consequences, especially for C02/P68.
- Resume affected test only after explicit owner decision and any required separate permission.
- If dangerous security/production operation becomes necessary, STOP before tool execution, not merely report after the fact.

**Final reporting format:** exact SHA, changed files, tests executed, PASS/FAIL/NOT RUN/BLOCKED counts, source/device coverage, security status, outstanding block IDs, production deployment yes/no, owner approval and next safe action.

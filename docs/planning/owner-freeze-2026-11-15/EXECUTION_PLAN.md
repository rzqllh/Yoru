# Yoru vNext — P0/P1/P2 backlog and proposed execution roadmap

**Status:** PLAN ONLY / NOT EXECUTION AUTHORIZATION. L01 **supersedes hosted preview**: only production remotely hosted, preview locally. C01 old shared-production preview risk is no longer a target; C02–C04 and release/cloud security remain blocked. Agent autonomy does not grant production data, security changes, third-party access or deployments. This plan implies no timelines or successful tests.

## P0 — integrity, security and release prerequisites

| ID | Scope | Dependency | Definition of done (not currently claimed) |
|---|---|---|---|
| P0-01 | Reconcile owner decision register + old D01–D09 contract | None | Owner reviews supersession and unresolved choices; exact SHA recorded |
| P0-02 | **L01 local/prod separation verification** | P0-01; L01 | No hosted preview; local tests use local/test data/keys; no implicit prod credentials, prod user reads/writes or remote preview deployments; production retains owner gate |
| P0-03 | Upstream entitlement/ToU/host/SSRF policy | P0-01; C03/C04 | Per-provider ALLOWED/BLOCKED decision with evidence; no forbidden bypass |
| P0-04 | Independent coverage denominator, catalog scope and episode release evidence | P0-01; C02 | Eligible title/episode inventory, 0/0 fails, all missing/unverified counted transparently |
| P0-05 | Stable anime/season/cour/movie/special/source identity | P0-03/P0-04 | No guessed joins, separate AniList/MAL IDs, reversible legacy migration |
| P0-06 | Source lifecycle + real correct playback | P0-03/P0-05 | Source discovered/attemptable/confirmed separated; authorized native and consented fallback tested |
| P0-07 | Provider safety, retries/cooldown, emergency kill switch | P0-03/P0-06 | Timeouts/429/SSRF/security negative tests; allowlisted disable-only switch |
| P0-08 | Subtitle search, matching, consent, Off and display | P0-05/P0-06 | Real id/en providers, exact episode/release, iPhone caption, fail states |
| P0-09 | Account isolation + guest ownership + optional automatic sync | P0-02/P0-05 | Real OTP, cross-account/anonymous denial, CAS, two-device success |
| P0-10 | Versioned recovery, account deletion and retention | P0-09 | Validated snapshot/restore, corruption and deletion tests; bounded retention |
| P0-11 | Physical iPhone Safari + Chrome exact-SHA acceptance | P0-06/08/09 | Real video/subtitle/resume/PWA evidence on specified devices |
| P0-12 | Safe hosting, monitoring/rollback and owner release gate | P0-02/07/11 and C02 | Exact deployed SHA full stack, logs without private data, rollback drill, owner GO |

**P0 acceptance is not automatically satisfied by fixture CI.** See [ACCEPTANCE_MATRIX_V1.md](ACCEPTANCE_MATRIX_V1.md).

## P1 — primary product/UX completion

| ID | Scope | Acceptance |
|---|---|---|
| P1-01 | Metadata hybrid AniList/MAL if permitted | Field provenance, 429 fallback, ID and backup compatibility |
| P1-02 | Browse UX and advanced filtering | Progressive filters, URL and pagination correctness, no fabricated totals |
| P1-03 | Full-page desktop/mobile detail | Remove desktop modal, retain scroll/focus/deep links |
| P1-04 | Home hero, Anime Popular and Compact cards | 8s accessible rotation; mobile 2-col; explicit Compact toggle |
| P1-05 | Full player with trusted intro/recap markers | Real timed skip only when available; no guessed timestamps |
| P1-06 | Caption preset + manual style controls | Presets/default and renderer gating, hardsub explanation |
| P1-07 | Watch Guide and franchise routes | Curated when justified, release fallback, spoiler-safe branching |
| P1-08 | Offline browsing/detail cache | Metadata/detail available offline within bounded cache; not stream video |
| P1-09 | Personalized suggestions/local history | Supplemental, privacy-preserving, no forced login |
| P1-10 | First-run/recovery, errors, mobile accessibility | Clear labels, keyboard/safe areas, no inaccessible CTA |
| P1-11 | Durable provider health metrics | Per-provider cooldown and incident diagnostics without user history |

## P2 — conditional expansion/optimization

| ID | Scope | Gate |
|---|---|---|
| P2-01 | Extra independently authorized anime video providers | Unique verified episode coverage improvement |
| P2-02 | anime-sdk and AniStream architecture evaluation | Upstream license, maintenance and mapping review |
| P2-03 | FlyStream patterns | **Reference-only under RG01; no runtime integration** |
| P2-04 | Android/browser parity beyond iPhone/Chrome | Separate device matrix |
| P2-05 | Provider ranking/caching and UX tuning | Metrics and risk evidence |
| P2-06 | Torrent engine/resolver proposal | **Deferred by P05; must get separate architecture authorization** |

## Proposed work packages

| Package | Scope | Entry gates | Exit evidence |
|---|---|---|---|
| E00 | Baseline and decision reconciliation | Read-only GitHub/local state | Branch/worktree/PR/current SHA inventory, no lost changes |
| E01 | L01 isolation verification and C02–C04 access/coverage resolution | E00 | Local-only workflow verified; upstream permission and 100% eligibility rules resolved or explicitly BLOCKED |
| E02 | Episode/source/provider contract | E01 (per-provider permission) | Deterministic test matrix, no false Play |
| E03 | End-to-end single real playable vertical slice | E02 | One authorized correct anime/episode → playable video → subtitle → resume in Chrome and physical Safari |
| E04 | Incremental upstream expansion | E03 | Evidence of actual additional playable episode coverage and failover |
| E05 | Hybrid metadata and discovery/UX | E01, identity contract | Provenance and navigation tests, no destructive migration |
| E06 | Player, detail, Home, Browse, Watch Guide UX | E02/05 | Accessibility/behavior acceptance including updated D02 |
| E07 | Account-local/cloud and recovery | E01, schema/identity | Two-user/two-device auth/RLS/CAS/backup acceptance |
| E08 | Full product integration and coverage audit | E03–E07 approved scope | Test matrix exact-SHA, physical device, independent coverage ledger |
| E09 | Production/rollout decision | E08, Issue #20 | Public GO only with explicit owner authorization, otherwise NO-GO |

**Critical dependency:** E00 → E01 → E02 → E03 → E04 → E08 → E09. E05–E07 may be planned in parallel but not autonomously change shared `App.tsx`, `Player.tsx`, router, schema, CSS or backend contracts without reviewed coordination.

## Codex / agent execution controls (future, require separate approval)

1. Inspect current repository SHA and preserve uncommitted local work. Never force-reset, auto-delete worktrees, stash silently or clean remote branches without scope.
2. Review this draft **and** open blockers. Do not interpret this docs-only PR as implementation permission.
3. Isolate production code changes by dependency and branch; review exact HEAD of each PR; record touched files and test evidence.
4. Run lint, typecheck, unit tests, frontend/backend build, Chromium/WebKit E2E; then **separate** authorized provider tests and physical iPhone sign-off. Never fabricate CI/QA results.
5. No auto-enabling provider hosts, new proxy transport, cloud service role, schema migration, production deployment, remote preview environment, production-data access from local, or paid services without explicit approval.
6. Reconcile `docs/public` only against verified behavior after implementation; preserve evidence of older baselines.
7. Production deploy and rollback require owner approval. Only previously approved narrowly scoped **disable-only** provider emergency switch may be used during incidents.
8. Emit final GO/NO-GO, unresolved P0/P1, exact SHA, tested environment and proof links.

## L01 — environment topology and promotion

- **Single remotely hosted target:** production only. No separate remotely hosted preview or staging deployment.
- **Pre-production observation:** local `npm run dev`, local build / local serve and deterministic tests with fixtures or separately authorized test accounts.
- **No automatic production data parity:** local preview does not gain production secrets, unrestricted DB access, or real user records merely to reproduce production behavior.
- **Promotion:** tests and evidence on exact SHA → reviewed integration → owner approval → production deployment; no remote preview gate implied.
- **Static configuration:** `vercel.json` Git deployment disabled is consistent with this policy, but actual remote project settings must be verified before claiming no preview exists.

## Release policy

- Private beta may be operated according to already authorized controls without claiming complete streaming coverage.
- Public release requires independently measured 100% of **agreed eligible already-aired catalog and eligible episode denominator**, native or verified fallback playback, tested titles/devices, security gate, provider permissions, incident readiness, cloud safety where applicable, and explicit owner GO.
- **Current owner P68 C still conflicts with independent denominator requirement.** No metric signoff until that conflict is explicitly resolved.
- No deployment, data migration, provider activation, branch cleanup or code edit is authorized by this document.

# AGENTS.md — Yoru Agent/Harness Operating Contract

> Status: **proposed instructions in draft docs PR #161**. Read with the current owner decision freeze. This file **does not grant implementation, database access, provider activation, deployment, security-rule changes, or merge permission**. Applies to Codex, Claude, Gemini, local agents, orchestrators, subagents, and human-assisted code generation once adopted.

## 0. Mission

Maintain Yoru as an anime-first local-first PWA, using the actual React/Vite/TypeScript frontend, Hono backend, IndexedDB storage, and existing repository conventions. Build **only** the scope owner explicitly authorizes, against verified repository state. Do not substitute a plausible solution for the current owner contract.

## 1. Mandatory reading before ANY implementation proposal

1. [Latest Decision Register](docs/planning/owner-freeze-2026-11-15/DECISION_REGISTER.md) — P01–P71, RG01–RG10, **L01**.
2. [Open conflicts](docs/planning/owner-freeze-2026-11-15/OPEN_CONFLICTS.md) — unresolved requirements and blocked permissions.
3. [12-document specification index](docs/specs/README.md) — PRD, design, requirements, features, flows, business rules, database, API, architecture, security, roadmap, testing.
4. [Static alignment audit](docs/planning/owner-freeze-2026-11-15/CODE_ALIGNMENT_AUDIT.md) — hypotheses to reproduce, not runtime PASS.
5. [Release gate](https://github.com/rzqllh/Yoru/issues/20) and [cloud-sync gate](https://github.com/rzqllh/Yoru/issues/78), as applicable. Inspect current source and exact git SHA before acting.

**Precedence for target behavior:** latest explicit owner instruction (L01 and later) > current reviewed owner decision register > approved detailed specification > historical planning and public documentation. **Precedence for observed behavior:** executable source + actual tests and device evidence; documentation never proves runtime. If two applicable owner choices conflict, do not choose one silently: **BLOCKED**.

## 2. Environment invariant — L01

- Exactly **one remotely hosted runtime target: PRODUCTION**.
- Preview, release candidate verification, dev server and QA run **locally**. No new hosted preview, Vercel branch preview, staging website or duplicate production deployment.
- Local parity concerns behavior and API contracts, **not shared production secrets or user data**. Default to isolated test/local data; connections to production database/records require separate explicit authorization/security review.
- Production deploy, rollback, domain, secrets, infrastructure and public release require separate owner approval. Do not enable automatic Git deployment to emulate a preview.
- Branch/PR documentation can be prepared only when owner authorizes that scope. A docs-only PR does not authorize implementation.

## 3. Non-negotiable product invariants

- **Truthful media:** metadata ≠ released episode ≠ source URL ≠ decoded video ≠ correct episode. Only actual playback evidence can make a source verified; no fabricated 100% coverage.
- **Identity:** separate MAL/AniList/provider IDs; do not join by title or episode number alone. Fail closed on season/cour/movie/OVA/ambiguous entries.
- **Sources:** audit broadly, enable only validated/allowed upstreams. **FlyStream is reference-only (RG01)**. Torrent deferred. No open proxy/SSRF, token disclosure, unauthorized access-control/anti-bot circumvention, or use in conflict with provider rights/terms.
- **Player:** native preferred, consented iframe fallback may count only when genuinely playable and correct; hard subtitle limitations labeled. Indonesian subtitle first, explicit English consent, Off persistent.
- **Account:** optional local-first. Guest records never auto-uploaded; account-owned records isolated locally and in cloud. Do not delete/overwrite unknown watch progress.
- **Release:** upcoming excluded from first-public-playable catalog; all eligible already-aired titles/episodes need actual proof. P68 provider-based episode denominator conflicts with that guarantee: **coverage signoff BLOCKED** until owner resolves. Public release #20 stays NO-GO without live evidence, physical iPhone Safari, security gates and owner GO.

## 4. UNKNOWN / CONFLICT / OUT-OF-SCOPE = BLOCKED

If evidence is missing, requirements conflict, external authorization/rights are uncertain, API/schema is unknown, a change needs production credentials, or necessary action exceeds approved scope:

1. Stop **only the affected operation** before writing code/config/data or using an unsafe default. Continue unrelated approved read-only work if safe.
2. Inspect available source/code/test and cite exact evidence (file/line/SHA, owner decision IDs, external rule) **without inventing missing information**.
3. Create a blocker using the **exact template below**. Mark status `BLOCKED`, never `DONE` or `PASS`.
4. Ask the owner for a **clear decision** (prefer up to three options, with consequences and a recommendation) when owner authority is required. No unprompted architectural/security policy.
5. Resume only after an explicit decision and, for restricted work, separate execution approval. Log the resolution with decision IDs and tests.

### Blocker template (mandatory)

```text
BLOCKED [YOR-BLK-###] — <short title>
Scope: <feature/ticket/PR>
Owner decision(s): <Pxx/RGxx/Lxx>
Source/evidence: <exact SHA, file:line, test, trusted external policy>
Unknown/conflict: <what is not known; do not guess>
Impact: <what cannot safely proceed>
Safe work completed: <read-only or independently safe scope>
Options: A ... / B ... / C ... (or direct factual question)
Recommendation: <reasoned option; not chosen on owner's behalf>
Owner decision needed: <one concrete question>
Release/security state: BLOCKED / NOT RUN
```

**Examples:** Unknown title-to-MAL mapping → don't emit guessed ID. Provider 403/anti-bot → don't bypass. Unknown production database role → no prod connection. P68 denominator → no 100% claim. Unknown API path → inspect code/contract, don't fabricate endpoint.

## 5. Implementation and source-control constraints

- Before coding: inspect `git status`, current branch, HEAD, open PR, local worktrees and ignored/untracked files; protect others' work. No force push, `git reset --hard`, `git clean`, destructive checkout or branch/worktree deletion without explicit scoped approval.
- Work only in authorized branch/files. Do not change database/RLS/auth, provider hosts, feature gates, secrets, dependencies, paid services or deployment as incidental cleanup.
- Preserve stable routes, ID namespaces, data migrations, recovery compatibility and existing working behavior unless owner approved changes.
- Prefer small reversible changes with tests and rollback notes; coordinate edits to shared `App.tsx`, `Player.tsx`, router, CSS, API and data schema.
- Source and exact-SHA evidence first; never claim build/test/live PASS if not run. Distinguish mock fixture, browser automated, hosted, real provider, and physical-device tests.
- Update requirements/acceptance/decision mapping alongside approved changes; do not rewrite older evidence or quietly close blocker/issues.
- No agent may invent a requirement, signed upstream consent, credential, SLA, release date or third-party API.

## 6. Required deliverable/report for every authorized task

```text
Goal and approved scope:
Repo HEAD / branch / worktree:
Decision IDs and affected specs:
Files inspected/changed:
Implemented vs. proposed vs. blocked:
Tests run (exact commands) and observed results:
Live evidence / device evidence (or NOT RUN):
Security and data impacts:
Unresolved YOR-BLK IDs and owner questions:
Deployment performed? (normally NO)
Next safe action:
```

**Human approval boundaries:** owner must independently authorize implementation scope, release and risky operations. A task prompt, discussion record, or desired target is not equivalent to consent for external access or destructive operations.

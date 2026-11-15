# 04 — Feature Inventory and Scope Control

**Source observation boundary:** historical static `main` @ `b2fd85a23f9f41003ef328a8a9b9220fd2f68b5c`, recheck at current SHA. `SOURCE ALIGNED` != verified behavior. Feature work remains **not authorized** by these documents.

## Feature map and implementation gaps

| Feature | Owner decisions | Existing inspected source | Target, gap, evidence |
|---|---|---|---|
| Discovery & search | P16/P19/P25 | `backend/pipeline/jikan.ts`, `App.tsx` | MAL/Tenrai catalog works as inspected path; complete catalog boundary and 'Bisa Ditonton' based on real evidence missing |
| Hybrid metadata | P18/P38/RG10 | `id-mapping.ts`, `daily-trends.ts`, `watch-guide.ts` | AniList enrichment exists but not per-field canonical authority; upstream terms unresolved |
| Home/hero | P24/P25 | `App.tsx` | 8-second timer behavior present; physical/accessibility proof missing |
| Mobile cards | P56 | `App.tsx`, styles | Two columns present; explicit Compact toggle not established |
| Browse filters | P57 | `App.tsx`, router | Current combined filter form; expandable advanced section missing |
| Anime detail | P21/P22 | `App.tsx`, resume.ts | Mobile full page; **desktop modal remains** |
| Episode mapping | P16/P17 | `jikan.ts`, `local.ts`, `stremio.ts` | Mostly MAL/number-based; correct cour/OVA/movie cross-provider proof incomplete |
| Source federation | P06–P10/P34/RG02 | local, Stremio, Miruro, public embed | Candidate adapters exist, extra upstream coverage not integrated; all need rights and device proof |
| Embed fallback | P02/P03/P11/RG08 | backend public-embed, player embed | **Normal detail explicitly rejects iframe**; old browser test enforces rejection |
| Native video | P27/P43/P59 | source-readiness.ts, source-ranking.ts | Browser preflight exists; playing whole correct episode not globally proved |
| Subtitle search | P12–P15/P35/P54 | backend subtitles.ts, Player.tsx | Optional providers and controls exist; live iPhone/episode correctness unverified |
| Subtitle style | P44/P58 | caption appearance and Player.tsx | Manual options partly implemented; named presets/renderer parity incomplete |
| Resume | P22 | resume.ts, IndexedDB | Existing save/resume path; cross-account migration and physical playback not verified |
| Auto-next | P36 | Player.tsx | 8-second timer/cancel for native; exact franchise transition and embed capability incomplete |
| Watch Guide | P23 | WatchGuide.tsx, curated-watch-paths.ts | Curated/release fallback source work exists; correctness and coverage conditional |
| Offline | P37/P47 | sw.js, db.ts | Shell/local collection supported; catalog/detail caching incomplete |
| Accounts and sync | P32/P33/P41/P52/P63/RG05 | db.ts local-only | Current local DB not per-account; cloud automation not merged in inspected main |
| Backup | P60/P70 | backup.ts, db.ts | Manual v1 import/export, no versioned cloud retention snapshots |
| Provider cooldown | P34 | source-memory.ts | Remembers successful source, no comprehensive provider health cooldown |
| Skip intro | P49 | Player.tsx | General seek exists; segment-specific verified intro/recap action absent |
| Monitoring/kill switch | P50/P65/P69 | API/operations docs | No verified disable-only switch/alerts end-to-end |
| Local preview only | L01 | `vercel.json` | Automatic Git deployment disabled; actual host config not audited |
| FlyStream reference | RG01 | No adapter in inspected provider set | Correct: **do not implement** |

## Lifecycle states (mandatory on issues and agent reports)

`PROPOSED` → `AUTHORIZED` → `IN_PROGRESS` → `CODED` → `TESTED_FIXTURE` → `TESTED_BROWSER` → `LIVE_VERIFIED` → `RELEASE_APPROVED`.

Other states: `BLOCKED`, `FAILED`, `NOT_RUN`, `SUPERSEDED`, `OUT_OF_SCOPE`. Do **not** collapse `CODED` or `TESTED_FIXTURE` into `LIVE_VERIFIED`. A provider may be individually BLOCKED while independently authorized product work proceeds.

## Feature contract template for new approved work

```text
Feature-ID:
Requirement & owner decision refs:
User benefit:
In-scope / non-goals:
Current code and exact SHA:
Dependencies / upstream rights:
Data and privacy impact:
Normal state / empty / loading / error / retry / offline:
Accessibility and target devices:
QA IDs (fixture / real / physical):
Rollback/migration:
Owner approval and unresolved blocker IDs:
Evidence to claim DONE:
```

## Agent scope rules

- **Must not** add provider integration just because the provider is named in the upstream registry. FlyStream is reference-only.
- **Must not** invent UI controls for unsupported native/iframe/hardsub capabilities.
- **Must not** remove legacy ID routes, user library/progress, or backup compatibility while modifying metadata.
- **Must not** enable cloud sync until owner-approved auth/RLS/ownership tests and deployment plan exist.
- **Must not** remove tests that currently fail under updated requirements without replacing them with positive **and** negative tests in an approved implementation PR.
- **Must** stop with a `BLOCKED` question if a feature requires an unknown permission, URL source, design asset, episode mapping, data migration, production change or release definition.

## Deferred and conditional features

Torrent engine P05, native installers, Android parity beyond owner priority, FlyStream integration, and any external paid/secret-bearing service are **not default scope**. New requests require explicit decisions and separate authorization, not inferred from 'integrate many providers.'

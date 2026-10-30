# Yoru — Task tracker (recoverable state)
Updated: 2026-10-30 (UTC+7). Epic: https://github.com/rzqllh/Yoru/issues/44. Release gate: https://github.com/rzqllh/Yoru/issues/20.

## Authoritative state
- Integration branch: `deploy/vercel-preview-20261029`; starting SHA `c80150ddfed5e82a86791cbf582157a06ad5f169`.
- `main` is NOT approved for the new UX scope. Preview only until real-source, device, security and owner release gates pass.
- No account/cloud change, fabricated ratings/view counts, presumed Sub Indo or false playback readiness.
- Status vocabulary: `PLANNED` (design only), `CODED` (code exists), `TESTED` (exact CI SHA verified), `LIVE_VERIFIED` (real upstream/device proof), `BLOCKED` (external dependency).
- "CI PASS" does not imply "LIVE_VERIFIED".
- Changes to this file and `YORU_HANDOFF.md` are REQUIRED in each implementation PR, at every PR merge, and before a model handoff.
- Independent PR branches may progress in parallel. Do not edit the same shared files concurrently; integrate one PR at a time against the latest preview HEAD.

## Delivery matrix

| ID | Priority | Feature / outcome | State | Acceptance / dependency |
|---|---|---|---|---|
| YX-01 | P0 | One-tap continue playback | CODED (CI pending) | Correct episode + resume; verified native source; graceful source-choice fallback |
| YX-02 | P0 | Episode availability and source truth | CODED (candidate label only; needs full state model) | Metadata candidate/verified/failed states never conflated |
| YX-03 | P0 | Honest adaptive quality controls | TESTED (CI+Browser E2E PR #48 head b7219869; merged) | Auto as initial choice; no phantom 1080p; unsupported disabled |
| YX-04 | P0 | Subtitle appearance and placement | PLANNED | Font, sizes, text/background opacity, position, outline, preview + native/embed capability gating |
| YX-05 | P0 | Mobile and physical Safari | BLOCKED | Real iPhone model/iOS, fullscreen, subtitle, PiP, PWA, portrait/landscape evidence |
| YX-06 | P0 | Source memory/recovery and smart next | PLANNED | Verified source remembering; bounded recovery; manual consent |
| YX-07 | P0 | Franchise relations on detail | TESTED (direct links only; #50 head ad000df; not curated) | Verified TV/OVA/movie/prequel/side-story relation graph; attribution |
| YX-08 | P1 | Discovery watch-guide subpage | TESTED (#50 head ad000df CI + E2E) | `/jelajahi/panduan-urutan`; no extra primary category tab |
| YX-09 | P1 | Branching franchise curated paths | PLANNED | Fate etc branching, optionality, spoiler protection; no guessed chronology |
| YX-10 | P1 | Franchise progress/next-in-path | PLANNED | Local-first versioned migration + backup compatibility |
| YX-11 | P1 | Search suggestions + aliases | PLANNED | Truthful supported metadata, accessible keyboard navigation |
| YX-12 | P1 | Browse filter URL and controls | PLANNED | Chips, persisted URL, correct counts and complete year ranges |
| YX-13 | P1 | Personalized home + library | PLANNED | Local-only suggestions, list sort/history/status |
| YX-14 | P1 | Anime detail and deep links | PLANNED | Shareable route and trailer only when verified metadata exists |
| YX-15 | P1 | UI design system + microcopy | PLANNED | Canonical CSS tokens, coherent radius/space/color, WCAG/HIG, no marketing fluff |
| YX-16 | P1 | Visual load and performance | PLANNED | Lazy poster loading, correct sizing, measured CWV |
| YX-17 | P1 | First-run and recovery UX | PLANNED | Actionable error states; transparent setup; backup reassurance |
| YX-18 | P0 | Stremio/Torrentio response parity | CODED (parser+disabled UI; new CI pending) | Classify direct HTTPS vs infoHash/fileIdx torrent vs externalUrl; never claim torrent=HTTP |
| YX-19 | P0 | Opt-in torrent-capable playback path | BLOCKED | Explicit verified playback engine/resolver; browser/platform limitations and secure config |
| YX-20 | P0 | Real video/subtitle compatibility matrix | BLOCKED | Independent real examples, codecs, source access, safe URL checks, user approval and device proof |
| YX-21 | P0 | QA and release gates | BLOCKED | Exact-SHA CI+E2E, physical iPhone, no unresolved P0/P1, release issue #20 |
| YX-22 | FINAL | Update public docs and release decision | PLANNED | Only after code checks; never imply live coverage without evidence |

## Current focus / safe parallel lanes
- Lane A (watch guide): relation-data architecture, route and detail integration. Own files `backend/pipeline/*`, new `frontend/src/components/WatchGuide*`, plus a **serialized** App integration commit.
- Lane B (player + source honesty): player controls and Stremio response classification; source tests; coordinate on `Player.tsx`.
- Lane C (product polish): pure CSS token refactor / browse/library components, after avoiding shared `App.tsx` conflicts.
- Integration lane: merge tested PRs sequentially to preview; refresh this tracker, handoff and issue #44 at every merge.
- Public-facing docs (README, docs/public/*, DESIGN.md): **last** step only.

## Progress ledger
- PR #52 One-tap resume merged preview `4e482f0753d4e90450366fa091bc92d748dbd7dd`; exact CI+Browser E2E PASS at head `330b7abc758388ceb6eba822d546f69bddaba042`.
- YX-18 source visibility lane `feat/yoru-torrentio-source-visibility-20261030`: backend `unavailable` candidates from Torrentio-style Stremio sources surfaced as explicitly disabled in episode picker, no torrent engine/resolver. Exact CI pending.
- Torrentio mapping/classification PR #51 merged preview `a7cacfe9` with exact-SHA CI+Browser E2E green at `3c2d711`; no torrent engine or browser playback.
- YX-01 one-tap resume on `feat/yoru-one-tap-resume-20261030`: verified-source-first route, fallback to detail if source unavailable, short-clip progress fix, browser regression. CI pending.
- Watch Guide PR #50 merged preview as `0a184799` after exact head `ad000df` CI+Browser E2E PASS. Only first-degree relations; full curated franchise order still pending.
- Torrentio parser original branch `5520993` CI+E2E PASS; ancestry conflict after #50 squash required clean rebase to `feat/yoru-torrentio-rebased-20261030` (new exact-SHA verification pending). No torrent playback capability yet.
- PR #48 merged quality after CI+Browser E2E success on b7219869; preview merge 8b82c1fd.
- Watch Guide PR #47 tested green at 58303a16 but ancestry conflict after tracker squash; clean rebase `feat/yoru-watch-guide-rebased-20261030` awaiting new exact-SHA CI. Direct relations only, chronology/recommended remain gated.
- Rebased Lane B: previous feature SHA `64263345b` passed CI+Browser E2E, but #46 conflicted after #45 squash. New clean branch `feat/yoru-honest-quality-rebased-20261030` needs new exact-SHA checks before merge.
| Date | PR / exact commit | Done | Evidence | Next |
|---|---|---|---|---|
| 2026-10-30 | Planning checkpoint, preview `c80150d` | Owner approved UX improvements, branching watch guide, subtitle controls and Torrentio-style source path; epic #44 created | GitHub repository inspected; no new feature tests run | Tracking/handoff PR, then isolated vertical slices |

## External blockers
- Secrets/API configuration for real subtitle services and authorized source providers; never commit credentials.
- Real iPhone Safari acceptance evidence and a secure playback path for torrent-only Stremio candidates.
- Vercel deployment READY is not a full /api health+live video test. Preview SSO remains enabled.

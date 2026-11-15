# Complete owner decision register — Yoru vNext

**Authority:** This is an ordered transcription of decisions made in conversation, with later choices taking precedence only where explicitly indicated. A letter is a historical selected option, not permission for unsupervised external operations. **P66 did not receive a numbered selection; RG05 answered its substance.**

## P01–P15 — playback, providers, subtitle

| ID | Choice | Owner outcome | Interpretation |
|---|---|---|---|
| P01 | C | Complete feature set before comprehensive watch acceptance | Refined P26: test per feature, full integration after completion |
| P02 | B | Permit iframe/embed as fallback | Consent and real playback still required |
| P03 | B | Permit hardsub with accurate label | Hard subtitles cannot be disabled/styled |
| P04 | C | Treat discovered URLs as immediately ready | **SUPERSEDED BY P59** for status semantics: attemptable is not confirmed |
| P05 | A | Defer torrent; prioritize direct streams | No implied resolver installation |
| P06 | C | Built-in providers + configurable providers | Hybrid |
| P07 | C | Integrate as many sources as feasible | Refined P62/RG02: audit widely, activate only validated |
| P08 | B | Dedicated resolver per provider | Isolation and failure attribution |
| P09 | B | Proxy only for approved/configured upstreams | Never open proxy/SSRF |
| P10 | C | Automatic fallback, including iframe | P11 one-time consent and available controls |
| P11 | B | Ask iframe consent once | Consent must precede auto-fallback |
| P12 | B | Indonesian subtitles first; ask before English | No silent English fallback |
| P13 | A | Allow playback with no subtitles | Label clearly |
| P14 | A | Persist subtitle Off/language preference | Across episodes/providers |
| P15 | B | Consistent player UI when technically supported | Disable/describe unsupported controls |

## P16–P25 — discovery, metadata, UX

| ID | Choice | Owner outcome | Interpretation |
|---|---|---|---|
| P16 | B | Display known episodes and truthful statuses | No synthetic numbering |
| P17 | B | Strict automatic matching; manual choice for ambiguity | Correct title/season/cour/special |
| P18 | B | Hybrid AniList + MAL | Refined by P38; restricted upstream use still unresolved |
| P19 | C | Complete discovery catalog plus Bisa Ditonton filter | Refined RG07: exclude upcoming from 100% release denominator |
| P20 | B | Unverified resolution claims labeled unverified | Provider label ≠ verified rendition |
| P21 | B | Full-page anime detail on desktop and mobile | Supersedes D04 desktop modal |
| P22 | A | One-click resume last episode/timestamp | Reverify source before resume |
| P23 | B | Curated watch route first when supported; else release order | Never invent chronology |
| P24 | A | Hero rotates every 8 seconds with pause on interaction | Also keyboard/reduced motion |
| P25 | B | Personalization supplements neutral catalog | No ranking capture masquerading as objective |

## P26–P35 — engineering, account, reliability

| ID | Choice | Owner outcome | Interpretation |
|---|---|---|---|
| P26 | B | Test each feature; end-to-end integration when feature-complete | Refines P01 |
| P27 | B | DONE requires observed function, not CI alone | Especially live media |
| P28 | C | Broad agent execution autonomy | Does not authorize unsafe production/access changes |
| P29 | B | Automatic preview within approved scope; production only with owner approval | P69 narrowly exempts preapproved emergency kill switch |
| P30 | B | Private beta allowed; public release only after gates | RG04 preserves 100% pre-release requirement |
| P31 | A | Agent autonomy for broad technical non-release work | Bounded by authorization/security/repository protection |
| P32 | B | Optional account, IndexedDB local-first | Offline usability retained |
| P33 | C | Automatic cross-device sync + manual button | RG05 limits automatic upload to account-owned data |
| P34 | B | Rank healthy providers and cooldown failed ones | Define operational thresholds later |
| P35 | B | Federate subtitle search independent of video provider | Strong identity matching |

## P36–P45 — player, infrastructure, release

| ID | Choice | Owner outcome | Interpretation |
|---|---|---|---|
| P36 | B | Verified auto-next with cancellable 8-second timer | Exact next episode |
| P37 | B | Cache shell, library and metadata offline; not video automatically | Cache ≠ playback |
| P38 | A | Authoritative metadata source chosen per field | Explicit provenance |
| P39 | B | Physical iPhone Safari and desktop Chrome mandatory; Android later | Automated WebKit not substitute |
| P40 | C | Preview has production configuration parity | Refined P42/RG03 |
| P41 | B | Merge sync conflicts when safe; ask on ambiguity | No silent overwrite |
| P42 | A | Preview shares production secrets and database | **PARTIALLY SUPERSEDED RG03**: no unrestricted write |
| P43 | B | Bounded retries/timeouts then provider failover | Never infinite retries |
| P44 | B | Subtitle timing offset and alternate tracks | Persist appropriately |
| P45 | C | Every catalog anime playable before public release | P55/P64/RG07 refine upcoming and episodes |

## P46–P55 — privacy/cache/release

| ID | Choice | Owner outcome | Interpretation |
|---|---|---|---|
| P46 | A | Logout removes session; local data remains | Account deletion separately confirmed |
| P47 | B | LRU/size-bounded refreshing metadata cache | Preserve important progress/library |
| P48 | A | All provider credentials only in backend | Backend storage alone does not neutralize shared prod access |
| P49 | B | Full player and trustworthy skip intro/recap | No guessed timestamps |
| P50 | A | Auto incident detection/notification; production rollback with owner approval | Emergency kill switch handled P69 |
| P51 | B | Only reviewed trusted branches can execute sensitive preview | Branch trust is not DB authorization |
| P52 | A | Separate each account's local library/progress | Guest context distinct |
| P53 | B | Metadata cache with validated source fallback | No title-only merge |
| P54 | A | Only confidently matched subtitles auto-selected | Ambiguous tracks manual |
| P55 | A | Literally every catalog anime playable for first public release | RG07 excludes upcoming only |

## P56–P65 — UX, backups, preview, release

| ID | Choice | Owner outcome | Interpretation |
|---|---|---|---|
| P56 | B | Two-column cards default; Compact mode available | Persistent/view preference needs specification |
| P57 | B | Key Browse filters exposed; advanced filters expandable | Upcoming separate |
| P58 | B | Subtitle presets plus manual adjustments | Renderer capability gating |
| P59 | B | Show Play attempt immediately; clearly distinguish found/trying/confirmed/failed | **Supersedes P04 false ready claim** |
| P60 | B | Automatic versioned snapshots plus manual export/import | Restore without destructive overwrite |
| P61 | A | Shared production DB with read/write preview initially | **WRITE SCOPE SUPERSEDED BY RG03** |
| P62 | B | Agent validates provider before controlled activation | Permission/security and proof remain required |
| P63 | A | Upload cloud automatically after login | **SCOPE SUPERSEDED BY RG05** |
| P64 | B | All released episodes of eligible anime must actually play | P68 denominator still contested |
| P65 | B | Log technical failures without identities/viewing histories | No secret/media URLs |

## P66–P71 — last operational decisions

| ID | Choice | Owner outcome | Interpretation |
|---|---|---|---|
| P66 | Unanswered | Ownership of locally stored guest data at login | Answered substantively by RG05; do not invent a P66 letter |
| P67 | B | After public launch, newly unavailable ongoing episode does not take down entire site | Mark unavailable honestly |
| P68 | C | Count episode as released only when provider carries video | **CONFLICT** with all-aired-title coverage; keep recorded, do not silently rewrite |
| P69 | A | Preapproved emergency provider kill switch without new prod approval | Only disable affected provider; audit and notify |
| P70 | B | Keep bounded versioned snapshots, example 30 days | Example is not final retention parameter |
| P71 | A | Preview may read all production user data | **CRITICAL PRIVACY BLOCKER**; owner-only UI does not make data exposure safe |

## RG01–RG10 — explicit re-grill decisions

| ID | Choice | Owner outcome | Precedence / issue |
|---|---|---|---|
| RG01 | C | FlyStream reference architecture/features only | Do not integrate FlyStream |
| RG02 | B | Audit many upstreams, activate gradually by evidence | Refines P07 |
| RG03 | B | Same production database; preview writes account-test data only | Supersedes unlimited write from P42/P61 |
| RG04 | A | Private beta now; public waits for 100% required coverage | Preserves strong P55/P64 gate |
| RG05 | B | Auto-upload only records belonging to logged-in account; guest not auto-uploaded | Refines P33/P63; resolves P66 substance |
| RG06 | A | Sensitive preview owner-only with strong authentication and access audit | Human-access restriction; not blanket data-read permission |
| RG07 | B | Already-aired titles must play; upcoming separate | Narrower scope than literal P55 |
| RG08 | B | Both native or fallback count **only if real playback confirmed** | Revises old D02 acceptance |
| RG09 | B | Owner requests agents automatically overcome upstream anti-bot controls | **BLOCKED** where unpermitted; choice not external authorization |
| RG10 | B | Owner requests AniList and MAL remain active regardless of terms | **BLOCKED** where provider terms disallow use; availability cannot be guaranteed |

## Historical UX contracts D01–D09: reconciliation

- D01: Indonesian-first subtitles, English explicit, Off persistent → P12/P14 reaffirm.
- D02: uncontrolled iframe excluded → **target superseded** by P02/P03/P11/RG08; safe consent and actual playback required. Code/tests may still enforce old rule.
- D03: AniList-primary metadata → **target replaced** by P18/P38 hybrid field-specific authority, subject to provider access constraints.
- D04: mobile detail full-page, desktop modal → **target replaced** by P21 full-page on both.
- D05: release/curated order → P23 curated recommendation default when verified, release fallback.
- D06: 8-second accessible hero → P24 reaffirm.
- D07: popular 2-column cards → P56 adds Compact mode.
- D08: Upcoming separate and Browse hierarchy → P57 adds progressive filters.
- D09: native subtitle style → P58 adds presets and user adjustment.

## Decision versus authorization

The decisions describe desired outcomes. Security, provider permission, rights, deployment, databases, environment secrets, and production changes are independently gated. See [OPEN_CONFLICTS.md](OPEN_CONFLICTS.md) and [ACCEPTANCE_MATRIX_V1.md](ACCEPTANCE_MATRIX_V1.md).
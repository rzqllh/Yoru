# 06 — Business Rules and Non-negotiable Invariants

**Scope:** Product/domain invariants independent of implementation. The word **MUST** means acceptance requirement once authorized; **BLOCKED** means the agent cannot proceed without resolution. No legal/third-party permission is created by this document.

| ID | Rule | Decisions | Failure behavior |
|---|---|---|---|
| BR-001 | Every anime has stable canonical identity; MAL/AniList/provider IDs are never conflated | P17/P38 | No auto join; manual resolution |
| BR-002 | Season/cour, OVA/special/movie and episode must match before playback | P16/P17 | Wrong/ambiguous source cannot be 'verified' |
| BR-003 | `SOURCE_DISCOVERED` and `PLAYBACK_CONFIRMED` are different states | P04/P27/P59 | Found links only 'coba putar' |
| BR-004 | Native HLS/MP4 is preferred; a consented iframe fallback is eligible only after correct real playback proof | P02/P03/P10/P11/RG08 | No proof/permission → unavailable/blocked |
| BR-005 | Hardsub cannot be disabled/restyled; external iframe controls depend on provider | P03/P15 | Display capability warning |
| BR-006 | Indonesian subtitles first, English only after explicit permission, Off persistent | P12–P14 | Never override Off or auto English |
| BR-007 | Federated subtitle selection needs accurate episode/release confidence | P35/P54 | Uncertain match → manual |
| BR-008 | Quality claim '1080p' etc is unverified until observed media rendition | P20 | Label advertised/unverified |
| BR-009 | Provider retry/timeout/cooldown bounded; safe failover | P34/P43 | No infinite retries or silent loops |
| BR-010 | No open proxy, SSRF, arbitrary network destination, secrets in frontend or logs | P09/P48/P65 | Deny unsafe request; security blocker |
| BR-011 | Source activations require prior entitlement/security and live evidence | P62/RG02 | No activation; record BLOCKED |
| BR-012 | FlyStream is architectural reference, not source integration | RG01 | Do not create FlyStream adapter |
| BR-013 | Torrent runtime is deferred; `infoHash` is not a playable HTTP stream | P05 | Label unsupported/deferred |
| BR-014 | All eligible aired catalog titles and eligible released episodes must actually play for initial public release | P45/P55/P64/RG04/RG07 | NO-GO until independent denominator and proof |
| BR-015 | Upcoming is discoverable but not required playable at first public release | P19/RG07 | Mark upcoming and exclude with proof |
| BR-016 | Post-launch missing new episode can be labeled unavailable without shutting down entire app | P67 | Honest regression monitoring |
| BR-017 | P68 C provider-derived 'released episode' conflicts with BR-014's whole aired catalog promise | P68/P55/RG07 | **BLOCKED** for coverage/100% claim; owner decision required |
| BR-018 | Account optional and library local-first | P32 | Guest user must retain core usability |
| BR-019 | Guest, account A and account B records never silently mix | P52/RG05 | Do not upload/merge ambiguous records |
| BR-020 | Only records already owned by account auto-sync after login | P33/P63/RG05 | Guest remains local unless separately claimed |
| BR-021 | Concurrent sync merges only when safe; ambiguous state needs explicit choice | P41 | No silent last-write-wins data loss |
| BR-022 | Logout removes session but preserves owned local data; deletion is separate operation | P46 | Never clear library just for logout |
| BR-023 | Snapshot history bounded and corruption-safe; exact retention number remains unset | P60/P70 | Do not invent 30 days as approved parameter |
| BR-024 | Hero rotates every 8 s with pause/accessibility; mobile cards 2 cols with Compact mode | P24/P56 | Validate touch, reduced motion, device |
| BR-025 | Anime detail is full-page desktop AND mobile; Preserve deep-links/Back/focus | P21 | Old modal not acceptable target |
| BR-026 | Watch Guide curated if reliable, otherwise release; never fabricate canon | P23 | Show uncertain relation as uncertain |
| BR-027 | Auto-next countdown 8 s cancellable for verified correct next episode | P36 | Don't jump across unknown seasons |
| BR-028 | Intro/recap buttons only from trusted segment timing | P49 | Hide/disable if markers absent |
| BR-029 | No separate hosted preview; QA locally, production only hosted | L01 | Never create remote preview/staging as implied task |
| BR-030 | Local testing grants no default production DB, user-data or secrets access | L01/P48 | Separate owner approval/security review |
| BR-031 | Production deployment and rollback require explicit owner approval | P29/P50 | Stop unapproved operation |
| BR-032 | Preapproved emergency kill switch may only deactivate affected provider with audit | P69 | No deploy, activate or broad policy changes |
| BR-033 | CI fixture PASS does not equal live video/subtitle/device PASS | P27/P39 | Keep separate status/evidence |
| BR-034 | RG09 request cannot override a site's anti-bot/access controls or content rights | RG09 | Use authorized access or BLOCKED |
| BR-035 | RG10 request cannot force AniList/MAL to ignore terms or keep APIs running | RG10 | Review terms, seek permission or BLOCKED |

## Eligibility and coverage: intentionally unresolved decision

**Owner choices are preserved, not reinterpreted silently.** P68 C counts an episode as 'released' after a provider carries it, while BR-014 and RG07 require all already-aired titles/episodes. Counting only provider-listed episodes can yield false 100%. **YOR-BLK-001** applies to any public-release coverage calculation until the owner approves an independent release source, scope and denominator.

**Proposed invariant requiring approval:** keep separately sourced official-airing status, provider availability, and real playback evidence. An empty provider list can never yield `100% playable`. No 0/0 PASS.

## Decision precedence and agent invariants

- Latest explicit owner topology L01 supersedes historical hosted preview choices. Older rows retained for audit.
- Later choice supersedes old choice **only where explicit**, never by assistant inference.
- Unknown schema, API, third-party entitlement, device result, user data ownership, design direction or local-to-production access → [AGENTS blocker](../../AGENTS.md), not fabricated field/config/approval.
- Decisions express target product behavior. They do not by themselves authorize code, database migrations, use of credentials, source activation, merges, production deployment or release.
- Never substitute `MOCK_PASS`, repository docs or Vercel READY for live evidence.
- Stop only the affected hazardous action; continue approved, independent analysis/test work when safe.

## Enforceable acceptance example

```text
Precondition: A known aired anime has episode #8, metadata knows episode #8, but no provider has a working video.
Required: Display episode #8 as known/unavailable; do not remove it from the catalog or release denominator.
Prohibited: Count discovered episode #1 only and declare the title 100% playable.
Evidence: DF-COV-02/03 + exact release data source + episode matrix.
Status until independent denominator approved: BLOCKED.
```

See [Requirements](03-REQUIREMENTS.md), [Testing](12-TESTING.md), [Open conflicts](../planning/owner-freeze-2026-11-15/OPEN_CONFLICTS.md).

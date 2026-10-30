# Watch-order research — Yoru universal guide
Date: 2026-10-30 · Evidence: AniList official GraphQL documentation, plus **illustrative** anime-fan forum discussions. This is an issue taxonomy, **not** a claim of a statistically representative survey or canon-approved viewing order.

## What users actually struggle with

| Complaint pattern | Examples in community discussion | Requirement for Yoru | What metadata can prove |
| --- | --- | --- | --- |
| Multiple independent continuities / routes | Fate, Gundam, Raildex: users disagree where to start ([r/anime](https://www.reddit.com/r/anime/comments/ii06cr/); [r/animequestions 2026](https://www.reddit.com/r/animequestions/comments/1x3v9pp/)) | Separate paths instead of a fake single canon timeline; select an entry point with spoiler warnings | `ALTERNATIVE`, `SPIN_OFF`, `SAME_UNIVERSE` only describe relationships, not actual recommended route |
| Different **novel/source** vs **broadcast** release order | Monogatari novel versus anime release ([r/anime](https://www.reddit.com/r/anime/comments/1863wgj/)) | Distinguish *anime release*, *source release*, *recommended newcomer*, and in-universe story order | AniList anime air date is **not** novel order |
| Nonchronological broadcast and reused episode blocks | Haruhi 2006/2009 broadcast vs chronological ([r/Haruhi 2026](https://www.reddit.com/r/Haruhi/comments/1u1i9kq/); [r/Haruhi 2026](https://www.reddit.com/r/Haruhi/comments/1tqkh0u/)) | Support **episode-level** insertions and multiple edition-specific sequences in curated dataset | AniList media relation graph alone cannot order individual episodes |
| Side stories/OVA/special placement | Re:Zero Memory Snow/Frozen Bonds discussion ([r/Re_Zero](https://www.reddit.com/r/Re_Zero/comments/1d026ic)); K-On! OVAs & movie ([r/k_on](https://www.reddit.com/r/k_on/comments/1ce433n)) | Label optional additions and specific insert-after episode **only** when sourced | `SPECIAL`/`OVA` format is useful for filtering, **not** for episode insertion |
| Movie vs TV continuity and compilation | Fate and Gundam alternative routes; fans confuse compilations/remakes with sequels ([r/animequestions](https://www.reddit.com/r/animequestions/comments/1x3v9pp/)) | Explicit film type, `SUMMARY`/`COMPILATION`, `ALTERNATIVE` labels, and spoiler-safe warnings | Relation categories and media formats only |
| Highly rated sequel opened without context | A viewer watched the Haruhi movie before the show ([r/anime](https://www.reddit.com/r/anime/comments/16c4z3a/)) | Explain when a film assumes earlier context, not arbitrary sorting by score | Need verified editorial prerequisite graph |
| Optional versus essential content | Re:Zero discussion reports conflicting OVA recommendations ([r/Animemes](https://www.reddit.com/r/Animemes/comments/1x06r6c/watch_order_mess/)) | Optionality + confidence + source links, not a blanket filler/skippable verdict | Cannot be automatically inferred from `SIDE_STORY` or `SUMMARY` |
| Same franchise with incomplete cross-database IDs | Across anime catalogs | Do not silently discard known AniList entries without MAL IDs; open detail only when mapped | `id` and `idMal` fields, with null allowed |

## Verified API constraints

- Official: [AniList Media query](https://docs.anilist.co/guide/graphql/queries/media) supports `relations.edges.relationType` and their linked `Media`. [Page API](https://docs.anilist.co/reference/object/page) accepts `media(id_in: [Int], type: ANIME)`. [MediaRelation enum](https://docs.anilist.co/reference/enum/mediarelation) includes prequel, sequel, parent, side-story, alternative, spin-off, summary, compilation, contains and same-universe. The graph describes **related anime**, not temporal plot positions or complete canon.
- [Rate limit](https://docs.anilist.co/guide/rate-limiting) currently warns of a degraded **30 requests/minute** limit, plus burst and 429 retries. Do **not** traverse all graph relations on every page render.
- AniList responses can omit related media dates, include no MAL mapping, and omit edges or return rate-limited/network errors. Never infer titles, dates, availability or completeness when missing.

## Implementable coverage tiers

**Tier A — automatic for arbitrary anime (this PR):** first-degree explorer already exists; add user-triggered second-hop traversal with bounded 10-node frontier and 75-node total, caching/process request budget, deduplication, cycle handling, release-date sorting, genre/type grouping, explicit unknown date and partial-network status. No false canon.

**Tier B — curated community/sourced watch paths (future independent PR):** normalized schema `franchise`, `edition`, `pathId`, `steps`, `mediaId`, `episodeRange?`, `required/optional`, `branchId`, `prerequisites`, `why`, `spoilerLevel`, `sources [{url,author,date}]`, `reviewedAt`; editorial provenance and disputes; only activate recommended/chronological modes after an owner-reviewed path is complete. Do not scrape and republish entire forum posts or silently treat upvotes as authority.

**Tier C — long tail / continuous coverage:** allow user to search **any** anime and show the best available automatic graph; index recurring support complaints by pattern, not an unsupported promise that Yoru has personally researched every single anime. Add correction requests / community evidence citations via GitHub issues, human verification, anti-vandalism and expiry/review routines, eventually measured title coverage.

## Deliberate exclusions / open risk

- `PREQUEL`/`SEQUEL` describe a relationship but not automatically safe watch order. `SUMMARY` is a recap relation but not proof that skipping it is correct for everyone.
- No invented episode timestamp, canon rank, timeline or spoilers.
- A 2-hop graph is still a **partial neighborhood**. Query capped at 10 direct links; deeper branches can be unscanned.
- Never conflate visual watch guide with stream availability: an anime graph title is metadata, not an episode guaranteed playable in Yoru.

## Acceptance for this slice

1. Any catalog anime with valid MAL ID can call the same generic API and choose a bounded expansion; no hard-coded franchise-specific special casing.
2. Two-hop duplicate edges/cycles and manga adaptations cannot trigger indefinite traversal.
3. Disabled Recommended/Chronology stay disabled until separately sourced curation.
4. Filters expose alternate/compilation/OVA/movie distinctions and preserve unknown release date.
5. Backend handles rate limit/API failure with a clearly marked partial result, not fabricated success.
6. Node/Browser E2E passes on exact PR SHA; live provider data and iPhone physical are separately unverified.

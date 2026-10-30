# Yoru episode-edition watch order — evidence and scope
Verified/reviewed: 2026-10-30 (Asia/Jakarta). Implementation lane: YX-09/YX-10.

## Verified use cases for the reusable edition contract

### Haruhi (2006 vs 2009)

- The **official 2026 Haruhi anniversary site** reprinted the *14 episodes in original 2006 television broadcast order*: https://haruhitv-anniversary.com/news/article0017.html
- The **official anniversary site** separately published the *28-episode 2009 broadcast edition*, with the 2010 Disappearance film identified after that collection: https://haruhitv-anniversary.com/news/article0020.html
- Catalog identities are **not interchangeable**: [AniList 849](https://anilist.co/anime/849) = 2006, 14 episodes; [AniList 4382](https://anilist.co/anime/4382) = rebroadcast 2009, 28 episodes; [AniList 7311](https://anilist.co/anime/7311) = film.
- The official overview explains the series was broadcast out of chronological order in 2006 and reconfigured with new episodes for the 2009 edition: https://haruhitv-anniversary.com/overview.html.
- The app stores two explicit **broadcast editions**; it does **not** assert that all providers use the same numbering. The story chronology option remains disabled until separately justified.

### Re:ZERO OVA and Director's Cut

- Crunchyroll editorial route distinguishes TV arcs, Memory Snow and Frozen Bond, and warns Frozen Bond is a prequel best seen after sufficient main-story context: https://www.crunchyroll.com/news/guides/2025/5/17/re-zero-watch-order
- [AniList 21355](https://anilist.co/anime/21355) is original Season 1 (25 episodes), whereas [AniList 100049](https://anilist.co/anime/100049) is one **two-episode OVA release** (Memory Snow episode 1, The Frozen Bond episode 2).
- [AniList 108632](https://anilist.co/anime/108632) and [AniList 119661](https://anilist.co/anime/119661) split Season 2 into 13 and 12 episodes. [AniList 163134](https://anilist.co/anime/163134) is 16 episodes of Season 3.
- The Re:ZERO path intentionally stops at Season 3: it does not claim to cover all later media. It is explicitly a **beginner recommendation**, not a single in-universe chronological route. Director's Cut is an edited alternative presentation, not a new story that must be watched after all TV episodes.

## Engineering contract implemented

- Each step's `episodeRange` contains a numeric range and mandatory explicit `edition` string. The same AniList media ID may recur **only with non-overlapping episode ranges from the exact same edition** within a path.
- Media identity maps to *series/detail*, **not** a provider's playable episode reference. UI offers `Detail serial` and displays the edition. Do not deep-link a guessed episode or mark as Play ready.
- Separate paths for 2006/2009 remain independent `pathId` keys in the existing IndexedDB backup-compatible manual progress.
- Existing Fate/Monogatari paths without episode ranges still require unique media IDs (no regression).
- All source URLs are HTTPS, with recorded review/checked dates; reviewer can update as evidence evolves.
- Individual edition-scoped paths are sourced examples for **universal** curator architecture, not exhaustive coverage of anime. Remaining classes: Monogatari source novel versus broadcast arc order, Gundam separate universes, OVA insertion by arc, remakes, recaps, spin-offs and franchise spoiler/optional steps.

## Acceptance boundaries

- Node unit tests verify two broadcast editions, episode count, episode identity constraints and overlapping OVA ranges.
- Browser tests verify edition switching, numbered episode labels, duplicate-media rendering and no misleading one-click playback.
- Deterministic CI + E2E is not live provider or iOS Safari verification; release issue #20 remains BLOCKED.

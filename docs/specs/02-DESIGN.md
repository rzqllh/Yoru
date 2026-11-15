# 02 — UI/UX Design Contract

**State:** TARGET SPEC, not proof current UI matches. **Reference:** [PRD](01-PRD.md), [User Flows](05-USER_FLOW.md), [Decisions](../planning/owner-freeze-2026-11-15/DECISION_REGISTER.md), [Code audit](../planning/owner-freeze-2026-11-15/CODE_ALIGNMENT_AUDIT.md).

## Design principles

1. **Anime-first:** prioritize artwork, title identity, episode, source, watch state and subtitle readability.
2. **State honesty:** `source discovered` is not `video confirmed`; unknown/failed video is not represented as ready.
3. **Small-screen first:** responsive iPhone layouts, safe area, touch hit targets, scroll restoration, bottom navigation, portrait and landscape.
4. **Accessible by default:** semantic headings, visible focus, accessible name, keyboard controls, reduced motion, status announcements, constrained modals only when truly modal.
5. **Capability-aware:** native and embedded controls intentionally differ; hardsub cannot be disabled or restyled.
6. **Respect history:** Back/Forward, deep-link routes, existing watch progress and user-selected Off/filters must survive navigation.

**Visual tokens:** The actual current colors, CSS variables, typography, spacing and icon language must be extracted from `frontend/src/styles.css`, not invented from this text. A rebrand, new token scale or UI library migration is **NOT AUTHORIZED** by this spec. Exact breakpoint values and design asset licensing remain `NEEDS VERIFICATION`.

## Information architecture

| Level | Destination | Contract |
|---|---|---|
| Primary | Home | Hero, Popular, Continue Watching, upcoming preview |
| Primary | Jelajahi / Browse | Search; main visible filters; advanced expandable; valid query URL |
| Primary | Watch Guide | Verified curated path or release fallback, relation labels |
| Primary | Koleksi / Library | Watchlist, progress/resume, guest/account ownership |
| Primary | Settings | Subtitle preferences, personal data export/import, account controls |
| Deep route | Anime detail | Full-page `/anime/:malId` legacy-compatible and future ID bridge |
| Full-screen layer | Player | Native video or consented and verified embed |

**No independent desktop detail modal.** P21 supersedes old D04; [App.tsx](../../frontend/src/App.tsx) currently still has `DetailDialog` on desktop, a known mismatch.

## Home components

- **Hero:** rotate 8 seconds only if auto animation allowed; pause on hover/focus/interaction; controls usable without hover; respect `prefers-reduced-motion`. Media artwork from trusted metadata with fallbacks.
- **Popular cards:** mobile default **2 columns**; explicitly selectable Compact mode (P56). Changing view cannot invalidate catalog/scroll/filters. Desktop density adapts to available width.
- **Continue Watching:** one action resumes exact last episode/position after source revalidation; do not autoplay wrong provider or skip verification.
- **Upcoming:** clearly marked not-yet-aired; not counted toward mandatory first-public-playable set.

## Browse design/state model

1. Loading skeleton with accessible `aria-busy`.
2. Results with URL-backed query/filters/sort, truthful count. Primary filters visible; advanced fields in a labeled disclosure with expanded state.
3. Empty search distinguishes **no results** vs **no playable sources** vs **metadata service failed**.
4. Infinite/load-more pagination deduplicates by canonical ID. Don't show `X total` if only `X loaded` is known.
5. Filter `Bisa Ditonton` uses verified playable status with device/time evidence; unknown stays unknown, not silently excluded from catalog.

## Anime detail full page

- Clear Back affordance, preserved history, landmark main, poster, title, release type/status, labels and synopsis; provenance where meaningful.
- Watch Guide entry when there is evidence of related franchise paths. No spoiler-filled speculative sequence.
- A primary attempt/resume button that is not mislabeled `confirmed` before playback.
- Episode list: exact numeric/content identity with separate availability state (known, source candidate, attempting, confirmed, failure, unknown), progress ring if recorded, and recoverable source picker.
- Display provider, quality **as advertised/unverified** until verified rendition, subtitle type, whether native/iframe, and fallback limitations.
- No guessed episodes or source title equivalences; unknown identity escalates to manual choice.

## Player interaction states

```text
CANDIDATE → ATTEMPTING → LOADING → CONFIRMED_PLAYING
                          ↘ FAILED → RETRY / ALTERNATE / REPORT
                          ↘ UNSUPPORTED / BLOCKED
```

- Native: play/pause/seek/mute/speed/fullscreen/PiP/quality/CC only when supported.
- Iframe: prior informed one-time consent; cannot promise seek/progress/control unless integration can demonstrate them.
- Auto-next: **8-second cancellable countdown** only after next episode exists and correct playable source is verified; no wrong cour/season transition.
- Skip intro/recap: only if source supplies reliable segment boundaries; hide/disable otherwise.
- Caption: default Indonesian, prompt before English, explicit Off, manual tracks and time offset, capability-gated font/size/background/position plus named presets when implemented; hardsub marked permanent.

## Error, loading, privacy microcopy

| State | Suggested meaning, not fixed wording | Action |
|---|---|---|
| No source | Tidak menemukan kandidat video | Try alternative/provider |
| Source found, unverified | Kandidat tersedia; coba putar | Attempt, not guarantee |
| Preflight failed | Browser tidak bisa memuat/decode video ini | Next source / report |
| Wrong episode/ambiguous | Identitas episode belum dapat dipastikan | Manual match |
| No Sub Indo | Subtitle Indonesia belum tersedia | Off or ask to use English |
| Unauthorized provider | Sumber tidak bisa digunakan lewat jalur yang diizinkan | Do not bypass; alternative |
| Account data ownership unclear | Data lokal belum terikat akun ini | Keep local until explicit claim |
| Coverage denominator unknown | Belum bisa mengukur 100% katalog | BLOCKED, not 100% badge |

## Accessibility and responsive acceptance

- Minimum practical touch target, safe-area insets, no clipped CTA on short screens, reachable subtitle panel with keyboard and VoiceOver.
- Focus trap only for true dialog; full-page detail should not use `aria-modal`.
- Announce async source status without re-announcing on every tick.
- Theme contrast, color-independent status, alt text for meaningful art; decorative artwork alt empty.
- Motion reduced for carousel and loaders where applicable; no controls visible yet disabled without explanation.
- **Physical iPhone Safari** and desktop Chrome mandatory; browser WebKit simulation is supplemental only.

## Design evidence and unresolved decisions

Screenshots/Figma, exact visual assets, numeric breakpoints and theme tokens were **not supplied as approved designs**. Source CSS is the implementation baseline. If a generated UI requires a visual choice not fixed by owner decisions, **ask owner and mark BLOCKED rather than inventing a rebrand or design system**. All defects should reference [acceptance cases](12-TESTING.md) and an exact SHA.

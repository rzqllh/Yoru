# 03 — Matrix Yoru (YOR-*)

| Metadata | Nilai |
|---|---|
| Tanggal | 2026-11-04 |
| Yomirra | `rzqllh/Yomirra` `preview` @ `e102fbc7484908b5452441cd84938d913856bee6` |
| Yoru | `rzqllh/Yoru` `main` @ `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` |
| Status | **DRAFT - belum di-commit** |
| Banner | **Source-level via GitHub API. Belum ada tsc, lint, build, test, screenshot, atau computed CSS yang dijalankan.** |

**Metode angka:** hitungan source = lexical match pada source commit terpin, bukan DOM/runtime; nilai token dan delta = pembacaan deklarasi CSS / perhitungan rancangan, bukan computed CSS. `VERIFIED` = terbukti di source yang dibaca; `UNVERIFIED` = belum dapat dibuktikan atau perlu browser/checkout. Draft dibuat di luar repo.

## Cakupan dan legenda

| Field | Interpretasi |
|---|---|
| Jumlah ID | **145 template ID** = jumlah baris matrix hasil klasifikasi Fase 1; lexical/source mapping, **bukan** jumlah instance DOM |
| VERIFICATION | `VERIFIED` = source JSX/CSS yang diaudit pada SHA metadata; `UNVERIFIED` = selector efektif, nilai computed style, visual/runtime, dan pemakaian dinamis; belum screenshot |
| `RAW` / `RAW-SELECT` / `RAW-INPUT` | Kontrol native JSX yang perlu pemeriksaan wrapper primitive; lexical match **tidak** membuktikan seluruh konteks semantic |
| `GLASS` | Efek glass masih dipasang di luar satu utility Surface, menurut source scan |
| `CALLSITE` | Styling visual ada di penggunaan langsung dan perlu dipetakan ke variant |
| `REVIEW` | Potensi reusability atau mapping belum dapat dipastikan; **UNVERIFIED** hingga inspeksi per callsite/runtime |
| `NONE` | Source sudah memanggil primitive relevan; belum otomatis dinyatakan visual parity |
| `PROTECT-*` | Perilaku/content tidak boleh berubah |
| Primitive, variant, token | **PROPOSED**, belum diimplementasikan dan belum diberi approval per nilai |

**Metode matrix:** satu baris per elemen aksi atau template React (item dari `.map` tidak dihitung sebanyak runtime data). `existing` ialah deskripsi source-level dari audit Fase 1; verifikasi *computed* selalu **UNVERIFIED**. Bila sumber file tidak spesifik atau berbeda antarkondisi, status `REVIEW` mengharuskan inspeksi sebelum batch 02. Tidak ada route/browser test.

## Distribusi area

| Area | Jumlah ID (lexical matrix rows) |
|---|---:|
| global navigation and home | 27 |
| browse and library | 36 |
| detail, episodes, status, source selection | 17 |
| player (every control type and critical action) | 37 |
| watch guide and settings | 28 |
| **Total** | **145** |

## global navigation and home — 27 ID

| ID | Existing (source-level) | Primitive target | Variant (proposed) | Token (proposed) | Status |
|---|---|---|---|---|---|
| `YOR-NAV-SIDEBAR-SURFACE` | dark gradient blur24 | Surface | `glass.sidebar` | surface.sidebar + blur.24 + radius.none | GLASS |
| `YOR-NAV-DESKTOP-HOME` | nav-link transparent, active lime | NavButton(Button) | `nav.desktop` | accent.active + control.nav44 | RAW |
| `YOR-NAV-DESKTOP-BROWSE` | nav-link transparent, active lime | NavButton(Button) | `nav.desktop` | accent.active + control.nav44 | RAW |
| `YOR-NAV-DESKTOP-LIBRARY` | nav-link transparent, active lime | NavButton(Button) | `nav.desktop` | accent.active + control.nav44 | RAW |
| `YOR-NAV-DESKTOP-SETTINGS` | nav-link transparent, active lime | NavButton(Button) | `nav.desktop` | accent.active + control.nav44 | RAW |
| `YOR-NAV-SHORTCUT-SEASON` | side-quick transparent | Button | `nav.shortcut` | surface.hover + radius.control | RAW |
| `YOR-NAV-SHORTCUT-CONTINUE` | side-quick transparent | Button | `nav.shortcut` | surface.hover + radius.control | RAW |
| `YOR-NAV-TOPBAR-SURFACE` | sticky bg translucent blur22 | Surface | `glass.topbar` | surface.topbar + blur.22 + z.topbar | GLASS |
| `YOR-NAV-TOPBAR-DISCOVER` | lime tint 42/44px | Button | `nav.discover` | accent.tint + control.touch44 + radius.control | RAW |
| `YOR-NAV-TOPBAR-AVATAR` | circular 36px button | IconButton | `nav.avatar` | radius.full + control.avatar36 | RAW |
| `YOR-NAV-MOBILE-HOME` | icon/label in fullwidth bar | MobileNavItem(Button) | `nav.mobile` | accent.active + control.nav44 | RAW |
| `YOR-NAV-MOBILE-BROWSE` | icon/label in fullwidth bar | MobileNavItem(Button) | `nav.mobile` | accent.active + control.nav44 | RAW |
| `YOR-NAV-MOBILE-LIBRARY` | icon/label in fullwidth bar | MobileNavItem(Button) | `nav.mobile` | accent.active + control.nav44 | RAW |
| `YOR-NAV-MOBILE-SETTINGS` | icon/label in fullwidth bar | MobileNavItem(Button) | `nav.mobile` | accent.active + control.nav44 | RAW |
| `YOR-NAV-MOBILE-SURFACE` | fixed fullwidth blur24 sat145 | Surface | `glass.bottomNav` | blur.24 + saturate.145 + alpha.nav79 + z.nav | GLASS |
| `YOR-NAV-MOBILE-MENU-OPEN` | hamburger button | IconButton | `nav.menu` | control.touch44 | RAW |
| `YOR-NAV-MOBILE-MENU-CLOSE` | close-menu button | IconButton | `nav.close` | control.touch44 | RAW |
| `YOR-NAV-MOBILE-BACKDROP` | full-screen dark overlay | Surface | `modal.scrim` | overlay.dim + z.modal | REVIEW |
| `YOR-HOME-HERO-COVER` | image bg gradient | Surface | `hero` | radius.hero + shadow.hero | REVIEW |
| `YOR-HOME-HERO-BADGE` | rounded pill blur12 | Badge | `hero.glass` | blur.12 + radius.full + accent.tint | GLASS |
| `YOR-HOME-HERO-OPEN` | btn-primary solid lime | Button | `primary` | accent.primary + control.primary40 | RAW |
| `YOR-HOME-HERO-SAVE` | btn-outline translucent | Button | `outline` | surface.secondary + radius.control | RAW |
| `YOR-HOME-HERO-CARD-SELECT` | poster cover image card | AnimeCard(Button) | `card.anime` | radius.card + shadow.card | RAW |
| `YOR-HOME-CONTINUE-CARD` | image 16:9 clickable | ContinueCard(Button) | `card.resume` | radius.card + accent.progress | RAW |
| `YOR-HOME-FEED-RETRY` | btn-outline | Button | `outline` | control.primary40 | RAW |
| `YOR-HOME-SEE-ALL` | transparent text-link | Button | `link` | accent.text | RAW |
| `YOR-HOME-FEATURED-ROTATION` | 8000ms JS interval | FeaturedCarousel | `behavior.existing` | behavior.heroInterval8000 | PROTECT-BEHAVIOR |

## browse and library — 36 ID

| ID | Existing (source-level) | Primitive target | Variant (proposed) | Token (proposed) | Status |
|---|---|---|---|---|---|
| `YOR-BROWSE-SEARCH` | native text input in browse toolbar | SearchInput | `catalog.search` | control.touch44 + surface.search | RAW-INPUT |
| `YOR-BROWSE-CLEAR` | native button transparent | IconButton | `search.clear` | control.touch44 + surface.transparent | RAW |
| `YOR-BROWSE-TAB-SEASON` | native category-switch button | SegmentedControl | `catalog.season` | accent.active + radius.control | RAW |
| `YOR-BROWSE-TAB-TOP` | native category-switch button | SegmentedControl | `catalog.top` | accent.active + radius.control | RAW |
| `YOR-BROWSE-SELECT-GENRE` | native select dark | Select | `filter.genre` | control.select44 + surface.control | RAW-SELECT |
| `YOR-BROWSE-SELECT-TYPE` | native select dark | Select | `filter.type` | control.select44 + surface.control | RAW-SELECT |
| `YOR-BROWSE-SELECT-SCORE` | native select dark | Select | `filter.score` | control.select44 + surface.control | RAW-SELECT |
| `YOR-BROWSE-SELECT-YEAR` | native select dark | Select | `filter.year` | control.select44 + surface.control | RAW-SELECT |
| `YOR-BROWSE-SELECT-SORT` | native select dark | Select | `filter.sort` | control.select44 + surface.control | RAW-SELECT |
| `YOR-BROWSE-RESET` | native browse-reset | Button | `filter.reset` | surface.secondary + radius.control | RAW |
| `YOR-BROWSE-CHIP-GENRE` | native removable filter chip | Chip | `filter.removable` | surface.secondary + control.touch44 | RAW |
| `YOR-BROWSE-CHIP-TYPE` | native removable filter chip | Chip | `filter.removable` | surface.secondary + control.touch44 | RAW |
| `YOR-BROWSE-CHIP-SCORE` | native removable filter chip | Chip | `filter.removable` | surface.secondary + control.touch44 | RAW |
| `YOR-BROWSE-CHIP-YEAR` | native removable filter chip | Chip | `filter.removable` | surface.secondary + control.touch44 | RAW |
| `YOR-BROWSE-CHIP-SORT` | native removable filter chip | Chip | `filter.removable` | surface.secondary + control.touch44 | RAW |
| `YOR-BROWSE-OPEN-UPCOMING` | native upcoming link button | Button | `outline` | surface.secondary + control.touch44 | RAW |
| `YOR-BROWSE-OPEN-SEASON` | native upcoming link button | Button | `outline` | surface.secondary + control.touch44 | RAW |
| `YOR-BROWSE-OPEN-GUIDE` | btn-outline | Button | `outline` | surface.secondary + control.primary40 | RAW |
| `YOR-BROWSE-CARD-OPEN` | anime-card native button | AnimeCard(Button) | `card.anime` | radius.card + hover.scale | RAW |
| `YOR-BROWSE-LOAD-MORE` | btn-outline | Button | `outline` | control.primary40 | RAW |
| `YOR-BROWSE-RETRY` | btn-outline | Button | `outline` | control.primary40 | RAW |
| `YOR-LIBRARY-TAB-ALL` | native view-tabs button | SegmentedControl | `library.view` | surface.secondary + accent.active | RAW |
| `YOR-LIBRARY-TAB-CONTINUE` | native view-tabs button | SegmentedControl | `library.view` | surface.secondary + accent.active | RAW |
| `YOR-LIBRARY-HIGHLIGHT-RESUME` | btn-primary lime | Button | `primary` | accent.primary + control.primary40 | RAW |
| `YOR-LIBRARY-STAT-CARDS` | surface dark/gradient | Surface | `stats` | surface.stats + radius.card | REVIEW |
| `YOR-LIBRARY-FILTER-ALL` | native filter-tabs button | Chip | `library.filter` | surface.secondary + accent.active | RAW |
| `YOR-LIBRARY-FILTER-PLANNED` | native filter-tabs button | Chip | `library.filter` | surface.secondary + accent.active | RAW |
| `YOR-LIBRARY-FILTER-WATCHING` | native filter-tabs button | Chip | `library.filter` | surface.secondary + accent.active | RAW |
| `YOR-LIBRARY-FILTER-COMPLETED` | native filter-tabs button | Chip | `library.filter` | surface.secondary + accent.active | RAW |
| `YOR-LIBRARY-SORT` | native select | Select | `library.sort` | control.select44 + surface.control | RAW-SELECT |
| `YOR-LIBRARY-STATUS` | native select per card | Select | `library.status` | surface.secondary + control.select | RAW-SELECT |
| `YOR-LIBRARY-CARD-OPEN` | native button card content | LibraryCard(Button) | `card.library` | surface.card + radius.card | RAW |
| `YOR-LIBRARY-CONTINUE-OPEN` | native resume card button | ContinueCard(Button) | `card.resume` | surface.card + radius.card | RAW |
| `YOR-LIBRARY-REMOVE` | native icon-button | IconButton | `library.remove` | semantic.destructive + control.touch44 | RAW |
| `YOR-LIBRARY-FIND-ANIME` | native text-link | Button | `link` | accent.text | RAW |
| `YOR-LIBRARY-EMPTY-BROWSE` | btn-primary | Button | `primary` | accent.primary + control.primary40 | RAW |

## detail, episodes, status, source selection — 17 ID

| ID | Existing (source-level) | Primitive target | Variant (proposed) | Token (proposed) | Status |
|---|---|---|---|---|---|
| `YOR-DETAIL-MODAL-SURFACE` | desktop dark modal and shadow | Dialog/Surface | `modal.detail` | surface.modal + shadow.modal + radius.modal | REVIEW |
| `YOR-DETAIL-MOBILE-BACK` | icon-button.glass blur10 | IconButton | `glass.back` | blur.10 + control.touch44 | RAW+GLASS |
| `YOR-DETAIL-DESKTOP-CLOSE` | icon-button.glass blur10 | IconButton | `glass.close` | blur.10 + control.touch44 | RAW+GLASS |
| `YOR-DETAIL-SYNOPSIS-EXPAND` | native text link | Button | `link` | accent.text | RAW |
| `YOR-DETAIL-PLAY-EPISODE` | btn-primary | Button | `primary` | accent.primary + control.primary40 | RAW |
| `YOR-DETAIL-ADD-TO-LIBRARY` | btn-outline | Button | `outline` | surface.secondary + radius.control | RAW |
| `YOR-DETAIL-OPEN-GUIDE` | btn-outline | Button | `outline` | surface.secondary + radius.control | RAW |
| `YOR-DETAIL-EPISODE-REGISTERED` | episode-row status-registered | EpisodeButton(Button) | `episode.registered` | semantic.registered border/bg + status.behavior | RAW+PROTECT-STATUS |
| `YOR-DETAIL-EPISODE-CANDIDATE` | episode-row status-candidate | EpisodeButton(Button) | `episode.candidate` | semantic.candidate border/bg + status.behavior | RAW+PROTECT-STATUS |
| `YOR-DETAIL-EPISODE-TORRENT` | episode-row status-torrent | EpisodeButton(Button) | `episode.torrent` | semantic.torrent border/bg + status.behavior | RAW+PROTECT-STATUS |
| `YOR-DETAIL-EPISODE-ERROR` | episode-row status-error | EpisodeButton(Button) | `episode.error` | semantic.error border/bg + status.behavior | RAW+PROTECT-STATUS |
| `YOR-DETAIL-EPISODE-UNAVAILABLE` | episode-row status-unavailable | EpisodeButton(Button) | `episode.unavailable` | semantic.unavailable border/bg + status.behavior | RAW+PROTECT-STATUS |
| `YOR-DETAIL-EPISODE-LOAD-MORE` | native load-episodes | Button | `episode.loadMore` | surface.secondary + control.touch44 | RAW |
| `YOR-DETAIL-SOURCE-PICKER` | dark-green source-picker | Surface | `panel.source` | surface.sourcePicker + radius.panel | REVIEW |
| `YOR-DETAIL-SOURCE-OPTION` | native button per candidate | Button | `source.candidate` | semantic.source + control.touch44 | RAW |
| `YOR-DETAIL-SOURCE-DISABLED` | native disabled button per unavailable | Button | `source.unavailable` | semantic.disabled + control.touch44 | RAW |
| `YOR-DETAIL-SOURCE-CLOSE` | icon-button | IconButton | `source.close` | control.touch44 | RAW |

## player (every control type and critical action) — 37 ID

| ID | Existing (source-level) | Primitive target | Variant (proposed) | Token (proposed) | Status |
|---|---|---|---|---|---|
| `YOR-PLAYER-ROOT` | full-screen dedicated player route | Surface | `player.shell` | surface.player + z.player | PROTECT-BEHAVIOR |
| `YOR-PLAYER-TOPBAR` | translucent blur16 | Surface | `glass.playerTop` | blur.16 + surface.playerTop | GLASS |
| `YOR-PLAYER-BACK` | icon-button.glass | IconButton | `glass.back` | blur.10 + control.touch44 | RAW+GLASS |
| `YOR-PLAYER-CENTER-PLAY` | 76x76 round glass blur15 | TransportButton | `player.centerPlay` | control.center76 + blur.15 + radius.full | RAW+GLASS |
| `YOR-PLAYER-TRANSPORT-SURFACE` | toolbar blur20 | Surface | `glass.playerToolbar` | blur.20 + surface.playerToolbar | GLASS |
| `YOR-PLAYER-PLAY-PAUSE` | native lime transport button | TransportButton(Button) | `transport.primary` | accent.primary + control.transport44 | RAW |
| `YOR-PLAYER-SEEK` | native range custom thin track | PlayerSeekBar(Range) | `range.seek` | accent.progress + control.seekTrack6/17 | RAW-INPUT |
| `YOR-PLAYER-MUTE` | native dark button | TransportButton(Button) | `transport.icon` | surface.transport + control.transport44 | RAW |
| `YOR-PLAYER-VOLUME` | native range | RangeSlider | `range.volume` | accent.volume + control.range | RAW-INPUT |
| `YOR-PLAYER-BACK-10` | native dark transport button | TransportButton(Button) | `transport.jump` | surface.transport + control.transport44 | RAW |
| `YOR-PLAYER-FORWARD-10` | native dark transport button | TransportButton(Button) | `transport.jump` | surface.transport + control.transport44 | RAW |
| `YOR-PLAYER-FULLSCREEN` | native dark transport button | TransportButton(Button) | `transport.icon` | surface.transport + control.transport44 | RAW+PROTECT-BEHAVIOR |
| `YOR-PLAYER-PIP` | native dark transport button | TransportButton(Button) | `transport.icon` | surface.transport + control.transport44 | RAW+PROTECT-BEHAVIOR |
| `YOR-PLAYER-MORE` | native dark control expand | Button | `player.more` | surface.transport + accent.expanded | RAW |
| `YOR-PLAYER-SELECT-SPEED` | native select | Select | `player.speed` | control.select40/44 + surface.transport | RAW-SELECT |
| `YOR-PLAYER-SELECT-QUALITY` | native select | Select | `player.quality` | control.select40/44 + surface.transport | RAW-SELECT |
| `YOR-PLAYER-SUBTITLE-TRIGGER` | native dark control | Button | `player.subtitle` | surface.transport + accent.expanded | RAW |
| `YOR-PLAYER-NEXT-CANCEL` | native next countdown action | Button | `player.nextCancel` | surface.next + control.touch44 | RAW |
| `YOR-PLAYER-NEXT-CONTINUE` | native next countdown action | Button | `player.nextContinue` | surface.next + control.touch44 | RAW |
| `YOR-PLAYER-SUBTITLE-PANEL` | dark gradient panel | Surface | `panel.subtitle` | surface.subtitlePanel + radius.panel | REVIEW |
| `YOR-PLAYER-SUBTITLE-OFF` | native pressable option | Chip | `subtitle.option` | semantic.selected + control.touch44 | RAW |
| `YOR-PLAYER-SUBTITLE-ID` | native pressable option | Chip | `subtitle.option` | semantic.selected + control.touch44 | RAW |
| `YOR-PLAYER-SUBTITLE-EN` | native pressable option | Chip | `subtitle.option` | semantic.selected + control.touch44 | RAW |
| `YOR-PLAYER-SUBTITLE-TRACK` | native dynamic pressable track | Chip | `subtitle.option` | semantic.selected + control.touch44 | RAW |
| `YOR-PLAYER-SUBTITLE-PANEL-CLOSE` | native button | Button | `subtitle.close` | control.touch44 | RAW |
| `YOR-PLAYER-SUBTITLE-OFFSET-RESET` | native offset button | Button | `subtitle.offset` | control.touch44 | RAW |
| `YOR-PLAYER-SUBTITLE-SUGGESTION-DISMISS` | native button | Button | `subtitle.dismiss` | control.touch44 | RAW |
| `YOR-PLAYER-SUBTITLE-UPLOAD` | native file input | FileInput | `subtitle.upload` | control.file + semantic.input | RAW-INPUT |
| `YOR-PLAYER-CAPTION-FONT` | native select | Select | `caption.font` | control.select40 + surface.transport | RAW-SELECT |
| `YOR-PLAYER-CAPTION-SIZE` | native select | Select | `caption.size` | control.select40 + surface.transport | RAW-SELECT |
| `YOR-PLAYER-CAPTION-TEXT-OPACITY` | native select | Select | `caption.textOpacity` | control.select40 + surface.transport | RAW-SELECT |
| `YOR-PLAYER-CAPTION-BG-OPACITY` | native select | Select | `caption.backgroundOpacity` | control.select40 + surface.transport | RAW-SELECT |
| `YOR-PLAYER-CAPTION-OUTLINE` | native select | Select | `caption.outline` | control.select40 + surface.transport | RAW-SELECT |
| `YOR-PLAYER-CAPTION-POSITION` | native select | Select | `caption.position` | control.select40 + surface.transport | RAW-SELECT |
| `YOR-PLAYER-CAPTION-SCOPE` | native select | Select | `caption.scope` | control.select40 + surface.transport | RAW-SELECT |
| `YOR-PLAYER-RECOVER-SOURCE` | native recovery button | Button | `player.recovery` | semantic.error + control.touch44 | RAW |
| `YOR-PLAYER-VIDEO-STAGE` | native video and captions | VideoSurface | `media.content` | no glass on video frame | PROTECT-NO-GLASS |

## watch guide and settings — 28 ID

| ID | Existing (source-level) | Primitive target | Variant (proposed) | Token (proposed) | Status |
|---|---|---|---|---|---|
| `YOR-GUIDE-BACK` | btn-outline | Button | `outline` | surface.secondary + control.primary40 | RAW |
| `YOR-GUIDE-SEARCH` | native text input | SearchInput | `guide.search` | surface.search + control.touch44 | RAW-INPUT |
| `YOR-GUIDE-SUGGESTION` | native chip per recommendation | Chip | `guide.suggestion` | surface.secondary + radius.chip | RAW |
| `YOR-GUIDE-RESULT` | native button per result | Button | `guide.result` | surface.secondary + control.touch44 | RAW |
| `YOR-GUIDE-MODE-RELEASE` | native button active accent | SegmentedControl | `guide.mode` | surface.secondary + accent.active | RAW |
| `YOR-GUIDE-MODE-CHRONOLOGY` | native button active accent | SegmentedControl | `guide.mode` | surface.secondary + accent.active | RAW |
| `YOR-GUIDE-CURATED-PATH` | native button per path | Chip | `guide.path` | surface.secondary + accent.active | RAW |
| `YOR-GUIDE-UNDO` | btn-outline | Button | `outline` | control.primary40 | RAW |
| `YOR-GUIDE-COMPLETE-NEXT` | btn-primary | Button | `primary` | accent.primary + control.primary40 | RAW |
| `YOR-GUIDE-STEP-OPEN` | btn-outline | Button | `outline` | control.primary40 | RAW |
| `YOR-GUIDE-EXPAND-RELATIONS` | btn-outline | Button | `outline` | control.primary40 | RAW |
| `YOR-GUIDE-GROUP-FILTER` | native outlined filter | Chip | `guide.group` | surface.secondary + accent.active | RAW |
| `YOR-GUIDE-RELATED-OPEN` | btn-outline | Button | `outline` | control.primary40 | RAW |
| `YOR-SETTINGS-ANCHOR-PLAYBACK` | dark pill anchor | Button asChild anchor | `settings.anchor` | surface.secondary + radius.full | CALLSITE |
| `YOR-SETTINGS-ANCHOR-SOURCES` | dark pill anchor | Button asChild anchor | `settings.anchor` | surface.secondary + radius.full | CALLSITE |
| `YOR-SETTINGS-ANCHOR-ACCOUNT` | dark pill anchor | Button asChild anchor | `settings.anchor` | surface.secondary + radius.full | CALLSITE |
| `YOR-SETTINGS-ANCHOR-DATA` | dark pill anchor | Button asChild anchor | `settings.anchor` | surface.secondary + radius.full | CALLSITE |
| `YOR-SETTINGS-ANCHOR-ABOUT` | dark pill anchor | Button asChild anchor | `settings.anchor` | surface.secondary + radius.full | CALLSITE |
| `YOR-SETTINGS-PLAYER-DEMO` | btn-primary | Button | `primary` | accent.primary + control.primary40 | RAW |
| `YOR-SETTINGS-AUTO-NEXT` | native select | Select | `settings.autoNext` | surface.control + control.select42 | RAW-SELECT |
| `YOR-SETTINGS-DEFAULT-SPEED` | native select | Select | `settings.speed` | surface.control + control.select42 | RAW-SELECT |
| `YOR-SETTINGS-SUBTITLE-LANGUAGE` | native select | Select | `settings.language` | surface.control + control.select42 | RAW-SELECT |
| `YOR-SETTINGS-REFRESH-SOURCES` | icon-button | IconButton | `settings.refresh` | surface.secondary + control.icon36 | RAW |
| `YOR-SETTINGS-EXPORT` | setting-action | Button | `settings.action` | surface.secondary + radius.control | RAW |
| `YOR-SETTINGS-IMPORT` | setting-action | Button | `settings.action` | surface.secondary + radius.control | RAW |
| `YOR-SETTINGS-IMPORT-FILE` | native file input hidden | FileInput | `settings.hiddenFile` | not a styled button, preserve accessibility | RAW-INPUT |
| `YOR-SETTINGS-DELETE-LOCAL` | setting-action danger | Button | `settings.destructive` | semantic.error + radius.control | RAW |
| `YOR-SETTINGS-SOURCE-STATE` | semantic status label | Badge | `settings.status` | semantic.connected/failed | REVIEW |


## Kontrak perilaku Player / Episode

| Wrapper / ID | Struktur target | Behavior tidak boleh berubah | Gate |
|---|---|---|---|
| `TransportButton` (`YOR-PLAYER-PLAY-PAUSE`, `BACK-10`, `FORWARD-10`, `MUTE`) | Wrapper `Button`, typed variant map; mempertahankan handler dan `aria-*` | Play/pause native video, skip **±10 detik**, mute/volume, disabled dan touch | Runtime UNVERIFIED, screenshot + media test kelak |
| `TransportButton` (`YOR-PLAYER-FULLSCREEN`, `PIP`) | Wrapper `Button`, status capability | Native fullscreen/PiP APIs, platform fallback, focus/keyboard | UNVERIFIED |
| `PlayerSeekBar` (`YOR-PLAYER-SEEK`) | Wrapper range input; bukan styled Button | Drag + keyboard seek, progress/duration, events, thumb hit area; **6px track / 17px thumb** adalah source CSS, bukan computed | UNVERIFIED |
| `EpisodeButton` (`YOR-DETAIL-EPISODE-*`) | Wrapper `Button` + semantic status `episodeStatus` | **registered / candidate / torrent / error / unavailable**; jangan samakan menjadi satu status/warna | UNVERIFIED |
| VideoSurface (`YOR-PLAYER-VIDEO-STAGE`) | Konten media tetap di bawah control overlay | Tidak menambah glass/filter ke video frame atau mengubah HLS, subtitle cue, progress persistence | PROTECT-NO-GLASS |
| Subtitle controls | Wrapper `Select`/`Chip` sesuai semantic | Native picker iOS, language/track, offset ±0.1/±0.5s, hard/softsub, panel close | UNVERIFIED |

**Metode angka player:** ±10 detik dan offset diperoleh dari aksi/source-level audit; 6px/17px dari deklarasi CSS. Browser interaction dan computed values belum diukur.

## Dekomposisi `App.tsx` — pure-move `YOR-02A`

| Target komponen / file (proposed) | Sumber logika sekarang | Kewajiban |
|---|---|---|
| `HomePage.tsx` | Home section `App.tsx` | State/props, carousel interval, layout tetap |
| `BrowsePage.tsx` | Fungsi BrowsePage di `App.tsx` | Filters/pagination/search tetap |
| `LibraryPage.tsx` | Fungsi LibraryPage di `App.tsx` | Status, sort, resume, local storage tetap |
| `DetailBody.tsx` | Fungsi DetailBody di `App.tsx` | Availability, sources, episodes, progress tetap |
| `DetailMobilePage.tsx` | Fungsi DetailMobilePage di `App.tsx` | Native mobile navigation/detail semantics tetap |
| `DetailDialog.tsx` | Fungsi DetailDialog di `App.tsx` | Focus trap, close, scroll behavior tetap |
| `SettingsPage.tsx` | Fungsi SettingsPage di `App.tsx` | Preferences/backup/import tetap |
| `AnimeCard.tsx` / `ContinueCard.tsx` | Card templates di `App.tsx` | Ekstraksi **hanya** jika source memberi batas komponen dan parity terbukti; UNVERIFIED |
| `App.tsx` | Tetap root composition | **Tidak** migrasi router, state ownership, data layer, URL/history |
| `Player.tsx`, `WatchGuide.tsx` | Komponen existing | Tidak dipecah dalam pure-move ini |

**Urutan wajib:** `YOR-02` → `YOR-02A` pure-move (satu commit, screenshot diff **0 diwajibkan**) → `YOR-03`. Perhitungan `0` ialah acceptance criterion, **bukan** hasil pengujian. Nama file PascalCase pada feature components; primitive via typed variant-to-class map, tanpa cva dan tanpa Tailwind.

## Open items

| ID | Hal yang belum terverifikasi | Status |
|---|---|---|
| YOR-O-01 | Computed CSS semua YOR-* dan visual state 390/1440 | UNVERIFIED |
| YOR-O-02 | Fixture/mock untuk katalog/episode/player supaya screenshot deterministik | UNVERIFIED |
| YOR-O-03 | Readiness local checkout, `YOR-00` Playwright, typecheck/build | BLOCKED |
| YOR-O-04 | Focus, video/PiP/native captions/subtitles parity | UNVERIFIED |
| YOR-O-05 | Zero-diff saat `YOR-02A` pure-move | UNVERIFIED; gate wajib |

## Addendum 2026-11-04 (Revisi 2) — Integrasi Federasi Multi-Source & Hero Data Track

**Tetap 145 ID Matrix (tanpa renumbering):** Bagian ini memetakan komponen presentasi existing ke arsitektur multi-source federation dan daily hero data integrity tanpa menambah atau mengubah 145 ID visual yang telah dikunci.

| Area / ID Existing | Pemetaan Arsitektur & Kontrak Terkait | Status & Guardrails |
|---|---|---|
| `YOR-HOME-HERO-SURFACE` | Konsumsi dataset tren harian AniList (`Page.mediaTrends`); background poster/banner dinamis. | VERIFIED LOCAL / DRAFT |
| `YOR-HOME-HERO-BADGE` | Menampilkan `#${rank} HARI INI` / `TREN HARIAN ANILIST` bila snapshot valid; `#${rank} TERPOPULER` / `POPULER SEPANJANG MASA` bila fallback. Melarang manipulasi label. | VERIFIED LOCAL / DRAFT |
| `YOR-HOME-HERO-INDICATORS` | Tablist 10 item (`HERO-D05`); interval rotasi 10 detik terisolasi dari network fetch; reset timer otomatis saat navigasi manual (klik/panah). | VERIFIED LOCAL / DRAFT |
| `YOR-HOME-HERO-SOURCE-DATE` | Menampilkan tanggal snapshot riil dalam kalender Asia/Jakarta (`HERO-D02`); dilarang memalsukan tanggal hari ini bila snapshot berasal dari tanggal sebelumnya. | VERIFIED LOCAL / DRAFT |
| `YOR-DETAIL-EPISODE-REGISTERED` | Hanya disematkan bila episode benar-benar terdaftar di penyedia; dilarang membuat episode sintetis hanya dari total episode metadata (`SRC-R01`). | LOCKED INVARIANT |
| `YOR-DETAIL-EPISODE-CANDIDATE` | Kandidat URL HTTPS HLS/MP4; dilarang otomatis dianggap playable sebelum lolos verifikasi browser (`SRC-R02`). | LOCKED INVARIANT |
| `YOR-DETAIL-EPISODE-TORRENT` | Status descriptor eksternal; bukan native HLS/MP4. | PROTECT-STATUS |
| `YOR-DETAIL-EPISODE-ERROR`, `UNAVAILABLE` | Representasi kegagalan/ketiadaan episode secara jujur; failover tidak boleh mengganti cour, season, atau anime lain secara diam-diam. | PROTECT-STATUS |
| `YOR-DETAIL-SOURCE-SELECTION` | Memprioritaskan audio asli + softsub Indonesia (`D01`); mendeteksi dan memberi peringatan eksplisit pada hardsub lokal; menolak iframe tanpa subtitle (`D02`). | LOCKED INVARIANT |
| `YOR-PLAYER-VIDEO-STAGE` | Media native HLS/MP4; aspek rasio dijaga (no video shrinking/cropping aneh); dilarang menyisipkan iframe pihak ketiga (`D02`). | PROTECT-NO-GLASS |
| `YOR-PLAYER-CONTROLS-OVERLAY` | Liquid Glass overlay; padding bawah dan tinggi panel disesuaikan agar tidak menutupi 2–3 baris teks subtitle WebVTT (`SRC-R06`). | UX FIX REQUIRED |
| `YOR-PLAYER-QUALITY-SELECT` | Menampilkan resolusi terukur (1080p/720p dari HLS stream inf / MP4 dimensions); dilarang hardcoding label "1080p" tanpa pembuktian (`SRC-R03`). | MEASURED QUALITY ONLY |
| `YOR-PLAYER-SUBTITLE-MENU` | Kontrol trek subtitle, sinkronisasi offset, dan verifikasi bahasa Indonesia murni (mencegah kebocoran hardsub Arab gundul `SRC-R04`). | INTEGRITY LOCKED |
| `YOR-PLAYER-RECOVER-SOURCE` | Pemulihan kegagalan streaming otomatis dengan fallback ke candidate berikutnya tanpa open-proxy atau bypass hak cipta (`SRC-R05`). | SECURITY AUDITED |
| `YOR-SETTINGS-SOURCE-STATE` | Status konektivitas dan kesehatan $\ge 5$ provider independen (configured, eligible, verified, error) secara jujur. | TRANSPARENCY LOCKED |

**Gate Rekonsiliasi:** Seluruh pemetaan di atas menjaga D01 (Indonesian-first subtitles), D02 (native playback fail-closed), D03 (identity bridge), pencegahan SSRF pada signed proxy, dan akurasi peringkat harian AniList. Tidak ada modifikasi kode aplikasi atau instalasi dalam tahap ini.

Lihat [`04-yoru-multi-source-masterplan.md`](04-yoru-multi-source-masterplan.md) dan `planning-addenda/` untuk rincian proposal addenda.

# 00 — Kontrak Refactor UI dan Gate Eksekusi

| Metadata | Nilai |
|---|---|
| Tanggal | 2026-11-04 |
| Yomirra | `rzqllh/Yomirra` `preview` @ `e102fbc7484908b5452441cd84938d913856bee6` |
| Yoru | `rzqllh/Yoru` `main` @ `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` |
| Status | **DRAFT - belum di-commit** |
| Banner | **Source-level via GitHub API. Belum ada tsc, lint, build, test, screenshot, atau computed CSS yang dijalankan.** |

**Metode angka:** hitungan source = lexical match pada source commit terpin, bukan DOM/runtime; nilai token dan delta = pembacaan deklarasi CSS / perhitungan rancangan, bukan computed CSS. `VERIFIED` = terbukti di source yang dibaca; `UNVERIFIED` = belum dapat dibuktikan atau perlu browser/checkout. Draft dibuat di luar repo.

## 1. Status akses dan blocker eksekusi

| Kapabilitas / persyaratan | Status | Bukti / gate berikutnya |
|---|---|---|
| Baca source kedua repo via GitHub API | **VERIFIED** | Fetch pada SHA metadata; read-only |
| Checkout lokal Yomirra | **BLOCKED** | Tidak tersedia dalam environment saat audit; perlu checkout yang sesuai SHA |
| Checkout lokal Yoru | **BLOCKED** | Tidak tersedia dalam environment saat audit; perlu checkout yang sesuai SHA |
| Shell umum | **VERIFIED** | Tersedia, tetapi tidak menyiratkan command proyek bisa dijalankan |
| Dependency proyek terpasang | **UNVERIFIED** | Periksa setelah checkout tanpa mengubah lockfile tanpa persetujuan |
| `tsc`, lint, build, dev server pada repo | **NOT RUN** | Perlu checkout + dependency, stdout/stderr/exit code asli |
| Browser & screenshot baseline | **NOT RUN** | Perlu server yang berjalan dan tooling |
| `@playwright/test` untuk Yoru | **APPROVED, DEFERRED** | Hanya devDependency Yoru, commit terpisah `YOR-00` setelah environment tersedia |
| Fixture/mock data eksternal Yoru | **REQUIRED, UNVERIFIED** | Harus deterministik: katalog, detail, episode, source, player, settings |
| Inventory yang disebut pada path tujuan | **NOT FOUND** | Pada kedua SHA path belum ditemukan; draft ini bukan file repo |
| Rekonsiliasi ID matrix | **VERIFIED lexical** | **147 YOM + 145 YOR = 292 ID** (row scan); laporan sebelumnya menyebut 296 tanpa tabel ID yang merekonsiliasi |
| Audit runtime dan computed style per ID | **UNVERIFIED** | Fase 2 pada 390px dan 1440px setelah environment siap |

**Prasyarat Fase 2:** checkout kedua repo; dependency terkunci/terpasang; tooling browser siap; `YOR-00` terpisah; fixture/mock Yoru; auth/state/locale/timezone/fallback gambar dikunci; rute reader dan player punya data deterministik. Tidak menganggap approval tooling sebagai perintah memasang sekarang.

## 2. Keputusan final owner (1–5; dipertahankan)

1. Strict parity dulu (token, primitive, halaman tanpa perubahan visual). Normalisasi jadi batch WAJIB sebelum final audit (YOM-09 / YOR-09), bukan "future". Catat setiap alias legacy beserta jumlah pemakaiannya; semuanya harus habis di batch itu. Sebelum batch itu, ajukan skala final (radius, blur, alpha overlay, tinggi kontrol) dengan delta px/pt per nilai untuk gue approve per nilai.
2. Exceptions boleh, hanya kalau tercatat di docs/internal/token-exceptions.md (nilai, lokasi, alasan). Hardcode di luar daftar = pelanggaran.
3. Naming: file kebab-case primitive Yomirra tetap, jangan rename. Compound primitive tetap satu file family. Komponen layar/fitur = satu komponen satu file. Yoru: PascalCase mengikuti Player.tsx dan WatchGuide.tsx.
4. Yoru: typed variant-to-class map tanpa dependency baru. Jangan tambah cva.
5. Lab Yomirra di luar scope (read-only). Yoru: approve @playwright/test sebagai devDependency (hanya Yoru, commit terpisah YOR-00). ESLint Yoru ditunda. Gate Yoru = typecheck + build + screenshot diff.

**Revisi tambahan yang mengikat:** dekomposisi `App.tsx` Yoru adalah pure-move setelah `YOR-02` sebelum `YOR-03`, screenshot diff **0** (persyaratan acceptance, bukan hasil tes); router/state/data layer tidak disentuh. Normalisasi wajib sebelum final audit. **Semua pekerjaan implementasi DITUNDA** hingga checkout/environment; tugas sekarang dokumen saja, tanpa commit.

## 3. Delapan aturan target dan penyesuaian

| # | Aturan target | Penyesuaian kontrak |
|---|---|---|
| 1 | Satu komponen = satu file; nama file = nama komponen | Yomirra primitive tetap kebab-case; Yoru feature PascalCase; compound family satu file |
| 2 | Wajib pakai `Button`, `IconButton`, `Chip`, `Tabs/SegmentedControl`, `Select`, `SearchInput`, `Badge`, `Dialog/Sheet`, `Toggle`, `Surface`; larang native control ber-style kustom jika primitive cocok | Native `<select>` boleh **di dalam** wrapper `Select`, bukan call site ber-style bebas; semantik native harus terjaga |
| 3 | `className`, `...props` ke root, `variant`/`size` (`cva`); variant bernama bila digunakan 2+ tempat atau bermakna | Yomirra `cn()` + `cva`; Yoru typed variant-to-class map, **tanpa cva/dependency baru** |
| 4 | Struktur/perilaku berbeda = wrapper komponen baru di atas primitive | `TransportButton`, `PlayerSeekBar`, `EpisodeButton`, `ReaderControl`, `NavItem` sesuai kontrak |
| 5 | Visual values melalui token: radius, alpha, blur, saturate, shadow, tinggi, spacing, duration, z-index | Batch 01 hanya alias exact-value; Batch 09 normalisasi setelah persetujuan tiap delta |
| 6 | Satu Surface/utility glass sebagai pemilik `backdrop-filter`, membaca blur+saturate+alpha+border | `YOM-01`/`YOR-01` memperkenalkan layer **tanpa consumer**, sehingga efek existing belum dimigrasikan |
| 7 | Dilarang arbitrary value dan hex/rgb(a) di komponen/page kecuali exception tertulis | `token-exceptions.md` hanya **rencana draft**, belum dibuat dalam repo. `data-[state=*]` bukan magic visual |
| 8 | Override call site hanya layout; beda visual memakai variant | Jangan ubah tampilan/behavior ketika memigrasikan call site |

**Batas lain:** jangan Glisse; jangan menyentuh admin Yomirra, UI Lab, root folder, dependency tak disetujui, router/state/data layer; preserve status episode Yoru (`registered`, `candidate`, `torrent`, `error`, `unavailable`) dan reader image Yomirra tanpa glass/refraction.

## 4. Batch final yang mengikat / proposed gate

| Batch | Scope | Gate sebelum commit (setelah environment ada) |
|---|---|---|
| `YOR-00` | Pasang `@playwright/test` devDependency **khusus Yoru**, commit terpisah | Lockfile review, install provenance, typecheck/build; **belum dikerjakan** |
| `Fase 2` | Baseline sebelum perubahan: Yomirra Home/Jelajah/Library/detail/webtoon/paged/settings; Yoru Beranda/Jelajahi/Koleksi/detail/player toolbar/subtitle/settings | 390px + 1440px; fixture/mock Yoru; manifest computed CSS per ID; exact SHA, state, screenshot assets |
| `YOM-01` / `YOR-01` | Token alias exact + glass utility/layer, **tanpa consumer** | YOM typecheck/lint/build/diff; YOR typecheck/build/diff; screenshots delta 0 |
| `YOM-02` / `YOR-02` | Primitive API/variants; call-site migration **tidak** dalam batch ini kecuali diperlukan untuk tes primitive | Gate sesuai repo + state/focus/accessibility parity |
| `YOR-02A` | Pure-move pecah `App.tsx` ke screen/component files; **di antara 02 dan 03** | Typecheck + build; screenshot diff **0**; state/router/data behavior identik |
| `YOM-03` / `YOR-03` | Nav/header/menus/dock/sidebar | Gate sesuai repo + route, focus, touch |
| `YOM-04` / `YOR-04` | Home/discovery/browse/search/cards | Gate sesuai repo + data & layout snapshots |
| `YOM-05` / `YOR-05` | Library, bookmark, koleksi, detail, source actions | Gate sesuai repo + persisted state |
| `YOM-06` | Reader controls/panels/scrubber saja; image content dilindungi | Typecheck/lint/build + screenshot webtoon/paged dan gesture regression |
| `YOR-06` | Player transport, quality, subtitles; episode states tetap semantik | Typecheck/build + player screenshots + behavioral checks |
| `YOM-07` / `YOR-07` | Settings, akun, system overlays | Gate sesuai repo + dialog/focus/error states |
| `YOM-08` / `YOR-08` | Sisa call-site parity, cleanup tanpa normalisasi nilai | Gate sesuai repo + grep sementara + diff 0 |
| `YOM-09` / `YOR-09` **WAJIB** | Normalisasi radius/blur/alpha/tinggi **hanya dari skala per-nilai yang disetujui owner**; habiskan seluruh alias legacy | Gate sesuai repo; screenshot delta **hanya** yang disetujui; alias usage 0 |
| Final audit (setelah 09) | Grep, exception reconciliation, visual diff, daftar perubahan | Per-repo proof output + before/after unique values + alias 0 |

**Satu batch = satu commit per repo**, setelah eksekusi diizinkan. Tidak ada commit dari dokumen ini. `YOR-02A` ialah nama batch usulan untuk pure-move; identitas final dapat dikonfirmasi sebelum implementasi.

## 5. Definition of Done

| Kriteria | Bukti wajib |
|---|---|
| Audit source sesudah normalisasi | Grep seluruh scope publik; hitung *lexical matches* dan klasifikasi, bukan sekadar jumlah string |
| Alias legacy | Setiap alias tercatat dengan source usages sebelum `09`, lalu **0 consumer** sesudah `09`; token definisi legacy juga dihapus |
| Hardcode/arbitrary | **0** nilai visual di luar exception register; semua pengecualian memuat nilai/lokasi/alasan dan approval |
| Radius/blur/alpha | Tabel **jumlah nilai unik** source dan manifest computed CSS, sebelum vs sesudah; hindari menghitung prefixed CSS sebagai dua efek visual |
| Behavior | Tidak mengubah route, native video controls, HLS, subtitle, reader gestures, data persistence, episode statuses |
| Visual parity | Diff 0 pada batch non-normalisasi; delta visual batch 09 harus approved per nilai dan diverifikasi |
| Gates | YOM: `tsc --noEmit`, ESLint, build, screenshot; YOR: typecheck, build, screenshot; stdout/stderr/exit code asli |
| Scope | Admin dan Lab Yomirra tidak disentuh; Glisse tidak diinstal; tidak ada arsitektur/root folder change |

## 6. Template laporan per batch

| Field | Yang harus ditempel |
|---|---|
| Repo / branch / SHA before → after | Nilai asli dari Git, bukan asumsi |
| Batch / commit SHA | Satu commit setelah gate terpenuhi |
| Changed files | Daftar path dan alasan; file yang tak berhubungan = blokir |
| Commands | Perintah exact dan working directory |
| stdout | **Output asli lengkap** atau tautan log artefak yang inspectable |
| stderr | **Output asli lengkap**; tandai jika kosong dan terverifikasi |
| Exit code | Angka hasil proses untuk tiap command; tidak boleh mengklaim PASS jika tidak dijalankan |
| Screenshot before/after | Route, viewport 390/1440, seed/fixture, theme/state, lokasi asset |
| Screenshot diff | Pixel difference dan threshold **yang disepakati**, khusus `YOR-02A` wajib 0 |
| Computed-style manifest | ID → border-radius, color alpha, blur, saturation, shadow, dimensions, spacing, duration, z-index |
| Delta visual | Old → new, delta px/pt/percentage-points, approval ID, hasil diff |
| Legacy + exception | Alias usages awal/akhir, hardcode residual, file exception |
| Result | PASS / FAIL / BLOCKED / UNVERIFIED, jelas per gate |

## Open items

| ID | Item | Status |
|---|---|---|
| O-01 | Checkout dan dependency kedua repo agar Fase 2 dapat berjalan | BLOCKED |
| O-02 | `YOR-00` Playwright dan fixture/mock deterministik | APPROVED, DEFERRED / UNVERIFIED fixture |
| O-03 | Tabel skala final setiap delta sebelum `YOM-09` / `YOR-09` | PENDING APPROVAL PER NILAI |
| O-04 | Daftar exception yang disetujui untuk draft register | PENDING APPROVAL |
| O-05 | Computed-style baseline serta screenshot state/viewport per ID | UNVERIFIED |

## 7. Addendum Yoru 2026-11-04 — Rencana Multi-Source & Integritas Data (DRAFT)

- Owner meminta riset **minimum lima sumber media non-embedded** untuk Yoru, dengan target cakupan anime seluas mungkin. **Cakupan metadata** dan **ketersediaan episode playable** adalah dua metrik berbeda; dilarang menjanjikan seluruh katalog memiliki video playable.
- Tujuh kandidat diinspeksi pada level source/referensi: AnimeParadise, HiAnime, AnimePahe, Otakudesu, AllManga/AllAnime, Oploverz, Gomunime. Status: `SOURCE_READ`, bukan izin siar atau bukti live playback.
- Rancangan, batas legal, dependency, pemetaan episode, target >=5 provider independen upstream, acceptance, dan rollback dicatat di [`04-yoru-multi-source-masterplan.md`](04-yoru-multi-source-masterplan.md).
- **Kontrak UI refactor dan angka 147 YOM + 145 YOR tidak berubah**. Ini pekerjaan arsitektur streaming & data terpisah tanpa mengubah nomor batch `YOR-00`–`YOR-09`.

## 8. Addendum 2026-11-04 (Revisi 2) — Batasan Federasi, Integritas Hero & Tata Kelola XYN

| Aspek | Kebijakan & Batasan yang Mengikat | Status Bukti |
|---|---|---|
| **Multi-Source Federation** | Menghitung $\ge 5$ sumber upstream independen yang sah, bukan sekadar 5 nama provider yang mengekstrak CDN/storage yang sama. | TARGET PROPOSAL |
| **Fail-Closed D02** | Menolak fallback iframe/embed pihak ketiga tanpa kontrol subtitle internal. Native player HLS/MP4 tetap mutlak. | LOCKED INVARIANT |
| **Accurate Media Availability** | Tidak boleh ada episode "Play-Ready" sintetis semata-mata karena metadata memiliki total episode (SRC-R01). Mirror wajib divalidasi judul & nomornya (SRC-R02). | LOCKED INVARIANT |
| **No Fabricated Quality** | Label resolusi (1080p/720p) harus berbasis pengukuran riil (HLS variant stream inf / MP4 dimensions), bukan string statis (SRC-R03). | LOCKED INVARIANT |
| **Subtitle Language Integrity** | Melarang kebocoran hardsub bahasa asing (misal Arab gundul) pada pilihan Bahasa Indonesia; VTT harus sinkron dan tervalidasi (SRC-R04). | LOCKED INVARIANT |
| **Signed Media Proxy Security** | Threat model proxy (`/api/proxy/stream`) wajib membatasi SSRF, DNS rebinding, IP private/loopback, dan token TTL pendek. Ekspansi runtime menunggu approval owner (SRC-R05). | THREAT MODEL AUDITED |
| **Hero Data Integrity** | Metrik harian AniList (`Page.mediaTrends`) mengukur delta aktivitas snapshot, bukan popularitas sepanjang masa. Pemisahan timer rotasi 10s dari network fetch (HERO-D01..D06). | VERIFIED LOCAL / AGY |
| **Hero Timezone & Date** | Menggunakan Asia/Jakarta (WIB) untuk kalender antarmuka pengguna; preservasi timestamp snapshot asli sumber (JST/UTC) tanpa asumsi jadwal rilis yang belum terbukti. | VERIFIED LOCAL / AGY |
| **XYN Multi-Agent & QA** | Mengikuti protokol `xyn-orchestrate` dan `xyn-qa-audit`. Ritsuka sebagai controller tunggal; Rinne wajib mengaudit deliverable secara independen (Maker-Checker). | MANDATORY GOVERNOR |
| **Status Dokumen** | Seluruh dokumen dan usulan addenda berstatus **DRAFT - belum di-commit**. Tidak ada modifikasi kode aplikasi, dependensi, atau deployment. | STRICT BOUNDARY |

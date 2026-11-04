# Addendum 2026-11-04 — docs/planning/TRACKING.md (Revisi 2)

| Metadata | Nilai |
|---|---|
| Tanggal | 2026-11-04 |
| Yomirra | `preview` @ `e102fbc7484908b5452441cd84938d913856bee6` (di luar scope) |
| Yoru Baseline | `main` @ `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` |
| Status | **DRAFT - belum di-commit; usulan append resmi** |
| Banner | **Pelacak komprehensif: 7 Kandidat, Ekosistem Agregator, Audit Risiko, dan Hero Data Track.** |

**Penempatan:** Blok di bawah adalah usulan untuk di-*append* pada `docs/planning/TRACKING.md` setelah owner review.

---

## 1. Pelacak Tujuh Kandidat Provider Asli (Read-Only)

| ID | Nama Kandidat | Status Source | Live Playback Yoru | Hak / Lisensi | Tindakan Lanjutan |
|---|---|---|---|---|---|
| `SRC-01` | AnimeParadise | `SOURCE_READ` | UNVERIFIED | UNKNOWN | Audit CORS, segmen HLS, dan izin siar |
| `SRC-02` | HiAnime | `SOURCE_READ` | UNVERIFIED | UNKNOWN | Verifikasi independensi host megaplay |
| `SRC-03` | AnimePahe | `SOURCE_READ` | UNVERIFIED | UNKNOWN | Pemeriksaan mendalam extractor kwik |
| `SRC-04` | Otakudesu | `SOURCE_READ` | UNVERIFIED | UNKNOWN | Audit format hardsub & domain rotasi |
| `SRC-05` | AllManga | `SOURCE_READ` | UNVERIFIED | UNKNOWN | Audit GraphQL payload & multi-CDN |
| `SRC-06` | Oploverz | `SOURCE_READ` | UNVERIFIED | UNKNOWN | Verifikasi resolusi riil vs hardcode |
| `SRC-07` | Gomunime | `SOURCE_READ` | UNVERIFIED | UNKNOWN | Audit CDN upstream pihak ketiga |

---

## 2. Pelacak Ekosistem Agregator & Ekstensi Publik

| Nama Ekosistem | Kategori Taksonomi | Dependensi / Shared Host | Status Kelayakan |
|---|---|---|---|
| **Tatap** | Aggregator API | Mengekstrak provider pihak ketiga; dependensi scraping | ARCH_REFERENCE |
| **Aniraku Backend** | Aggregator API | Multi-source anime API; referensi routing resolver | ARCH_REFERENCE |
| **Anivexa (Ani-API)** | Aggregator API | Aggregator metadata & stream; referensi model D03 | ARCH_REFERENCE |
| **Anihub API** | Aggregator API | REST wrapper provider anime; referensi failover | ARCH_REFERENCE |
| **lightanime-api** | Aggregator API | Microservice streaming; referensi singleflight caching | ARCH_REFERENCE |
| **StreamPlay / Tatakai** | Implementation Reference | Resolver native Android/Node; parsing manifest HLS | ARCH_REFERENCE |
| **CloudStream / Aniyomi** | Extension Framework | Plugin modular terisolasi; referensi boundary scraper | ARCH_REFERENCE |
| **Mangayomi / Seanime** | Extension Framework | Framework multi-sumber; referensi health monitoring | ARCH_REFERENCE |

---

## 3. Pelacak Audit Kritis Implementasi (SRC-R01..R06) & Hero Data (HERO-D01..D06)

| Kode Isu | Fokus Risiko / Verifikasi | Status Investigasi | Status Mitigasi |
|---|---|---|---|
| `SRC-R01` | Episode sintetis otomatis dari metadata | AUDITED | Invarian fail-closed: tolak Play-ready pada anime unreleased |
| `SRC-R02` | Validitas stream mirror universal vs embed | AUDITED | Filter ketat HLS/MP4 native; tolak iframe default |
| `SRC-R03` | Verifikasi resolusi 1080p riil terukur | AUDITED | Ukur stream inf manifest / videoWidth decoding fisik |
| `SRC-R04` | Integritas bahasa subtitle vs kebocoran Arab gundul | AUDITED | Isolasi trek audio raw + softsub VTT Indonesia |
| `SRC-R05` | Threat model keamanan signed proxy & SSRF | AUDITED | Allowlist host, tolak IP private/loopback, token TTL 3h |
| `SRC-R06` | Layout pemutar Liquid Glass menutupi subtitle WebVTT | AUDITED | Usulan penyesuaian padding baseline subtitle |
| `HERO-D01` | Metrik ranking murni lonjakan aktivitas harian AniList | VERIFIED LOCAL | 6 unit test membuktikan delta aktivitas mengalahkan skor all-time |
| `HERO-D02` | Preservasi tanggal snapshot kalender Asia/Jakarta | VERIFIED LOCAL | Konversi snapshot JST/UTC ke kalender WIB |
| `HERO-D03` | Pemisahan jujur label `#1 TERPOPULER` bila offline | VERIFIED LOCAL | Fallback tidak lagi memalsukan all-time sebagai "Hari Ini" |
| `HERO-D04` | Kelengkapan peringkat 10 anime tanpa filler palsu | VERIFIED LOCAL | Deduplikasi ID dan penolakan anime tanpa ID MAL valid |
| `HERO-D05` | Pemisahan rotasi carousel 10s dari network fetch | VERIFIED LOCAL | Timer rotasi terisolasi + reset pada interaksi manual |
| `HERO-D06` | QA data independen & bukti deterministik | REPORTED_BY_AGY | 229 passing tests dilaporkan lokal; menunggu audit Rinne |

*Ledger Blocker Rilis:* Persetujuan tertulis owner untuk $\ge 5$ provider independen, izin media legal, validasi fisik Safari iOS, dan penutupan issue #20 tetap menjadi syarat mutlak sebelum implementasi kode.

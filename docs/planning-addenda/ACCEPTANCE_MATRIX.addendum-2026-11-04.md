# Addendum 2026-11-04 — docs/planning/ACCEPTANCE_MATRIX.md (Revisi 2)

| Metadata | Nilai |
|---|---|
| Tanggal | 2026-11-04 |
| Yomirra | `preview` @ `e102fbc7484908b5452441cd84938d913856bee6` (di luar scope) |
| Yoru Baseline | `main` @ `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` (uncommitted local dirty state) |
| Status | **DRAFT - belum di-commit; usulan append resmi** |
| Banner | **Dokumentasi perancangan kriteria akseptansi multi-source & data integrity. Belum di-commit ke file resmi.** |

**Penempatan:** Blok di bawah adalah usulan untuk di-*append* pada `docs/planning/ACCEPTANCE_MATRIX.md` setelah owner approval. Dilarang menimpa riwayat akseptansi lama.

---

## 2026-11-04 — AC-SRC-MULTI & AC-HERO Acceptance Proposal

### Bagian 1: Source Federation & Media Playback (AC-SRC-MULTI)

| AC ID | Persyaratan Akseptansi | Bukti Wajib untuk Status PASS | Status Saat Ini |
|---|---|---|---|
| `AC-SRC-MULTI-01` | $\ge 5$ provider independen yang sah dengan jalur upstream/CDN terpisah | Dokumen register provider ditandatangani owner + graph independensi CDN | PROPOSED / NOT_RUN |
| `AC-SRC-MULTI-02` | Fail-closed D02: tidak ada iframe embed atau magnet yang diakui sebagai native playable | Test parsing stream format HLS/MP4 dan penolakan iframe fallback | LOCKED INVARIANT |
| `AC-SRC-MULTI-03` | Pencocokan akurat season, cour, OVA, movie tanpa episode sintetis (`SRC-R01`) | Test suite fixture lintas anime multi-season (Attack on Titan, Haruhi, Fate) | PROPOSED / NOT_RUN |
| `AC-SRC-MULTI-04` | Kualitas 1080p terukur dari stream inf/MP4 dimensions riil, bukan label string (`SRC-R03`) | Log inspeksi manifest HLS `RESOLUTION=1920x1080` dan browser decoded properties | PROPOSED / NOT_RUN |
| `AC-SRC-MULTI-05` | Subtitle Bahasa Indonesia murni tanpa kebocoran hardsub asing/Arab gundul (`SRC-R04`) | Validasi WebVTT, sinkronisasi cue timing, dan penolakan hardsub asing | PROPOSED / NOT_RUN |
| `AC-SRC-MULTI-06` | Media proxy aman dari SSRF, DNS rebinding, IP private, dan token tamper (`SRC-R05`) | Test suite penetrasi SSRF, blacklist IP lokal, dan validasi HMAC token TTL | PROPOSED / NOT_RUN |
| `AC-SRC-MULTI-07` | Player UX: kontrol Liquid Glass tidak menutupi teks subtitle & video tidak menyusut (`SRC-R06`) | Screenshot diff visual, a11y focus, dan penyesuaian padding subtitle WebVTT | PROPOSED / NOT_RUN |

### Bagian 2: Data Integrity Track Hero Daily Top 10 (AC-HERO)

| AC ID | Persyaratan Akseptansi | Bukti Wajib untuk Status PASS | Status Saat Ini |
|---|---|---|---|
| `AC-HERO-01` | Peringkat harian didasarkan murni pada lonjakan delta aktivitas AniList harian riil | 6 test deterministik pada `tests/daily-trends.test.mjs` (show skor rendah rank #1) | REPORTED_BY_AGY |
| `AC-HERO-02` | Preservasi tanggal snapshot kalender Asia/Jakarta tanpa fabrikasi tanggal stale | Konversi timestamp snapshot JST/UTC ke tanggal kalender lokal dan cache stale | REPORTED_BY_AGY |
| `AC-HERO-03` | Pemisahan tegas label fallback: `#1 TERPOPULER` bila offline, bukan `#1 HARI INI` | Unit/E2E test simulasi HTTP 503 menghasilkan label katalog all-time jujur | REPORTED_BY_AGY |
| `AC-HERO-04` | Rotasi visual 10 detik terisolasi dari network fetch + reset pada aksi manual | E2E browser test menguji timer reset dan ketiadaan network calls saat interval tick | REPORTED_BY_AGY |

*Catatan Integritas Bukti:* Hasil bertanda `REPORTED_BY_AGY` memerlukan verifikasi QA independen ulang oleh Rinne sebelum dipromosikan menjadi `VERIFIED`. Dilarang memberikan status PASS tanpa bukti eksekusi inspectable. Release issue #20 tetap berstatus **NO-GO**.

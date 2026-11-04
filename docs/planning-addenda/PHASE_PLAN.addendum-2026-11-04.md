# Addendum 2026-11-04 — docs/planning/PHASE_PLAN.md (Revisi 2)

| Metadata | Nilai |
|---|---|
| Tanggal | 2026-11-04 |
| Yomirra | `preview` @ `e102fbc7484908b5452441cd84938d913856bee6` (di luar scope) |
| Yoru Baseline | `main` @ `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` |
| Status | **DRAFT - belum di-commit; usulan append resmi** |
| Banner | **Penyelarasan dependensi Fase Repositori vs Roadmap Rekayasa P0/P1/P2.** |

**Penempatan:** Blok di bawah adalah usulan untuk di-*append* pada `docs/planning/PHASE_PLAN.md` setelah owner review. Dilarang mengubah penomoran fase asli repositori.

---

## 2026-11-04 — Penyelarasan Roadmap P0/P1/P2 ke Fase Repositori Eksisting

| Work Package | Deskripsi Paket Kerja | Penyelarasan Fase Repositori | Gerbang Akseptansi & Bukti | Status |
|---|---|---|---|---|
| `WP-P0-01` | Rekonsiliasi Git baseline SHA `464e7a7c` vs local worktree | Phase 00 / Phase 01 | Audit commit log, diff, dan isolasi working tree | VERIFIED LOCAL |
| `WP-P0-02` | Eliminasi risiko episode sintetis & validitas mirror (`SRC-R01..R02`) | Phase 01 / Phase 05 | Invarian D02 fail-closed, penolakan stream embed palsu | LOCKED INVARIANT |
| `WP-P0-03` | Integritas data Top 10 Hero AniList & mitigasi fallback (`HERO-D01..D06`) | Phase 04 / Phase 05 | 6 test deterministik, timer rotasi 10s terisolasi | REPORTED_BY_AGY |
| `WP-P0-04` | Audit threat model keamanan signed media proxy (`SRC-R05`) | Phase 01 / Phase 08 | Proteksi anti-SSRF, DNS rebinding, token HMAC TTL | THREAT MODEL AUDITED |
| `WP-P1-01` | Pengukuran kualitas 1080p riil & trek subtitle Indonesia (`SRC-R03..R04`) | Phase 02 / Phase 08 | Log stream inf HLS, eliminasi kebocoran hardsub Arab | PROPOSED / NOT_RUN |
| `WP-P1-02` | Seleksi, audit ToS, dan izin $\ge 5$ provider independen | Phase 01 / Phase 08 | Graph dependensi CDN terpisah + persetujuan owner | PROPOSED / NOT_RUN |
| `WP-P1-03` | Validasi live playback nyata di Chromium & WebKit iPhone Safari | Phase 08 | Log playback start/seek fisik pada perangkat nyata | PROPOSED / NOT_RUN |
| `WP-P2-01` | Perbaikan layout UX pemutar Liquid Glass agar tidak menutupi subtitle (`SRC-R06`) | Phase 08 | Visual diff, penyesuaian padding subtitle WebVTT | PROPOSED / NOT_RUN |
| `WP-P2-02` | Penutupan isu rilis publik #20 & pembuktian formal gerbang G1–G6 | Phase 09 | Verifikasi menyeluruh seluruh acceptance criteria | PROPOSED / NOT_RUN |

*Catatan Kritis:* Tidak ada renumbering fase produk (Fase 01, 02, 08, 09 tetap berjalan sesuai rencana awal). Pekerjaan P0–P2 tidak terkait dengan batch UI refactor `YOR-00`–`YOR-09`.

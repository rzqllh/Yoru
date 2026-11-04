# Addendum 2026-11-04 — docs/planning/MASTER_PLAN.md (Revisi 2)

| Metadata | Nilai |
|---|---|
| Tanggal | 2026-11-04 |
| Yomirra | `preview` @ `e102fbc7484908b5452441cd84938d913856bee6` (di luar scope) |
| Yoru Baseline | `main` @ `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` |
| Status | **DRAFT - belum di-commit; usulan append resmi** |
| Banner | **Perancangan strategis: Integrasi Source Federation & Hero Data Integrity Track.** |

**Penempatan:** Blok di bawah adalah usulan untuk di-*append* pada `docs/planning/MASTER_PLAN.md` setelah owner review. Dilarang menimpa riwayat keputusan sebelumnya.

---

## 2026-11-04 — Multi-Source Federation & Hero Data Integrity (PROPOSED)

### 1. Keputusan Pemilik yang Mengikat (Locked Policy Decisions)
1. **Target $\ge 5$ Provider Independen:** Dihitung berdasarkan jalur infrastruktur dan CDN upstream yang terbukti terpisah secara teknis, bukan sekadar pelabelan 5 adapter yang mengarah ke host video yang sama.
2. **Invarian D02 Fail-Closed:** Tetap mempertahankan kebijakan pemutar native HLS/MP4 tanpa fallback iframe/embed pihak ketiga. Episode tanpa stream langsung yang valid wajib berstatus `unavailable`.
3. **Keamanan Media Proxy:** Threat model signed media proxy (`backend/api/proxy.ts`) membatasi SSRF, DNS rebinding, dan host allowlist. Ekspansi runtime ditunda hingga otorisasi terpisah.
4. **Zona Waktu Hero Harian:** Kalender antarmuka pengguna disajikan dalam zona waktu Asia/Jakarta (WIB), dengan preservasi timestamp snapshot asli dari AniList (15:00 UTC / 00:00 JST).

### 2. Pilar Strategis Masterplan
- **Source Federation Architecture:** Mengintegrasikan 7 kandidat asli (SRC-01 s.d. SRC-07) dan pembelajaran dari 5 taksonomi ekosistem agregator (Tatap, Aniraku, Anivexa, CloudStream, Seanime).
- **Audit Kritis Implementasi Lokal (SRC-R01..R06):**
  - Mencegah episode sintetis dari metadata (`SRC-R01`).
  - Menolak mirror embed palsu sebagai media native (`SRC-R02`).
  - Memvalidasi kualitas 1080p riil via HLS stream inf / MP4 dimensions (`SRC-R03`).
  - Menjamin integritas subtitle Indonesia & mencegah kebocoran hardsub Arab gundul (`SRC-R04`).
  - Mengunci keamanan proxy terhadap serangan SSRF & manipulasi token (`SRC-R05`).
  - Memperbaiki layout pemutar Liquid Glass agar kontrol tidak menutupi subtitle WebVTT (`SRC-R06`).
- **Data Integrity Track Hero Top 10 (HERO-D01..D06):**
  - Mengukur delta lonjakan aktivitas harian AniList `Page.mediaTrends` (`HERO-D01`).
  - Pemisahan tegas label fallback: `#1 TERPOPULER` bila offline, bukan `#1 HARI INI` (`HERO-D03`).
  - Memisahkan rotasi visual 10 detik dari network fetching (`HERO-D05`).
- **Release Gating:** Penutupan isu rilis publik #20 tetap bergantung pada pemenuhan gerbang G1–G6 dan kriteria akseptansi formal.
- **Rujukan Masterplan Terpadu:** Proposal lengkap terdokumentasi di [`../04-yoru-multi-source-masterplan.md`](../04-yoru-multi-source-masterplan.md).

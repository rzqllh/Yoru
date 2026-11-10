# Addendum 2026-11-04 — docs/planning/CURRENT_STATE.md (Revisi 2)

| Metadata | Nilai |
|---|---|
| Tanggal | 2026-11-04 |
| Yomirra | `preview` @ `e102fbc7484908b5452441cd84938d913856bee6` (di luar scope) |
| Yoru Baseline | `main` @ `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` |
| Local Worktree | `main` dirty (uncommitted local fixes on daily-trends, player UX, provider tests) |
| Status | **DRAFT - belum di-commit; usulan append resmi** |
| Banner | **Rekonsiliasi kondisi riil implementasi lokal vs remote main per 4 November 2026.** |

**Penempatan:** Blok di bawah adalah usulan untuk di-*append* pada `docs/planning/CURRENT_STATE.md` setelah owner review.

---

## 2026-11-04 — Rekonsiliasi Kondisi Riil: Remote Main vs Local State

### 1. Status Git & Baseline
- **Remote `origin/main`:** Berada pada SHA `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` (*feat(provider): generalize aggregator adapter with singleflight id mapping and AGGREGATOR_API_BASE support (#157)*).
- **Local Working Tree:** Branch `main` up to date dengan remote, namun memuat uncommitted changes lokal hasil perbaikan sesi sebelumnya:
  - `backend/pipeline/daily-trends.ts`: Perbaikan integrasi AniList `Page.mediaTrends` snapshot 15:00 UTC (00:00 JST), ranking `activity` murni, dan deduplikasi ID.
  - `frontend/src/App.tsx`: Pemisahan badge `#1 HARI INI` vs `#1 TERPOPULER`, timer rotasi 10 detik dengan reset interaksi manual, dan isolasi fallback D02.
  - `tests/daily-trends.test.mjs`: Penambahan 6 skenario pengujian deterministik integritas data.
  - Uncommitted untracked files: `backend/providers/universal.ts`, `backend/providers/indonesia.ts`, `backend/api/proxy.ts`, `tests/universal-stream.test.mjs`, `tests/aggregator-federation.test.mjs`.

### 2. Rekonsiliasi Klaim vs Bukti Nyata

| Aspek / Klaim | Status Bukti | Fakta Teknis yang Direkonsiliasi |
|---|---|---|
| **7 Kandidat Provider Asli** | `SOURCE_READ` + `UNKNOWN` | 0 dari 7 penyedia telah disetujui izin siarnya; implementasi live belum divalidasi end-to-end pada produksi. |
| **Ekosistem Agregator** | `ARCH_REFERENCE` | Ekosistem (Tatap, Aniraku, Anivexa, CloudStream, Seanime) dipetakan ke 5 taksonomi; belum diaktifkan di runtime. |
| **Klaim 229 Passing Tests** | `REPORTED_BY_AGY` | Test suite lokal `node --test tests/*.test.mjs` dilaporkan 229/229 lulus di sesi AGY; menunggu review independen Rinne. |
| **Top 10 Tren Harian AniList** | `REPORTED_BY_AGY` | Endpoint `/api/anime/daily-trends` mengembalikan status 200 dengan 10 anime lonjakan aktivitas harian (Overgeared #1). |
| **Kualitas 1080p Riil** | `UNVERIFIED` | Sebagian sumber masih menggunakan label statis; pengukuran resolusi decoding fisik belum dilakukan. |
| **Integritas Subtitle** | `PROPOSED` | Insiden hardsub bahasa Arab gundul (cera.online) pada SNK telah diisolasi; mitigasi VTT softsub terpisah belum di-deploy. |
| **Media Signed Proxy** | `THREAT MODEL AUDITED` | Kode proxy lokal (`proxy.ts`) memiliki filter loopback/private IP; audit keamanan penuh dan izin owner diperlukan sebelum aktif. |
| **Rilis Publik (Issue #20)** | **`NO-GO`** | Gerbang rilis publik tetap ditutup hingga seluruh kriteria akseptansi P0 dan P1 terverifikasi secara formal. |

### 3. Batasan Fase Dokumentasi
Dalam fase rekonsiliasi ini, **0 baris kode aplikasi diubah**. Seluruh analisis dicatat dalam dokumen perancangan draf terisolasi.

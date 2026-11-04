# Yoru Documentation Draft Pack — 2026-11-04 (Revisi 2)

Status: **DRAFT - belum di-commit**.
Dokumentasi perancangan terpadu untuk Source Federation, Audit Kritis Implementasi Lokal, dan Integritas Data Tren Harian AniList.

## Snapshot Status & Repositori

- **Historical Baseline SHA:** `rzqllh/Yoru` `main` @ `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` (commit: *feat(provider): generalize aggregator adapter with singleflight id mapping and AGGREGATOR_API_BASE support (#157)*).
- **Local Working Tree:** Branch `main` up to date with `origin/main`; memuat uncommitted local changes untuk perbaikan endpoint daily-trends AniList dan mitigasi fallback D02.
- **Yomirra Baseline:** `rzqllh/Yomirra` `preview` @ `e102fbc7484908b5452441cd84938d913856bee6` (referensi arsitektur saja; di luar scope).

## Daftar 12 Berkas Paket Dokumentasi

1. [`00-contract.md`](00-contract.md) — Kontrak refactor UI, batasan fail-closed D02, integritas data hero, dan tata kelola multi-agent XYN. *(Diperbarui)*
2. [`01-token-catalogue.md`](01-token-catalogue.md) — Katalog token visual UI. *(Dipertahankan tanpa perubahan)*
3. [`02-matrix-yomirra.md`](02-matrix-yomirra.md) — Matriks token Yomirra. *(Dipertahankan tanpa perubahan; di luar scope)*
4. [`03-matrix-yoru.md`](03-matrix-yoru.md) — Matriks 145 ID Yoru dengan pemetaan arsitektur Source Federation, mitigasi overlap kontrol pemutar, dan hero daily indicators. *(Diperbarui)*
5. [`04-yoru-multi-source-masterplan.md`](04-yoru-multi-source-masterplan.md) — Masterplan perancangan multi-source, taksonomi ekosistem agregator, audit risiko SRC-R01..R06, track data HERO-D01..D06, dan roadmap P0/P1/P2. *(Diperbarui)*
6. [`README-review.md`](README-review.md) — Ringkasan paket dokumentasi draf dan audit trail rekonsiliasi. *(Berkas ini)*
7. [`planning-addenda/ACCEPTANCE_MATRIX.addendum-2026-11-04.md`](planning-addenda/ACCEPTANCE_MATRIX.addendum-2026-11-04.md) — Usulan kriteria akseptansi AC-SRC-MULTI-01..06 dan AC-HERO-01..04. *(Diperbarui)*
8. [`planning-addenda/CURRENT_STATE.addendum-2026-11-04.md`](planning-addenda/CURRENT_STATE.addendum-2026-11-04.md) — Rekonsiliasi status implementasi lokal vs remote main dan pembatasan bukti. *(Diperbarui)*
9. [`planning-addenda/MASTER_PLAN.addendum-2026-11-04.md`](planning-addenda/MASTER_PLAN.addendum-2026-11-04.md) — Usulan append keputusan arsitektural multi-source dan integritas ranking. *(Diperbarui)*
10. [`planning-addenda/PHASE_PLAN.addendum-2026-11-04.md`](planning-addenda/PHASE_PLAN.addendum-2026-11-04.md) — Pemetaan paket kerja P0/P1/P2 ke fase repo yang sudah ada (Fase 01, 02, 08, 09). *(Diperbarui)*
11. [`planning-addenda/PROVIDERS.addendum-2026-11-04.md`](planning-addenda/PROVIDERS.addendum-2026-11-04.md) — Transparansi pembatasan penyedia dan larangan klaim streaming 100%. *(Diperbarui)*
12. [`planning-addenda/TRACKING.addendum-2026-11-04.md`](planning-addenda/TRACKING.addendum-2026-11-04.md) — Pelacak status 7 kandidat, taksonomi agregator, dan ledger blocker. *(Diperbarui)*

## Batas dan Cara Pakai

- Dokumen resmi di `docs/planning/` **tidak ditimpa langsung** dalam fase ini untuk menjaga integritas riwayat repositori.
- Seluruh addenda di `planning-addenda/` disiapkan sebagai draf proposal append yang dapat direview dan di-commit terpisah setelah persetujuan eksplisit owner.
- Tidak ada source yang diaktifkan secara runtime. Tidak ada izin media pihak ketiga yang diasumsikan. Issue rilis publik #20 tetap berstatus **NO-GO** hingga seluruh gerbang bukti terpenuhi.

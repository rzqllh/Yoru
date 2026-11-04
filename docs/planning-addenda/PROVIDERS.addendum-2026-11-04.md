# Addendum 2026-11-04 — docs/public/providers.md (Revisi 2)

| Metadata | Nilai |
|---|---|
| Tanggal | 2026-11-04 |
| Yomirra | `preview` @ `e102fbc7484908b5452441cd84938d913856bee6` (di luar scope) |
| Yoru Baseline | `main` @ `464e7a7c46f869675a07c4f2bbf27b8e541bb3af` |
| Status | **DRAFT - belum di-commit; usulan append resmi** |
| Banner | **Panduan transparansi publik: Pembatasan penyedia dan larangan klaim sepihak.** |

**Penempatan:** Blok di bawah adalah usulan untuk di-*append* pada `docs/public/providers.md` setelah persetujuan owner.

---

## 2026-11-04 — Transparansi Status Penyedia Media & Pembatasan Teknis

Yoru meneliti arsitektur federasi multi-sumber dengan target minimum lima penyedia direct HLS/MP4 independen berbasis perizinan yang sah, penelusuran asal media (*provenance*), dan verifikasi empiris pemutar native di Chromium dan Apple Safari iOS. 

### Poin Transparansi Publik:
1. **Daftar Riset Bukan Konfigurasi Aktif:** Tujuh nama penyedia kandidat (AnimeParadise, HiAnime, AnimePahe, Otakudesu, AllManga/AllAnime, Oploverz, Gomunime) merupakan daftar riset teknis internal, **belum aktif dalam aplikasi produksi**. URL sampel, token scraper, atau kredensial internal dilarang dipublikasikan.
2. **Tidak Ada Janji Streaming 100% (No Universal Playable Claim):** Cakupan metadata penjelajahan katalog (AniList/MAL) berbeda dengan ketersediaan video streaming riil. Episode yang belum tayang, ditarik dari peredaran, atau mengalami gangguan server hulu akan dilaporkan berstatus `unavailable` secara jujur.
3. **Kebijakan Fail-Closed D02:** Yoru menolak menyematkan pemutar iframe pihak ketiga tanpa kontrol subtitle internal. Hanya video dengan format direct stream HTTPS yang dapat diputar secara native.
4. **Integritas Resolusi & Subtitle:** Label kualitas (1080p/720p) wajib mencerminkan resolusi video terukur riil. Trek subtitle Bahasa Indonesia diverifikasi kebersihannya dari hardsub bahasa asing.
5. **Rilis Publik #20:** Seluruh integrasi penyedia tunduk pada gerbang rilis publik #20 dan otorisasi tertulis owner sebelum dipromosikan ke lingkungan publik.

# Yoru — Panduan Desain dan Pengalaman Pengguna

Dokumen ini menjelaskan antarmuka **web preview** Yoru dan batasan kemampuan yang terlihat oleh penonton. Acuan implementasi aktual saat ini adalah `frontend/src/styles.css`. Konsolidasi CSS menjadi satu kumpulan token yang tidak bertumpuk masih menjadi pekerjaan [YX-15](https://github.com/rzqllh/Yoru/issues/44), sehingga tabel di bawah menjelaskan nilai **efektif**, bukan klaim bahwa refactor sudah selesai.

## Prinsip pengalaman

1. **Anime lebih penting daripada dekorasi.** Prioritaskan poster, judul, episode, posisi tontonan, dan status sumber dibanding panel glass bertingkat.
2. **Informasi yang jujur.** Metadata episode, kandidat stream, dan hasil media yang benar-benar lolos pemeriksaan merupakan tiga status berbeda. Jangan gunakan angka penonton, label Sub Indo, 1080p, atau tombol Play yang tidak didukung data aktual.
3. **Watch-first, local-first.** Pengguna dapat meneruskan episode tanpa membuka detail ulang jika sumber native lolos pemeriksaan; progres disimpan di IndexedDB. Tidak ada akun/cloud.
4. **Aksesibilitas lebih dulu.** Target sentuhan iOS minimal 44pt, fokus keyboard jelas, reduced-motion dihormati, kontras teks diuji, dan hover bukan satu-satunya penanda keadaan.
5. **UI tidak mengendalikan sumber pihak ketiga.** Tidak semua player iframe bisa menggunakan kontrol kualitas/subtitle Yoru. Torrent berbasis `infoHash` hanya ditampilkan sebagai kandidat disabled sampai resolver nyata tersedia.

## Sistem visual efektif

### Palet dasar

| Token | Nilai efektif preview | Fungsi |
| --- | --- | --- |
| `--canvas` | `#090e16` | Latar utama |
| `--surface` | `rgba(24,32,46,.82)` | Panel glass utama |
| `--surface-2` | `rgba(38,47,64,.88)` | Panel/input sekunder |
| `--surface-hover` | `rgba(52,67,83,.89)` | Hover |
| `--line` | `rgba(200,215,235,.15)` | Border halus |
| `--line-strong` | `rgba(200,215,235,.27)` | Border kontrol |
| `--text` | `#f6f9fc` | Teks utama |
| `--soft` | `#ced9e5` | Teks pendukung |
| `--muted` | `#a3b0c1` | Metadata dan label sekunder |
| `--accent` | `#c7f68c` | Aksi/seleksi penting |
| `--accent-hover` | `#dcffa7` | Hover aksi |

Komposisi visual yang dituju adalah **60/30/10**: sekitar 60% kanvas/ruang negatif, 30% permukaan konten, dan maksimal 10% aksen/sinyal interaktif. Ini prinsip desain, bukan klaim hasil pengukuran piksel pada seluruh halaman. Nilai 60/20/10 tanpa kategori tambahan hanya berjumlah 90%, sehingga bukan pembagian lengkap.

### Radius, spasi dan tipografi

| Token | Efektif |
| --- | --- |
| `--radius-sm` | 10px |
| `--radius-md` | 15px |
| `--radius-lg` | 22px |
| `--radius-xl` | 26px |
| Skala spasi | 4 / 8 / 16 / 24 / 32 / 48px |
| Headline | Manrope, ukuran responsif |
| UI/body | DM Sans, dengan fallback font sistem |

Jangan menggunakan radius besar dan backdrop blur untuk setiap elemen. Kontrol, navigasi, kartu anime, dan modal harus memiliki hierarki visual yang terbaca di layar kecil. Blur sebaiknya dikurangi ketika performa GPU atau kontras teks memburuk; pengukuran perangkat nyata masih diperlukan.

## Arsitektur informasi

| Lokasi | Fungsi |
| --- | --- |
| `/` | Beranda, hero Top 10 yang diberi label sumber, lanjut menonton, seasonal/populer |
| `/jelajahi` | Pencarian serta kategori Musim ini, Populer, Akan datang |
| `/jelajahi/musim-ini`, `/jelajahi/populer`, `/jelajahi/akan-datang` | Shortcut kategori |
| `/jelajahi/panduan-urutan` | Subpage sekunder relasi anime, tidak menggantikan tab utama |
| `/jelajahi/panduan-urutan?anime=ID` | Panduan relasi langsung untuk MAL ID tertentu |
| `/koleksi`, `/koleksi/lanjut-menonton` | Watchlist dan resume |
| `/pengaturan` | Playback, sumber, subtitle, backup dan informasi aplikasi |

Panduan urutan hanya menampilkan **relasi langsung AniList** dan urutan tanggal rilis. Mode pengurutan metadata rekomendasi dan kronologi bercabang harus disabled jika belum ada data terkurasi. Rute editorial yang bersumber ditampilkan terpisah dari hasil pengurutan metadata; sumber, opsi jalur, dan peringatan spoiler harus terlihat. Hubungan prekuel/sekuel, side story, spin-off, dan alternate route tidak boleh secara otomatis diklaim membentuk satu canon linear.

## Komponen dan interaction contract

### Anime card, katalog dan hero

Poster memakai proporsi konsisten dan fallback jika artwork tidak ada. Skor ditandai sebagai skor katalog, bukan rating penonton Yoru. Judul panjang dapat dibungkus atau dipotong pada batas yang konsisten. Hero berotasi tiap 8 detik dengan kontrol manual serta penghentian saat tab tersembunyi atau reduced motion. Tren harian AniList hanya dipakai jika data lengkap; fallback diberi label popularitas katalog.

### Detail anime dan pemilihan episode

Detail memuat judul, metadata, sinopsis, daftar episode, pilihan sumber dan akses **Urutan cerita**. Label `Ada kandidat sumber · belum diperiksa` berarti **bukan** video siap diputar. Ketika pemeriksaan media gagal, berikan pilihan mencoba lagi atau memilih sumber lain. Kandidat infoHash Torrentio ditampilkan disabled beserta alasan, bukan 1080p palsu.

### Layar tonton

Player native merupakan layar tersendiri, bukan modal yang mengunci scroll halaman lain. Default kualitas HLS ialah **Auto**; opsi manual hanya muncul jika representasi aktual tersedia. Di browser yang tidak mengizinkan pemilihan representasi manual, pilihannya disabled.

Resume dari Beranda/Koleksi harus membuka episode/posisi tersimpan **setelah** pemeriksaan sumber native. Jika tidak tersedia, kembali ke detail anime untuk memilih alternatif tanpa menghapus progres.

Subtitle native WebVTT menyediakan bahasa, impor SRT/VTT, offset, font, ukuran, opasitas teks/latar, outline, posisi cue yang didukung browser, dan pratinjau. Ketersediaan subtitle bergantung pada file dan sumber yang benar-benar ada. Hardsub dan iframe eksternal tidak bisa dijanjikan mengikuti styling Yoru.

### Empty, loading dan failure states

Berikan alasan dan satu aksi yang relevan: `Coba lagi`, `Pilih sumber lain`, atau `Jelajahi anime`. Jangan menggunakan kartu statistik palsu `00`, CTA kosong, placeholder sumber yang seolah clickable, atau menampilkan error backend mentah pada antarmuka penonton.

## Copywriting

Gunakan bahasa Indonesia alami: `Beranda`, `Jelajahi`, `Koleksi`, `Lanjut menonton`, `Periksa sumber episode`, `Belum bisa diputar`. Hindari slogan generik, klaim `semua anime lengkap`, atau daftar kemampuan yang belum diujikan. Label sumber eksternal, trailer, subtitle, dan kualitas harus menggambarkan kemampuan aktual serta keterbatasannya.

## Progres manual pada rute editorial

Panel rute bersumber menampilkan jumlah langkah selesai, tombol **Tandai langkah berikutnya selesai** dan **Batalkan langkah terakhir**, serta judul berikutnya. Status tidak otomatis ditentukan oleh layanan streaming. Simpan progres secara terpisah per `pathId` di preferensi IndexedDB yang telah mendukung backup v1; validasi nilai dan batasi sesuai jumlah langkah rute. Di layar kecil, tindakan minimal 44px dan harus tetap bisa digunakan dengan keyboard.

## Pengujian yang masih wajib

CI Linux/Windows dan Chromium/WebKit browser test tidak menggantikan audit visual aksesibilitas lengkap, Core Web Vitals pada koneksi nyata, uji iPhone Safari fisik, serta playback live berbagai sumber. Catat bukti pengujian di [roadmap UX](https://github.com/rzqllh/Yoru/issues/44) dan [release gate](https://github.com/rzqllh/Yoru/issues/20). Tidak ada promotion ke `main` atau production tanpa persetujuan release eksplisit.

## Panduan urutan multi-franchise — interaksi dan kejujuran

Di `/jelajahi/panduan-urutan`, penelusuran berlaku untuk semua judul berkode MAL yang tersedia, bukan pilihan khusus Fate/SAO/Slime. Relasi AniList langsung tampil lebih dulu; tombol **Perluas hubungan (2 tingkat)** menjalankan satu perluasan terbatas (maksimal 10 tetangga langsung / 75 node), lengkap dengan status hasil parsial. Pengguna dapat memfilter TV, film, OVA/special/ONA, cabang cerita, rangkuman, dan lainnya. Gunakan `fieldset`/label yang mudah diakses dan ukuran target sentuh 44px.

Jangan menampilkan hasil network sebagai **timeline canon**; kategori `PREQUEL`, `ALTERNATIVE`, `SUMMARY`, `SAME_UNIVERSE` dan format film hanya menjelaskan relasi metadata. Urutan rilis berarti *tanggal anime*, bukan urutan novel, broadcast episode, atau posisi OVA setelah episode tertentu. Mode Disarankan dan Kronologi tetap disabled hingga ada sumber kurasi yang layak. Lihat [panduan publik](docs/public/watch-order.md) dan [riset kasus](docs/internal/WATCH_ORDER_RESEARCH_2026-10-30.md).

# Menggunakan Yoru

Yoru adalah PWA untuk mencari anime, melihat hubungan cerita, menyimpan koleksi, dan menonton dari sumber video kompatibel yang kamu pilih. Katalog anime tidak selalu berarti sebuah episode punya video siap putar.

## Beranda dan Jelajahi

**Beranda** menampilkan anime musim ini, tren harian AniList jika datanya lengkap, serta daftar tontonan yang bisa dilanjutkan. Jika tren harian tidak tersedia, labelnya berubah menjadi popularitas katalog; Yoru tidak menampilkan angka penonton yang tidak ada.

Di **Jelajahi**, pilih Musim ini, Populer atau Akan datang. Gunakan pencarian, genre, jenis anime, skor, tahun, dan urutan hasil. Hasil membutuhkan koneksi ke layanan katalog.

## Urutan season, OVA dan movie

Buka **Jelajahi → Panduan urutan anime** atau **Urutan cerita** di detail anime.

Yoru mengambil hubungan **langsung** dari AniList dan dapat menampilkan prekuel, sekuel, side story, alternatif, movie, atau OVA sesuai metadata. Tombol **Urutan rilis** menyusun berdasarkan tanggal yang tersedia. Ini **bukan** kronologi cerita atau urutan lengkap semua judul dalam satu franchise. Untuk Fate dan franchise bercabang, mode **Disarankan** dan **Kronologi** belum aktif karena memerlukan kurasi terverifikasi. Judul tanpa pemetaan MyAnimeList tidak dapat dibuka sebagai detail.

## Memulai video dan melanjutkan tontonan

1. Buka detail anime lalu pilih episode. Pilihan sumber video yang belum diperiksa bukan jaminan video dapat diputar.
2. Untuk video native HLS/MP4, Yoru mencoba memeriksa dekode video dalam browser sebelum membuka pemutar.
3. Jika sudah pernah menonton, tekan kartu **Lanjut menonton** di Beranda atau Koleksi. Yoru akan memeriksa ulang sumber episode terakhir dan mencoba membuka pemutar langsung di posisi tersimpan. Jika pemeriksaan gagal, detail anime terbuka agar kamu dapat memilih sumber lain.
4. Pilih **Kualitas Auto** untuk adaptasi kualitas HLS. Opsi resolusi hanya tersedia jika manifest media benar-benar mencantumkannya; pada beberapa browser pengaturan manual tidak tersedia.
5. Jika tidak ada video native, player embed eksternal dapat dicoba secara sadar. Yoru tidak mengendalikan codec, kualitas, maupun subtitle di dalam iframe tersebut.

Untuk mencoba kontrol tanpa sumber anime, buka **Pengaturan → Coba pemutar**. Demo HLS dengan WebVTT lokal tidak membuktikan kompatibilitas provider live.

## Subtitle

Di player native, menu **Subtitle** memprioritaskan kandidat Indonesia dari addon Stremio yang terkonfigurasi, lalu sumber subtitle lain yang tersedia; pilihan manual pengguna tetap dihormati. Ketersediaan Sub Indo, kualitas terjemahan, dan sinkronisasi harus diperiksa pada episode dan sumber aktual. Kamu juga dapat menambahkan file SRT/VTT dari perangkat.

Pilihan tampilannya mencakup jenis dan ukuran huruf, opasitas teks, opasitas latar, tebal outline, serta posisi atas/bawah/bawaan jika browser menyediakan `VTTCue` yang dapat diatur. Ada pratinjau tampilan. Preferensi dapat disimpan untuk seluruh Yoru atau anime tertentu. Dukungan `::cue` dan posisi antar-browser bisa berbeda; hardcoded subtitle dan iframe tidak dapat diubah dari Yoru.

## Torrentio dan sumber lain

Yoru mengenali deskriptor `infoHash` dari respons stream addon Stremio dan menampilkan kandidat torrent sebagai **belum bisa diputar** dengan alasan yang jelas. Itu bukan fitur streaming torrent aktif: browser tidak otomatis memutar magnet, dan Yoru saat ini tidak memiliki engine, debrid, atau resolver torrent bawaan. Sumber HLS/MP4 HTTPS tetap bisa diperiksa secara terpisah. Lihat [Panduan provider](providers.md) untuk konfigurasi.

## Koleksi, cadangan dan privasi

Simpan anime sebagai Ingin ditonton, Sedang ditonton, atau Selesai. Koleksi, progres, preferensi subtitle, dan pengaturan playback berada di **IndexedDB browser setempat**. Tidak ada akun atau sinkronisasi cloud.

Di **Pengaturan**, gunakan ekspor untuk membuat backup sebelum menghapus data browser atau berpindah perangkat; impor untuk memulihkan backup yang valid. Menghapus data situs dapat menghilangkan riwayat lokal jika tidak dicadangkan.

## Batasan aplikasi

PWA dapat di-install melalui browser yang mendukung, tetapi bukan IPA, APK, atau EXE. Offline shell tidak berarti episode video bisa ditonton offline. Hasil CI Chromium/WebKit belum menggantikan pengujian Safari di iPhone fisik. Status validasi publik dan pekerjaan yang masih terbuka ada di [release gate](https://github.com/rzqllh/Yoru/issues/20) serta [roadmap UX](https://github.com/rzqllh/Yoru/issues/44).

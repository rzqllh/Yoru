# Troubleshooting Yoru

Mulai dari browser komputer dan terminal yang menjalankan Yoru. Jika menemui error, lihat pesan lengkap, bukan hanya layar kosong.

| Gejala | Penyebab umum | Langkah |
| --- | --- | --- |
| `node` / `npm` tidak ditemukan | Node belum terinstal atau PATH lama | Instal Node 22.12+, buka terminal baru |
| `npm ci` gagal | Jaringan, lockfile, cache atau Node tidak cocok | Periksa versi Node dan koneksi; jangan hapus lockfile untuk mengakalinya |
| Port 5173/8787 sudah dipakai | Ada server lain yang berjalan | Hentikan instance lama, tutup terminal, lalu jalankan ulang |
| Beranda kosong / gagal memuat | Backend atau Tenrai tidak tersedia | Periksa `/api/health`, koneksi internet dan coba ulang |
| Anime muncul, tetapi episode belum bisa diputar | Metadata atau kandidat source belum lolos pemeriksaan browser | Pilih episode, periksa opsi sumber dan alasan penolakan; cocokkan `malId` dan episode |
| `INVALID_PROVIDER_CONFIG` | Format JSON/ID/URL salah | Bandingkan dengan file `.example` dan pastikan JSON valid |
| `SOURCE_UNAVAILABLE` | Addon gagal atau URL stream tidak didukung | Cek URL manifest HTTPS, ID episode, timeout dan respons addon |
| Video hitam / terus loading | Codec, CORS, URL kedaluwarsa, HLS segment, browser | Coba pemutar demo; cek Network/Console; uji sumber lain |
| Torrentio 1080p ditampilkan disabled | Addon hanya mengembalikan `infoHash/fileIdx`, bukan URL media langsung | Ini belum bisa diputar di Yoru; butuh engine/resolver yang terverifikasi. Cari URL HLS/MP4 HTTPS yang kompatibel |
| Resolusi manual tidak bisa dipilih | Manifest tidak menawarkan level berbeda atau browser menggunakan HLS native | Gunakan kualitas Auto; jangan menganggap 1080p tersedia dari label source |
| Posisi/opacity subtitle tidak terlihat berubah | Hardsub, iframe, atau browser membatasi `::cue`/`VTTCue` | Gunakan track WebVTT native jika tersedia; periksa pratinjau dan browser lain |
| Panduan urutan tidak menunjukkan seluruh Fate atau SAO | Explorer saat ini hanya menampilkan relasi langsung AniList dan urutan rilis | Pilih judul lain dalam cabang franchise; mode kronologi/rekomendasi belum dikurasi |
| Lanjut menonton kembali ke detail anime | Pemeriksaan sumber native terakhir tidak berhasil | Pilih sumber lain secara manual; progres lokal tetap tersimpan |
| Subtitle Indonesia tidak terlihat | Track tidak ada, file tidak bisa diakses, atau format tidak cocok | Periksa `tracks`, `lang: "id"`, URL `.vtt` dan opsi subtitle player |
| PWA tidak muncul tombol Install | Tidak memakai build produksi atau secure context | Jalankan `npm run build && npm start` secara terpisah; gunakan localhost/HTTPS |
| Offline hanya bisa membuka shell | Katalog/video remote tidak di-cache | Ini desain saat ini; kembali online untuk mengambil metadata/video |
| Koleksi/progress hilang | Site data/browser storage dibersihkan | Impor backup sebelumnya; tidak ada cloud sync otomatis |

## Cara memeriksa backend

Jalankan `npm run dev`, lalu buka:

- `http://127.0.0.1:8787/api/health` — API hidup.
- `http://127.0.0.1:8787/api/providers` — daftar provider aktif, atau kosong jika belum dikonfigurasi.

Jika player contoh **berfungsi** tetapi anime dari sumbermu tidak, masalah biasanya berada pada URL, codec, CORS atau subtitle sumber tersebut, bukan katalog.

## Khusus iPhone

Safari harus mengakses server melalui **HTTPS tepercaya** ketika berasal dari perangkat lain (bukan `localhost` iPhone). HLS biasanya memakai dukungan native Safari, tetapi setiap stream dan subtitle tetap perlu dites. Fitur fullscreen/PiP tergantung Safari dan versi iOS. Tidak ada klaim bahwa iOS sudah lolos tes fisik.

Jika masih gagal, buat issue di [GitHub Issues](https://github.com/rzqllh/Yoru/issues) dengan OS/browser, langkah reproduksi, pesan error (tanpa token), dan apakah Coba pemutar berfungsi.

## Ketika sebagian provider masih bekerja

Jika satu provider memiliki konfigurasi rusak, API tetap mengembalikan episode/provider sehat serta `warnings` berisi ID sumber yang gagal. **Pengaturan** menampilkan sumber yang bermasalah. Perbaiki file lokal terkait dan klik refresh provider. Jika *semua* konfigurasi gagal dibaca, API mengembalikan 422. Jangan menafsirkan daftar kosong sebagai keberhasilan streaming.

## Metadata sesudah 1 Oktober 2026

Jikan Public API sudah dihentikan. Yoru menggunakan Tenrai `/v1` untuk katalog MyAnimeList. Jika katalog tetap kosong, cek respon `GET /api/anime/discover?kind=season&page=1` dan status Tenrai; kode `503` menandakan upstream belum tersedia. Tombol *Coba lagi* tidak dapat memperbaiki upstream yang offline.

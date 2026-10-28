# Troubleshooting Yoru

Mulai dari browser komputer dan terminal yang menjalankan Yoru. Jika menemui error, lihat pesan lengkap, bukan hanya layar kosong.

| Gejala | Penyebab umum | Langkah |
| --- | --- | --- |
| `node` / `npm` tidak ditemukan | Node belum terinstal atau PATH lama | Instal Node 22.12+, buka terminal baru |
| `npm ci` gagal | Jaringan, lockfile, cache atau Node tidak cocok | Periksa versi Node dan koneksi; jangan hapus lockfile untuk mengakalinya |
| Port 5173/8787 sudah dipakai | Ada server lain yang berjalan | Hentikan instance lama, tutup terminal, lalu jalankan ulang |
| Beranda kosong / gagal memuat | Backend atau Jikan tidak tersedia | Periksa `/api/health`, koneksi internet dan coba ulang |
| Kartu anime ada, tetapi tidak ada tombol play | Belum ada provider untuk MAL ID/episode | Isi config lokal; cocokkan `malId` dan nomor episode |
| `INVALID_PROVIDER_CONFIG` | Format JSON/ID/URL salah | Bandingkan dengan file `.example` dan pastikan JSON valid |
| `SOURCE_UNAVAILABLE` | Addon gagal atau URL stream tidak didukung | Cek URL manifest HTTPS, ID episode, timeout dan respons addon |
| Video hitam / terus loading | Codec, CORS, URL kedaluwarsa, HLS segment, browser | Coba Test player; cek Network/Console; uji sumber lain |
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

Jika masih gagal, buat issue di [GitHub Issues](https://github.com/rzqllh/Yoru/issues) dengan OS/browser, langkah reproduksi, pesan error (tanpa token), dan apakah Test player berfungsi.

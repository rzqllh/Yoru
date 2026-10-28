# Cara menggunakan Yoru

## Beranda dan Jelajahi

- **Beranda** menampilkan rekomendasi dan kategori anime dari katalog Jikan.
- **Jelajahi** memuat daftar berdasarkan kategori/halaman.
- **Cari** berdasarkan judul; pilih kartu untuk membuka detail, sinopsis dan daftar episode.
- Gambar, metadata, dan hasil pencarian membutuhkan koneksi. Jika Jikan sedang terbatas, coba beberapa saat lagi.

## Koleksi dan progress

Dari detail anime, tambahkan ke **Koleksi**. Yoru menyimpan status seperti **Ingin Ditonton**, **Sedang Ditonton**, atau **Selesai**. Setelah playback berjalan, progress episode dapat disimpan secara lokal dan tersedia untuk **lanjut menonton**.

**Data tidak berpindah otomatis** ke perangkat/browser lain. Browser menyimpan library dan watch progress menggunakan IndexedDB; membersihkan site data dapat menghapusnya.

## Menonton video

1. Jika belum punya sumber anime, buka **Pengaturan → Test player**.
2. Jika sudah punya sumber, ikuti [Panduan provider](providers.md), kemudian buka anime dengan MAL ID yang sesuai.
3. Pilih episode yang tersedia. Bila ada lebih dari satu sumber, pilih sumbernya.
4. Saat video memuat, gunakan kontrol player. Subtitle hanya ditampilkan sebagai Indonesia jika sumber memang menyediakan track `lang: "id"` atau hardsub yang benar.

**Yang belum tersedia:** pencarian sumber anime otomatis, download offline media, torrent, cloud sync, serta subtitling AI. PWA offline hanya mempertahankan shell aplikasi dan data lokal.

## Ekspor/impor data

Buka **Pengaturan** dan gunakan tombol ekspor untuk menyimpan backup koleksi/progress. Simpan file di tempat yang aman. Untuk mengembalikannya, pilih impor backup yang valid. Proses impor menggunakan schema ber-versi dan validasi; jangan mengubah isi JSON secara manual.

## Beda PWA dan aplikasi native

PWA dapat dipasang dari browser yang mendukung, tetapi **bukan** APK/IPA/EXE. Browser masih memiliki batasan codec, CORS, fullscreen dan storage masing-masing platform. Lihat [Status distribusi](releases.md) sebelum mencari installer.

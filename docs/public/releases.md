# Status rilis Yoru

**Status saat ini: web preview, belum final public release.** Kode pada branch preview tidak otomatis sama dengan `main` atau website production. Publikasi produksi membutuhkan persetujuan pemilik dan bukti release gate [#20](https://github.com/rzqllh/Yoru/issues/20).

## Jenis unduhan

| Bentuk | Ketersediaan |
| --- | --- |
| Source code | Tersedia dari GitHub; membutuhkan Node.js untuk menjalankan aplikasi |
| PWA web lokal | Bisa dijalankan dengan `npm ci`, `npm run build`, dan `npm start` |
| GitHub Actions artifact | Bukti build/pengujian untuk developer, bukan installer |
| Windows EXE, Android APK, iOS IPA | **Belum dirilis** |

ZIP source atau hasil build bukan installer. Arsip ZIP web build versi lama `v0.9.0-rc.1` pernah disalahartikan sebagai aplikasi siap pakai dan telah ditarik sebagai asset release; source archive otomatis GitHub tetap dapat ditampilkan oleh platform.

## Fitur pada branch preview

Yoru menyediakan katalog anime, pencarian dan filter, hero tren harian AniList dengan label sumber, watchlist/progres lokal, resume satu ketukan setelah memeriksa sumber, player native HLS/MP4, mode embed eksternal, serta kontrol subtitle WebVTT. Detail anime dan Jelajahi dapat membuka **Panduan urutan anime** untuk judul apa pun dengan mapping katalog. Relasi langsung AniList tersedia secara default; perluasan dua tingkat tersedia opt-in dengan batas fan-out, cache, label hasil parsial dan kategori TV/film/OVA/cabang/rangkuman. Urutannya **tetap tanggal rilis**, bukan kronologi canon.

Untuk HLS yang terpapar ke hls.js, kualitas **Auto** menjadi default dan hanya representasi yang benar-benar ditemukan pada manifest yang dapat dipilih. Penyesuaian caption native mencakup font, ukuran, opasitas teks/latar, outline, dan posisi saat browser mengizinkannya. Semua kontrol ini memiliki batasan per browser dan tidak memodifikasi subtitle permanen/iframe.

Addon Stremio opt-in dapat mengembalikan sumber HTTPS langsung atau metadata torrent bergaya Torrentio. Kandidat `infoHash` dikenali dan ditampilkan **disabled**, bukan diputar. Mesin/resolver torrent bawaan belum tersedia; tidak ada klaim kompatibilitas live atas seluruh addon.

**Sudah di preview**: beberapa rute editorial berreferensi untuk Fate dan Monogatari, dengan pilihan alternatif, sumber dan penanda risiko spoiler. Ini rekomendasi terbatas, bukan kurasi lengkap setiap anime atau urutan canon otomatis.\n\n**Belum selesai**: panduan terkurasi menyeluruh termasuk kronologi/urutan episode khusus untuk Fate/SAO/Slime dan franchise lain, progres per-jalur franchise, resolver torrent nyata, dukungan akun/cloud, verifikasi video/subtitle provider secara live, pengujian Safari iPhone fisik, dan pemeriksaan deployment publik end-to-end.

Lihat [cara menggunakan Yoru](using-yoru.md), [konfigurasi provider](providers.md), [roadmap UX](https://github.com/rzqllh/Yoru/issues/44), dan [release gate](https://github.com/rzqllh/Yoru/issues/20). Tes CI Chromium/WebKit tidak menggantikan bukti pemutaran anime nyata atau pengujian perangkat fisik.

Panduan penggunaan lebih lanjut: [menilai hubungan anime dan mengirim koreksi](watch-order.md). Tidak ada klaim bahwa komunitas telah memverifikasi seluruh franchise.

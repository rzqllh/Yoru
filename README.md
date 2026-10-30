# Yoru

Yoru membantu kamu mencari anime Jepang, menyimpan koleksi, dan melanjutkan tontonan dari browser. Data koleksi dan posisi tontonan tersimpan di perangkatmu.

Versi saat ini adalah web preview. Menemukan anime di katalog tidak menjamin videonya tersedia. Pemutaran memerlukan sumber yang kompatibel; bahasa subtitle mengikuti track yang disediakan sumber tersebut.

## Mulai di komputer

Siapkan Node.js 22.12 atau lebih baru, npm, dan Git.

```sh
git clone https://github.com/rzqllh/Yoru.git
cd Yoru
npm ci
npm run dev
```

Buka http://127.0.0.1:5173. Untuk mencoba video dan subtitle contoh, buka **Pengaturan > Test player**. Contoh ini membantu memeriksa pemutar, bukan membuktikan ketersediaan video anime.

Untuk menjalankan hasil build dan mencoba pemasangan PWA:

```sh
npm run build
npm start
```

Buka http://127.0.0.1:8787. Gunakan menu pemasangan aplikasi di browser yang mendukungnya. Perangkat lain memerlukan koneksi HTTPS tepercaya.

## Yang bisa kamu lakukan

| Kebutuhan | Dukungan saat ini |
| --- | --- |
| Mencari anime dan membaca detailnya | Katalog online menggunakan Tenrai/MyAnimeList |
| Menyimpan koleksi dan melanjutkan tontonan | Data tersimpan lokal di browser |
| Memutar video | HLS/MP4 yang kompatibel dan pilihan player eksternal |
| Menggunakan subtitle | Track yang tersedia pada sumber; dukungan berbeda menurut player |
| Memindahkan koleksi | Ekspor dan impor backup |
| Membuka aplikasi tanpa jaringan | Shell aplikasi dan data tersimpan; katalog baru dan video online tetap memerlukan jaringan |

Yoru belum menyediakan akun, sinkronisasi cloud, torrent, atau installer Windows/APK/IPA. Pengujian Safari pada iPhone fisik masih diperlukan. [Status rilis](docs/public/releases.md) menjelaskan batas dukungan dan unduhan yang tersedia.

## Status rilis dan blocker

Yoru masih merupakan web preview, bukan layanan streaming publik yang sudah tervalidasi. Sebelum menyatakan siap rilis, selesaikan dan lampirkan bukti untuk provider video nyata, validasi availability lintas anime/episode, integrasi subtitle live, pengujian pada iPhone Safari fisik, hosting HTTPS beserta kontrol keamanan/rollback, serta persetujuan akhir. Rincian dan status setiap gate ada di [Public release gate](https://github.com/rzqllh/Yoru/issues/20) dan [Action items rilis](docs/public/releases.md#action-to-be-taken-before-public-release).

## Menambahkan sumber dan menjaga data

Ikuti [panduan sumber video](docs/public/providers.md) untuk media HTTPS milikmu atau addon yang kompatibel. Hanya gunakan media yang berhak kamu akses. Ketersediaan, kualitas, dan subtitle dari pihak lain dapat berubah.

Koleksi tersimpan di browser, bukan akun online. Membersihkan penyimpanan browser dapat menghapusnya. Ekspor backup melalui aplikasi sebelum mengganti perangkat atau membersihkan data. Jangan commit konfigurasi lokal atau token.

## Panduan

| Tujuan | Bacaan |
| --- | --- |
| Menjalankan aplikasi | [Panduan mulai](docs/public/getting-started.md) |
| Memakai koleksi, resume, dan backup | [Menggunakan Yoru](docs/public/using-yoru.md) |
| Menambahkan video dan subtitle | [Sumber video](docs/public/providers.md) |
| Mengatasi masalah | [Pemecahan masalah](docs/public/troubleshooting.md) |
| Berkontribusi | [Pengembangan](docs/public/development.md) dan [panduan desain](DESIGN.md) |
| Menilai kesiapan deployment | [Persyaratan rilis](docs/public/production-readiness.md) |

## Inspirasi dan penghargaan


Yoru adalah implementasi tersendiri. Proyek berikut dipelajari sebagai referensi ide, pengalaman penggunaan, atau kontrak publik, bukan sebagai klaim bahwa seluruh fiturnya sudah ada di Yoru. Terima kasih kepada para maintainer dan kontributor:

- [Tatap](https://github.com/asfaraguest/tatap): pengalaman player anime lintas platform, penyimpanan lokal dan subtitle.
- [Kazumi](https://github.com/Predidit/Kazumi) & [KazumiRules](https://github.com/Predidit/KazumiRules): gagasan format rules terpisah dari aplikasi; engine Kazumi tidak di-embed.
- [CloudStream](https://github.com/recloudstream/cloudstream) dan [Aniyomi](https://github.com/aniyomiorg/aniyomi): pola ekosistem extension dan library.
- [Nuvio Mobile](https://github.com/NuvioMedia/NuvioMobile): UI media multi-platform dan bring-your-own-sources.
- [AIOStreams](https://github.com/Viren070/AIOStreams): gagasan seleksi/penyatuan sumber; bukan dependency di Yoru.
- [AnimeEmbed](https://www.animeembed.com/): kontrak embed berdasarkan MAL ID (ketersediaan dan subtitle bergantung pada layanan eksternal).
- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk): kontrak addon manifest dan stream HTTP/JSON.
- [anime-sdk](https://github.com/hexxt-git/anime-sdk): pendekatan normalisasi metadata dan provider; tidak dibundel.
- [Wajik Anime API](https://github.com/wajik45/wajik-anime-api), [Nonton Indo](https://github.com/ExtremeBoyGG/nonton-indo): referensi variasi sumber Sub Indo; adapter mereka tidak dibundel.
- [Magnetio](https://github.com/peterdsp/Magnetio): referensi arsitektur torrent/indexer untuk kemungkinan tahap mendatang; torrent belum didukung.

Layanan/pustaka yang digunakan Yoru, antara lain [Jikan](https://jikan.moe/) (metadata dari MAL), [React](https://react.dev/), [Vite](https://vite.dev/), [Hono](https://hono.dev/), [hls.js](https://github.com/video-dev/hls.js), dan [idb](https://github.com/jakearchibald/idb). Nama serta merek proyek lain tetap milik pemiliknya dan tidak menyatakan afiliasi. Ketentuan dan lisensi setiap dependency tetap berlaku; lihat `LICENSE`, `package-lock.json`, dan lisensi paket masing-masing.


## Lisensi

Kode original Yoru menggunakan [MIT](LICENSE). Konten, metadata, gambar, video, dan subtitle dari pihak lain memiliki hak penggunaan masing-masing. Nama proyek referensi tidak menyatakan afiliasi.

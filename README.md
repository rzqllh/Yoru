# Yoru

**Anime discovery, player, dan koleksi pribadi — langsung dari browser.**

Yoru adalah proyek open-source (MIT) berbasis **PWA**: jelajahi katalog anime Jepang, cari judul, buka detail, simpan ke koleksi, dan lanjutkan tontonan. Katalog menggunakan Tenrai/MyAnimeList. Yoru mengintegrasikan pemutar eksternal AnimeEmbed secara dua arah berbasis MAL ID dan episode: progres tontonan tersinkronisasi otomatis ke IndexedDB lokal dan mendukung pemutaran lanjutan (*resume playback* via `?start=...`). Subtitle bawaan AnimeEmbed adalah English Subtitle; untuk subtitle Bahasa Indonesia (WebVTT), gunakan pemutar demo lokal atau konfigurasi provider stream kustom.

> **Status:** Web **preview & release candidate**, bukan installer native final. Demo video HLS + subtitle bahasa Indonesia tersedia langsung. Streaming anime nyata didukung via integrasi AnimeEmbed dan file konfigurasi lokal; belum diuji di Safari iOS fisik. Tidak ada file installer native (Windows EXE, Android APK, atau iOS IPA) yang dirilis pada tahap ini.

## Mulai dalam beberapa menit

**Perlu:** [Node.js 22.12+](https://nodejs.org/) (termasuk npm), Git, dan internet saat instalasi/katalog.

```sh
git clone https://github.com/rzqllh/Yoru.git
cd Yoru
npm ci
npm run dev
```

Buka **http://127.0.0.1:5173** di browser komputer. Masuk ke **Pengaturan → Test player** untuk melihat contoh HLS 9 detik dan subtitle Indonesia tanpa mencari sumber anime.

**Untuk PWA yang bisa di-install:** hentikan `npm run dev`, lalu jalankan:

```sh
npm run build
npm start
```

Buka **http://127.0.0.1:8787**. Di browser yang mendukung instalasi PWA, gunakan menu **Install app / Add to Home Screen**. `localhost` biasanya memenuhi syarat secure context; perangkat lain di jaringan memerlukan HTTPS tepercaya.

> **Tidak perlu mengunduh ZIP release:** source resmi ada di tombol **Code → Download ZIP** GitHub jika tidak memakai Git. ZIP source **bukan aplikasi siap-install**. GitHub Release tidak lagi menampilkan ZIP web build yang masih memerlukan langkah developer. Ikuti instruksi di atas untuk menjalankan versi web saat ini.

## Apa yang sudah bisa digunakan?

| Fitur | Status | Perlu internet / source? |
| --- | --- | --- |
| Beranda, seasonal/top/upcoming, cari dan detail anime Jepang | Tersedia | Internet untuk Tenrai |
| Daftar episode, pemilihan source dan pemutar eksternal AnimeEmbed | Tersedia; terintegrasi dua arah dengan pelacakan progress & resume lokal | Ya, internet |
| Pemutar HLS/MP4 + track subtitle WebVTT | Tersedia; contoh lokal sudah diuji Chromium | Contoh lokal: tidak; media nyata: ya |
| Watchlist, progress dan resume | Tersedia di IndexedDB browser | Tidak untuk data tersimpan |
| Backup ekspor/impor data pribadi | Tersedia | Tidak |
| Install PWA dan shell offline | Tersedia di build produksi | Katalog baru tetap membutuhkan internet |
| Provider lokal HTTPS dengan file JSON | Tersedia | Konfigurasi manual |
| Jembatan addon Stremio HTTPS HLS/MP4 | Tersedia secara opt-in | Addon + mapping episode manual |
| Rule scraper arbitrer, torrent/magnet, cloud sync | Belum tersedia | — |
| Installer Windows / APK / IPA | Belum tersedia | — |

**Privasi:** data koleksi/progress disimpan di browser melalui IndexedDB; tidak ada akun atau cloud sync. Data browser dapat terhapus bila storage dibersihkan, jadi ekspor backup jika datanya penting.

## Ingin menonton episode anime?

Yoru tidak memasukkan provider streaming anime secara default. Tambahkan URL HLS (`.m3u8`) atau MP4 HTTPS yang dapat diputar oleh browser, dengan MAL ID dan nomor episode yang cocok:

1. Salin `configs/providers.local.json.example` menjadi `configs/providers.local.json`.
2. Ganti `malId`, `number`, `url`, serta track subtitle sesuai media yang kamu punya.
3. Simpan dan buka kembali detail anime yang sesuai; pilih episode → source → Play.

Jangan memasukkan token ke URL atau commit file `*.local.json`. Stream tanpa dukungan CORS, codec atau subtitle browser mungkin tidak bisa diputar. Untuk alternatif addon HTTP/JSON, lihat **[Panduan provider](docs/public/providers.md)**.

## Dokumentasi

| Mulai dari sini | Untuk apa |
| --- | --- |
| [Panduan mulai](docs/public/getting-started.md) | Instalasi Windows/macOS/Linux, demo player dan PWA |
| [Panduan penggunaan](docs/public/using-yoru.md) | Jelajah anime, library, resume dan backup |
| [Konfigurasi provider](docs/public/providers.md) | JSON stream, MAL ID, subtitle dan addon Stremio |
| [Pemecahan masalah](docs/public/troubleshooting.md) | Error instalasi, katalog, video, PWA, dan Safari |
| [Pengembangan & kontribusi](docs/public/development.md) | Perintah, arsitektur singkat, test dan kontribusi |
| [Status rilis](docs/public/releases.md) | Perbedaan source, web preview, dan native package |

## Pengujian player eksternal

Dalam pemeriksaan Chromium menggunakan origin lokal Yoru pada 29 Oktober 2026, AnimeEmbed mengembalikan media dengan metadata durasi untuk MAL ID **21 (One Piece)**, **52991 (Frieren)**, dan **1535 (Death Note)**. Pada sampel **One Piece episode 1**, video berhasil berjalan hingga sekitar **5,29 detik** dengan buffer aktif dan tanpa error media. Pemutar AnimeEmbed terintegrasi dua arah melalui pesan `postMessage` (dengan verifikasi origin dan validasi skema) yang menyimpan progres tontonan secara lokal ke IndexedDB serta mendukung query `?start=<seconds>` saat melanjutkan tontonan. Subtitle bawaan AnimeEmbed adalah English Subtitle. Ini bukan jaminan seluruh katalog dapat diputar tanpa kendala eksternal, bukan bukti Sub Indo pada AnimeEmbed, dan bukan verifikasi Safari iOS fisik.

## Pengembangan

```sh
npm ci
npm run check
npm run dev
```

Backend Hono: http://127.0.0.1:8787 · Frontend Vite: http://127.0.0.1:5173 · CI: lint, typecheck, unit test, build, Chromium E2E. Ketersediaan katalog mengikuti Jikan. **Jangan menyamakan tes video contoh dengan tes streaming provider nyata.**

## Inspirasi dan penghargaan

Yoru adalah implementasi tersendiri. Proyek berikut dipelajari sebagai **referensi ide, pengalaman penggunaan, atau kontrak publik**, bukan sebagai klaim bahwa seluruh fiturnya sudah ada di Yoru. Tidak ada penyalinan kode GPL/AGPL atau kode tanpa lisensi ke basis proyek ini. Terima kasih kepada para maintainer dan kontributor:

- [Tatap](https://github.com/asfaraguest/tatap) — pengalaman player anime lintas platform, penyimpanan lokal dan subtitle.
- [Kazumi](https://github.com/Predidit/Kazumi) & [KazumiRules](https://github.com/Predidit/KazumiRules) — gagasan format rules terpisah dari aplikasi; engine Kazumi **tidak** di-embed.
- [CloudStream](https://github.com/recloudstream/cloudstream) dan [Aniyomi](https://github.com/aniyomiorg/aniyomi) — pola ekosistem extension dan library.
- [Nuvio Mobile](https://github.com/NuvioMedia/NuvioMobile) — UI media multi-platform dan bring-your-own-sources.
- [AIOStreams](https://github.com/Viren070/AIOStreams) — gagasan seleksi/penyatuan sumber; **bukan** dependency di Yoru.
- [AnimeEmbed](https://www.animeembed.com/) — kontrak embed berdasarkan MAL ID (pemutaran belum terverifikasi, bukan dependency runtime).\n- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk) — kontrak addon manifest dan stream HTTP/JSON.
- [anime-sdk](https://github.com/hexxt-git/anime-sdk) — pendekatan normalisasi metadata dan provider; **tidak** dibundel.
- [Wajik Anime API](https://github.com/wajik45/wajik-anime-api), [Nonton Indo](https://github.com/ExtremeBoyGG/nonton-indo) — referensi variasi sumber Sub Indo; adapter mereka **tidak** dibundel.
- [Magnetio](https://github.com/peterdsp/Magnetio) — referensi arsitektur torrent/indexer untuk kemungkinan tahap mendatang; torrent **belum** didukung.

Layanan/pustaka yang digunakan Yoru, antara lain [Jikan](https://jikan.moe/) (metadata dari MAL), [React](https://react.dev/), [Vite](https://vite.dev/), [Hono](https://hono.dev/), [hls.js](https://github.com/video-dev/hls.js), dan [idb](https://github.com/jakearchibald/idb). Nama serta merek proyek lain tetap milik pemiliknya dan tidak menyatakan afiliasi. Ketentuan dan lisensi setiap dependency tetap berlaku; lihat `LICENSE`, `package-lock.json`, dan lisensi paket masing-masing.

## Lisensi

Kode original Yoru: **MIT**, lihat [LICENSE](LICENSE). Konten, metadata, gambar, video, dan subtitle dari pihak lain mempunyai hak penggunaan tersendiri. Tidak ada daftar stream pihak ketiga yang disematkan dalam repository ini.

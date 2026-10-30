# Yoru

**Anime discovery, player, dan koleksi pribadi — langsung dari browser.**

Yoru adalah proyek open-source (MIT) berbasis **PWA**: jelajahi katalog anime Jepang, cari judul, buka detail, simpan ke koleksi, dan lanjutkan tontonan. Katalog menggunakan Tenrai/MyAnimeList; sumber video **tidak otomatis dijamin**. Yoru juga menyediakan opsi mencoba player embed eksternal berdasarkan MAL ID dan episode; ketersediaan judul, kualitas dan subtitle (termasuk Bahasa Indonesia) **belum diverifikasi**. Untuk pemutaran langsung dan pelacakan progress lokal, hubungkan stream HTTPS melalui konfigurasi lokal atau addon Stremio yang kompatibel.

> **Status:** Web **preview**, bukan aplikasi native final. Demo video HLS + subtitle bahasa Indonesia tersedia tanpa konfigurasi provider. Streaming anime nyata bergantung pada sumber yang kamu masukkan sendiri; belum diuji end-to-end di Safari iOS. Tidak ada installer Windows, APK, atau IPA yang dirilis.

## Mulai dalam beberapa menit

**Perlu:** [Node.js 22.12+](https://nodejs.org/) (termasuk npm), Git, dan internet saat instalasi/katalog.

```sh
git clone https://github.com/rzqllh/Yoru.git
cd Yoru
npm ci
npm run dev
```

Buka **http://127.0.0.1:5173** di browser komputer. Masuk ke **Pengaturan → Coba pemutar** untuk melihat contoh HLS 9 detik dan subtitle Indonesia tanpa mencari sumber anime.

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
| Daftar episode, pemilihan source dan opsi player embed eksternal | Tersedia; external player bergantung layanan pihak ketiga dan belum teruji playback-nya | Ya, internet dan source |
| Pemutar HLS/MP4 + track subtitle WebVTT | Tersedia; contoh lokal sudah diuji Chromium | Contoh lokal: tidak; media nyata: ya |
| Watchlist, progress, dan lanjut menonton satu ketukan | Tersedia di IndexedDB; sumber episode diperiksa sebelum diputar ulang | Tidak untuk data tersimpan; playback butuh sumber |
| Backup ekspor/impor data pribadi | Tersedia | Tidak |
| Install PWA dan shell offline | Tersedia di build produksi | Katalog baru tetap membutuhkan internet |
| Provider lokal HTTPS dengan file JSON | Tersedia | Konfigurasi manual |
| Addon Stremio: HLS/MP4, subtitle, dan metadata sumber Torrentio | Opt-in; torrent berbasis hash ditampilkan **tidak dapat diputar**, bukan video siap tonton | Addon HTTPS dan mapping manual; tidak ada mesin torrent/debrid |
| Filter genre, jenis, skor, tahun, dan urutan | Tersedia melalui katalog; muat lebih banyak untuk halaman berikutnya | Internet untuk katalog |
| Subtitle SRT/VTT lokal, preferensi bahasa dan tampilan | Font, ukuran, opasitas teks/latar, outline, dan posisi WebVTT bila browser mendukung | Tidak berlaku untuk hardsub/iframe; Sub Indo tidak otomatis tersedia |
| Panduan urutan anime dan pilihan rute editorial | Graph AniList maksimal 2 tingkat + rute editorial terbatas dan bersumber (contoh Fate, Monogatari); **bukan urutan canon lengkap semua anime** | Internet untuk AniList; rute editorial tersedia lokal |
| Mesin torrent/magnet, debrid bawaan, urutan kronologi terkurasi, cloud sync | Belum tersedia | — |
| Installer Windows / APK / IPA | Belum tersedia | — |

**Privasi:** data koleksi/progress disimpan di browser melalui IndexedDB; tidak ada akun atau cloud sync. Data browser dapat terhapus bila storage dibersihkan, jadi ekspor backup jika datanya penting.

## Menemukan urutan anime

Buka **Jelajahi → Panduan urutan anime**, atau pilih **Urutan cerita** pada detail anime. Pencarian ini berlaku untuk judul anime apa pun yang punya identitas katalog; pilih **Perluas hubungan (2 tingkat)** untuk menelusuri keterkaitan tambahan secara terbatas. Yoru memperlihatkan relasi langsung dari AniList, termasuk prekuel, sekuel, spin-off, OVA, dan movie jika metadata tersedia. Urutan yang dapat dilihat saat ini adalah **urutan rilis berdasarkan tanggal metadata**; bukan jaminan urutan menonton terbaik maupun kronologi canon. Mode **Disarankan** dan **Kronologi** dinonaktifkan sampai tersedia panduan terkurasi yang dapat dipertanggungjawabkan untuk franchise bercabang seperti Fate.


**Rute editorial dari sumber:** beberapa franchise memiliki pilihan menonton yang menjelaskan jalur alternatif, posisi film, dan risiko spoiler. Baca [Panduan urutan anime](docs/public/watch-order.md) untuk cakupan serta daftar sumber; mode kronologi canon umum masih disabled.

**Riset urutan lintas-franchise:** Yoru memisahkan film, OVA/special, cabang cerita, dan rangkuman agar tidak mengarang satu garis canon. Baca [Panduan urutan anime](docs/public/watch-order.md) untuk batasan dan cara mengirim koreksi berreferensi.

## Ingin menonton episode anime?

Yoru tidak memasukkan provider streaming anime secara default. Tambahkan URL HLS (`.m3u8`) atau MP4 HTTPS yang dapat diputar oleh browser, dengan MAL ID dan nomor episode yang cocok:

1. Salin `configs/providers.local.json.example` menjadi `configs/providers.local.json`.
2. Ganti `malId`, `number`, `url`, serta track subtitle sesuai media yang kamu punya.
3. Simpan dan buka kembali detail anime yang sesuai; pilih episode → source → Play.

Jangan memasukkan token ke URL atau commit file `*.local.json`. Stream tanpa dukungan CORS, codec atau subtitle browser mungkin tidak bisa diputar. Untuk alternatif addon HTTP/JSON dan subtitle Stremio, lihat **[Panduan provider](docs/public/providers.md)** serta **[Vercel Preview](docs/public/vercel-preview.md)**. API key dan konfigurasi addon tetap disimpan di sisi server, bukan di komponen frontend.

## Dokumentasi

| Mulai dari sini | Untuk apa |
| --- | --- |
| [Panduan mulai](docs/public/getting-started.md) | Instalasi Windows/macOS/Linux, demo player dan PWA |
| [Panduan penggunaan](docs/public/using-yoru.md) | Jelajah anime, library, resume dan backup |
| [Panduan desain](DESIGN.md) | Sistem token, hirarki navigasi kanonikal, dan copywriting |
| [Konfigurasi provider](docs/public/providers.md) | JSON stream, MAL ID, subtitle dan addon Stremio |
| [Pemecahan masalah](docs/public/troubleshooting.md) | Error instalasi, katalog, video, PWA, dan Safari |
| [Pengembangan & kontribusi](docs/public/development.md) | Perintah, arsitektur singkat, test dan kontribusi |
| [Status rilis](docs/public/releases.md) | Perbedaan source, web preview, dan native package |
| [Production readiness](docs/public/production-readiness.md) | Hardening HTTP, HTTPS deployment, checklist verifikasi dan release gate |

## Pengujian player eksternal & sinkronisasi progress

Dalam pemeriksaan Chromium menggunakan origin lokal Yoru pada 29 Oktober 2026, AnimeEmbed mengembalikan media dengan metadata durasi untuk MAL ID **21 (One Piece)**, **52991 (Frieren)**, dan **1535 (Death Note)**. Pada sampel **One Piece episode 1**, video berhasil berjalan dengan buffer aktif dan tanpa error media.

Player embed AnimeEmbed kini menangkap event `postMessage` (`channel: 'animeembed'`, event `progress`, `pause`, `ended`) untuk mencatat posisi tontonan ke IndexedDB lokal secara otomatis. Saat pengguna kembali menonton episode tersebut, Yoru menyematkan parameter `?start=<detik>` ke URL iframe agar pemutar melanjutkan tontonan dari titik terakhir. Bahasa subtitle AnimeEmbed tidak dapat dijamin oleh Yoru dan bergantung pada player eksternal; subtitle Indonesia hanya bisa dikontrol melalui track yang benar-benar tersedia pada sumber native yang kompatibel.

## Pengembangan

```sh
npm ci
npm run check
npm run dev
```

Backend Hono: http://127.0.0.1:8787 · Frontend Vite: http://127.0.0.1:5173 · CI: lint, typecheck, unit test, build, Chromium dan WebKit E2E. Ketersediaan katalog menggunakan Tenrai v1 untuk MyAnimeList. **Jangan menyamakan tes video contoh dengan tes streaming provider nyata.** Track status fitur dan keputusan yang masih terbuka di [roadmap pengalaman pengguna](https://github.com/rzqllh/Yoru/issues/44), sedangkan [release gate publik](https://github.com/rzqllh/Yoru/issues/20) tetap BLOCKED.

## Inspirasi dan penghargaan

Yoru adalah implementasi tersendiri. Proyek berikut dipelajari sebagai **referensi ide, pengalaman penggunaan, atau kontrak publik**, bukan sebagai klaim bahwa seluruh fiturnya sudah ada di Yoru. Tidak ada penyalinan kode GPL/AGPL atau kode tanpa lisensi ke basis proyek ini. Terima kasih kepada para maintainer dan kontributor:

- [Tatap](https://github.com/asfaraguest/tatap) — pengalaman player anime lintas platform, penyimpanan lokal dan subtitle.
- [Kazumi](https://github.com/Predidit/Kazumi) & [KazumiRules](https://github.com/Predidit/KazumiRules) — gagasan format rules terpisah dari aplikasi; engine Kazumi **tidak** di-embed.
- [CloudStream](https://github.com/recloudstream/cloudstream) dan [Aniyomi](https://github.com/aniyomiorg/aniyomi) — pola ekosistem extension dan library.
- [Nuvio Mobile](https://github.com/NuvioMedia/NuvioMobile) — UI media multi-platform dan bring-your-own-sources.
- [AIOStreams](https://github.com/Viren070/AIOStreams) — gagasan seleksi/penyatuan sumber; **bukan** dependency di Yoru.
- [AnimeEmbed](https://www.animeembed.com/) — kontrak embed berdasarkan MAL ID (tersedia sebagai fallback eksternal, bukan dependency runtime).
- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk) — kontrak addon manifest dan stream HTTP/JSON.
- [anime-sdk](https://github.com/hexxt-git/anime-sdk) — pendekatan normalisasi metadata dan provider; **tidak** dibundel.
- [Wajik Anime API](https://github.com/wajik45/wajik-anime-api), [Nonton Indo](https://github.com/ExtremeBoyGG/nonton-indo) — referensi variasi sumber Sub Indo; adapter mereka **tidak** dibundel.
- [Magnetio](https://github.com/peterdsp/Magnetio) — referensi arsitektur torrent/indexer untuk kemungkinan tahap mendatang; torrent **belum** didukung.

Layanan/pustaka yang digunakan Yoru, antara lain [Jikan](https://jikan.moe/) (metadata dari MAL), [React](https://react.dev/), [Vite](https://vite.dev/), [Hono](https://hono.dev/), [hls.js](https://github.com/video-dev/hls.js), dan [idb](https://github.com/jakearchibald/idb). Nama serta merek proyek lain tetap milik pemiliknya dan tidak menyatakan afiliasi. Ketentuan dan lisensi setiap dependency tetap berlaku; lihat `LICENSE`, `package-lock.json`, dan lisensi paket masing-masing.

## Lisensi

Kode original Yoru: **MIT**, lihat [LICENSE](LICENSE). Konten, metadata, gambar, video, dan subtitle dari pihak lain mempunyai hak penggunaan tersendiri. Tidak ada daftar stream pihak ketiga yang disematkan dalam repository ini.

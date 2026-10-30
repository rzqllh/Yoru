# Status rilis dan jenis unduhan Yoru

## Bedakan source dengan aplikasi jadi

| Bentuk | Siapa yang membutuhkan | Cara mendapatkan |
| --- | --- | --- |
| **Source code** | Kontributor / pengguna yang punya Node.js | Tombol **Code** GitHub atau `git clone` |
| **PWA web lokal** | Pengguna browser komputer | Jalankan `npm ci`, `npm run build`, `npm start` |
| **GitHub Actions artifact** | Developer yang mengecek CI | Dari run GitHub Actions; **bukan** installer |
| **Installer Windows / APK / IPA** | Pengguna akhir tanpa Node.js | **Belum dirilis** |

ZIP versi `v0.9.0-rc.1` sebelumnya adalah kumpulan hasil build + file Node untuk menjalankan server, **bukan binary siap-install**. Asset tersebut telah ditarik dari release agar tidak menyesatkan; source archive otomatis GitHub mungkin tetap tampil karena disediakan platform.

**Jangan mencari tombol download APK/EXE yang belum ada** atau menganggap source ZIP bisa langsung dibuka sebagai aplikasi. Ketika build native benar-benar tersedia dan diuji, release berikutnya akan menamai file sesuai platform beserta instruksi instalasi.

## Status fitur yang perlu diketahui

Yoru web saat ini mendukung katalog Tenrai, navigasi kanonikal browser, player demo HLS/WebVTT, player embed AnimeEmbed dengan sinkronisasi progres tontonan via postMessage dan resume `?start=`, library IndexedDB, offline shell, provider manual, dan Stremio HTTPS opt-in. Bahasa subtitle AnimeEmbed mengikuti layanan eksternal. Subtitle Indonesia memerlukan track kompatibel yang benar-benar tersedia pada sumber atau file kustom. Safari fisik serta installer desktop/mobile native belum dirilis.

Lihat [Panduan mulai](getting-started.md) untuk menjalankan versi web dan [Issue tracking](https://github.com/rzqllh/Yoru/issues/3) untuk blocker release berikutnya.

## Action to be taken before public release

Release status: **BLOCKED**. Merging code into `main` does not mean the service is ready for public streaming. Track these items to closure in [Public release gate #20](https://github.com/rzqllh/Yoru/issues/20):

- **G1 — Live video providers:** verify independent, authorized real HLS/MP4 sources against representative anime and episodes, including CORS, codecs, expiry and failure behavior.
- **G2 — Availability truthfulness:** validate season/cour/special/movie identity and prove the UI never labels an unplayable candidate as ready.
- **G3 — Live subtitles:** test OpenSubtitles, SubDL and SubSource with authorized credentials and real search/download responses, including quotas and errors. Keep secrets server-side.
- **G4 — Physical iPhone Safari:** record device model/iOS and verify playback, subtitles, fullscreen, PiP, PWA install and upgrade on an actual device.
- **G5 — Hosting/security:** provide a real HTTPS deployment URL, server-only secrets, gateway authentication/rate limiting, CSP/CORS, logs/alerts and a tested rollback.
- **G6 — Final acceptance:** attach exact-commit CI/browser evidence, quantified coverage, zero unresolved P0/P1, and explicit owner go/no-go.

Do not claim live-provider coverage, iPhone Safari support, or production readiness until evidence is attached. A demo stream, fixture, or READY preview deployment is not sufficient evidence.

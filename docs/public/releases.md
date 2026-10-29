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

Yoru web saat ini mendukung katalog Tenrai, player demo HLS/WebVTT, library IndexedDB, offline shell, provider manual dan Stremio HTTPS opt-in. Source anime nyata, subtitle pada provider eksternal, Safari fisik serta aplikasi mobile/Windows native masih memerlukan validasi/implementasi tambahan.

Lihat [Panduan mulai](getting-started.md) untuk menjalankan versi web dan [Issue tracking](https://github.com/rzqllh/Yoru/issues/3) untuk blocker release berikutnya.

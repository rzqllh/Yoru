# Menjalankan Yoru di komputer

Panduan ini untuk **Windows, macOS, atau Linux**, tidak membutuhkan akun Yoru dan tidak membutuhkan konfigurasi source untuk mencoba demo player.

## 1. Persiapan

Instal [Node.js versi 22.12 atau lebih baru](https://nodejs.org/) (npm sudah termasuk) dan Git. Buka PowerShell/Terminal dan cek:

```sh
node --version
npm --version
git --version
```

Jika `node` atau `npm` tidak dikenali, tutup-buka terminal setelah instalasi.

## 2. Unduh kode resmi

```sh
git clone https://github.com/rzqllh/Yoru.git
cd Yoru
```

Tidak punya Git? Pada halaman repository pilih **Code → Download ZIP**, ekstrak dan buka terminal pada folder hasil ekstraksi. Itu adalah **source code**, bukan installer; langkah berikutnya tetap dibutuhkan.

## 3. Jalankan untuk pertama kali

```sh
npm ci
npm run dev
```

Tunggu dua layanan menyala, lalu buka **http://127.0.0.1:5173**. Jangan tutup terminal selama aplikasi dipakai. Backend tersedia di **http://127.0.0.1:8787/api/health**.

Coba alurnya:
1. Buka **Beranda** dan **Jelajahi** saat online; katalog datang dari Tenrai.
2. Cari satu judul anime lalu buka detailnya.
3. Buka **Pengaturan → Test player** untuk video HLS pendek dengan track WebVTT **Bahasa Indonesia**.
4. Buka **Koleksi** untuk menyimpan anime. Data ini tersimpan di browser yang digunakan.

Video contoh bukan episode anime. Setelah metadata termuat, detail anime menyediakan player embed eksternal dengan sinkronisasi progres tontonan ke IndexedDB lokal. Subtitle bawaan pemutar embed umumnya berbahasa Inggris. Untuk sumber video HLS/MP4 mandiri dan takarir Bahasa Indonesia, lihat [Panduan provider](providers.md).

## 4. Coba versi PWA

Hentikan `npm run dev` dengan **Ctrl+C**. Jalankan:

```sh
npm run build
npm start
```

Buka **http://127.0.0.1:8787** dari komputer yang menjalankan server. Pada Chrome/Edge, cari ikon **Install** di bilah alamat atau menu browser. Aplikasi bisa terbuka dalam jendela mandiri dan menampilkan shell saat offline; **data katalog baru dan video remote tetap membutuhkan internet**.

**Di iPhone:** iPhone tidak menjalankan server Node dari ZIP. Jalankan backend di komputer/server HTTPS, akses melalui HTTPS tepercaya dari Safari, lalu gunakan Share → Add to Home Screen. Browser Safari iOS belum diuji langsung oleh tim proyek; perlakukan ini sebagai panduan uji, bukan jaminan kompatibilitas.

## 5. Mematikan dan memperbarui

- **Matikan server:** kembali ke terminal dan tekan Ctrl+C.
- **Update source:** `git pull` dari folder Yoru, lalu `npm ci` dan jalankan lagi.
- **Reset setelah error dependency:** tutup server, jalankan `npm ci`, ulangi.
- **Data koleksi:** gunakan fitur ekspor backup di Pengaturan sebelum membersihkan data situs.

Butuh bantuan? [Troubleshooting](troubleshooting.md). Untuk kontribusi: [Development](development.md).

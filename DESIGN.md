# Panduan Desain & Antarmuka Yoru (DESIGN.md)

Dokumen ini mendefinisikan sistem desain, arsitektur informasi, spesifikasi token, dan konvensi penulisan antarmuka (*copywriting*) untuk aplikasi Yoru.

---

## 1. Prinsip Desain

1. **Fokus pada Anime, Bukan SaaS Dashboard**
   Yoru dirancang khusus untuk penikmat anime. Hirarki visual memprioritaskan poster, judul, metadata relevan (musim, episode, skor), dan pemutaran media tanpa ornamen dekoratif yang mengganggu.
2. **Anti-Slop & Kejujuran Fungsional**
   Hindari jargon pemasaran kecerdasan buatan, teks klise, dan metrik palsu (seperti kartu kosong bertuliskan "00"). Status ketersediaan subtitle dan sumber pemutaran harus dinyatakan apa adanya tanpa klaim berlebihan.
3. **Local-First & Transparan**
   Riwayat tontonan, progres tontonan, dan anime favorit disimpan secara lokal di peramban (IndexedDB). UI secara konsisten menampilkan status penyimpanan dan opsi ekspor/impor cadangan.
4. **Konsistensi Visual & Ergonomi Kontras**
   Tema gelap terkalibrasi dengan kontras rasio minimal WCAG AA (teks `#f5f6f8` di atas latar `#0e1014`, aksen lime-green `#c6f56a` untuk elemen aksi utama).

---

## 2. Desain Token

### A. Palet Warna

| Token | Nilai Hex | Penggunaan |
| :--- | :--- | :--- |
| `--canvas` | `#0e1014` | Latar belakang dasar aplikasi |
| `--surface` | `#14171d` | Latar kartu, sidebar, dan header panel |
| `--surface-2` | `#1b1f26` | Latar elemen sekunder, tag/badge, form input |
| `--surface-hover` | `#222731` | Status hover pada baris daftar dan item menu |
| `--line` | `#252932` | Garis batas (*border*) halus antarelemen |
| `--line-strong` | `#333844` | Garis batas aktif atau penekanan fokus |
| `--muted` | `#8d939e` | Teks sekunder, label pembantu, caption waktu |
| `--soft` | `#b6bbc4` | Teks pendukung dengan kontras menengah |
| `--text` | `#f5f6f8` | Teks primer berdaya baca tinggi |
| `--accent` | `#c6f56a` | Aksen warna lime-green untuk status aktif dan tombol aksi utama |
| `--accent-hover` | `#d7ff7d` | Status hover elemen aksen |
| `--accent-dark` | `#1e2813` | Latar badge penanda aktif dan tag terpilih |
| `--danger` | `#e8867a` | Warna peringatan kesalahan dan tombol destruktif |
| `--danger-bg` | `#2d1e1e` | Latar penampung pesan kesalahan |

### B. Tipografi

- **Display & Judul**: `Manrope`, sans-serif (bobot 600, 700, 800) untuk judul hero, heading halaman, dan angka metrik.
- **Teks Utama & Antarmuka**: `DM Sans`, Inter, ui-sans-serif, system-ui, sans-serif (bobot 400, 500, 700) untuk label menu, deskripsi anime, dan elemen interaktif.
- **Skala Ukuran Teks**:
  - Judul Hero: `clamp(1.75rem, 3.5vw, 2.4rem)`
  - Judul Halaman: `1.4rem` – `1.6rem` (Manrope 700)
  - Judul Bagian: `1.05rem` – `1.2rem` (Manrope 700)
  - Judul Kartu: `0.92rem` (Manrope 600, 2 baris batas elipsis)
  - Teks Body / UI: `0.85rem` – `0.9rem` (DM Sans 400/500)
  - Metadata / Tag: `0.75rem` – `0.78rem` (DM Sans 500)

### C. Skala Spasi (*Spacing*) & Radius

- **Spasi**:
  - `--space-xs`: `4px`
  - `--space-sm`: `8px`
  - `--space-md`: `16px`
  - `--space-lg`: `24px`
  - `--space-xl`: `32px`
  - `--space-2xl`: `48px`
- **Border Radius**:
  - `--radius-sm`: `6px` (badge kecil, tag)
  - `--radius-md`: `10px` (tombol, input form, pill filter)
  - `--radius-lg`: `14px` (poster kartu anime, panel modal)
  - `--radius-xl`: `18px` (container hero, banner player)

---

## 3. Arsitektur Informasi & Navigasi Kanonikal

Sistem navigasi Yoru menggunakan pemetaan URL kanonikal peramban yang mendukung tombol Back/Forward dan penyimpanan status saat penyegaran halaman:

| Rute URL | Halaman | Deskripsi & Filter Aktif |
| :--- | :--- | :--- |
| `/` | Beranda | Hero unggulan, anime tren musim ini, dan rilisan populer |
| `/jelajahi` | Jelajahi | Katalog eksplorasi umum dengan bilah pencarian tersinkronisasi |
| `/jelajahi/musim-ini` | Jelajahi (*Shortcut*) | Katalog tersaring otomatis: Musim Ini |
| `/jelajahi/populer` | Jelajahi (*Shortcut*) | Katalog tersaring otomatis: Populer Sepanjang Masa |
| `/jelajahi/akan-datang` | Jelajahi (*Shortcut*) | Katalog tersaring otomatis: Segera Tayang |
| `/koleksi` | Koleksi | Daftar tontonan tersimpan, favorit, dan riwayat |
| `/koleksi/lanjut-menonton` | Koleksi (*Shortcut*) | Sub-tampilan terfokus untuk anime dengan progres tontonan aktif |
| `/pengaturan` | Pengaturan | Konfigurasi pemutaran, sumber video, cadangan data, dan informasi aplikasi |

### Hirarki Breadcrumbs

Setiap tampilan utama menyajikan penunjuk lokasi hirarkis dinamis:
- `Yoru > Beranda`
- `Yoru > Jelajahi > Musim ini`
- `Yoru > Jelajahi > Cari: "[kata kunci]"`
- `Yoru > Koleksi > Lanjut menonton`
- `Yoru > Pengaturan`

### Pembedaan Status Pintasan (*Shortcut*)

Pintasan pada bilah samping (*Sidebar*) ditandai dengan dot aksen lime dan latar bernuansa lembut, sembari mempertahankan asosiasi visual menu induk (`Jelajahi` atau `Koleksi`) agar pengguna memahami konteks hirarki secara intuitif.

---

## 4. Spesifikasi Komponen

### A. Poster & Kartu Anime (`AnimeCard`)
- Rasio aspek gambar 3:4.5 dengan pemotongan rapi (`object-fit: cover`).
- Penanda skor di pojok kiri atas poster dengan latar semi-transparan bergradien gelap.
- Judul anime dibatasi maksimal 2 baris elipsis untuk mencegah pergeseran tata letak grid.
- Metadata baris kedua menampilkan format dan jumlah episode yang ringkas (contoh: `TV • 24 ep`).

### B. Hero Unggulan (`Hero Section`)
- Judul panjang dibatasi dengan pembungkus teks yang fleksibel (`overflow-wrap: break-word`) sehingga tidak terpotong pada berbagai resolusi viewport.
- Lapisan gradien multi-stop melindungi keterbacaan teks di atas gambar latar belakang beresolusi tinggi.

### C. Pemutar Media (`Player Modal`)
- **Penanganan Frame Iframe**: Menerima pesan antarmuka `postMessage` (`channel: 'animeembed'`) dari domain terverifikasi untuk mencatat `currentTime` dan durasi ke IndexedDB secara real-time.
- **Melanjutkan Tontonan**: Menyisipkan parameter `?start=[detik]` ke iframe pemutar saat pengguna membuka kembali episode yang sedang berjalan.
- **Transparansi Subtitle**: Label informasi secara eksplisit menerangkan ketersediaan subtitle (contoh: `Subtitle: English (AnimeEmbed)` atau `Subtitle: Bahasa Indonesia (Tersedia)` pada stream demo/lokal).

### D. Keadaan Kosong (*Empty States*)
- Tampilan kosong menyajikan panduan tindakan langsung (misalnya tautan ke katalog Jelajahi) daripada menampilkan angka statistik kosong seperti `00`.

---

## 5. Panduan Copywriting

1. **Gunakan Bahasa Indonesia Baku yang Alami**
   - Gunakan `Beranda`, `Jelajahi`, `Koleksi`, `Pengaturan`.
   - Gunakan istilah media yang umum dipahami: `Episode`, `Tonton sekarang`, `Lanjut menonton`, `Favorit`.
2. **Hindari Jargon Berlebihan dan Tanda Baca Dekoratif**
   - Hindari tanda titik dekoratif di akhir judul hero atau tajuk bagian (contoh: tulis `Koleksi Pribadi`, bukan `Koleksi Pribadi.`).
   - Hindari istilah pemasaran otomatis seperti *"Platform anime berbasis AI terlengkap"*. Tuliskan fitur secara konkret: *"Aplikasi anime PWA lokal dengan riwayat tontonan tersimpan di peramban"*.
3. **Pesan Kesalahan yang Memberikan Solusi**
   - Saat sumber video tidak dapat dimuat, sertakan saran langkah perbaikan yang jelas: *"Sumber video eksternal sedang tidak dapat dihubungi. Periksa koneksi internet atau gunakan konfigurasi provider lokal di menu Pengaturan."*

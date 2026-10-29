# Developer & kontribusi

Yoru terdiri dari dua workspace Node/TypeScript: `frontend/` (React/Vite) dan `backend/` (Hono). Repository menggunakan lisensi MIT.

## Setup

```sh
git clone https://github.com/rzqllh/Yoru.git
cd Yoru
npm ci
npm run check
npm run dev
```

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan frontend dan backend untuk development |
| `npm run lint` | Pemeriksaan aturan Biome |
| `npm run typecheck` | Pemeriksaan TypeScript |
| `npm test` | Unit test Node |
| `npm run build` | Bundle frontend dan kompilasi backend |
| `npm start` | Menjalankan hasil build di port 8787 |
| `npm run check` | Lint + types + unit + build |

Browser E2E menggunakan workflow **Browser E2E** GitHub Actions dengan Chromium, termasuk viewport mobile dan PWA offline. Rujuk hasil run terbaru; jangan menganggap tes ini sama dengan Safari/iPhone fisik.

## Struktur dan aliran data

```text
backend/api/       Endpoint REST Hono
backend/pipeline/  Metadata Tenrai, normalisasi dan validasi
backend/providers/ Adapter provider lokal dan jembatan addon
frontend/src/      Halaman UI, player, library IndexedDB
frontend/public/   PWA manifest, service worker, demo HLS dan WebVTT
configs/           Contoh konfigurasi; *.local.json tidak di-commit
scripts/           Menjalankan mode dev dan produksi
tests/             Test logic/API dan browser
docs/public/       Panduan pengguna dan kontributor
docs/internal/     Catatan pengembangan
```

Katalog dari Tenrai menghasilkan MAL ID; provider lokal/addon menghubungkan MAL ID ke daftar episode. Player hanya menerima URL/track yang lolos validasi. Progress/library adalah data browser (IndexedDB). Hasil pencarian tidak menjamin tersedia sumber video.

## API dasar

- `GET /api/health`
- `GET /api/anime/discover?kind=season&page=1` (`season`, `top`, `upcoming`)
- `GET /api/anime/search?q=judul&page=1`
- `GET /api/anime/:id`
- `GET /api/anime/:id/episodes`
- `GET /api/providers`
- `GET /api/anime/:id/provider-episodes`
- `GET /api/streams?episodeRef=...`

## Prinsip kontribusi

Gunakan branch dan PR. Sertakan tes saat mengubah perilaku, pastikan `npm run check` lulus, dan beri langkah reproduksi untuk bug. Jangan menambahkan kode dari proyek GPL/AGPL atau tanpa lisensi. Jika memakai dependency permissive, penuhi atribusi/lisensi yang diwajibkan. Penghargaan terhadap karya referensi ditulis **hanya dalam bagian penghargaan README utama**; komentar kode dan UI tidak perlu menampilkan daftar parity.

Jangan commit credential, `configs/*.local.json`, aset/media yang tidak boleh didistribusikan atau file build `dist/`. Lihat [Panduan provider](providers.md) dan [Status rilis](releases.md).

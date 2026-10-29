# Menambahkan sumber video ke Yoru

**Default:** satu player embed eksternal dapat dicoba, tetapi cakupan judul dan Sub Indo tidak dijamin. Katalog metadata disediakan Tenrai, sementara video demo HLS tersimpan lokal. Sumber HLS/MP4 langsung tetap ditambahkan melalui **file konfigurasi lokal**; saat ini belum ada marketplace extension atau scraper bawaan.

## Pilihan A: URL video HTTPS (paling sederhana)

Salin `configs/providers.local.json.example` menjadi `configs/providers.local.json`.

**Windows PowerShell:**
```powershell
Copy-Item configs/providers.local.json.example configs/providers.local.json
```

**macOS/Linux:**
```sh
cp configs/providers.local.json.example configs/providers.local.json
```

Buka file hasil salinan dengan editor. Format intinya:

```json
{
  "id": "my-streams",
  "name": "Video saya",
  "anime": [
    {
      "malId": 1,
      "episodes": [
        {
          "number": 1,
          "streams": [
            {
              "format": "hls",
              "url": "https://video.example.org/episode-1.m3u8",
              "quality": "Auto",
              "subtitleMode": "soft",
              "tracks": [
                {
                  "lang": "id",
                  "label": "Bahasa Indonesia",
                  "url": "https://video.example.org/episode-1.vtt"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

Alamat `example.org` di atas **contoh format**, bukan stream yang dapat ditonton. Isi dengan URL media yang memang dapat diakses dari perangkatmu.

**Pemetaan penting:**
- `malId` = ID numerik anime di MyAnimeList/Tenrai (misalnya URL detail MAL berakhiran `/anime/1` → ID 1).
- `number` = episode pada provider, harus cocok dengan episode yang kamu buka.
- `format` = `hls` untuk file `.m3u8` atau `mp4` untuk video `.mp4`.
- `subtitleMode` = `soft`, `hard`, atau `unknown` sesuai sumber.
- `tracks` = URL subtitle WebVTT dan kode bahasa; `id` berarti Bahasa Indonesia.
- Stream link sementara jangan dijadikan identitas permanen episode.

Simpan konfigurasi. Buka detail anime ber-ID sama, lalu pilih episode yang tersedia. Konfigurasi diperiksa ulang backend; jika gagal, lihat [Troubleshooting](troubleshooting.md).

## Pilihan B: addon Stremio HTTPS (manual, opt-in)

Salin `configs/stremio.local.json.example` menjadi `configs/stremio.local.json` dan isi **URL manifest HTTPS** addon, serta mapping ID dan episode secara eksplisit:

```json
{
  "addons": [
    {
      "id": "example",
      "name": "Addon pilihan saya",
      "manifestUrl": "https://addon.example.com/manifest.json",
      "anime": [
        {
          "malId": 1,
          "stremioId": "kitsu:1",
          "season": 1,
          "episodes": [1, 2]
        }
      ]
    }
  ]
}
```

**Batasan saat ini:**
- Hanya membaca respons **stream/series** HTTP/JSON dari addon yang telah dimapping.
- Hanya stream langsung HTTPS **HLS/MP4** dan subtitle track kompatibel; **magnet, torrent, debrid, DRM, scraper JS, addon installer otomatis tidak didukung**.
- URL manifest harus HTTPS, domain publik, tanpa kredensial/parameter rahasia.
- Server membatasi akses jaringan (DNS/IP), timeout, response size dan redirect. URL media tetap dimainkan **langsung oleh browser**; bukan proxy universal.
- Tidak semua addon menggunakan ID/season/episode yang sama; kompatibilitas harus diuji sendiri.

## Sub Indo, kualitas dan fallback

`lang: "id"` menandai track Indonesia, **bukan** jaminan isinya benar. Hardsub sudah menempel di gambar dan tidak dapat dinonaktifkan. File subtitle eksternal harus benar-benar bisa diunduh oleh browser serta memiliki format yang didukung. Jika dua provider menawarkan episode sama, Yoru dapat menampilkan beberapa pilihan stream.

## Keamanan konfigurasi

File `configs/providers.local.json` dan `configs/stremio.local.json` di-ignore oleh Git. Jangan commit token/API key, memasukkan credential ke URL, atau mengarahkan addon ke jaringan internal. Untuk instalasi publik, jangan mengekspos backend tanpa pembatasan tambahan.

Buka [Panduan penggunaan](using-yoru.md) untuk memilih episode dan memutar media.

## Pilihan C: Coba pemutar eksternal tanpa menyiapkan JSON

Pada detail anime, pilih episode untuk mencoba player embed berbasis MAL ID dari layanan pihak ketiga. Ini **tidak mengonfirmasi episode ada atau bisa ditonton**, tidak menjamin subtitle Indonesia, dan progress dalam iframe tidak masuk ke IndexedDB Yoru. Jika tidak berfungsi, gunakan provider HTTPS pribadi yang terverifikasi. Browser bisa membatasi pemutaran iframe, cookie, dan fullscreen. Link langsung tersedia di panel player untuk diagnosis.

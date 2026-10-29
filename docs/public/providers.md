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

## External subtitle discovery (release-candidate contract)

Yoru uses three optional **built-in server-side** subtitle adapters; there is no user-installable subtitle-addon marketplace. Set `OPENSUBTITLES_API_KEY`, `OPENSUBTITLES_ACCESS_TOKEN` (for downloads), `SUBDL_API_KEY`, and `SUBSOURCE_API_KEY` in the **backend process environment**, not in source control or browser settings. All secrets stay on the backend.

- OpenSubtitles: searches by official REST API using catalogue title and episode, downloads require an authenticated account token.
- SubDL: searches episode subtitles with the documented API, selecting raw unpacked files; ZIP downloads are unsupported rather than silently mislabeled.
- SubSource: uses fixed-host API with `X-API-Key`; uncertain provider response shapes are discarded pending verified live responses.
- SRT, WebVTT, and dialogue cues from ASS/SSA can be rendered in a **uniform Yoru style**. Karaoke, typesetting, fancy placement, and embedded fonts do not carry over to this simplified presentation.
- The CC menu never assumes found results are correctly synchronized. A subtitle must be successfully downloaded as VTT before it is selected. Indonesian is tried before English, but malformed/unknown results are rejected.
- Manual **Off** and explicit subtitle selection override automatic fallback within the current player session.
- `GET /api/subtitles/status` reports which adapters are configured (boolean only; **not** their health). `GET /api/anime/:id/subtitles?episode=N` returns candidates and warnings. No keys or protected URLs are returned.

**Limits:** Without actual keys and authenticated live-provider checks, search and downloads are not end-to-end verified. There is no guarantee that an anime title has a subtitle or that its timing matches a particular video release. The API is intended to be run behind an HTTPS gateway and abuse controls in public deployments.

## Miruro-compatible multi-provider adapter (opt-in)

Set `MIRURO_API_BASE` to the HTTPS origin of an **approved/self-hosted Miruro-compatible API**. By default this adapter is disabled. The public Miruro demo is documented by its maintainer as a test service, and its pipe streaming endpoints may return upstream 503/500 due to Cloudflare. Do not depend on it as a public production SLA.

Yoru resolves MAL → AniList via AniList GraphQL, fetches the provider-specific SUB episode lists, rejects mismatched AniList IDs and episode numbers, and exposes candidate HLS/MP4 streams only. External embeds and stream links requiring unsupported Referer/headers are not silently proxied; the browser native preflight determines whether a candidate can actually decode.

The adapter implements the external API contract without copying or vendoring its code. The upstream author describes the project as educational only. Confirm relevant terms and video rights before making this provider part of a public production distribution. Configured upstream != episode playable; strict verification still applies.

### Provider API authentication correction (29 October 2026)

SubDL **v1** search uses an `api_key` URL query parameter according to the official v1 specification; the v2 Bearer convention is not interchangeable. Yoru supplies that parameter from its backend environment and does not expose it to the frontend. To reduce anonymous quota exhaustion, Yoru issues short-lived HMAC-signed subtitle-file links after search, requires the grant at download, and applies conservative process-wide request ceilings. Public multi-instance deployments still need a shared rate-limit/authentication gateway; an in-process limiter is not a public service guarantee.

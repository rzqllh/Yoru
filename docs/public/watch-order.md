# Panduan urutan anime — cakupan dan batasannya

Yoru menyediakan **Panduan urutan anime** untuk berbagai judul, bukan daftar khusus franchise populer. Pilih **Jelajahi → Panduan urutan anime**, cari judul (atau buka **Urutan cerita** dari detail), lalu periksa hubungan yang tersedia.

## Membaca hasilnya

- **Urutan rilis**: disusun dari bulan/tahun rilis anime menurut AniList. Ini bukan urutan peristiwa cerita, urutan novel/manga, atau rekomendasi pasti bagi penonton baru. Judul tanpa tanggal diletakkan di akhir.
- **Hubungan langsung**: judul yang secara eksplisit ditautkan dari anime terpilih oleh AniList. Tidak semua seri punya hubungan lengkap atau MAL ID.
- **Perluas hubungan (2 tingkat)**: tindakan opsional untuk mengambil hubungan dari sebagian judul terkait. Perluasan dibatasi untuk menjaga API: maksimal 10 judul langsung yang dipindai dan sekitar 75 judul dalam hasil, sehingga **bukan** katalog seluruh franchise. Status parsial/gagal API ditampilkan apa adanya.
- **Filter jenis judul**: TV/season, film, OVA/special/ONA, cabang cerita, rangkuman, dan lainnya. Filter bukan keputusan tentang canon.
- **Jalur alternatif / spin-off / semesta sama**: hubungan antarjudul, bukan perintah untuk menontonnya dalam satu urutan. **Rangkuman/kompilasi** juga tidak otomatis berarti aman dilewati.
- **Disarankan** dan **Kronologi** masih dinonaktifkan sampai ada urutan editorial per-franchise/episode dengan alasan dan referensi yang dapat diperiksa.

Sebuah anime boleh memiliki lebih dari satu cara menonton yang sah: misalnya urutan anime rilis, urutan penerbitan novel, susunan broadcast original, kronologi dalam cerita, jalur pemula tanpa spoiler, serta jalur rewatch. Keberadaannya harus ditandai jelas, bukan digabung menjadi satu angka.

## Kenapa tidak selalu cukup mengurutkan season?

Pertanyaan yang berulang di komunitas mencakup pilihan jalur dalam Fate/Gundam, perbedaan urutan novel dan anime Monogatari, urutan siaran dan kronologi Haruhi, serta posisi OVA/film pada Re:Zero dan K-On!. Bahkan anime yang sederhana bisa memiliki special tanpa posisi episode yang disepakati. Yoru menggunakan klasifikasi masalah ini untuk memperbaiki model data, **bukan** menyalin komentar forum menjadi kebenaran canon.

Rujukan diskusi contoh: [franchise dengan urutan awal yang diperdebatkan](https://www.reddit.com/r/anime/comments/ii06cr/), [novel versus anime](https://www.reddit.com/r/anime/comments/1863wgj/), [perdebatan Haruhi](https://www.reddit.com/r/Haruhi/comments/1u1i9kq/), dan [OVA Re:Zero](https://www.reddit.com/r/Re_Zero/comments/1d026ic). Sumber relasi untuk hasil pada aplikasi adalah [AniList](https://docs.anilist.co/guide/graphql/queries/media), bukan forum.

## Membantu memperbaiki urutan

Jika judul, edisi, cabang cerita, atau posisi OVA/film terlihat salah, buat laporan di [GitHub Issues Yoru](https://github.com/rzqllh/Yoru/issues/new). Agar dapat diverifikasi, sertakan:

1. Nama franchise, judul dan tautan MAL/AniList yang dimaksud.
2. Apakah masalahnya urutan rilis, kronologi cerita, novel/manga, rekomendasi pemula, recap, atau hubungan alternatif.
3. Urutan atau posisi episode yang diusulkan beserta tanda **wajib/opsional**; jangan menuliskan spoiler besar di judul issue.
4. Tautan rujukan dengan tanggal, dan jelaskan jika ada beberapa pendapat yang sama-sama masuk akal.
5. Jika mungkin, jelaskan apakah urutan berlaku hanya untuk versi adaptasi, director's cut, remake, atau lini semesta tertentu.

Usulan forum tidak otomatis menjadi panduan resmi. Setiap urutan yang akan ditampilkan sebagai rekomendasi perlu memeriksa identitas media, episode/rentang, asal dan versi sumber, potensi spoiler, serta perbedaan opini; tanpa bukti memadai akan tetap dilabeli **belum terkurasi**.

**Batasan:** Yoru belum mengklaim seluruh anime mempunyai kurasi urutan lengkap. Metadata jaringan juga tidak membuktikan video/episode tersedia untuk ditonton. Ikuti [status rilis](releases.md) dan [roadmap fitur](https://github.com/rzqllh/Yoru/issues/44) untuk pekerjaan selanjutnya.

import type {CuratedPath,PathStep} from './curated-watch-paths'

/**
 * Edition-aware routes are deliberately not a conversion table between streaming
 * providers. An episode number belongs ONLY to its named release/edition.
 * Every episode order below is sourced and editorially scoped.
 */
type EpisodeOrder={title:string;aniListId:number;edition:string;optional?:boolean}
const episodes=(titles:readonly string[],data:EpisodeOrder):PathStep[]=>
 titles.map((title,index)=>({
  title:`Episode ${String(index+1).padStart(2,'0')} — ${title}`,
  aniListId:data.aniListId,kind:'TV',optional:data.optional===true,
  note:`Nomor ${index+1} untuk edisi ${data.edition}. Jangan dipakai pada edisi lain atau sebagai tautan Play langsung.`,
  episodeRange:{start:index+1,end:index+1,edition:data.edition}
 }))
const SRC=(title:string,url:string)=>({title,url,checkedAt:'2026-10-30'})

const HARUHI_2006=[
 'The Adventures of Mikuru Asahina Episode 00',
 'The Melancholy of Haruhi Suzumiya I',
 'The Melancholy of Haruhi Suzumiya II',
 'The Boredom of Haruhi Suzumiya',
 'The Melancholy of Haruhi Suzumiya III',
 'Remote Island Syndrome (Part 1)',
 'Mysterique Sign',
 'Remote Island Syndrome (Part 2)',
 'Someday in the Rain',
 'The Melancholy of Haruhi Suzumiya IV',
 'The Day of Sagittarius',
 'Live Alive',
 'The Melancholy of Haruhi Suzumiya V',
 'The Melancholy of Haruhi Suzumiya VI'
] as const
const HARUHI_2009=[
 'The Melancholy of Haruhi Suzumiya I',
 'The Melancholy of Haruhi Suzumiya II',
 'The Melancholy of Haruhi Suzumiya III',
 'The Melancholy of Haruhi Suzumiya IV',
 'The Melancholy of Haruhi Suzumiya V',
 'The Melancholy of Haruhi Suzumiya VI',
 'The Boredom of Haruhi Suzumiya',
 'Bamboo Leaf Rhapsody',
 'Mysterique Sign',
 'Remote Island Syndrome (Part 1)',
 'Remote Island Syndrome (Part 2)',
 'Endless Eight I',
 'Endless Eight II',
 'Endless Eight III',
 'Endless Eight IV',
 'Endless Eight V',
 'Endless Eight VI',
 'Endless Eight VII',
 'Endless Eight VIII',
 'The Sigh of Haruhi Suzumiya I',
 'The Sigh of Haruhi Suzumiya II',
 'The Sigh of Haruhi Suzumiya III',
 'The Sigh of Haruhi Suzumiya IV',
 'The Sigh of Haruhi Suzumiya V',
 'The Adventures of Mikuru Asahina Episode 00',
 'Live Alive',
 'The Day of Sagittarius',
 'Someday in the Rain'
] as const
const REZERO_TV_2016='TV 2016 (25 episode)'
const REZERO_OVA='Re:ZERO OVAs (2 episode dalam 1 entri AniList)'
const rezero=(title:string,id:number,kind:PathStep['kind'],note:string,optional=false,episodeRange?:PathStep['episodeRange']):PathStep=>
 ({title,aniListId:id,kind,note,optional,...(episodeRange?{episodeRange}:{})})

export const EDITION_WATCH_PATHS:readonly CuratedPath[]=[
 {
  id:'haruhi-2006-original-airing',franchise:'Haruhi Suzumiya',
  title:'2006: urutan siaran asli (14 episode)',
  pathType:'broadcast',scope:'selected-route',reviewedAt:'2026-10-30',spoilerRisk:'contextual',
  note:'Urutan siaran Jepang 2006 memang sengaja melompat-lompat. Cocok untuk merasakan eksperimen penyiaran aslinya. Nomor episode di sini HANYA untuk edisi siaran 2006, bukan versi 2009 atau pembagian season pada platform tertentu.',
  anchorAniListIds:[849,4382,7311],
  sources:[
   SRC('Situs resmi Haruhi 20th: urutan 14 episode siaran asli','https://haruhitv-anniversary.com/news/article0017.html'),
   SRC('AniList: seri Haruhi 2006 memiliki 14 episode','https://anilist.co/anime/849')
  ],
  steps:episodes(HARUHI_2006,{title:'Haruhi 2006',aniListId:849,edition:'siaran asli 2006 (14 episode)'})
 },
 {
  id:'haruhi-2009-rebroadcast',franchise:'Haruhi Suzumiya',
  title:'2009: susunan 28 episode + film',
  pathType:'broadcast',scope:'selected-route',reviewedAt:'2026-10-30',spoilerRisk:'low',
  note:'Versi 2009 menggabungkan 14 episode lama dan 14 episode baru menjadi 28 dengan urutan lebih sesuai alur cerita. Pilih versi edisi yang benar: jangan membaca nomor ini sebagai urutan siaran 2006. Film The Disappearance diletakkan setelah serial 28 episode.',
  anchorAniListIds:[849,4382,7311],
  sources:[
   SRC('Situs resmi Haruhi 20th: daftar lengkap episode edisi 2009 dan film','https://haruhitv-anniversary.com/news/article0020.html'),
   SRC('AniList: edisi Haruhi 2009 memiliki 28 episode','https://anilist.co/anime/4382'),
   SRC('AniList: The Disappearance of Haruhi Suzumiya','https://anilist.co/anime/7311')
  ],
  steps:[
   ...episodes(HARUHI_2009,{title:'Haruhi 2009',aniListId:4382,edition:'siaran 2009 (28 episode)'}),
   {title:'The Disappearance of Haruhi Suzumiya (film 2010)',aniListId:7311,
    kind:'MOVIE',optional:false,
    note:'Tonton film setelah menyelesaikan versi 2009 untuk mempertahankan konteks cerita.'}
  ]
 },
 {
  id:'rezero-newcomer-ovas',franchise:'Re:ZERO',
  title:'Season + OVA: jalur penonton baru',
  pathType:'newcomer',scope:'selected-route',reviewedAt:'2026-10-30',spoilerRisk:'low',
  note:'Rute editorial yang membedakan versi TV 25 episode, Director’s Cut (suntingan ulang), dan dua OVA terpisah. Ini jalur awal sampai Season 3; bukan katalog lengkap musim berikutnya. Penempatan Memory Snow setelah Season 1 lebih mudah untuk pemula meskipun latar peristiwanya ada di tengah Season 1.',
  anchorAniListIds:[21355,100049,108632,119661,163134],
  sources:[
   SRC('Crunchyroll News: Re:ZERO watch order, arcs dan penempatan OVA','https://www.crunchyroll.com/news/guides/2025/5/17/re-zero-watch-order'),
   SRC('AniList: entri gabungan dua OVA Re:ZERO','https://anilist.co/anime/100049'),
   SRC('AniList: Re:ZERO Season 1, 25 episode','https://anilist.co/anime/21355')
  ],
  steps:[
   rezero('Re:ZERO Season 1 — TV asli (25 episode)',21355,'TV','Tonton serial TV 2016. Director’s Cut merupakan versi sunting ulang; bukan season berbeda yang wajib ditonton juga.',false,{start:1,end:25,edition:REZERO_TV_2016}),
   rezero('OVA 1 — Memory Snow',100049,'OVA','Cerita sampingan; menurut panduan Crunchyroll, dapat disisipkan setelah bagian Mansion pada Director’s Cut. Rute ini menempatkannya setelah Season 1 untuk menghindari nomor episode lintas edisi.',true,{start:1,end:1,edition:REZERO_OVA}),
   rezero('OVA 2 — The Frozen Bond',100049,'OVA','Kisah latar Emilia dan Puck. Rekomendasi menonton setelah Season 1, sebelum Season 2; bukan season utama atau episode TV.',true,{start:2,end:2,edition:REZERO_OVA}),
   rezero('Re:ZERO Season 2 — bagian pertama',108632,'TV','13 episode bagian pertama; nomor episode lokal seri ini mulai dari 1.',false,{start:1,end:13,edition:'Season 2 Part 1 (2020)'}),
   rezero('Re:ZERO Season 2 — bagian kedua',119661,'TV','12 episode bagian kedua; cek penomoran edisi platform sebelum memilih episode.',false,{start:1,end:12,edition:'Season 2 Part 2 (2021)'}),
   rezero('Re:ZERO Season 3',163134,'TV','16 episode Season 3. Panduan ini tidak menyatakan semua instalmen berikutnya tercakup.',false,{start:1,end:16,edition:'Season 3 (2024–2025)'})
  ]
 }
] as const

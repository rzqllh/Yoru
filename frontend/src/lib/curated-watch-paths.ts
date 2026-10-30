/**
 * Source-backed editorial viewing routes.
 * Each published path is a bounded RECOMMENDATION, not a canon assertion.
 * This registry is extensible by PR with verifiable sources and review dates.
 */
import {EDITION_WATCH_PATHS} from './curated-watch-path-editions.ts'

export type PathStep={
 title:string;aniListId:number|null;kind:'TV'|'MOVIE'|'OVA'|'ONA'|'SPECIAL'|'GROUP';
 optional:boolean;note:string;episodeRange?:{start:number;end:number;edition:string}
}
export type CuratedPath={
 id:string;franchise:string;title:string;pathType:'newcomer'|'alternative'|'source-order'|'broadcast'|'chronology';
 scope:'selected-route';reviewedAt:string;spoilerRisk:'low'|'contextual';
 note:string;anchorAniListIds:number[];
 sources:{title:string;url:string;checkedAt:string}[];
 steps:PathStep[]
}
const source=(title:string,url:string)=>({title,url,checkedAt:'2026-10-30'})
const entry=(title:string,aniListId:number|null,kind:PathStep['kind'],note:string,optional=false):PathStep=>
 ({title,aniListId,kind,note,optional})

/**
 * Sources support the paths as editorial suggestions; titles and AniList IDs
 * were separately checked against the corresponding AniList catalog pages.
 * The collection deliberately DOES NOT imply full franchise coverage.
 */
export const CURATED_WATCH_PATHS:readonly CuratedPath[]=[
 {
  id:'fate-anime-newcomer',franchise:'Fate/stay night',title:'Mulai Fate lewat anime modern',
  pathType:'newcomer',scope:'selected-route',reviewedAt:'2026-10-30',spoilerRisk:'low',
  note:'Salah satu rute menonton untuk pemula. Heaven\'s Feel merupakan jalur cerita alternatif dari Unlimited Blade Works, bukan season lanjutan. Fate/Zero adalah prekuel yang ditonton belakangan untuk menjaga sebagian misteri. Cabang Grand Order/Apocrypha tidak dipaksakan masuk rute ini.',
  anchorAniListIds:[19603,20792,20791,21718,21719,10087,11741,356],
  sources:[
   source('Anime Meridian — How to Watch Fate in Order (September 2026)','https://animemeridian.com/guide/2026-09-20/how-to-watch-fate-in-order/'),
   source('AniList — Unlimited Blade Works (2014)','https://anilist.co/anime/19603'),
   source('AniList — Heaven\'s Feel I (2017)','https://anilist.co/anime/20791')
  ],
  steps:[
   entry('Fate/stay night: Unlimited Blade Works (2014)',19603,'TV','Mulai dari prolog/episode 0 jika edisi menyediakan.'),
   entry('Fate/stay night: Unlimited Blade Works 2nd Season',20792,'TV','Lanjutkan bagian kedua UBW.'),
   entry('Fate/stay night [Heaven\'s Feel] I. presage flower',20791,'MOVIE','Jalur alternatif Heaven\'s Feel, film pertama.'),
   entry('Fate/stay night [Heaven\'s Feel] II. lost butterfly',21718,'MOVIE','Film kedua dalam trilogi Heaven\'s Feel.'),
   entry('Fate/stay night [Heaven\'s Feel] III. spring song',21719,'MOVIE','Film penutup trilogi Heaven\'s Feel.'),
   entry('Fate/Zero',10087,'TV','Prekuel yang sengaja diletakkan setelah rute stay night dalam rekomendasi ini.'),
   entry('Fate/Zero 2nd Season',11741,'TV','Lanjutkan bagian kedua Fate/Zero.')
  ]
 },
 {
  id:'fate-prequel-first',franchise:'Fate/stay night',title:'Alternatif: mulai dari Fate/Zero',
  pathType:'alternative',scope:'selected-route',reviewedAt:'2026-10-30',spoilerRisk:'contextual',
  note:'Pilihan prekuel-dulu untuk penonton yang lebih tertarik kronologi sebagian peristiwa. Bukan satu timeline canon linear: Unlimited Blade Works dan Heaven\'s Feel tetap jalur alternatif. Fate/Zero lebih awal dapat mengungkap informasi yang pada rute lain disimpan sebagai misteri.',
  anchorAniListIds:[19603,20792,20791,21718,21719,10087,11741,356],
  sources:[
   source('Popverse — Fate timelines, chronological versus release grouping','https://www.thepopverse.com/fate-anime-watch-order-how-to-stay-night-grand-order-chronological-release'),
   source('AniList — Fate/Zero','https://anilist.co/anime/10087')
  ],
  steps:[
   entry('Fate/Zero',10087,'TV','Bagian pertama kisah prekuel.'),
   entry('Fate/Zero 2nd Season',11741,'TV','Lanjutkan bagian kedua.'),
   entry('Fate/stay night: Unlimited Blade Works (2014)',19603,'TV','Masuk ke jalur UBW, dimulai dari episode prolog bila ada.'),
   entry('Fate/stay night: Unlimited Blade Works 2nd Season',20792,'TV','Lanjutkan UBW.'),
   entry('Fate/stay night [Heaven\'s Feel] I. presage flower',20791,'MOVIE','Mulai jalur alternatif Heaven\'s Feel.'),
   entry('Fate/stay night [Heaven\'s Feel] II. lost butterfly',21718,'MOVIE','Lanjutkan trilogi.'),
   entry('Fate/stay night [Heaven\'s Feel] III. spring song',21719,'MOVIE','Selesaikan trilogi.')
  ]
 },
 {
  id:'monogatari-editorial',franchise:'Monogatari',title:'Monogatari: panduan awal editorial',
  pathType:'newcomer',scope:'selected-route',reviewedAt:'2026-10-30',spoilerRisk:'contextual',
  note:'Berdasarkan panduan editorial Crunchyroll, bukan kronologi kejadian secara menyeluruh. Kisah sering sengaja tidak kronologis. Panduan ini fokus kumpulan utama sampai Zoku Owarimonogatari dan TIDAK mengklaim mencakup seluruh instalmen terbaru. Penempatan Hanamonogatari serta Koyomimonogatari berbeda antar panduan novel/rilis anime.',
  anchorAniListIds:[5081,9260,21399,21400,17074],
  sources:[
   source('Crunchyroll — Monogatari Watch Order and Full Timeline Guide (updated January 2025)','https://www.crunchyroll.com/hi/news/guides/2024/3/10/a-guide-to-all-monogatari-arcs-in-order'),
   source('AniList — Bakemonogatari','https://anilist.co/anime/5081'),
   source('AniList — Monogatari Series: Second Season','https://anilist.co/anime/17074')
  ],
  steps:[
   entry('Bakemonogatari',5081,'TV','Awal jalur editorial ini.'),
   entry('Kizumonogatari I: Tekketsu-hen',9260,'MOVIE','Film pertama dari trilogi Kizumonogatari.'),
   entry('Kizumonogatari II: Nekketsu-hen',21399,'MOVIE','Film kedua dari trilogi.'),
   entry('Kizumonogatari III: Reiketsu-hen',21400,'MOVIE','Film ketiga dari trilogi.'),
   entry('Nisemonogatari',null,'TV','Lanjutkan instalmen setelah trilogi.'),
   entry('Nekomonogatari (Kuro)',null,'TV','Bagian awal tentang Hanekawa.'),
   entry('Monogatari Series: Second Season',17074,'TV','Berisi banyak arc; posisi beberapa arc dalam sumber novel bisa berbeda.'),
   entry('Hanamonogatari',null,'TV','Rilis terpisah; peletakan novel dan anime berbeda.'),
   entry('Tsukimonogatari',null,'SPECIAL','Lanjutkan kisah utama.'),
   entry('Owarimonogatari (bagian pertama)',null,'TV','Edisi layanan bisa memecah episode dengan cara berbeda.'),
   entry('Koyomimonogatari',null,'ONA','Tonton sebagai instalmen tersendiri menurut rute editorial ini.'),
   entry('Owarimonogatari (bagian kedua)',null,'TV','Berlanjut setelah bagian pertama dan instalmen relevan.'),
   entry('Zoku Owarimonogatari',null,'OVA','Rute ini berhenti di sini, tidak mengklaim keseluruhan franchise selesai.')
  ]
 },
 ...EDITION_WATCH_PATHS
] as const

const okId=(id:unknown)=>typeof id==='number'&&Number.isSafeInteger(id)&&id>0
const httpsUrl=(value:string)=>{try{return new URL(value).protocol==='https:'}catch{return false}}
export function validateCuratedPaths(paths:readonly CuratedPath[]):string[]{
 const errors:string[]=[],ids=new Set<string>()
 for(const path of paths){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path.id)||ids.has(path.id))errors.push('duplicate or invalid path ID: '+path.id)
  ids.add(path.id)
  if(!path.franchise.trim()||!path.title.trim()||!path.note.trim())errors.push('missing text: '+path.id)
  if(path.scope!=='selected-route')errors.push('unsupported scope: '+path.id)
  if(!/^\d{4}-\d{2}-\d{2}$/.test(path.reviewedAt))errors.push('missing review date: '+path.id)
  if(!path.anchorAniListIds.length||path.anchorAniListIds.some(id=>!okId(id)))errors.push('invalid anchors: '+path.id)
  if(!path.sources.length||path.sources.some(s=>!s.title.trim()||!httpsUrl(s.url)||!/^\d{4}-\d{2}-\d{2}$/.test(s.checkedAt)))errors.push('missing source evidence: '+path.id)
  if(!path.steps.length||path.steps.length>80)errors.push('invalid steps: '+path.id)
  // A media may repeat ONLY for distinct, non-overlapping episodes of one edition.
  // Never interpret two separate provider editions as sharing episode numbers.
  const used=new Map<number,Array<{start:number;end:number;edition:string}|null>>()
  for(const step of path.steps){
   if(!step.title.trim()||!step.note.trim()||step.title.length>180||step.note.length>420)errors.push('invalid step text: '+path.id)
   const r=step.episodeRange
   if(r&&(!okId(r.start)||!okId(r.end)||r.end<r.start||!r.edition.trim()||r.edition.length>120))errors.push('invalid episode range: '+path.id)
   if(step.aniListId!==null){
    if(!okId(step.aniListId)){errors.push('invalid media id: '+path.id);continue}
    const seen=used.get(step.aniListId)??[]
    if(seen.some(previous=>!previous||!r||previous.edition!==r.edition||
      (r.start<=previous.end&&r.end>=previous.start))){
     errors.push('ambiguous or duplicate media: '+path.id)
    }
    seen.push(r??null)
    used.set(step.aniListId,seen)
   }
  }
 }
 return errors
}
export function discoverCuratedPaths(anilistIds:readonly number[]):CuratedPath[]{
 const available=new Set(anilistIds)
 return CURATED_WATCH_PATHS.filter(path=>path.anchorAniListIds.some(id=>available.has(id)))
}

/** A story chronology must be a separately reviewed, sourced editorial path.
 * Recommendations, episode broadcast order, and AniList relations do not qualify.
 * No current bundled route is classified as in-story chronology.
 */
export function getStoryChronologyPath(paths:readonly CuratedPath[]):CuratedPath|null{
 return paths.find(path=>path.pathType==='chronology'&&validateCuratedPaths([path]).length===0)??null
}

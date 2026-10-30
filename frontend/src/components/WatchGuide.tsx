import {useEffect,useMemo,useState} from 'react'
import {ArrowLeft,ArrowRight,BookOpen,GitBranch,Info,Search,Network} from 'lucide-react'
import {search,watchGuide,type WatchGuideEntry,type WatchGuideResponse} from '../lib/api'
import {WATCH_GROUPS,filterWatchEntries,isExtendedNode,sortWatchEntries,type WatchGroup} from '../lib/watch-guide-view'
import type {Anime} from '../types'
import {discoverCuratedPaths} from '../lib/curated-watch-paths'

const suggestions=['Fate','Monogatari','Gundam','Toaru','Haruhi','Re:Zero','Steins;Gate','K-On!']
const labels:Record<WatchGuideEntry['relation'],string>={
 CURRENT:'Judul pilihan',PREQUEL:'Prekuel',SEQUEL:'Sekuel',
 SIDE_STORY:'Cerita sampingan',ALTERNATIVE:'Jalur alternatif',SPIN_OFF:'Spin-off',
 PARENT:'Cerita induk',SUMMARY:'Rangkuman',OTHER:'Terkait',
 COMPILATION:'Film kompilasi',CONTAINS:'Memuat bagian lain',SAME_UNIVERSE:'Semesta sama'
}
export default function WatchGuide({malId,onPick,onBack,onOpenAnime}:{
 malId:number|null;onPick:(malId:number)=>void;onBack:()=>void;onOpenAnime:(malId:number)=>void
}){
 const [query,setQuery]=useState('')
 const [matches,setMatches]=useState<Anime[]>([])
 const [data,setData]=useState<WatchGuideResponse|null>(null)
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 const [searchLoading,setSearchLoading]=useState(false)
 const [depth,setDepth]=useState<1|2>(1)
 const [filter,setFilter]=useState<WatchGroup>('all')
 const [curatedId,setCuratedId]=useState<string|null>(null)
 useEffect(()=>{
  const q=query.trim()
  if(q.length<2){setMatches([]);setSearchLoading(false);return}
  const controller=new AbortController()
  const timer=window.setTimeout(()=>{
   setSearchLoading(true)
   search(q,1,controller.signal).then(res=>setMatches(res.items.slice(0,8)))
    .catch(()=>{if(!controller.signal.aborted)setMatches([])})
    .finally(()=>{if(!controller.signal.aborted)setSearchLoading(false)})
  },300)
  return()=>{controller.abort();window.clearTimeout(timer)}
 },[query])
 useEffect(()=>{
  if(!malId){setData(null);setError('');return}
  const controller=new AbortController()
  setLoading(true);setError('')
  if(depth===1)setData(null)
  watchGuide(malId,controller.signal,depth).then(setData).catch(()=>{
   if(!controller.signal.aborted)setError('Hubungan cerita belum bisa dimuat. Coba judul lain atau ulangi nanti.')
  }).finally(()=>{if(!controller.signal.aborted)setLoading(false)})
  return()=>controller.abort()
 },[malId,depth])
 const entries=useMemo(()=>sortWatchEntries(data?.graph?.nodes??data?.items??[]),[data])
 const filtered=useMemo(()=>filterWatchEntries(entries,filter),[entries,filter])
 const names=useMemo(()=>new Map(entries.map(e=>[e.aniListId,e.title])),[entries])
 const entryById=useMemo(()=>new Map(entries.map(e=>[e.aniListId,e])),[entries])
 const curated=useMemo(()=>discoverCuratedPaths(entries.map(e=>e.aniListId)),[entries])
 const selectedCurated=curated.find(path=>path.id===curatedId)??curated[0]
 const pick=(id:number)=>{setDepth(1);setFilter('all');setCuratedId(null);setData(null);setMatches([]);onPick(id)}
 return <div className="page-body yoru-watch-guide">
  <div className="page-intro"><div>
   <span className="mini-label">PANDUAN CERITA</span>
   <h1>Panduan urutan anime</h1>
   <p>Telusuri hubungan season, film, OVA, special dan cabang cerita berdasarkan judul yang dipilih.</p>
  </div></div>
  <button type="button" className="btn btn-outline" onClick={onBack}><ArrowLeft size={16}/> Kembali ke Jelajahi</button>
  <div className="guide-search">
   <label htmlFor="watch-guide-search"><Search size={16}/> Cari franchise atau judul anime</label>
   <input id="watch-guide-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari judul untuk melihat hubungan ceritanya…"/>
   <div className="guide-chips">{suggestions.map(term=><button type="button" key={term} onClick={()=>setQuery(term)}>{term}</button>)}</div>
   {searchLoading&&<p role="status">Mencari judul…</p>}
   {matches.length>0&&<section className="guide-results" aria-label="Hasil pencarian panduan">
    {matches.map(anime=><button type="button" key={anime.malId} onClick={()=>pick(anime.malId)}>
     <span><strong>{anime.title}</strong><small>{anime.type} · {anime.year??'Tahun tidak diketahui'}</small></span>
     <ArrowRight size={17}/>
    </button>)}
   </section>}
  </div>
  {!malId&&<div className="guide-information">
   <BookOpen size={20}/><p>Mulai dari judul apa pun, bukan daftar franchise terbatas. Hubungan diambil dari AniList; urutan rekomendasi dan kronologi cerita belum dapat dibuktikan hanya dari metadata.</p>
  </div>}
  {loading&&<p role="status" className="guide-information">{depth===2?'Memperluas jaringan hubungan…':'Memeriksa hubungan cerita di AniList…'}</p>}
  {error&&<p role="alert" className="guide-information">{error}</p>}
  {data&&<>
   <div className="guide-heading"><div>
    <h2>Jaringan judul yang berhubungan</h2>
    <p>Urutan rilis berdasarkan bulan/tahun yang tersedia, bukan urutan canon atau rekomendasi menonton.</p>
   </div><a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">Sumber: AniList</a></div>
   <fieldset className="guide-mode"><legend className="sr-only">Jenis urutan anime</legend>
    <button type="button" disabled title="Urutan rekomendasi belum dikurasi untuk franchise ini">Disarankan</button>
    <button type="button" disabled title="Urutan kejadian/episode tidak tersedia dari relasi AniList">Kronologi</button>
    <button type="button" aria-pressed="true" className="active">Urutan rilis</button>
   </fieldset>
   <div className="guide-information"><Info size={18}/><p>Prekuel/sekuel adalah relasi judul, bukan bukti kapan OVA disisipkan di antara episode. Jalur alternatif, semesta sama, dan film rangkuman tidak otomatis menjadi bagian cerita utama. Judul tanpa tanggal berada di akhir daftar.</p></div>
   {selectedCurated&&<section className="guide-curated" aria-label="Panduan menonton dengan sumber">
    <div className="guide-curated-header">
     <div><span className="mini-label">RUTE EDITORIAL · BUKAN URUTAN CANON TUNGGAL</span>
      <h3>Panduan menonton {selectedCurated.franchise}</h3>
      <p>{selectedCurated.note}</p>
     </div>
     <small>Ditinjau {selectedCurated.reviewedAt}</small>
    </div>
    <fieldset className="guide-curated-choices">
     <legend>Pilih rute</legend>
     {curated.map(path=><button type="button" key={path.id}
      aria-pressed={selectedCurated.id===path.id} className={selectedCurated.id===path.id?'active':''}
      onClick={()=>setCuratedId(path.id)}>{path.title}</button>)}
    </fieldset>
    {selectedCurated.spoilerRisk==='contextual'&&<div className="guide-information"><Info size={17}/>
     <p>Rute ini dapat memperlihatkan hubungan cerita lebih awal daripada urutan rilis. Sinopsis episode dan twist sengaja tidak dicantumkan.</p></div>}
    <ol className="guide-curated-steps">
     {selectedCurated.steps.map((step,index)=>{
      const matched=step.aniListId?entryById.get(step.aniListId):undefined
      return <li key={`${selectedCurated.id}:${step.aniListId??step.title}`}>
       <span className="guide-path-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
       <div><strong>{step.title}</strong>
        <small>{step.kind} · {step.optional?'Opsional dalam rute ini':'Bagian dari rute ini'}</small>
        <p>{step.note}</p>
        {step.episodeRange&&<small>Episode {step.episodeRange.start}–{step.episodeRange.end} · edisi {step.episodeRange.edition}</small>}
       </div>
       {matched?.malId?<button type="button" className="btn btn-outline" onClick={()=>{if(matched?.malId)onOpenAnime(matched.malId)}}>Buka detail</button>:
        step.aniListId?<a href={`https://anilist.co/anime/${step.aniListId}`} target="_blank" rel="noopener noreferrer">Lihat di AniList</a>:
        <span className="guide-unmapped">Belum terhubung ke katalog</span>}
      </li>
     })}
    </ol>
    <div className="guide-curated-sources"><strong>Sumber panduan editorial</strong>
     {selectedCurated.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>)}
     <small>Sumber dan rute dapat berbeda pendapat. Yoru tidak menjamin ketersediaan video pada judul-judul ini.</small>
    </div>
   </section>}
   <div className="guide-expand">
    <div><strong>{entries.length} judul terpetakan</strong><small>{data.graph?'Jaringan maksimal dua tingkat dari judul pilihan':'Baru hubungan langsung dari judul pilihan'}</small></div>
    {!data.graph&&<button type="button" className="btn btn-outline" disabled={loading||entries.length<2} onClick={()=>setDepth(2)}><Network size={16}/> Perluas hubungan (2 tingkat)</button>}
   </div>
   {data.graph&&<div className="guide-information" role="status"><Network size={18}/><p>{data.graph.note} {data.graph.scannedDirect} dari {data.graph.directTotal} judul langsung ditelusuri. Hasil ini tetap bukan daftar franchise lengkap.</p></div>}
   <fieldset className="guide-groups"><legend className="sr-only">Filter jenis hubungan anime</legend>
    {WATCH_GROUPS.map(group=><button type="button" key={group.id}
     className={filter===group.id?'active':''} aria-pressed={filter===group.id}
     onClick={()=>setFilter(group.id)}>{group.label} ({filterWatchEntries(entries,group.id).length})</button>)}
   </fieldset>
   {filtered.length===0?<p className="guide-information">Belum ada judul dalam kategori ini pada metadata yang ditemukan.</p>:
   <div className="guide-entries">{filtered.map((item,index)=><div className="guide-entry" key={item.aniListId}>
    <div className="guide-order">{String(index+1).padStart(2,'0')}</div>
    <div className="guide-entry-body">
     <strong>{item.title}</strong>
     <small>{labels[item.relation]??'Terkait'} · {item.format} · {item.year??'Tahun belum tersedia'}{item.month?' / '+String(item.month).padStart(2,'0'):''}</small>
     {item.relation==='ALTERNATIVE'||item.relation==='SPIN_OFF'||item.relation==='SAME_UNIVERSE'?<span className="guide-alt"><GitBranch size={13}/> Jalur/semesta berbeda; cek kesinambungan cerita</span>:null}
     {isExtendedNode(item)&&<span className="guide-alt"><Network size={13}/> Ditemukan melalui {names.get(item.viaAniListId??-1)??'judul terkait'} (tingkat 2)</span>}
    </div>
    <button type="button" className="btn btn-outline" disabled={!item.malId} title={item.malId?'Buka detail anime':'Belum dipetakan ke MyAnimeList'} onClick={()=>item.malId&&onOpenAnime(item.malId)}>
     {item.malId?'Buka':'Belum terpetakan'}
    </button>
   </div>)}</div>}
   {entries.length===1&&<p className="guide-information">Belum ada hubungan judul lain dalam respons AniList untuk anime ini.</p>}
  </>}
 </div>
}

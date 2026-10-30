import {useEffect,useMemo,useState} from 'react'
import {ArrowLeft,ArrowRight,BookOpen,GitBranch,Info,Search} from 'lucide-react'
import {search,watchGuide,type WatchGuideEntry,type WatchGuideResponse} from '../lib/api'
import type {Anime} from '../types'

const suggestions=['Fate','Sword Art Online','Tensei Shitara Slime Datta Ken']
const labels:Record<string,string>={CURRENT:'Judul pilihan',PREQUEL:'Prekuel',SEQUEL:'Sekuel',
 SIDE_STORY:'Cerita sampingan',ALTERNATIVE:'Jalur alternatif',SPIN_OFF:'Spin-off',
 PARENT:'Cerita induk',SUMMARY:'Rangkuman',OTHER:'Terkait'}
function releaseSort(items:WatchGuideEntry[]){
 return [...items].sort((a,b)=>(a.year??9999)-(b.year??9999)||
 (a.month??99)-(b.month??99)||a.title.localeCompare(b.title,'id'))
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
 useEffect(()=>{
  const q=query.trim()
  if(q.length<2){setMatches([]);return}
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
  setLoading(true);setError('');setData(null)
  watchGuide(malId,controller.signal).then(setData).catch(()=>{
   if(!controller.signal.aborted)setError('Hubungan cerita belum bisa dimuat. Coba judul lain atau ulangi nanti.')
  }).finally(()=>{if(!controller.signal.aborted)setLoading(false)})
  return()=>controller.abort()
 },[malId])
 const ordered=useMemo(()=>releaseSort(data?.items??[]),[data])
 return <div className="page-body yoru-watch-guide">
  <div className="page-intro"><div>
   <span className="mini-label">PANDUAN CERITA</span>
   <h1>Panduan urutan anime</h1>
   <p>Temukan season, film, OVA, dan cabang cerita tanpa harus menebak dari judulnya.</p>
  </div></div>
  <button type="button" className="btn btn-outline" onClick={onBack}><ArrowLeft size={16}/> Kembali ke Jelajahi</button>
  <div className="guide-search">
   <label htmlFor="watch-guide-search"><Search size={16}/> Cari franchise atau judul anime</label>
   <input id="watch-guide-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari judul untuk melihat hubungan ceritanya…"/>
   <div className="guide-chips">{suggestions.map(term=><button type="button" key={term} onClick={()=>setQuery(term)}>{term}</button>)}</div>
   {searchLoading&&<p role="status">Mencari judul…</p>}
   {matches.length>0&&<div className="guide-results" aria-label="Hasil pencarian panduan">
    {matches.map(anime=><button type="button" key={anime.malId} onClick={()=>{onPick(anime.malId);setMatches([])}}>
     <span><strong>{anime.title}</strong><small>{anime.type} · {anime.year??'Tahun tidak diketahui'}</small></span>
     <ArrowRight size={17}/>
    </button>)}
   </div>}
  </div>
  {!malId&&<div className="guide-information">
   <BookOpen size={20}/><p>Pilih salah satu judul. Hubungan prekuel, sekuel, dan spin-off diambil dari metadata AniList. Panduan terkurasi untuk franchise bercabang belum tersedia.</p>
  </div>}
  {loading&&<p role="status" className="guide-information">Memeriksa hubungan cerita di AniList…</p>}
  {error&&<p role="alert" className="guide-information">{error}</p>}
  {data&&<>
   <div className="guide-heading"><div>
    <h2>Judul yang saling berhubungan</h2>
    <p>Urutan rilis menurut tanggal metadata, bukan rekomendasi urutan menonton.</p>
   </div><a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">Sumber: AniList</a></div>
   <div className="guide-mode" role="group" aria-label="Jenis urutan anime">
    <button type="button" disabled title="Belum terkurasi">Disarankan</button>
    <button type="button" disabled title="Belum ada kronologi cerita terverifikasi">Kronologi</button>
    <button type="button" aria-pressed="true" className="active">Urutan rilis</button>
   </div>
   <div className="guide-information"><Info size={18}/><p>Daftar ini hanya mencakup hubungan langsung dari judul terpilih, bukan seluruh franchise. Jalur alternatif tidak otomatis mengikuti cerita utama. Urutan lengkap membutuhkan kurasi tambahan.</p></div>
   <div className="guide-entries">{ordered.map((item,index)=><div className="guide-entry" key={item.aniListId}>
    <div className="guide-order">{String(index+1).padStart(2,'0')}</div>
    <div className="guide-entry-body">
     <strong>{item.title}</strong>
     <small>{labels[item.relation]??'Terkait'} · {item.format} · {item.year??'Tahun belum tersedia'}</small>
     {item.relation==='ALTERNATIVE'||item.relation==='SPIN_OFF'?<span className="guide-alt"><GitBranch size={13}/> Jalur/cabang berbeda</span>:null}
    </div>
    <button type="button" className="btn btn-outline" disabled={!item.malId} title={item.malId?'Buka detail anime':'Belum dipetakan ke MyAnimeList'} onClick={()=>item.malId&&onOpenAnime(item.malId)}>
     {item.malId?'Buka':'Belum terpetakan'}
    </button>
   </div>)}</div>
   {ordered.length===1&&<p className="guide-information">Belum ada hubungan judul lain dalam respons AniList untuk anime ini.</p>}
  </>}
 </div>
}

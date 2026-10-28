import {useCallback,useEffect,useMemo,useRef,useState} from 'react'
import {ArrowDownRight,ArrowRight,ArrowUpRight,Bookmark,Check,ChevronDown,ChevronRight,Clapperboard,Clock3,Compass,Download,Film,Heart,Info,Layers3,Library,LoaderCircle,Menu,MonitorPlay,Play,Plus,RefreshCw,Search,Settings2,SlidersHorizontal,Sparkles,Star,Trash2,Upload,WifiOff,X} from 'lucide-react'
import type {Anime,Episode,LibraryEntry,Page,ProgressEntry,Stream,LibraryStatus} from './types'
import {api,catalog,detail,episodes,providerEpisodes,providers,search,streams} from './lib/api'
import {clearUserData,exportUserData,getAnimeSaved,importUserData,listLibrary,listProgress,removeAnime,saveAnime} from './lib/db'
import {description,scoreDisplay,yearLabel,durationDisplay} from './lib/format'
import Player from './components/Player'

type Playback={anime:Anime|null;episode:number;stream:Stream;demo?:boolean}
const TEST_STREAM:Stream={id:'demo',providerId:'HLS demo',format:'hls',url:'/demo/stream.m3u8',tracks:[{lang:'id',label:'Bahasa Indonesia (sampel)',url:'/demo-id.vtt'}],subtitleMode:'soft'}
const sections:[Page,string,typeof Compass][]=[['home','Beranda',Compass],['browse','Jelajahi',Compass],['library','Koleksi',Library],['settings','Pengaturan',Settings2]]
const SKELETON_KEYS=['a','b','c','d','e','f','g','h','i','j','k','l']
const posterPlaceholder='radial-gradient(circle at 68% 25%,#505346 0%,#242a24 32%,#15191c 75%)'

function Poster({anime,aspect='portrait'}:{anime:Anime;aspect?:'portrait'|'wide'}){
 return <div className={`poster ${aspect}`} style={{backgroundImage:anime.poster?`linear-gradient(180deg,transparent 38%,rgba(0,0,0,.27)),url("${anime.poster.replaceAll('"','%22')}")`:posterPlaceholder}} role="img" aria-label={`Poster ${anime.title}`}><span className="poster-glow"/></div>
}
function MiniLabel({children}:{children:React.ReactNode}){return <span className="mini-label">{children}</span>}
function Meta({anime}:{anime:Anime}){return <div className="anime-meta"><span>{yearLabel(anime.year)}</span><i/><span>{anime.type}</span><i/><span>{anime.episodes?`${anime.episodes} episode`:'Episode ?'}</span></div>}
function Card({anime,onOpen,compact=false}:{anime:Anime;onOpen:(anime:Anime)=>void;compact?:boolean}){
 return <button type="button" className={`anime-card ${compact?'compact':''}`} onClick={()=>onOpen(anime)} aria-label={`Buka ${anime.title}`}>
  <div className="card-art"><Poster anime={anime}/><div className="card-overlay"><span>LIHAT DETAIL <ArrowUpRight size={14}/></span></div>{anime.score!==null&&<span className="score-tag"><Star size={11} fill="currentColor"/>{scoreDisplay(anime.score)}</span>}</div>
  <div className="card-copy"><strong title={anime.title}>{anime.title}</strong><span>{anime.year||'—'} <span className="dot-separated">•</span> {anime.type}</span></div>
 </button>
}
function CardSkeleton(){return <div className="anime-card" aria-hidden="true"><div className="card-art skeleton"/><div className="card-copy"><div className="skeleton skeleton-line"/><div className="skeleton skeleton-line short"/></div></div>}
function Empty({icon=Film,title,body,action}:{icon?:typeof Film;title:string;body:string;action?:React.ReactNode}){const Icon=icon;return <div className="empty-state"><div className="empty-icon"><Icon size={25}/></div><h3>{title}</h3><p>{body}</p>{action}</div>}
function Section({eyebrow,title,action,children}:{eyebrow:string;title:string;action?:React.ReactNode;children:React.ReactNode}){return <section className="content-section"><div className="section-heading"><div><MiniLabel>{eyebrow}</MiniLabel><h2>{title}</h2></div>{action}</div>{children}</section>}

function useCatalog(kind:'season'|'top'|'upcoming'){
 const [data,setData]=useState<Anime[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('')
 const [retry,setRetry]=useState(0)
 // biome-ignore lint/correctness/useExhaustiveDependencies: retry counter intentionally forces new catalog request.
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');catalog(kind,1,controller.signal).then(result=>setData(result.items)).catch(e=>{if(!controller.signal.aborted)setError((e as Error).message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});return()=>controller.abort()},[kind,retry])
 return {data,loading,error,retry:()=>setRetry(v=>v+1)}
}
function AppLogo(){return <div className="logo"><span className="logo-symbol"><span/></span><span className="logo-type">yoru<span className="logo-punct">.</span></span></div>}

function App(){
 const [page,setPage]=useState<Page>('home');const [query,setQuery]=useState('')
 const [selected,setSelected]=useState<Anime|null>(null);const [playback,setPlayback]=useState<Playback|null>(null)
 const [toast,setToast]=useState('');const [mobileNav,setMobileNav]=useState(false)
 const [library,setLibrary]=useState<LibraryEntry[]>([]);const [progress,setProgress]=useState<ProgressEntry[]>([])
 const season=useCatalog('season'),top=useCatalog('top')
 const searchRef=useRef<HTMLInputElement>(null)
 const loadLocal=useCallback(()=>{void Promise.all([listLibrary(),listProgress()]).then(([saved,watching])=>{setLibrary(saved);setProgress(watching)}).catch(()=>{})},[])
 useEffect(()=>{loadLocal();window.addEventListener('yoru-data-updated',loadLocal);return()=>window.removeEventListener('yoru-data-updated',loadLocal)},[loadLocal])
 useEffect(()=>{if(!toast)return;const timer=window.setTimeout(()=>setToast(''),3600);return()=>window.clearTimeout(timer)},[toast])
 useEffect(()=>{function key(event:KeyboardEvent){if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setPage('browse');searchRef.current?.focus()}if(event.key==='Escape'){setSelected(null);setPlayback(null)}}window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[])
 const navigate=(next:Page)=>{setPage(next);setMobileNav(false);window.scrollTo({top:0,behavior:'smooth'})}
 const hero=season.data[0]||top.data[0]
 const continueList=progress.filter(row=>row.seconds>0 && (!row.duration||row.seconds<row.duration-10)).slice(0,6)
 async function toggleSave(anime:Anime){try{const entry=await getAnimeSaved(anime.id);if(entry){await removeAnime(anime.id);setToast('Dihapus dari koleksi')}else{await saveAnime(anime,'planned');setToast('Ditambahkan ke koleksi')}}catch{setToast('Gagal menyimpan koleksi')}}
 return <div className="app-shell">
  <aside className={`sidebar ${mobileNav?'is-open':''}`}>
   <div className="sidebar-brand"><AppLogo/><button type="button" className="close-menu" onClick={()=>setMobileNav(false)} aria-label="Tutup menu"><X size={20}/></button></div>
   <div className="sidebar-caption">MENU UTAMA</div>
   <nav className="main-nav" aria-label="Menu utama">{sections.map(([id,label,Icon])=><button type="button" key={id} className={`nav-link ${page===id?'active':''}`} onClick={()=>navigate(id)}><Icon size={19} strokeWidth={1.9}/><span>{label}</span>{page===id&&<span className="nav-indicator"/>}</button>)}</nav>
   <div className="sidebar-divider"/><div className="sidebar-caption">AKSES CEPAT</div>
   <button type="button" className="side-quick" onClick={()=>{navigate('browse');setQuery('')}}><Sparkles size={17}/> Anime musim ini <ArrowUpRight size={14}/></button>
   <button type="button" className="side-quick" onClick={()=>navigate('library')}><Clock3 size={17}/> Lanjut menonton <ArrowUpRight size={14}/></button>
   <div className="sidebar-bottom"><div className="sidebar-note"><div className="sidebar-note-icon"><Clapperboard size={20}/></div><strong>Temukan ceritamu.</strong><p>Anime favorit dalam satu tempat. Tanpa akun, tetap tersimpan.</p><button type="button" onClick={()=>navigate('browse')}>Jelajahi sekarang <ArrowRight size={14}/></button></div><div className="sidebar-foot">YORU / ANIME SPACE <span>V1.0</span></div></div>
  </aside>
  {mobileNav&&<button type="button" aria-label="Tutup menu" className="backdrop-nav" onClick={()=>setMobileNav(false)}/>}
  <div className="workspace">
   <header className="topbar"><div className="topbar-title"><button type="button" aria-label="Buka menu" className="mobile-menu" onClick={()=>setMobileNav(true)}><Menu size={22}/></button><div className="page-breadcrumb"><span>YORU</span><ChevronRight size={14}/><strong>{sections.find(s=>s[0]===page)?.[1]}</strong></div></div>
    <div className="topbar-actions"><div className="search-control"><Search size={18}/><input ref={searchRef} aria-label="Cari judul anime" value={query} onChange={e=>{setQuery(e.target.value);if(e.target.value.trim())setPage('browse')}} onFocus={()=>setPage('browse')} placeholder="Cari anime favorit..."/><kbd>⌘ K</kbd>{query&&<button type="button" aria-label="Hapus pencarian" onClick={()=>setQuery('')}><X size={16}/></button>}</div><span className="online-indicator"><span/> LOCAL FIRST</span><button type="button" className="avatar-button" title="Pengaturan" onClick={()=>navigate('settings')}>Y</button></div>
   </header>
   <main id="main-content">
    {page==='home'&&<>
      <div className="page-intro"><div><MiniLabel>THE ANIME EXPERIENCE</MiniLabel><h1>Beranda<span className="title-punct">.</span></h1><p>Selamat datang kembali. Ada cerita baru yang menunggumu.</p></div><div className="intro-date"><span>YOUR PERSONAL SPACE</span><strong>心のままに。</strong></div></div>
      <div className="hero-card" style={hero?.cover?{backgroundImage:`linear-gradient(90deg,#101319 2%,rgba(16,19,25,.98) 22%,rgba(16,19,25,.76) 49%,rgba(16,19,25,.16) 100%),linear-gradient(0deg,#101319 0%,transparent 60%),url("${hero.cover.replaceAll('"','%22')}")`}:undefined}>
       <div className="hero-copy"><div className="hero-badge"><span className="pulse"/> FEATURED THIS SEASON</div><div className="hero-kicker"><span className="line"/> ANIME PILIHAN MUSIM INI</div><h2>{hero?.title||'Your next story starts here.'}</h2><div className="hero-meta">{hero&&<><span className="hero-rating"><Star size={15} fill="currentColor"/> {scoreDisplay(hero.score)}</span><span>{hero.year||'Anime Jepang'}</span><span>{hero.type}</span><span>{hero.episodes?`${hero.episodes} Episode`:'Sedang tayang'}</span></>}</div><p>{hero?description(hero.synopsis).slice(0,220)+(hero.synopsis.length>220?'…':''):'Koleksi anime favorit, katalog musim ini, dan progress nontonmu dalam satu aplikasi yang terasa personal.'}</p><div className="hero-actions"><button type="button" className="btn btn-primary" onClick={()=>hero?setSelected(hero):navigate('browse')}><Play size={17} fill="currentColor"/> {hero?'Lihat anime':'Jelajahi anime'}</button><button type="button" className="btn btn-outline" onClick={()=>hero?void toggleSave(hero):navigate('library')}><Plus size={18}/>{hero?'Koleksiku':'Buka koleksi'}</button></div></div>
       <div className="hero-corner"><span>01 / DISCOVER</span><ArrowDownRight size={22}/></div>
      </div>
      {continueList.length>0&&<Section eyebrow="PICK UP WHERE YOU LEFT OFF" title="Lanjut menonton"><div className="continue-grid">{continueList.map(row=><button type="button" key={row.anime.id} className="continue-card" onClick={()=>setSelected(row.anime)}><div className="continue-image"><Poster anime={row.anime} aspect="wide"/><span className="continue-play"><Play size={18} fill="currentColor"/></span><div className="progress-track"><div style={{width:`${Math.min(100,row.duration?row.seconds/row.duration*100:10)}%`}}/></div></div><strong>{row.anime.title}</strong><small>Episode {row.episode} · {durationDisplay(row.seconds)} ditonton</small></button>)}</div></Section>}
      <Section eyebrow="FRESH FROM JAPAN" title="Tayang musim ini" action={<button type="button" className="text-link" onClick={()=>navigate('browse')}>Lihat semua <ArrowRight size={17}/></button>}>
       {season.error&&!season.data.length?<Empty icon={WifiOff} title="Katalog belum tersedia" body="Koneksi ke Jikan sedang bermasalah. Coba lagi nanti." action={<button type="button" className="btn btn-outline" onClick={season.retry}><RefreshCw size={16}/> Coba lagi</button>}/>:<div className="card-grid">{season.loading?SKELETON_KEYS.slice(0,6).map(key=><CardSkeleton key={key}/>):season.data.slice(0,6).map(a=><Card key={a.id} anime={a} onOpen={setSelected}/>)}</div>}
      </Section>
      <div className="editorial-banner"><div className="editorial-orbit"/><div><MiniLabel>BUILT AROUND YOUR WATCHLIST</MiniLabel><h3>Satu tempat untuk semua<br/><em>cerita yang berarti.</em></h3><p>Simpan favorit, lanjutkan episode, dan atur koleksi sesukamu. Semua tersimpan lokal di perangkatmu.</p><button type="button" className="btn btn-white" onClick={()=>navigate('library')}>Buka koleksi <ArrowUpRight size={17}/></button></div><span className="editorial-number">夜</span></div>
      <Section eyebrow="ALL-TIME FAVORITES" title="Paling populer" action={<button type="button" className="text-link" onClick={()=>navigate('browse')}>Eksplorasi <ArrowRight size={17}/></button>}>
       {top.error&&!top.data.length?<Empty icon={WifiOff} title="Belum bisa menampilkan anime populer" body="Periksa koneksi backend atau coba lagi." action={<button type="button" className="btn btn-outline" onClick={top.retry}>Coba lagi</button>}/>:<div className="card-grid">{top.loading?SKELETON_KEYS.slice(0,6).map(key=><CardSkeleton key={key}/>):top.data.slice(0,6).map(a=><Card key={a.id} anime={a} onOpen={setSelected}/>)}</div>}
      </Section>
    </>}
    {page==='browse'&&<Browse query={query} setQuery={setQuery} onOpen={setSelected}/>}
    {page==='library'&&<LibraryPage library={library} progress={progress} onOpen={setSelected} onBrowse={()=>navigate('browse')} onRemove={removeAnime} onStatusChange={saveAnime}/>}
    {page==='settings'&&<SettingsPage onDemo={()=>setPlayback({anime:null,episode:0,stream:TEST_STREAM,demo:true})} onNotify={setToast} onDataChanged={loadLocal}/>}
   </main>
   <footer className="footer"><div><AppLogo/><span>Anime, your way.</span></div><span>Powered by Jikan metadata · Built local-first</span><span>© {new Date().getFullYear()} YORU</span></footer>
  </div>
  <nav className="mobile-bottom" aria-label="Navigasi mobile">{sections.map(([id,label,Icon])=><button type="button" className={page===id?'active':''} key={id} onClick={()=>navigate(id)}><Icon size={21}/><span>{label}</span></button>)}</nav>
  {selected&&<DetailDialog anime={selected} isSaved={library.some(e=>e.anime.id===selected.id)} onClose={()=>setSelected(null)} onToggleSave={()=>void toggleSave(selected)} onWatch={value=>{setPlayback(value);setSelected(null)}}/>}
  {playback&&<Player anime={playback.anime} episode={playback.episode} stream={playback.stream} demo={playback.demo} onClose={()=>setPlayback(null)}/>}
  {toast&&<div role="status" className="toast"><Check size={17}/>{toast}</div>}
 </div>
}

function Browse({query,setQuery,onOpen}:{query:string;setQuery:(v:string)=>void;onOpen:(anime:Anime)=>void}){
 const [kind,setKind]=useState<'season'|'top'|'upcoming'>('season')
 const [items,setItems]=useState<Anime[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [next,setNext]=useState(false);const [page,setPage]=useState(1)
 const [retry,setRetry]=useState(0)
 const value=query.trim()
 // biome-ignore lint/correctness/useExhaustiveDependencies: retry value intentionally forces a new browse request.
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');const timer=window.setTimeout(()=>{
  const get=value?search(value,page,controller.signal):catalog(kind,page,controller.signal)
  get.then(response=>{setNext(response.hasNext);setItems(previous=>page===1?response.items:[...previous,...response.items.filter(a=>!previous.some(p=>p.id===a.id))])}).catch(e=>{if(!controller.signal.aborted)setError((e as Error).message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)})
 },value?350:0);return()=>{controller.abort();window.clearTimeout(timer)}},[kind,value,page,retry])
 const setTab=(tab:typeof kind)=>{setKind(tab);setPage(1);setItems([])}
 const setSearch=(q:string)=>{setQuery(q);setPage(1);setItems([])}
 return <div className="page-body"><div className="page-intro"><div><MiniLabel>FIND YOUR NEXT OBSESSION</MiniLabel><h1>Jelajahi<span className="title-punct">.</span></h1><p>Mulai petualangan baru dari ribuan judul anime Jepang.</p></div><div className="intro-icon"><Compass size={28}/></div></div>
  <div className="browse-toolbar"><div className="browse-input"><Search size={19}/><input aria-label="Cari anime" value={query} onChange={e=>setSearch(e.target.value)} placeholder="Judul, genre, atau kata kunci..."/>{query&&<button type="button" aria-label="Hapus" onClick={()=>setSearch('')}><X size={18}/></button>}</div><fieldset className="category-switch"><legend className="sr-only">Kategori katalog</legend>{([['season','Musim ini'],['top','Populer'],['upcoming','Akan datang']] as const).map(([id,label])=><button type="button" className={!value&&kind===id?'active':''} key={id} onClick={()=>{setSearch('');setTab(id)}}>{label}</button>)}</fieldset></div>
  <div className="browse-results-header"><div><MiniLabel>{value?'SEARCH RESULTS':'THE ANIME DIRECTORY'}</MiniLabel><h2>{value?`Hasil untuk “${value}”`:kind==='season'?'Sedang tayang':kind==='top'?'Anime populer':'Segera hadir'}</h2></div><span className="results-label"><SlidersHorizontal size={15}/> {loading?'Memuat...':`${items.length} judul`}</span></div>
  {error&&items.length===0?<Empty icon={WifiOff} title="Tidak bisa memuat katalog" body={error} action={<button type="button" className="btn btn-outline" onClick={()=>setRetry(n=>n+1)}><RefreshCw size={16}/> Coba lagi</button>}/>:items.length===0&&!loading?<Empty icon={Search} title="Tidak ada judul ditemukan" body="Coba ejaan lain atau pilih kategori berbeda."/>:<div className="card-grid browse-grid">{items.map(a=><Card key={a.id} anime={a} onOpen={onOpen}/>)}{loading&&SKELETON_KEYS.slice(0,page===1?12:6).map(key=><CardSkeleton key={key}/>)}</div>}
  {next&&!loading&&!error&&<div className="load-more"><button type="button" className="btn btn-outline" onClick={()=>setPage(n=>n+1)}>Muat lebih banyak <ChevronDown size={17}/></button></div>}
 </div>
}

function LibraryPage({library,progress,onOpen,onBrowse,onRemove,onStatusChange}:{library:LibraryEntry[];progress:ProgressEntry[];onOpen:(a:Anime)=>void;onBrowse:()=>void;onRemove:(id:string)=>Promise<void>;onStatusChange:(anime:Anime,status:LibraryStatus)=>Promise<void>}){
 const [filter,setFilter]=useState<'all'|LibraryStatus>('all')
 const saved=useMemo(()=>library.filter(row=>filter==='all'||row.status===filter),[library,filter])
 return <div className="page-body"><div className="page-intro"><div><MiniLabel>YOUR PERSONAL ARCHIVE</MiniLabel><h1>Koleksiku<span className="title-punct">.</span></h1><p>Semua yang kamu simpan, di satu tempat yang selalu milikmu.</p></div><div className="intro-icon"><Bookmark size={28}/></div></div>
  <div className="library-stats"><div><span>TOTAL KOLEKSI</span><strong>{library.length.toString().padStart(2,'0')}</strong><small>Judul tersimpan</small></div><div><span>SEDANG DITONTON</span><strong>{library.filter(l=>l.status==='watching').length.toString().padStart(2,'0')}</strong><small>Anime aktif</small></div><div><span>RIWAYAT EPISODE</span><strong>{progress.length.toString().padStart(2,'0')}</strong><small>Progress tercatat</small></div></div>
  <Section eyebrow="PERSONAL COLLECTION" title="Daftar simpan" action={<button type="button" className="text-link" onClick={onBrowse}>Temukan anime <ArrowRight size={17}/></button>}>
   <div className="filter-tabs">{([['all','Semua'],['planned','Ingin ditonton'],['watching','Menonton'],['completed','Selesai']] as const).map(([id,label])=><button type="button" key={id} className={filter===id?'active':''} onClick={()=>setFilter(id)}>{label}</button>)}</div>
   {saved.length===0?<Empty icon={Bookmark} title="Belum ada koleksi di sini" body="Temukan anime yang menarik, lalu tekan + Koleksiku untuk menyimpannya." action={<button type="button" className="btn btn-primary" onClick={onBrowse}><Compass size={17}/> Mulai jelajahi</button>}/>:<div className="library-list">{saved.map(row=><div className="library-item" key={row.anime.id}><button type="button" className="library-item-main" onClick={()=>onOpen(row.anime)}><Poster anime={row.anime}/><div><strong>{row.anime.title}</strong><Meta anime={row.anime}/><span className="library-status">{row.status==='planned'?'Ingin ditonton':row.status==='watching'?'Sedang ditonton':'Selesai'}</span></div></button><select className="library-status-select" aria-label={`Status ${row.anime.title}`} value={row.status} onChange={e=>void onStatusChange(row.anime,e.target.value as LibraryStatus)}><option value="planned">Ingin ditonton</option><option value="watching">Menonton</option><option value="completed">Selesai</option></select><button type="button" className="icon-button" title="Hapus dari koleksi" aria-label={`Hapus ${row.anime.title}`} onClick={()=>void onRemove(row.anime.id)}><Trash2 size={17}/></button></div>)}</div>}
  </Section>
 </div>
}

function DetailDialog({anime,isSaved,onClose,onToggleSave,onWatch}:{anime:Anime;isSaved:boolean;onClose:()=>void;onToggleSave:()=>void;onWatch:(p:Playback)=>void}){
 const [info,setInfo]=useState<Anime>(anime);const [listed,setListed]=useState<Episode[]>([]);const [available,setAvailable]=useState<Episode[]>([])
 const [loading,setLoading]=useState(true);const [playing,setPlaying]=useState('');const [error,setError]=useState('')
 const [choices,setChoices]=useState<{episode:number;items:Stream[]}|null>(null)
 const [more,setMore]=useState(false);const [page,setPage]=useState(1);const [hasNext,setHasNext]=useState(false)
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');setPage(1);setListed([]);setAvailable([]);setChoices(null);setInfo(anime)
  void Promise.allSettled([detail(anime.malId,controller.signal),episodes(anime.malId,1,controller.signal),providerEpisodes(anime.malId,controller.signal)]).then(results=>{
   if(controller.signal.aborted)return
   if(results[0].status==='fulfilled')setInfo(results[0].value)
   if(results[1].status==='fulfilled'){setListed(results[1].value.items);setHasNext(results[1].value.hasNext)}
   if(results[2].status==='fulfilled')setAvailable(results[2].value.items)
  }).finally(()=>{if(!controller.signal.aborted)setLoading(false)})
  return()=>controller.abort()
 },[anime])
 const availableMap=useMemo(()=>{const map=new Map<number,Episode[]>();for(const entry of available){const current=map.get(entry.number)||[];current.push(entry);map.set(entry.number,current)}return map},[available])
 const displayed=useMemo(()=>{const entries=new Map<number,Episode>();for(const ep of listed)entries.set(ep.number,ep);for(const ep of available)entries.set(ep.number,{...entries.get(ep.number),...ep});return [...entries.values()].sort((a,b)=>a.number-b.number)},[listed,available])
 async function loadNext(){try{const r=await episodes(anime.malId,page+1);setListed(current=>[...current,...r.items]);setHasNext(r.hasNext);setPage(page+1)}catch{setError('Tidak bisa mengambil episode berikutnya')}}
 async function play(ep:Episode){const sources=availableMap.get(ep.number);if(!sources?.length)return;setPlaying(String(ep.number));setError('');try{const results=await Promise.allSettled(sources.map(source=>streams(source.id)));const items=results.flatMap(result=>result.status==='fulfilled'?result.value.items:[]);if(!items.length){setError('Tidak ada stream yang bisa diputar untuk episode ini.');return}if(items.length===1){onWatch({anime:info,episode:ep.number,stream:items[0]})}else{setChoices({episode:ep.number,items})}}catch(e){setError((e as Error).message)}finally{setPlaying('')}}
 return <div className="modal-backdrop"><div className="detail-modal" role="dialog" aria-modal="true" aria-label={`Detail ${info.title}`}>
  <button type="button" className="modal-close icon-button glass" onClick={onClose} aria-label="Tutup detail"><X size={21}/></button>
  <div className="detail-cover" style={{backgroundImage:info.cover?`linear-gradient(0deg,#13161d,rgba(19,22,29,.62) 40%,rgba(19,22,29,.16)),url("${info.cover.replaceAll('"','%22')}")`:undefined}}/>
  <div className="detail-main"><div className="detail-poster"><Poster anime={info}/></div><div className="detail-info"><MiniLabel>ANIME DETAIL / #{info.malId}</MiniLabel><h2>{info.title}</h2>{info.japaneseTitle&&<p className="detail-japanese">{info.japaneseTitle}</p>}<div className="detail-facts"><span className="hero-rating"><Star size={15} fill="currentColor"/> {scoreDisplay(info.score)}</span><span>{yearLabel(info.year)}</span><span>{info.type}</span><span>{info.status}</span></div><div className="genre-tags">{info.genres.map(g=><span key={g}>{g}</span>)}</div><p className={`detail-synopsis ${more?'expanded':''}`}>{info.synopsis||'Sinopsis belum tersedia dari metadata.'}</p>{info.synopsis.length>280&&<button type="button" className="read-more" onClick={()=>setMore(v=>!v)}>{more?'Lebih sedikit':'Baca selengkapnya'} <ChevronDown size={15}/></button>}<div className="detail-actions"><button type="button" className="btn btn-primary" onClick={()=>{const first=available[0];if(first)void play(first);else setError('Belum ada source untuk judul ini. Isi configs/providers.local.json untuk menambahkan stream.')}}><Play size={17} fill="currentColor"/> {available.length?'Putar episode pertama':'Cek sumber'}</button><button type="button" className="btn btn-outline" onClick={onToggleSave}>{isSaved?<Check size={17}/>:<Plus size={17}/>} {isSaved?'Tersimpan':'Koleksiku'}</button></div></div></div>
  <div className="detail-episodes"><div className="section-heading"><div><MiniLabel>EPISODE GUIDE</MiniLabel><h2>Daftar episode</h2></div><span className="episode-count">{available.length} tersedia untuk streaming</span></div>{error&&<p className="detail-error"><Info size={16}/>{error}</p>}
   {choices&&<div className="source-picker"><div className="source-title"><strong>Pilih sumber · Episode {choices.episode}</strong><button type="button" className="icon-button" onClick={()=>setChoices(null)} aria-label="Tutup pilihan sumber"><X size={16}/></button></div><div className="source-options">{choices.items.map((stream,i)=><button type="button" key={stream.id||i} onClick={()=>onWatch({anime:info,episode:choices.episode,stream})}><MonitorPlay size={18}/><span><strong>{stream.quality||stream.format.toUpperCase()} · {stream.subtitleMode==='hard'?'Hardsub':stream.tracks.some(t=>t.lang==='id')?'Softsub ID':'Subtitle tidak terverifikasi'}</strong><small>{stream.providerId||'Custom provider'} · {stream.format.toUpperCase()}</small></span><Play size={17}/></button>)}</div></div>}
   {loading?<div className="detail-loading"><LoaderCircle className="spin" size={19}/> Mengambil episode…</div>:displayed.length?<div className="episode-list">{displayed.map(ep=>{const streamReady=availableMap.has(ep.number);return <button type="button" key={ep.number} className={`episode-row ${streamReady?'available':''}`} onClick={()=>void play(ep)} disabled={!streamReady||!!playing}><span className="episode-number">{String(ep.number).padStart(2,'0')}</span><div><strong>{ep.title}</strong><small>{streamReady?'Stream tersedia':ep.filler?'Filler · Metadata':'Metadata saja · Belum ada source'}</small></div>{streamReady?<span className="episode-action">{playing===String(ep.number)?<LoaderCircle size={17} className="spin"/>:<Play size={16}/>}</span>:<span className="episode-disabled">—</span>}</button>})}</div>:<Empty icon={Film} title="Episode belum tersedia" body="Metadata atau sumber stream belum ditemukan."/>}
   {hasNext&&<button type="button" className="load-episodes" onClick={()=>void loadNext()}>Muat episode berikutnya <ChevronDown size={16}/></button>}
  </div>
 </div></div>
}

function SettingsPage({onDemo,onNotify,onDataChanged}:{onDemo:()=>void;onNotify:(value:string)=>void;onDataChanged:()=>void}){
 const [providerList,setProviderList]=useState<{id:string;name:string;animeCount:number}[]>([])
 const [providerError,setProviderError]=useState('');const [apiOnline,setApiOnline]=useState(false)
 const [importing,setImporting]=useState(false);const inputRef=useRef<HTMLInputElement>(null)
 const refresh=useCallback(()=>{void Promise.allSettled([providers(),api<{status:string}>('/api/health')]).then(results=>{if(results[0].status==='fulfilled'){setProviderList(results[0].value.providers);setProviderError('')}else setProviderError('Tidak dapat membaca provider. Periksa konfigurasi JSON.');setApiOnline(results[1].status==='fulfilled')})},[])
 useEffect(()=>refresh(),[refresh])
 async function exportData(){try{const json=await exportUserData();const blob=new Blob([JSON.stringify(json,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='yoru-backup.json';anchor.click();URL.revokeObjectURL(url);onNotify('Backup berhasil diekspor')}catch{onNotify('Gagal mengekspor data')}}
 async function importData(file:File|null){if(!file)return;setImporting(true);try{if(file.size>5_000_000)throw new Error('Ukuran backup melebihi 5 MB');const json=JSON.parse(await file.text());await importUserData(json);onDataChanged();onNotify('Data berhasil dipulihkan')}catch(e){onNotify((e as Error).message)}finally{setImporting(false)}}
 async function reset(){if(!window.confirm('Hapus seluruh koleksi dan progress lokal? Tindakan ini tidak dapat dibatalkan.'))return;try{await clearUserData();onNotify('Data lokal telah dihapus')}catch{onNotify('Gagal menghapus data')}}
 return <div className="page-body settings-page"><div className="page-intro"><div><MiniLabel>MAKE IT YOURS</MiniLabel><h1>Pengaturan<span className="title-punct">.</span></h1><p>Atur sumber tontonan dan data personal kamu.</p></div><div className="intro-icon"><Settings2 size={27}/></div></div>
  <div className="settings-layout"><div className="settings-section"><div className="settings-heading"><div className="settings-heading-icon"><Layers3 size={21}/></div><div><h2>Sumber streaming</h2><p>Adapter lokal untuk episode dan stream.</p></div></div><div className="settings-box"><div className="setting-row"><div><strong>API backend</strong><small>Server Hono lokal</small></div><span className={`setting-state ${apiOnline?'good':'bad'}`}><span/>{apiOnline?'Terhubung':'Offline'}</span></div><div className="setting-row"><div><strong>Provider terkonfigurasi</strong><small>{providerList.length?providerList.map(p=>`${p.name} (${p.animeCount} anime)`).join(', '):'Belum ada provider personal'}</small></div><button type="button" className="icon-button" aria-label="Refresh provider" onClick={refresh}><RefreshCw size={18}/></button></div>{providerError&&<p className="config-error">{providerError}</p>}<div className="settings-note"><Info size={17}/><p>Source anime tidak dibundel dalam repositori. Tambahkan URL stream HTTPS milikmu ke <code>configs/providers.local.json</code> mengikuti contoh yang tersedia, lalu refresh.</p></div></div>
  <div className="settings-heading"><div className="settings-heading-icon"><MonitorPlay size={21}/></div><div><h2>Pengujian pemutar</h2><p>Verifikasi video HLS + subtitle WebVTT.</p></div></div><div className="settings-box player-test-setting"><div><span className="test-pill">PUBLIC TEST STREAM</span><strong>HLS playback test</strong><small>Video animasi orisinal lokal, bukan episode anime. Subtitle ID tersedia untuk pengujian.</small></div><button type="button" className="btn btn-primary" onClick={onDemo}><Play size={16} fill="currentColor"/> Test player</button></div>
  </div><div className="settings-section"><div className="settings-heading"><div className="settings-heading-icon"><Bookmark size={21}/></div><div><h2>Data & privasi</h2><p>Local-first, tanpa akun dan tanpa pelacakan.</p></div></div><div className="settings-box"><div className="setting-row"><div><strong>Ekspor backup</strong><small>Unduh koleksi dan riwayat sebagai JSON.</small></div><button type="button" className="setting-action" onClick={()=>void exportData()}><Download size={17}/> Ekspor</button></div><div className="setting-row"><div><strong>Impor backup</strong><small>Pulihkan data lokal dari file backup.</small></div><button type="button" className="setting-action" onClick={()=>inputRef.current?.click()} disabled={importing}><Upload size={17}/> {importing?'Impor...':'Impor'}</button><input type="file" accept="application/json,.json" className="visually-hidden" ref={inputRef} onChange={e=>{void importData(e.target.files?.[0]||null);e.target.value=''}}/></div><div className="setting-row"><div><strong>Hapus data lokal</strong><small>Menghapus koleksi dan progress yang tersimpan di browser ini.</small></div><button type="button" className="setting-action danger" onClick={()=>void reset()}><Trash2 size={17}/> Hapus</button></div></div>
  <div className="settings-heading"><div className="settings-heading-icon"><Heart size={21}/></div><div><h2>Tentang Yoru</h2><p>Anime, your way.</p></div></div><div className="settings-box about-box"><div className="about-mark"><AppLogo/></div><p>Anime discovery + local-first watchlist dengan pemutar HLS, provider modular, dan pengalaman PWA yang siap dikembangkan ke native.</p><div className="about-meta"><span>Build</span><strong>1.0.0 · Local</strong></div><div className="about-meta"><span>Frontend</span><strong>React / Vite / TypeScript</strong></div><div className="about-meta"><span>Metadata</span><strong>Jikan API</strong></div></div></div></div>
 </div>
}
export default App

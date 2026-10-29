import {useCallback,useEffect,useMemo,useRef,useState} from 'react'
import {
 AlertTriangle,
 ArrowDownRight,
 ArrowRight,
 ArrowUpRight,
 Bookmark,
 Check,
 ChevronDown,
 ChevronRight,
 Clapperboard,
 Clock3,
 Compass,
 Download,
 Film,
 Heart,
 Home,
 Info,
 Layers3,
 LoaderCircle,
 Menu,
 MonitorPlay,
 Play,
 Plus,
 RefreshCw,
 Search,
 Settings2,
 SlidersHorizontal,
 Star,
 Trash2,
 Upload,
 WifiOff,
 X,
} from 'lucide-react'
import type {Anime,Episode,LibraryEntry,LibraryStatus,ProgressEntry,Stream} from './types'
import {api,catalog,detail,episodes,providerEpisodes,providers,search,streams,browseFiltered} from './lib/api'
import {clearUserData,exportUserData,getAnimeSaved,importUserData,listLibrary,listProgress,removeAnime,saveAnime,getPreference,setPreference} from './lib/db'
import {description,durationDisplay,scoreDisplay,yearLabel} from './lib/format'
import {getBreadcrumbs,parseRoute,routeToPath,type RouteState} from './lib/router'
import Player from './components/Player'
import {verifyNativeSource} from './lib/source-readiness'
import {rankNativeStreams} from './lib/source-ranking'
import {useDialogFocus} from './lib/useDialogFocus'

type Playback={anime:Anime|null;episode:number;stream:Stream;demo?:boolean;manualSource?:boolean}

const TEST_STREAM:Stream={
 id:'demo',
 providerId:'Contoh Yoru',
 format:'hls',
 url:'/demo/stream.m3u8',
 tracks:[{lang:'id',label:'Bahasa Indonesia',url:'/demo-id.vtt'}],
 subtitleMode:'soft',
}

const navItems:[RouteState['page'],string,typeof Home,string][]=[
 ['home','Beranda',Home,'/'],
 ['browse','Jelajahi',Compass,'/jelajahi'],
 ['library','Koleksi',Bookmark,'/koleksi'],
 ['settings','Pengaturan',Settings2,'/pengaturan'],
]

const SKELETON_KEYS=['a','b','c','d','e','f','g','h','i','j','k','l']
const posterPlaceholder='radial-gradient(circle at 68% 25%,#3a3e35 0%,#202422 35%,#13161a 75%)'

function Poster({anime,aspect='portrait'}:{anime:Anime;aspect?:'portrait'|'wide'}){
 return <div className={`poster ${aspect}`} style={{backgroundImage:anime.poster?`linear-gradient(180deg,transparent 40%,rgba(0,0,0,.3)),url("${anime.poster.replaceAll('"','%22')}")`:posterPlaceholder}} role="img" aria-label={`Poster ${anime.title}`}><span className="poster-glow"/></div>
}

function MiniLabel({children}:{children:React.ReactNode}){
 return <span className="mini-label">{children}</span>
}

function Meta({anime}:{anime:Anime}){
 return <div className="anime-meta"><span>{yearLabel(anime.year)}</span><i/><span>{anime.type}</span><i/><span>{anime.episodes?`${anime.episodes} episode`:'Episode ?'}</span></div>
}

function Card({anime,onOpen,compact=false}:{anime:Anime;onOpen:(anime:Anime)=>void;compact?:boolean}){
 return <button type="button" className={`anime-card ${compact?'compact':''}`} onClick={()=>onOpen(anime)} aria-label={`Buka ${anime.title}`}>
  <div className="card-art">
   <Poster anime={anime}/>
   <div className="card-overlay"><span>LIHAT DETAIL <ArrowUpRight size={14}/></span></div>
   {anime.score!==null&&<span className="score-tag" title="Skor komunitas"><Star size={11} fill="currentColor"/>{scoreDisplay(anime.score)}</span>}
  </div>
  <div className="card-copy">
   <strong title={anime.title}>{anime.title}</strong>
   <span>{anime.year||'—'} <span className="dot-separated">•</span> {anime.type}</span>
  </div>
 </button>
}

function CardSkeleton(){
 return <div className="anime-card" aria-hidden="true"><div className="card-art skeleton"/><div className="card-copy"><div className="skeleton skeleton-line"/><div className="skeleton skeleton-line short"/></div></div>
}

function Empty({icon=Film,title,body,action}:{icon?:typeof Film;title:string;body:string;action?:React.ReactNode}){
 const Icon=icon
 return <div className="empty-state"><div className="empty-icon"><Icon size={25}/></div><h3>{title}</h3><p>{body}</p>{action}</div>
}

function Section({eyebrow,title,action,children}:{eyebrow?:string;title:string;action?:React.ReactNode;children:React.ReactNode}){
 return <section className="content-section"><div className="section-heading"><div>{eyebrow&&<MiniLabel>{eyebrow}</MiniLabel>}<h2>{title}</h2></div>{action}</div>{children}</section>
}

function useCatalog(kind:'season'|'top'|'upcoming'){
 const [data,setData]=useState<Anime[]>([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [retry,setRetry]=useState(0)

 // biome-ignore lint/correctness/useExhaustiveDependencies: retry counter intentionally forces new catalog request.
 useEffect(()=>{
  const controller=new AbortController()
  setLoading(true)
  setError('')
  catalog(kind,1,controller.signal)
   .then(result=>setData(result.items))
   .catch(e=>{if(!controller.signal.aborted)setError((e as Error).message)})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false)})
  return()=>controller.abort()
 },[kind,retry])

 return {data,loading,error,retry:()=>setRetry(v=>v+1)}
}

function AppLogo(){
 return <div className="logo"><span className="logo-symbol"><span/></span><span className="logo-type">yoru<span className="logo-punct">.</span></span></div>
}

/** Resolve only native sources proven to decode in this browser. */
async function resolveHealthyNative(malId:number,episode:number,exceptUrl?:string):Promise<Stream|null>{
 try{
  const providers=await providerEpisodes(malId)
  const matches=providers.items.filter(item=>item.number===episode&&item.providerId!=='public-embed').slice(0,6)
  const resolved=await Promise.allSettled(matches.map(item=>streams(item.id)))
  const candidates=rankNativeStreams(resolved.flatMap(result=>result.status==='fulfilled'?result.value.items:[]))
   .filter(source=>source.url!==exceptUrl)
  const visited=new Set<string>()
  for(const candidate of candidates){
   if(visited.has(candidate.url))continue
   visited.add(candidate.url)
   if(visited.size>6)break
   try{await verifyNativeSource(candidate,10000);return candidate}catch{/* test other native */}
  }
 }catch{/* failed provider is not available */}
 return null
}

function App(){
 const [route,setRoute]=useState<RouteState>(()=>parseRoute(window.location.pathname,window.location.search))
 const [selected,setSelected]=useState<Anime|null>(null)
 const [playback,setPlayback]=useState<Playback|null>(null)
 const [toast,setToast]=useState('')
 const [mobileNav,setMobileNav]=useState(false)
 const [library,setLibrary]=useState<LibraryEntry[]>([])
 const [progress,setProgress]=useState<ProgressEntry[]>([])
 const [featuredIndex,setFeaturedIndex]=useState(0)
 const season=useCatalog('season')
 const top=useCatalog('top')
 const upcoming=useCatalog('upcoming')
 const searchInputRef=useRef<HTMLInputElement>(null)
 const prepareNext=useCallback(async():Promise<Stream|null>=>{
  if(!playback?.anime||playback.demo)return null
  return resolveHealthyNative(playback.anime.malId,playback.episode+1)
 },[playback])
 const continueNext=useCallback((stream:Stream)=>{
  setPlayback(current=>current?.anime?{...current,episode:current.episode+1,stream,manualSource:false}:current)
 },[])
 const recoverSource=useCallback(async()=>{
  if(!playback?.anime||playback.demo)return false
  const candidate=await resolveHealthyNative(playback.anime.malId,playback.episode,playback.stream.url)
  if(!candidate)return false
  setPlayback(current=>current?{...current,stream:candidate,manualSource:false}:current)
  return true
 },[playback])

 const navigateState=useCallback((next:RouteState,replace=false)=>{
  setRoute(next)
  const path=routeToPath(next)
  if(replace){
   window.history.replaceState(null,'',path)
  }else if(window.location.pathname+window.location.search!==path){
   window.history.pushState(null,'',path)
  }
  setMobileNav(false)
  if(!replace)window.scrollTo({top:0,behavior:'instant'})
 },[])

 useEffect(()=>{
  function onPopState(){
   setRoute(parseRoute(window.location.pathname,window.location.search))
   window.scrollTo({top:0,behavior:'instant'})
  }
  window.addEventListener('popstate',onPopState)
  return()=>window.removeEventListener('popstate',onPopState)
 },[])

 const loadLocal=useCallback(()=>{
  void Promise.all([listLibrary(),listProgress()]).then(([saved,watching])=>{
   setLibrary(saved)
   setProgress(watching)
  }).catch(()=>{})
 },[])

 useEffect(()=>{
  loadLocal()
  window.addEventListener('yoru-data-updated',loadLocal)
  return()=>window.removeEventListener('yoru-data-updated',loadLocal)
 },[loadLocal])

 useEffect(()=>{
  if(!toast)return
  const timer=window.setTimeout(()=>setToast(''),3600)
  return()=>window.clearTimeout(timer)
 },[toast])

 useEffect(()=>{
  function key(event:KeyboardEvent){
   if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
    event.preventDefault()
    if(route.page!=='browse'){
     navigateState({...route,page:'browse'})
    }
    window.setTimeout(()=>searchInputRef.current?.focus(),50)
   }
   if(event.key==='Escape'){
    if(selected){setSelected(null)}
    else if(playback){
     const wasDemo=Boolean(playback.demo)
     setPlayback(null)
     if(wasDemo)window.requestAnimationFrame(()=>{
      document.querySelector<HTMLButtonElement>('[aria-label="Coba pemutar"]')?.focus()
     })
    }
   }
  }
  window.addEventListener('keydown',key)
  return()=>window.removeEventListener('keydown',key)
 },[route,selected,playback,navigateState])

 const featured=top.data.slice(0,10)
 const hero=featured[featuredIndex%Math.max(1,featured.length)]||season.data[0]
 const continueList=useMemo(()=>progress.filter(row=>row.seconds>0&&(!row.duration||row.seconds<row.duration-10)).slice(0,6),[progress])

 async function toggleSave(anime:Anime){
  try{
   const entry=await getAnimeSaved(anime.id)
   if(entry){
    await removeAnime(anime.id)
    setToast('Dihapus dari koleksi')
   }else{
    await saveAnime(anime,'planned')
    setToast('Ditambahkan ke koleksi')
   }
  }catch{
   setToast('Gagal memperbarui koleksi')
  }
 }

 const breadcrumbs=useMemo(()=>getBreadcrumbs(route),[route])
 const closeWatch=()=>{
  const shouldRestoreDemo=Boolean(playback?.demo)
  setPlayback(null)
  window.scrollTo({top:0,behavior:'instant'})
  if(shouldRestoreDemo)window.requestAnimationFrame(()=>{
   document.querySelector<HTMLButtonElement>('[aria-label="Coba pemutar"]')?.focus()
  })
 }
 if(playback)return <Player
  key={`${playback.anime?.id||'demo'}:${playback.episode}:${playback.stream.url}`}
  anime={playback.anime}
  episode={playback.episode}
  stream={playback.stream}
  demo={playback.demo}
  manualSource={playback.manualSource===true}
  onPrepareNext={prepareNext}
  onContinueNext={continueNext}
  onRecoverSource={recoverSource}
  onClose={closeWatch}
 />

 return <div className="app-shell">
  <aside className={`sidebar ${mobileNav?'is-open':''}`}>
   <div className="sidebar-brand">
    <AppLogo/>
    <button type="button" className="close-menu" onClick={()=>setMobileNav(false)} aria-label="Tutup menu navigasi"><X size={20}/></button>
   </div>
   <div className="sidebar-caption">NAVIGASI</div>
   <nav className="main-nav" aria-label="Menu utama">
    {navItems.map(([pageKey,label,Icon])=>{
     const isActive=route.page===pageKey
     const hasActiveChild=(pageKey==='browse'&&route.shortcut==='season')||(pageKey==='library'&&route.shortcut==='continue')
     return <button
      type="button"
      key={pageKey}
      className={`nav-link ${isActive?'active':''} ${hasActiveChild?'has-active-child':''}`}
      onClick={()=>navigateState({page:pageKey,browseKind:pageKey==='browse'?'season':route.browseKind,libraryView:'all',searchQuery:''})}
     >
      <Icon size={19} strokeWidth={1.9}/>
      <span>{label}</span>
      {isActive&&<span className="nav-indicator"/>}
     </button>
    })}
   </nav>

   <div className="sidebar-divider"/>
   <div className="sidebar-caption">AKSES CEPAT</div>
   <div className="side-shortcuts">
    <button
     type="button"
     className={`side-quick ${route.page==='browse'&&route.shortcut==='season'?'active':''}`}
     onClick={()=>navigateState({page:'browse',browseKind:'season',libraryView:'all',searchQuery:'',shortcut:'season'})}
    >
     <Clapperboard size={17}/>
     <span>Anime musim ini</span>
     <ArrowUpRight size={14}/>
    </button>
    <button
     type="button"
     className={`side-quick ${route.page==='library'&&route.libraryView==='continue'?'active':''}`}
     onClick={()=>navigateState({page:'library',browseKind:'season',libraryView:'continue',searchQuery:'',shortcut:'continue'})}
    >
     <Clock3 size={17}/>
     <span>Lanjut menonton</span>
     <ArrowUpRight size={14}/>
    </button>
   </div>

   <div className="sidebar-bottom">
    <div className="sidebar-foot">
     <span>YORU</span>
     <span>ANIME FAVORITMU</span>
    </div>
   </div>
  </aside>

  {mobileNav&&<button type="button" aria-label="Tutup menu navigasi" className="backdrop-nav" onClick={()=>setMobileNav(false)}/>}

  <div className="workspace">
   <header className="topbar">
    <div className="topbar-title">
     <button type="button" aria-label="Buka menu" className="mobile-menu" onClick={()=>setMobileNav(true)}><Menu size={22}/></button>
     <div className="page-breadcrumb">
      {breadcrumbs.map((crumb,idx)=>(
       <span key={crumb} className="crumb-item">
        {idx>0&&<ChevronRight size={13} className="crumb-separator"/>}
        <strong className={idx===breadcrumbs.length-1?'current':''}>{crumb}</strong>
       </span>
      ))}
     </div>
    </div>
    <div className="topbar-actions">
     {route.page!=='browse'&&<button type="button" className="topbar-discover" aria-label="Jelajahi anime" onClick={()=>navigateState({page:'browse',browseKind:route.browseKind,libraryView:'all',searchQuery:route.searchQuery})}><Search size={17}/><span>Jelajahi anime</span><ArrowUpRight size={15}/></button>}
     <button type="button" className="avatar-button" title="Pengaturan aplikasi" aria-label="Buka pengaturan" onClick={()=>navigateState({page:'settings',browseKind:'season',libraryView:'all',searchQuery:''})}>Y</button>
    </div>
   </header>

   <main id="main-content">
    {route.page==='home'&&<>
     <div className="page-intro">
      <div>
       <h1>Beranda</h1>
       <p>Katalog anime musim ini, judul populer, dan riwayat tontonan tersimpan.</p>
      </div>
     </div>

     {hero&&<div className="hero-card" style={hero.cover?{backgroundImage:`linear-gradient(90deg,#0e1014 0%,rgba(14,16,20,.94) 36%,rgba(14,16,20,.7) 64%,rgba(14,16,20,.2) 100%),linear-gradient(0deg,#0e1014 0%,transparent 60%),url("${hero.cover.replaceAll('"','%22')}")`}:undefined}>
      <div className="hero-copy">
       <div className="hero-badge"><span className="pulse"/> 10 ANIME POPULER</div>
       <h2>{hero.title}</h2>
       <div className="hero-meta">
        <span className="hero-rating"><Star size={14} fill="currentColor"/> {scoreDisplay(hero.score)}</span>
        <span>{hero.year||'Anime'}</span>
        <span>{hero.type}</span>
        <span>{hero.episodes?`${hero.episodes} Episode`:'Sedang tayang'}</span>
       </div>
       <p>{description(hero.synopsis).slice(0,210)+(hero.synopsis.length>210?'…':'')}</p>
       <div className="hero-actions">
        <button type="button" className="btn btn-primary" onClick={()=>setSelected(hero)}>
         <Play size={16} fill="currentColor"/> Buka anime
        </button>
        <button type="button" className="btn btn-outline" onClick={()=>void toggleSave(hero)}>
         <Plus size={16}/> Koleksiku
        </button>
       </div>
      </div>
      <div className="hero-corner"><span>POPULARITAS KATALOG</span><ArrowDownRight size={20}/></div>
     </div>}
     {featured.length>1&&<fieldset className="hero-top-ten"><legend className="sr-only">Pilihan 10 anime populer</legend>{featured.map((a,i)=><button key={a.malId} type="button" aria-label={`Pilih anime peringkat ${i+1}: ${a.title}`} aria-pressed={hero?.malId===a.malId} className={hero?.malId===a.malId?"active":""} onClick={()=>setFeaturedIndex(i)}>{i+1}</button>)}</fieldset>}

     {continueList.length>0&&<Section eyebrow="TERAKHIR DITONTON" title="Lanjut menonton">
      <div className="continue-grid">
       {continueList.map(row=><button type="button" key={row.anime.id} className="continue-card" onClick={()=>setSelected(row.anime)}>
        <div className="continue-image">
         <Poster anime={row.anime} aspect="wide"/>
         <span className="continue-play"><Play size={18} fill="currentColor"/></span>
         <div className="progress-track"><div style={{width:`${Math.min(100,row.duration?row.seconds/row.duration*100:10)}%`}}/></div>
        </div>
        <strong>{row.anime.title}</strong>
        <small>Episode {row.episode} · {durationDisplay(row.seconds)} ditonton</small>
       </button>)}
      </div>
     </Section>}

     <Section
      eyebrow="KATALOG JEPANG"
      title="Musim ini"
      action={<button type="button" className="text-link" onClick={()=>navigateState({page:'browse',browseKind:'season',libraryView:'all',searchQuery:'',shortcut:'season'})}>Lihat semua <ArrowRight size={16}/></button>}
     >
      {season.error&&!season.data.length?<Empty icon={WifiOff} title="Katalog belum dapat dimuat" body="Layanan metadata sedang tidak merespons. Silakan coba kembali." action={<button type="button" className="btn btn-outline" onClick={season.retry}><RefreshCw size={15}/> Coba lagi</button>}/>:<div className="card-grid">{season.loading?SKELETON_KEYS.slice(0,6).map(key=><CardSkeleton key={key}/>):season.data.slice(0,6).map(a=><Card key={a.id} anime={a} onOpen={setSelected}/>)}</div>}
     </Section>

     <Section
      eyebrow="BERDASARKAN POPULARITAS KATALOG"
      title="10 anime populer"
      action={<button type="button" className="text-link" onClick={()=>navigateState({page:'browse',browseKind:'top',libraryView:'all',searchQuery:''})}>Lihat semua <ArrowRight size={16}/></button>}
     >
      {top.error&&!top.data.length?<Empty icon={WifiOff} title="Belum dapat memuat anime populer" body="Periksa sambungan internet atau coba muat ulang." action={<button type="button" className="btn btn-outline" onClick={top.retry}><RefreshCw size={15}/> Coba lagi</button>}/>:<div className="card-grid">{top.loading?SKELETON_KEYS.slice(0,6).map(key=><CardSkeleton key={key}/>):top.data.slice(0,10).map((a,i)=><div className="ranked-anime" key={a.id}><span className="ranked-anime-number">{i+1}</span><Card anime={a} onOpen={setSelected}/></div>)}</div>}
     </Section>
     <Section eyebrow="MUSIM SELANJUTNYA" title="Segera tayang"
      action={<button type="button" className="text-link" onClick={()=>navigateState({page:'browse',browseKind:'upcoming',libraryView:'all',searchQuery:''})}>Lihat pratinjau <ArrowRight size={16}/></button>}>
      {upcoming.error&&!upcoming.data.length?<Empty icon={WifiOff} title="Pratinjau belum tersedia" body="Coba lagi untuk melihat judul yang akan datang." action={<button type="button" className="btn btn-outline" onClick={upcoming.retry}>Coba lagi</button>}/>:<div className="card-grid">{upcoming.loading?SKELETON_KEYS.slice(0,4).map(key=><CardSkeleton key={key}/>):upcoming.data.slice(0,4).map(a=><Card key={a.id} anime={a} onOpen={setSelected}/>)}</div>}
     </Section>
    </>}

    {route.page==='browse'&&<Browse
     searchInputRef={searchInputRef}
     kind={route.browseKind}
     query={route.searchQuery}
     onTabChange={kind=>navigateState({page:'browse',browseKind:kind,libraryView:'all',searchQuery:''})}
     onQueryChange={q=>navigateState({page:'browse',browseKind:route.browseKind,libraryView:'all',searchQuery:q},true)}
     onOpen={setSelected}
    />}

    {route.page==='library'&&<LibraryPage
     view={route.libraryView}
     onViewChange={v=>navigateState({page:'library',browseKind:'season',libraryView:v,searchQuery:'',shortcut:v==='continue'?'continue':undefined})}
     library={library}
     progress={progress}
     onOpen={setSelected}
     onBrowse={()=>navigateState({page:'browse',browseKind:'season',libraryView:'all',searchQuery:''})}
     onRemove={removeAnime}
     onStatusChange={saveAnime}
    />}

    {route.page==='settings'&&<SettingsPage
     onDemo={()=>setPlayback({anime:null,episode:0,stream:TEST_STREAM,demo:true})}
     onNotify={setToast}
     onDataChanged={loadLocal}
    />}
   </main>

   <footer className="footer">
    <div className="footer-brand">
     <AppLogo/>
     <span>Jelajahi anime dan lanjutkan tontonanmu</span>
    </div>
    <div className="footer-meta">
     <span>Temukan cerita berikutnya</span>
     <span>Lisensi MIT</span>
     <span>© {new Date().getFullYear()} YORU</span>
    </div>
   </footer>
  </div>

  <nav className="mobile-bottom" aria-label="Navigasi layar sentuh">
   {navItems.map(([pageKey,label,Icon])=><button
    type="button"
    className={route.page===pageKey?'active':''}
    key={pageKey}
    onClick={()=>navigateState({page:pageKey,browseKind:pageKey==='browse'?'season':route.browseKind,libraryView:'all',searchQuery:''})}
   >
    <Icon size={20}/>
    <span>{label}</span>
   </button>)}
  </nav>

  {selected&&<DetailDialog
   anime={selected}
   isSaved={library.some(e=>e.anime.id===selected.id)}
   onClose={()=>setSelected(null)}
   onToggleSave={()=>void toggleSave(selected)}
   onWatch={value=>{setPlayback(value);setSelected(null)}}
  />}

  {toast&&<div role="status" className="toast"><Check size={16}/>{toast}</div>}
 </div>
}

function Browse({
 searchInputRef,
 kind,
 query,
 onTabChange,
 onQueryChange,
 onOpen,
}:{
 searchInputRef:React.Ref<HTMLInputElement>
 kind:'season'|'top'|'upcoming'
 query:string
 onTabChange:(k:'season'|'top'|'upcoming')=>void
 onQueryChange:(q:string)=>void
 onOpen:(anime:Anime)=>void
}){
 const [items,setItems]=useState<Anime[]>([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [next,setNext]=useState(false)
 const [page,setPage]=useState(1)
 const [retry,setRetry]=useState(0)
 const [genre,setGenre]=useState('')
 const [format,setFormat]=useState('')
 const [minimumScore,setMinimumScore]=useState(0)
 const [year,setYear]=useState('')
 const [order,setOrder]=useState('default')
 const value=query.trim()
 const usesServerFilters=Boolean(genre||format||minimumScore||year||order!=='default')

 // biome-ignore lint/correctness/useExhaustiveDependencies: normalized query and kind changes reset page.
 useEffect(()=>{
  setItems([])
  setNext(false)
  setError('')
  setPage(1)
 },[value,kind,genre,format,minimumScore,year,order])

 // biome-ignore lint/correctness/useExhaustiveDependencies: retry value intentionally forces new browse request.
 useEffect(()=>{
  const controller=new AbortController()
  setLoading(true)
  setError('')
  const timer=window.setTimeout(()=>{
   const req=usesServerFilters?browseFiltered({kind,query:value,genre,format,minimumScore,year,order},page,controller.signal):value?search(value,page,controller.signal):catalog(kind,page,controller.signal)
   req.then(response=>{
    if(controller.signal.aborted)return
    setNext(response.hasNext)
    setItems(prev=>{
     if(page===1)return response.items
     const existingIds=new Set(prev.map(p=>p.malId))
     const deduped=response.items.filter(item=>!existingIds.has(item.malId))
     return [...prev,...deduped]
    })
   }).catch(e=>{
    if(!controller.signal.aborted)setError((e as Error).message)
   }).finally(()=>{
    if(!controller.signal.aborted)setLoading(false)
   })
  },value?300:0)

  return()=>{
   controller.abort()
   window.clearTimeout(timer)
  }
 },[kind,value,page,retry,usesServerFilters,genre,format,minimumScore,year,order])

 const uniqueItems=useMemo(()=>{
  const seen=new Set<number>()
  return items.filter(a=>{
   if(seen.has(a.malId))return false
   seen.add(a.malId)
   return true
  })
 },[items])

 const filteredItems=uniqueItems
 const years=Array.from({length:new Date().getFullYear()-1989},(_,index)=>new Date().getFullYear()-index)

 return <div className="page-body">
  <div className="page-intro">
   <div>
    <h1>Jelajahi</h1>
    <p>Cari judul favoritmu, pilih genre, atau urutkan sesuai selera.</p>
   </div>
  </div>

  <div className="browse-controls">
  <div className="browse-toolbar">
   <div className="browse-input">
    <Search size={18}/>
    <input
     aria-label="Cari anime"
     ref={searchInputRef}
     value={query}
     onChange={e=>onQueryChange(e.target.value)}
     placeholder="Cari judul anime..."
    />
    {query&&<button type="button" aria-label="Bersihkan pencarian" onClick={()=>onQueryChange('')}><X size={17}/></button>}
   </div>

  </div>
  <fieldset className="browse-filters"><legend className="sr-only">Saring anime</legend>
   <div className="browse-filter-group">
    <span className="browse-filter-title">Lihat anime</span>
    <fieldset className="category-switch"><legend className="sr-only">Kategori anime</legend>
     {([['season','Musim ini'],['top','Populer'],['upcoming','Akan datang']] as const).map(([id,label])=><button type="button" key={id} className={kind===id?'active':''} aria-pressed={kind===id} onClick={()=>onTabChange(id)}>{label}</button>)}
    </fieldset>
   </div>
   <label>Genre<select aria-label="Genre" value={genre} onChange={e=>setGenre(e.target.value)}><option value="">Semua genre</option>{['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Slice of Life','Sports','Supernatural'].map(g=><option key={g} value={g}>{g}</option>)}</select></label>
   <label>Jenis<select aria-label="Jenis anime" value={format} onChange={e=>setFormat(e.target.value)}><option value="">Semua jenis</option>{['TV','Movie','OVA','ONA','Special','Music'].map(t=><option key={t} value={t}>{t}</option>)}</select></label>
   <label>Skor<select aria-label="Skor minimum" value={minimumScore} onChange={e=>setMinimumScore(Number(e.target.value))}><option value={0}>Semua skor</option><option value={7}>7 ke atas</option><option value={8}>8 ke atas</option><option value={9}>9 ke atas</option></select></label>
   <label>Tahun<select aria-label="Tahun rilis" value={year} onChange={e=>setYear(e.target.value)}><option value="">Semua tahun</option>{years.map(n=><option key={n} value={n}>{n}</option>)}</select></label>
   <label>Urutkan<select aria-label="Urutkan anime" value={order} onChange={e=>setOrder(e.target.value)}><option value="default">Relevansi</option><option value="rating">Skor tertinggi</option><option value="newest">Tahun terbaru</option></select></label>
   {(genre||format||minimumScore||year||order!=='default')&&<button type="button" className="browse-reset" onClick={()=>{setGenre('');setFormat('');setMinimumScore(0);setYear('');setOrder('default')}}>Reset filter</button>}
  </fieldset>
  </div>
  {(genre||format||minimumScore||year||order!=='default')&&<p className="browse-filter-note">Filter aktif · Berlaku untuk seluruh katalog.</p>}

  <div className="browse-results-header">
   <div>
    <h2>{value?`Hasil pencarian: “${value}”`:kind==='season'?'Musim ini':kind==='top'?'Anime terpopuler':'Pratinjau musim berikutnya'}</h2>
   </div>
   <span className="results-label"><SlidersHorizontal size={14}/> {loading?'Memuat...':`${filteredItems.length} judul`}</span>
  </div>
  {error&&uniqueItems.length>0&&<div className="config-error" role="alert">
   Belum bisa memuat lebih banyak anime.
   <button type="button" className="btn btn-outline" onClick={()=>setRetry(n=>n+1)}>Coba lagi</button>
  </div>}

  {error&&uniqueItems.length===0?<Empty
   icon={WifiOff}
   title="Tidak dapat memuat katalog"
   body="Belum bisa menampilkan anime. Periksa koneksi lalu coba lagi."
   action={<button type="button" className="btn btn-outline" onClick={()=>setRetry(n=>n+1)}><RefreshCw size={15}/> Coba lagi</button>}
  />:filteredItems.length===0&&!loading?<Empty
   icon={Search}
   title="Tidak ada judul yang cocok"
   body="Periksa ejaan kata kunci atau pilih kategori penjelajahan yang berbeda."
  />:<div className="card-grid browse-grid">
   {filteredItems.map(a=><Card key={a.id} anime={a} onOpen={onOpen}/>)}
   {loading&&SKELETON_KEYS.slice(0,page===1?12:6).map(key=><CardSkeleton key={key}/>)}
  </div>}

  {next&&!loading&&!error&&<div className="load-more">
   <button type="button" className="btn btn-outline" onClick={()=>setPage(n=>n+1)}>
    Muat lebih banyak <ChevronDown size={16}/>
   </button>
  </div>}
 </div>
}

function LibraryPage({
 view,
 onViewChange,
 library,
 progress,
 onOpen,
 onBrowse,
 onRemove,
 onStatusChange,
}:{
 view:'all'|'continue'
 onViewChange:(v:'all'|'continue')=>void
 library:LibraryEntry[]
 progress:ProgressEntry[]
 onOpen:(a:Anime)=>void
 onBrowse:()=>void
 onRemove:(id:string)=>Promise<void>
 onStatusChange:(anime:Anime,status:LibraryStatus)=>Promise<void>
}){
 const [filter,setFilter]=useState<'all'|LibraryStatus>('all')
 const saved=useMemo(()=>library.filter(row=>filter==='all'||row.status===filter),[library,filter])
 const continueItems=useMemo(()=>progress.filter(row=>row.seconds>0&&(!row.duration||row.seconds<row.duration-10)),[progress])

 const isCompletelyEmpty=library.length===0&&progress.length===0

 return <div className="page-body library-page">
  <div className="page-intro">
   <div>
    <h1>Koleksi</h1>
    <p>Simpan anime favoritmu dan lanjutkan dari episode terakhir.</p>
   </div>
   <div className="library-view-tabs">
    <button type="button" className={view==='all'?'active':''} onClick={()=>onViewChange('all')}>Semua simpanan ({library.length})</button>
    <button type="button" className={view==='continue'?'active':''} onClick={()=>onViewChange('continue')}>Lanjut menonton ({continueItems.length})</button>
   </div>
  </div>

  {continueItems.length>0&&<div className="library-highlight"><div className="library-highlight-copy"><span>LANJUTKAN TONTONAN</span><strong>{continueItems[0].anime.title}</strong><small>Episode {continueItems[0].episode} · {durationDisplay(continueItems[0].seconds)} ditonton</small><button type="button" className="btn btn-primary" onClick={()=>onOpen(continueItems[0].anime)}><Play size={16} fill="currentColor"/> Lanjutkan</button></div><div className="library-highlight-cover"><Poster anime={continueItems[0].anime}/></div></div>}
  {!isCompletelyEmpty&&<div className="library-stats">
   <div><span>TOTAL KOLEKSI</span><strong>{library.length.toString().padStart(2,'0')}</strong><small>Judul tersimpan</small></div>
   <div><span>SEDANG MENONTON</span><strong>{library.filter(l=>l.status==='watching').length.toString().padStart(2,'0')}</strong><small>Anime aktif</small></div>
   <div><span>RIWAYAT MENONTON</span><strong>{progress.length.toString().padStart(2,'0')}</strong><small>Episode tercatat</small></div>
  </div>}

  {view==='continue'&&<Section title="Lanjut menonton">
   {continueItems.length===0?<Empty
    icon={Clock3}
    title="Belum ada tontonan untuk dilanjutkan"
    body="Episode yang kamu putar akan otomatis tercatat di sini agar kamu bisa langsung melanjutkan kapan saja."
    action={<button type="button" className="btn btn-primary" onClick={onBrowse}><Play size={15} fill="currentColor"/> Mulai menonton</button>}
   />:<div className="library-list">
    {continueItems.map(row=><button type="button" key={row.anime.id} className="library-item library-item-main" onClick={()=>onOpen(row.anime)}>
     <Poster anime={row.anime}/>
     <div>
      <strong>{row.anime.title}</strong>
      <span>Episode {row.episode} · {durationDisplay(row.seconds)} ditonton</span>
     </div>
     <ArrowRight size={18}/>
    </button>)}
   </div>}
  </Section>}

  {view==='all'&&<Section title="Daftar koleksi" action={<button type="button" className="text-link" onClick={onBrowse}>Cari anime <ArrowRight size={16}/></button>}>
   {!isCompletelyEmpty&&<div className="filter-tabs">
    {([['all','Semua'],['planned','Ingin ditonton'],['watching','Menonton'],['completed','Selesai']] as const).map(([id,label])=><button
     type="button"
     key={id}
     className={filter===id?'active':''}
     onClick={()=>setFilter(id)}
    >
     {label}
    </button>)}
   </div>}

   {isCompletelyEmpty?<Empty
    icon={Bookmark}
    title="Koleksi masih kosong"
    body="Anime yang kamu simpan akan muncul di sini. Mulai dari judul yang kamu suka."
    action={<button type="button" className="btn btn-primary" onClick={onBrowse}><Compass size={16}/> Jelajahi anime</button>}
   />:saved.length===0?<Empty
    icon={Bookmark}
    title="Tidak ada judul di filter ini"
    body="Belum ada anime dengan status yang dipilih."
   />:<div className="library-list">
    {saved.map(row=><div className="library-item" key={row.anime.id}>
     <button type="button" className="library-item-main" onClick={()=>onOpen(row.anime)}>
      <Poster anime={row.anime}/>
      <div>
       <strong>{row.anime.title}</strong>
       <Meta anime={row.anime}/>
       <span className="library-status">{row.status==='planned'?'Ingin ditonton':row.status==='watching'?'Sedang ditonton':'Selesai'}</span>
      </div>
     </button>
     <select className="library-status-select" aria-label={`Ubah status ${row.anime.title}`} value={row.status} onChange={e=>void onStatusChange(row.anime,e.target.value as LibraryStatus)}>
      <option value="planned">Ingin ditonton</option>
      <option value="watching">Menonton</option>
      <option value="completed">Selesai</option>
     </select>
     <button type="button" className="icon-button" title="Hapus dari koleksi" aria-label={`Hapus ${row.anime.title}`} onClick={()=>void onRemove(row.anime.id)}>
      <Trash2 size={16}/>
     </button>
    </div>)}
   </div>}
  </Section>}
 </div>
}

function DetailDialog({
 anime,
 isSaved,
 onClose,
 onToggleSave,
 onWatch,
}:{
 anime:Anime
 isSaved:boolean
 onClose:()=>void
 onToggleSave:()=>void
 onWatch:(p:Playback)=>void
}){
 const dialogRef=useDialogFocus()
 const pickerRef=useRef<HTMLDivElement>(null)
 const [info,setInfo]=useState<Anime>(anime)
 const [listed,setListed]=useState<Episode[]>([])
 const [available,setAvailable]=useState<Episode[]>([])
 const [loading,setLoading]=useState(true)
 const [playing,setPlaying]=useState('')
 const [error,setError]=useState('')
 const [choices,setChoices]=useState<{episode:number;items:Stream[]}|null>(null)
 useEffect(()=>{
  if(!choices)return
  const frame=requestAnimationFrame(()=>pickerRef.current?.scrollIntoView({block:'nearest',behavior:'auto'}))
  return()=>cancelAnimationFrame(frame)
 },[choices])
 const [more,setMore]=useState(false)
 const [page,setPage]=useState(1)
 const [hasNext,setHasNext]=useState(false)

 useEffect(()=>{
  const controller=new AbortController()
  setLoading(true)
  setError('')
  setPage(1)
  setListed([])
  setAvailable([])
  setChoices(null)
  setInfo(anime)

  void Promise.allSettled([
   detail(anime.malId,controller.signal),
   episodes(anime.malId,1,controller.signal),
   providerEpisodes(anime.malId,controller.signal),
  ]).then(results=>{
   if(controller.signal.aborted)return
   if(results[0].status==='fulfilled')setInfo(results[0].value)
   if(results[1].status==='fulfilled'){
    setListed(results[1].value.items)
    setHasNext(results[1].value.hasNext)
   }
   if(results[2].status==='fulfilled')setAvailable(results[2].value.items)
  }).finally(()=>{
   if(!controller.signal.aborted)setLoading(false)
  })

  return()=>controller.abort()
 },[anime])

 const availableMap=useMemo(()=>{
  const map=new Map<number,Episode[]>()
  for(const entry of available){
   const current=map.get(entry.number)||[]
   current.push(entry)
   map.set(entry.number,current)
  }
  return map
 },[available])

 const displayed=useMemo(()=>{
  const entries=new Map<number,Episode>()
  for(const ep of listed)entries.set(ep.number,ep)
  for(const ep of available)entries.set(ep.number,{...entries.get(ep.number),...ep})
  return[...entries.values()].sort((a,b)=>a.number-b.number)
 },[listed,available])

 async function loadNext(){
  try{
   const r=await episodes(anime.malId,page+1)
   setListed(current=>[...current,...r.items])
   setHasNext(r.hasNext)
   setPage(page+1)
  }catch{
   setError('Tidak dapat mengambil daftar episode berikutnya')
  }
 }

 const embedCandidate=(ep:number):Stream=>({
  providerId:'Video alternatif',
  format:'embed',
  url:`https://www.animeembed.com/embed/mal/${info.malId}/${ep}`,
  subtitleMode:'unknown',tracks:[],
 })
 async function checkAndWatch(stream:Stream,ep:number,manual=false){
  if(stream.format==='embed'){
   // Deliberate selection here is the user consent to leave native playback.
   onWatch({anime:info,episode:ep,stream,manualSource:manual})
   return
  }
  setPlaying(String(ep))
  setError('')
  try{
   await verifyNativeSource(stream)
   onWatch({anime:info,episode:ep,stream,manualSource:manual})
  }catch{
   setError('Video belum bisa diputar. Coba pilihan lain atau ulangi.')
  }finally{setPlaying('')}
 }
 async function play(ep:Episode){
  const sources=(availableMap.get(ep.number)||[]).filter(source=>source.providerId!=='public-embed')
  setPlaying(String(ep))
  setError('')
  try{
   if(!sources.length){
    setChoices({episode:ep.number,items:[embedCandidate(ep.number)]})
    return
   }
   const results=await Promise.allSettled(sources.map(source=>streams(source.id)))
   const items=results.flatMap(result=>result.status==='fulfilled'?result.value.items:[])
   const native=rankNativeStreams(items)
   if(!native.length){
    setChoices({episode:ep.number,items:[embedCandidate(ep.number)]})
    return
   }
   if(native.length===1){
    await checkAndWatch(native[0],ep.number)
   }else{
    setChoices({episode:ep.number,items:native})
   }
  }catch{
   setError('Belum bisa menyiapkan video. Coba lagi.')
  }finally{setPlaying('')}
 }

 return <div className="modal-backdrop">
  <div ref={dialogRef} tabIndex={-1} className="detail-modal" role="dialog" aria-modal="true" aria-label={`Detail ${info.title}`}>
   <button type="button" className="modal-close icon-button glass" onClick={onClose} aria-label="Tutup detail anime"><X size={20}/></button>
   <div className="detail-cover" style={{backgroundImage:info.cover?`linear-gradient(0deg,#13161d,rgba(19,22,29,.6) 40%,rgba(19,22,29,.15)),url("${info.cover.replaceAll('"','%22')}")`:undefined}}/>
   <div className="detail-main">
    <div className="detail-poster"><Poster anime={info}/></div>
    <div className="detail-info">
     <MiniLabel>DETAIL ANIME</MiniLabel>
     <h2>{info.title}</h2>
     {info.japaneseTitle&&<p className="detail-japanese">{info.japaneseTitle}</p>}
     <div className="detail-facts">
      <span className="hero-rating" title="Skor komunitas"><Star size={14} fill="currentColor"/> {scoreDisplay(info.score)} / 10</span>
      <span>{yearLabel(info.year)}</span>
      <span>{info.type}</span>
      <span>{info.status}</span>
       {info.rating&&<span>{info.rating}</span>}
     </div>
     <div className="genre-tags">{info.genres.map(g=><span key={g}>{g}</span>)}</div>
     <p className={`detail-synopsis ${more?'expanded':''}`}>{info.synopsis||'Sinopsis belum tersedia dari metadata.'}</p>
     {info.synopsis.length>280&&<button type="button" className="read-more" onClick={()=>setMore(v=>!v)}>{more?'Sembunyikan':'Baca selengkapnya'} <ChevronDown size={14}/></button>}
     <div className="detail-actions">
      <button type="button" className="btn btn-primary" onClick={()=>void play(displayed[0]||{id:`mal:${info.malId}:1`,animeId:info.id,number:1,title:'Episode 1'})}>
       <Play size={16} fill="currentColor"/> Periksa sumber episode
      </button>
      <button type="button" className="btn btn-outline" onClick={onToggleSave}>
       {isSaved?<Check size={16}/>:<Plus size={16}/>} {isSaved?'Tersimpan':'Koleksiku'}
      </button>
     </div>
    </div>
   </div>

   <div className="detail-episodes">
    <div className="section-heading">
     <div>
      <h2>Daftar episode</h2>
     </div>
     <span className="episode-count">
      {available.filter(e=>e.providerId!=='public-embed').length>0?'Video tersedia':'Belum menemukan video yang bisa diputar'}
     </span>
    </div>
    {error&&<p className="detail-error"><AlertTriangle size={15}/>{error}</p>}

    {choices&&<div className="source-picker" ref={pickerRef}>
     <div className="source-title">
      <strong>Pilih video · Episode {choices.episode}</strong>
      <button type="button" className="icon-button" onClick={()=>setChoices(null)} aria-label="Tutup pilihan sumber"><X size={15}/></button>
     </div>
     <div className="source-options">
      {choices.items.map((stream,i)=><button type="button" key={stream.id||i} disabled={!!playing} onClick={()=>void checkAndWatch(stream,choices.episode,true)}>
       <MonitorPlay size={17}/>
       <span>
        <strong>{stream.format==='embed'?'Coba video alternatif':stream.quality||'Video langsung'} · {stream.subtitleMode==='hard'?'Subtitle menyatu':stream.tracks.some(t=>t.lang==='id')?'Subtitle Indonesia':'Bahasa subtitle belum diketahui'}</strong>
        <small>{stream.format==='embed'?'Pengaturan dan pilihan subtitle mungkin berbeda':'Video akan diperiksa sebelum diputar'}</small>
       </span>
       <Play size={16}/>
      </button>)}
     </div>
    </div>}

    {loading?<div className="detail-loading"><LoaderCircle className="spin" size={18}/> Memuat episode…</div>:displayed.length?<div className="episode-list">
     {displayed.map(ep=>{
      const streamReady=availableMap.get(ep.number)?.some(e=>e.providerId!=='public-embed')??false
      return <button type="button" key={ep.number} className={`episode-row ${streamReady?'available':''}`} onClick={()=>void play(ep)} disabled={!!playing}>
       <span className="episode-number">{String(ep.number).padStart(2,'0')}</span>
       <div>
        <strong>{ep.title}</strong>
        <small>{streamReady?'Ketuk untuk memilih video':'Cek pilihan video'}</small>
       </div>
       <span className="episode-action">{playing===String(ep.number)?<LoaderCircle size={16} className="spin"/>:<MonitorPlay size={15}/>}</span>
      </button>
     })}
    </div>:<Empty icon={Film} title="Episode belum tersedia" body="Daftar episode belum ditemukan dalam metadata."/>}

    {hasNext&&<button type="button" className="load-episodes" onClick={()=>void loadNext()}>Muat episode berikutnya <ChevronDown size={15}/></button>}
   </div>
  </div>
 </div>
}

function SettingsPage({
 onDemo,
 onNotify,
 onDataChanged,
}:{
 onDemo:()=>void
 onNotify:(value:string)=>void
 onDataChanged:()=>void
}){
 const [providerList,setProviderList]=useState<{id:string;name:string;animeCount:number|null}[]>([])
 const [providerError,setProviderError]=useState('')
 const [apiOnline,setApiOnline]=useState(false)
 const [importing,setImporting]=useState(false)
 const [defaultSubtitle,setDefaultSubtitle]=useState<'auto'|'id'|'en'|'off'>('id')
 const [autoNext,setAutoNext]=useState(true)
 const [defaultSpeed,setDefaultSpeed]=useState(1)
 const inputRef=useRef<HTMLInputElement>(null)
 useEffect(()=>{
  let active=true
  void Promise.all([getPreference('auto-next','on'),getPreference('playback-speed','1')]).then(([next,rate])=>{if(!active)return;setAutoNext(next!=='off');const n=Number(rate);if([0.5,0.75,1,1.25,1.5,2].includes(n))setDefaultSpeed(n)}).catch(()=>{})
  void getPreference('subtitle-default-language','id').then(value=>{
   if(active&&['auto','id','en','off'].includes(value))setDefaultSubtitle(value as 'auto'|'id'|'en'|'off')
  }).catch(()=>{})
  return()=>{active=false}
 },[])

 const refresh=useCallback(()=>{
  void Promise.allSettled([providers(),api<{status:string}>('/api/health')]).then(results=>{
   if(results[0].status==='fulfilled'){
    setProviderList(results[0].value.providers)
    setProviderError(results[0].value.warnings?.length?'Beberapa sumber sedang tidak tersedia. Coba lagi nanti.':'')
   }else{
    setProviderError('Belum bisa memeriksa sumber video.')
   }
   setApiOnline(results[1].status==='fulfilled')
  })
 },[])

 useEffect(()=>refresh(),[refresh])

 async function exportData(){
  try{
   const json=await exportUserData()
   const blob=new Blob([JSON.stringify(json,null,2)],{type:'application/json'})
   const url=URL.createObjectURL(blob)
   const anchor=document.createElement('a')
   anchor.href=url
   anchor.download='yoru-backup.json'
   anchor.click()
   URL.revokeObjectURL(url)
   onNotify('Cadangan data berhasil diekspor')
  }catch{
   onNotify('Gagal mengekspor data cadangan')
  }
 }

 async function importData(file:File|null){
  if(!file)return
  setImporting(true)
  try{
   if(file.size>5_000_000)throw new Error('Ukuran file cadangan melebihi 5 MB')
   const json=JSON.parse(await file.text())
   await importUserData(json)
   onDataChanged()
   onNotify('Data berhasil dipulihkan dari cadangan')
  }catch(e){
   onNotify((e as Error).message)
  }finally{
   setImporting(false)
  }
 }

 async function reset(){
  if(!window.confirm('Hapus seluruh koleksi dan riwayat tontonan yang tersimpan di browser ini? Tindakan ini tidak dapat dibatalkan.'))return
  try{
   await clearUserData()
   onDataChanged()
   onNotify('Data lokal berhasil dibersihkan')
  }catch{
   onNotify('Gagal membersihkan data lokal')
  }
 }

 return <div className="page-body settings-page">
  <div className="page-intro">
   <div>
    <h1>Pengaturan</h1>
    <p>Atur cara menonton, subtitle, dan koleksi dalam satu tempat.</p>
   </div>
  </div>

  <nav className="settings-nav" aria-label="Bagian pengaturan">
   <a href="#pengaturan-pemutaran">Pemutaran</a>
   <a href="#pengaturan-sumber">Sumber video</a>
   <a href="#pengaturan-akun">Akun & perangkat</a>
   <a href="#pengaturan-data">Data & privasi</a>
   <a href="#pengaturan-tentang">Tentang</a>
  </nav>
  <div className="settings-layout">
   <div className="settings-section">
    <div id="pengaturan-pemutaran" className="settings-heading">
     <div className="settings-heading-icon"><MonitorPlay size={20}/></div>
     <div>
      <h2>Pemutaran</h2>
      <p>Preferensi untuk seluruh episode.</p>
     </div>
    </div>
    <div className="settings-box">
     <div className="setting-row">
      <div>
       <strong>Pratinjau pemutar</strong>
       <small>Coba kontrol, kualitas, dan pengaturan subtitle sebelum menonton.</small>
      </div>
      <button type="button" className="btn btn-primary" onClick={onDemo} aria-label="Coba pemutar">
       <Play size={15} fill="currentColor"/> Coba pemutar
      </button>
     </div>
     <div className="setting-row"><div><strong>Lanjut ke episode berikutnya</strong><small>Hitung mundur 8 detik setelah video selesai.</small></div><select aria-label="Lanjut otomatis ke episode berikutnya" value={autoNext?'on':'off'} onChange={e=>{const next=e.target.value==='on';setAutoNext(next);void setPreference('auto-next',next?'on':'off').catch(()=>onNotify('Pilihan belum tersimpan'))}}><option value="on">Aktif</option><option value="off">Nonaktif</option></select></div>
     <div className="setting-row"><div><strong>Kecepatan bawaan</strong><small>Berlaku saat memutar episode baru.</small></div><select aria-label="Kecepatan bawaan" value={defaultSpeed} onChange={e=>{const next=Number(e.target.value);setDefaultSpeed(next);void setPreference('playback-speed',String(next)).catch(()=>onNotify('Pilihan belum tersimpan'))}}>{[0.5,0.75,1,1.25,1.5,2].map(n=><option key={n} value={n}>{n}×</option>)}</select></div>
     <div className="setting-row">
      <div><strong>Bahasa subtitle</strong><small>Indonesia diutamakan; English jika belum tersedia. Bisa diganti saat menonton.</small></div>
      <select aria-label="Bahasa subtitle utama" value={defaultSubtitle} onChange={event=>{
       const next=event.target.value as 'auto'|'id'|'en'|'off'
       setDefaultSubtitle(next)
       void setPreference('subtitle-default-language',next).catch(()=>onNotify('Gagal menyimpan pilihan subtitle'))
      }}>
       <option value="id">Bahasa Indonesia</option><option value="en">English</option><option value="auto">Indonesia, lalu English</option><option value="off">Tidak ada subtitle</option>
      </select>
     </div>
    </div>

    <div id="pengaturan-sumber" className="settings-heading">
     <div className="settings-heading-icon"><Layers3 size={20}/></div>
     <div>
      <h2>Sumber tontonan</h2>
      <p>Pilih video terbaik yang tersedia untuk setiap episode.</p>
     </div>
    </div>
    <div className="settings-box">
     <div className="setting-row">
      <div>
       <strong>Status katalog</strong>
       <small>Mendukung pencarian judul dan informasi episode</small>
      </div>
      <span className={`setting-state ${apiOnline?'good':'bad'}`}>
       <span/>{apiOnline?'Terhubung':'Tidak terhubung'}
      </span>
     </div>
     <div className="setting-row">
      <div>
       <strong>Sumber tersedia</strong>
       <small>{providerList.length?providerList.map(p=>`${p.id==='public-embed'?'Video alternatif':p.id==='miruro'?'Pilihan langsung':p.id.startsWith('stremio-')?'Add-on video':'Sumber pribadi'}${p.animeCount===null?'':` · ${p.animeCount} judul`}`).join(', '):'Belum ada sumber video tambahan'}</small>
      </div>
      <button type="button" className="icon-button" aria-label="Perbarui daftar sumber video" onClick={refresh}><RefreshCw size={17}/></button>
     </div>
     {providerError&&<p className="config-error">{providerError}</p>}
    </div>
   </div>

   <div className="settings-section">
    <div id="pengaturan-akun" className="settings-heading">
     <div className="settings-heading-icon"><Bookmark size={20}/></div>
     <div><h2>Akun & perangkat</h2><p>Akun dapat ditambahkan tanpa mengubah koleksi saat ini.</p></div>
    </div>
    <div className="settings-box">
     <div className="setting-row"><div><strong>Tanpa akun</strong><small>Koleksi tetap tersimpan di browser ini.</small></div><span className="setting-state good"><span/>Aktif</span></div>
     <div className="settings-note"><Info size={16}/><p>Login dan sinkronisasi belum tersedia. Gunakan cadangan untuk memindahkan koleksi.</p></div>
    </div>
    <div id="pengaturan-data" className="settings-heading">
     <div className="settings-heading-icon"><Bookmark size={20}/></div>
     <div>
      <h2>Data & privasi</h2>
      <p>Pindahkan atau hapus data yang tersimpan di browser.</p>
     </div>
    </div>
    <div className="settings-box">
     <div className="setting-row">
      <div>
       <strong>Unduh cadangan</strong>
       <small>Simpan koleksi, progress, dan preferensi sebagai file.</small>
      </div>
      <button type="button" className="setting-action" onClick={()=>void exportData()}><Download size={16}/> Ekspor</button>
     </div>
     <div className="setting-row">
      <div>
       <strong>Pulihkan cadangan</strong>
       <small>Pulihkan koleksi dan preferensi dari file Yoru.</small>
      </div>
      <button type="button" className="setting-action" onClick={()=>inputRef.current?.click()} disabled={importing}><Upload size={16}/> {importing?'Memulihkan...':'Impor'}</button>
      <input type="file" accept="application/json,.json" className="visually-hidden" ref={inputRef} onChange={e=>{void importData(e.target.files?.[0]||null);e.target.value=''}}/>
     </div>
     <div className="setting-row">
      <div>
       <strong>Hapus data lokal</strong>
       <small>Menghapus koleksi, riwayat, dan semua preferensi tersimpan.</small>
      </div>
      <button type="button" className="setting-action danger" onClick={()=>void reset()}><Trash2 size={16}/> Hapus</button>
     </div>
    </div>

    <div id="pengaturan-tentang" className="settings-heading">
     <div className="settings-heading-icon"><Heart size={20}/></div>
     <div>
      <h2>Tentang Yoru</h2>
      <p>Versi aplikasi dan informasi proyek.</p>
     </div>
    </div>
    <div className="settings-box about-box">
     <div className="about-mark"><AppLogo/></div>
     <p>Yoru menyatukan penjelajahan anime, koleksi pribadi, dan pemutaran video.</p>
     <div className="about-meta"><span>Versi</span><strong>v1.0.0-rc.2 (Web PWA)</strong></div>
     <div className="about-meta"><span>Katalog</span><strong>Anime Jepang</strong></div>
     <div className="about-meta"><span>Lisensi</span><strong>MIT License</strong></div>
    </div>
   </div>
  </div>
 </div>
}

export default App

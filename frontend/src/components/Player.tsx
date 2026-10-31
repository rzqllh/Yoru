import {useEffect,useMemo,useRef,useState,type ChangeEvent,type CSSProperties} from 'react'
import type Hls from 'hls.js'
import {AlertTriangle,ArrowLeft,Info,Maximize2,MonitorPlay,PictureInPicture2,SkipBack,SkipForward,Subtitles,Play,Pause,Volume2,VolumeX,Upload,SlidersHorizontal} from 'lucide-react'
import type {Anime,Stream} from '../types'
import {getPreference,getProgress,saveProgress,setPreference} from '../lib/db'
import {applySubtitleOffset,type CueBaseline} from '../lib/subtitle-offset'
import {parseLocalSubtitle} from '../lib/local-subtitles'
import {captionClasses,normalizeCaptionSettings,type CaptionPosition} from '../lib/caption-appearance'
import {getAvailableQualityLevels} from '../lib/quality-options'
import {connectAnimeEmbed,extractValidPlaybackProgress} from '../lib/animeembed'

const clock=(seconds:number)=>{const safe=Math.max(0,Math.floor(Number.isFinite(seconds)?seconds:0));const hrs=Math.floor(safe/3600);return `${hrs>0?`${hrs}:`:''}${String(Math.floor(safe/60)%60).padStart(2,'0')}:${String(safe%60).padStart(2,'0')}`}
type SubtitleResult={id:string;provider:string;language:'id'|'en';label:string;release:string;episode:number;score:number;sourceUrl?:string}
type Props={anime:Anime|null;episode:number;stream:Stream;demo?:boolean;manualSource?:boolean;onPrepareNext?:()=>Promise<Stream|null>;onContinueNext?:(stream:Stream)=>void;onRecoverSource?:()=>Promise<boolean>;onClose:()=>void}
export default function Player({anime,episode,stream,demo=false,manualSource=false,onPrepareNext,onContinueNext,onRecoverSource,onClose}:Props){
 const video=useRef<HTMLVideoElement>(null)
 const iframeRef=useRef<HTMLIFrameElement>(null)
 const hlsRef=useRef<Hls|null>(null)
 const cueBaselines=useRef(new WeakMap<object,CueBaseline>())
 const [speed,setSpeed]=useState(1)
 const [autoNext,setAutoNext]=useState(true)
 useEffect(()=>{void Promise.all([getPreference('playback-speed','1'),getPreference('auto-next','on')]).then(([rate,next])=>{const n=Number(rate);if([0.5,0.75,1,1.25,1.5,2].includes(n))setSpeed(n);setAutoNext(next!=='off')}).catch(()=>{})},[])
 const [isPaused,setIsPaused]=useState(true)
 const [position,setPosition]=useState(0)
 const [duration,setDuration]=useState(0)
 const [volume,setVolume]=useState(1)
 const [isMuted,setIsMuted]=useState(false)
 const [uploadedName,setUploadedName]=useState('')
 const [qualityLevels,setQualityLevels]=useState<{index:number;height:number}[]>([])
 const [qualityIndex,setQualityIndex]=useState<number|null>(null)
 const [qualityNote,setQualityNote]=useState('')
 const [subtitleChoices,setSubtitleChoices]=useState<SubtitleResult[]>([])
 const [subtitleState,setSubtitleState]=useState('')
 const [subtitleSearch,setSubtitleSearch]=useState(false)
 const [subtitlePanel,setSubtitlePanel]=useState(false)
 const [advancedControls,setAdvancedControls]=useState(false)
 const [selectedSubtitle,setSelectedSubtitle]=useState<{id:string;lang:string;url:string}|null>(null)
 const [subtitleOff,setSubtitleOff]=useState(false)
 const [subtitleManual,setSubtitleManual]=useState(false)
 const [englishOfferDismissedFor,setEnglishOfferDismissedFor]=useState('')
 const subtitleOfferKey=`${anime?.id??'demo'}:${episode}`
 const englishOfferDismissed=englishOfferDismissedFor===subtitleOfferKey
 const [subtitlePreference,setSubtitlePreference]=useState<'auto'|'id'|'en'|'off'>('auto')
 const [subtitlePreferenceReady,setSubtitlePreferenceReady]=useState(false)
 const [captionFont,setCaptionFont]=useState<'sans'|'serif'>('sans')
 const [captionSize,setCaptionSize]=useState(100)
 const [captionBackdrop,setCaptionBackdrop]=useState<'dark'|'clear'>('dark')
 const [captionScope,setCaptionScope]=useState<'global'|'anime'>('anime')
 const [captionTextOpacity,setCaptionTextOpacity]=useState<50|75|100>(100)
 const [captionBackgroundOpacity,setCaptionBackgroundOpacity]=useState<0|25|50|75|100>(75)
 const [captionOutline,setCaptionOutline]=useState<0|1|2>(1)
 const [captionPosition,setCaptionPosition]=useState<CaptionPosition>('original')
 const [captionPositionSupported,setCaptionPositionSupported]=useState(false)
 const captionLines=useRef(new WeakMap<VTTCue,number|'auto'>())

 const subtitleUrlRef=useRef<string|null>(null)
 const [subtitleOffset,setSubtitleOffset]=useState(0)
 const [pipSupported,setPipSupported]=useState(false)
 const [hasActiveCaptions,setHasActiveCaptions]=useState(false)
 const [displayNotice,setDisplayNotice]=useState('')
 const [error,setError]=useState('')
 const [recovering,setRecovering]=useState(false)
 const [recoverMessage,setRecoverMessage]=useState('')
 const recoveryAttempted=useRef(false)
 const [nextStream,setNextStream]=useState<Stream|null>(null)
 const [nextCountdown,setNextCountdown]=useState<number|null>(null)
 const [nextMessage,setNextMessage]=useState('')
 const [ready,setReady]=useState(false)
 const [resumeAt,setResumeAt]=useState(0)
 const lastSave=useRef(0)
 const watchRef=useRef<HTMLElement>(null)
 useEffect(()=>{watchRef.current?.querySelector<HTMLButtonElement>('[aria-label="Kembali"]')?.focus()},[])

 useEffect(()=>{
  let alive=true
  setSubtitleOffset(0)
  if(anime&&!demo){
   void getPreference(`subtitle-offset:${anime.id}`,'0').then(value=>{
    const n=Number(value)
    if(alive&&Number.isFinite(n)&&n>=-30&&n<=30)setSubtitleOffset(n)
   }).catch(()=>{})
  }
  return()=>{alive=false}
 },[anime,demo])

 useEffect(()=>{
  const v=video.current
  if(!v||stream.format==='embed')return
  v.playbackRate=speed
 },[speed,stream.format])

 useEffect(()=>{
  const v=video.current
  if(!v||stream.format==='embed')return
  const apply=()=>applySubtitleOffset(v.textTracks,subtitleOffset,cueBaselines.current)
  const nodes=Array.from(v.querySelectorAll('track'))
  for(const track of nodes)track.addEventListener('load',apply)
  apply()
  return()=>{for(const track of nodes)track.removeEventListener('load',apply)}
 },[stream.format,subtitleOffset])

 useEffect(()=>{
  let active=true
  const animeKey=anime&&!demo?'subtitle-style:'+anime.id:null
  void Promise.all([
   getPreference('subtitle-style:global',''),
   animeKey?getPreference(animeKey,''):Promise.resolve('')
  ]).then(([globalValue,animeValue])=>{
   if(!active)return
   const saved=animeValue||globalValue
   setCaptionScope(animeValue?'anime':'global')
   if(!saved)return
   try{
    const obj=normalizeCaptionSettings(JSON.parse(saved))
    setCaptionFont(obj.font)
    setCaptionSize(obj.size)
    setCaptionBackdrop(obj.backdrop)
    setCaptionTextOpacity(obj.textOpacity)
    setCaptionBackgroundOpacity(obj.backgroundOpacity)
    setCaptionOutline(obj.outline)
    setCaptionPosition(obj.position)
   }catch{/* invalid preference falls back to safe defaults */}
  }).catch(()=>{})
  return()=>{active=false}
 },[anime,demo])

 function saveCaptionStyle(
  font:'sans'|'serif',size:number,backdrop:'dark'|'clear',scope:'global'|'anime',
  extras:Partial<{textOpacity:50|75|100;backgroundOpacity:0|25|50|75|100;outline:0|1|2;position:CaptionPosition}>={}
 ){
  const normalized=normalizeCaptionSettings({font,size,backdrop,
   textOpacity:extras.textOpacity??captionTextOpacity,
   backgroundOpacity:extras.backgroundOpacity??captionBackgroundOpacity,
   outline:extras.outline??captionOutline,
   position:extras.position??captionPosition})
  setCaptionFont(normalized.font)
  setCaptionSize(normalized.size)
  setCaptionBackdrop(normalized.backdrop)
  setCaptionScope(scope)
  setCaptionTextOpacity(normalized.textOpacity)
  setCaptionBackgroundOpacity(normalized.backgroundOpacity)
  setCaptionOutline(normalized.outline)
  setCaptionPosition(normalized.position)
  const key=scope==='anime'&&anime&&!demo?'subtitle-style:'+anime.id:'subtitle-style:global'
  void setPreference(key,JSON.stringify(normalized)).catch(()=>{})
 }

 useEffect(()=>{
  if(stream.format==='embed')return
  const v=video.current
  if(!v)return
  const supported=typeof VTTCue!=='undefined'
  setCaptionPositionSupported(supported)
  if(!supported)return
  const apply=()=>{
   for(let i=0;i<v.textTracks.length;i++){
    const cues=v.textTracks[i].cues
    if(!cues)continue
    for(let n=0;n<cues.length;n++){
     const cue=cues[n]
     if(!(cue instanceof VTTCue))continue
     if(!captionLines.current.has(cue))captionLines.current.set(cue,cue.line)
     try{
      cue.line=captionPosition==='original'?captionLines.current.get(cue)??'auto':
       captionPosition==='top'?0:-1
     }catch{/* native cue renderer may reject placement */}
    }
   }
  }
  const load=()=>apply()
  for(const track of Array.from(v.querySelectorAll('track')))track.addEventListener('load',load)
  v.textTracks.addEventListener('addtrack',load)
  apply()
  return()=>{
   for(const track of Array.from(v.querySelectorAll('track')))track.removeEventListener('load',load)
   v.textTracks.removeEventListener('addtrack',load)
  }
 },[stream.format,captionPosition])


 useEffect(()=>{
  let alive=true
  setSubtitlePreferenceReady(false)
  if(!anime||demo){
   setSubtitlePreference('auto')
   setSubtitlePreferenceReady(true)
   return()=>{alive=false}
  }
  void Promise.all([getPreference(`subtitle-language:${anime.id}`,''),getPreference('subtitle-default-language','id')]).then(([specific,global])=>{
   if(!alive)return
   const value=specific||global
   const saved=value==='off'||value==='id'||value==='en'?value:'auto'
   setSubtitlePreference(saved)
   setSubtitleOff(saved==='off')
   setSubtitleManual(saved==='off')
  }).catch(()=>{
   if(alive)setSubtitlePreference('auto')
  }).finally(()=>{
   if(alive)setSubtitlePreferenceReady(true)
  })
  return()=>{alive=false}
 },[anime,demo])

 useEffect(()=>{
  if(demo||!anime||stream.format==='embed')return
  const controller=new AbortController()
  let alive=true
  setSubtitleChoices([])
  setSubtitleState('')
  setSubtitleSearch(true)
  setSelectedSubtitle(null)
  void fetch(`/api/anime/${anime.malId}/subtitles?episode=${episode}`,{signal:controller.signal})
   .then(async response=>{
    if(!response.ok)throw new Error('SUBTITLE_SEARCH_UNAVAILABLE')
    return response.json() as Promise<{items?:SubtitleResult[];warnings?:string[]}>
   }).then(data=>{
    if(!alive)return
    const choices=(data.items||[]).filter(item=>item.episode===episode&&
     (item.language==='id'||item.language==='en')&&
     typeof item.sourceUrl==='string'&&item.sourceUrl.startsWith('/api/subtitles/file?')&&item.score>=70)
    choices.sort((a,b)=>(a.language==='id'?0:1)-(b.language==='id'?0:1)||(a.provider==='stremio'?0:1)-(b.provider==='stremio'?0:1)||b.score-a.score)
    setSubtitleChoices(choices)
    if(!choices.length)setSubtitleState((data.warnings||[]).length?'Subtitle belum tersedia dari layanan saat ini. Coba file dari perangkat.':'Belum menemukan subtitle untuk episode ini.')
   }).catch(()=>{
    if(alive)setSubtitleState('Layanan pencarian subtitle tidak tersedia.')
   }).finally(()=>{if(alive)setSubtitleSearch(false)})
  return()=>{alive=false;controller.abort()}
 },[anime,episode,stream.format,demo])

 useEffect(()=>()=>{
  if(subtitleUrlRef.current)URL.revokeObjectURL(subtitleUrlRef.current)
 },[])

 async function activateSubtitle(item:SubtitleResult,manual:boolean){
  if(!item.sourceUrl)return false
  setSubtitleState('Menyiapkan subtitle…')
  try{
   const response=await fetch(item.sourceUrl)
   if(!response.ok)throw new Error('Gagal mengunduh subtitle')
   const body=await response.text()
   if(body.length>500000||!body.trimStart().startsWith('WEBVTT'))throw new Error('Format subtitle belum didukung')
   const url=URL.createObjectURL(new Blob([body],{type:'text/vtt'}))
   if(subtitleUrlRef.current)URL.revokeObjectURL(subtitleUrlRef.current)
   subtitleUrlRef.current=url
   setSelectedSubtitle({id:item.id,lang:item.language,url})
   setSubtitleOff(false)
   setSubtitleManual(manual)
   setSubtitleState(`Subtitle ${item.label} siap`)
   if(manual&&anime&&!demo){
    setSubtitlePreference(item.language)
    void setPreference(`subtitle-language:${anime.id}`,item.language).catch(()=>{})
   }
   return true
  }catch{
   setSubtitleState('Subtitle '+item.label+' belum bisa dimuat. Pilih yang lain.')
   return false
  }
 }
 function chooseNativeSubtitle(language:'id'|'en'){
  setSubtitleManual(true)
  setSubtitleOff(false)
  setSelectedSubtitle(null)
  setSubtitlePreference(language)
  setSubtitleState(`Subtitle ${language==='id'?'Indonesia':'English'} dipilih`)
  if(anime&&!demo)void setPreference(`subtitle-language:${anime.id}`,language).catch(()=>{})
 }
 async function importSubtitle(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0]
  event.target.value=''
  if(!file)return
  try{
   if(file.size>500000)throw new Error('SUBTITLE_TOO_LARGE')
   const body=parseLocalSubtitle(await file.text(),file.name,file.size)
   const url=URL.createObjectURL(new Blob([body],{type:'text/vtt'}))
   if(subtitleUrlRef.current)URL.revokeObjectURL(subtitleUrlRef.current)
   subtitleUrlRef.current=url
   setSelectedSubtitle({id:`local:${file.name}`,lang:'und',url})
   setUploadedName(file.name)
   setSubtitleOff(false)
   setSubtitleManual(true)
   setSubtitleState('Subtitle pribadi siap digunakan')
  }catch{
   setSubtitleState('File subtitle belum bisa dibaca. Gunakan SRT atau VTT maksimal 500 KB.')
  }
 }
 function togglePlayback(){
  const v=video.current
  if(!v)return
  if(v.paused)void v.play().catch(()=>setDisplayNotice('Video belum bisa dimulai. Coba lagi.'))
  else v.pause()
 }
 function seekTo(seconds:number){
  const v=video.current
  if(!v||!Number.isFinite(seconds))return
  v.currentTime=Math.max(0,Math.min(Number.isFinite(v.duration)?v.duration:seconds,seconds))
  setPosition(v.currentTime)
 }
 function setSound(value:number){
  const v=video.current
  if(!v)return
  const next=Math.max(0,Math.min(1,value))
  v.volume=next
  v.muted=next===0
  setVolume(next)
  setIsMuted(v.muted)
 }
 function disableSubtitle(){
  setSubtitlePreference('off')
  if(anime&&!demo)void setPreference(`subtitle-language:${anime.id}`,'off').catch(()=>{})
  setSubtitleManual(true)
  setSubtitleOff(true)
  setSelectedSubtitle(null)
  setSubtitleState('Subtitle dimatikan atas pilihan pengguna.')
  const tracks=video.current?.textTracks
  if(tracks)for(let i=0;i<tracks.length;i++)tracks[i].mode='disabled'
 }
 useEffect(()=>{
  if(!subtitlePreferenceReady||subtitlePreference==='off'||subtitleManual||subtitleOff||selectedSubtitle||subtitleSearch||!subtitleChoices.length)return
  let alive=true
  void (async()=>{
   // Only an explicit saved English preference permits English auto-selection.
   const candidates=subtitleChoices.filter(item=>item.language===(subtitlePreference==='en'?'en':'id'))
   for(const item of candidates){
    if(!alive)return
    if(!item.sourceUrl)continue
    const response=await fetch(item.sourceUrl).catch(()=>null)
    if(!response?.ok)continue
    const text=await response.text().catch(()=>null)
    if(!text||text.length>500000||!text.trimStart().startsWith('WEBVTT'))continue
    if(!alive)return
    const url=URL.createObjectURL(new Blob([text],{type:'text/vtt'}))
    if(subtitleUrlRef.current)URL.revokeObjectURL(subtitleUrlRef.current)
    subtitleUrlRef.current=url
    setSelectedSubtitle({id:item.id,lang:item.language,url})
    setSubtitleState(`Subtitle ${item.label} dipilih otomatis`)
    return
   }
   if(alive)setSubtitleState(subtitleChoices.some(item=>item.language==='en')?'Sub Indo belum tersedia. English hanya digunakan setelah dipilih.':'Sub Indo belum tersedia untuk episode ini.')
  })()
  return()=>{alive=false}
 },[subtitleChoices,subtitleManual,subtitleOff,selectedSubtitle,subtitleSearch,subtitlePreference,subtitlePreferenceReady])

 useEffect(()=>{
  if(stream.format==='embed')return
  const v=video.current
  if(!v)return
  if(subtitleOff){
   for(let i=0;i<v.textTracks.length;i++)v.textTracks[i].mode='disabled'
   return
  }
  if(!subtitlePreferenceReady)return
  const nativeTracks=Array.from(v.textTracks)
  const preferredLanguage=subtitlePreference==='en'?'en':'id'
  for(const track of nativeTracks){
   track.mode=selectedSubtitle?track.label===selectedSubtitle.id?'showing':'disabled':
    track.language.toLowerCase()===preferredLanguage?'showing':'disabled'
  }
 },[subtitleOff,selectedSubtitle,stream.format,subtitlePreference,subtitlePreferenceReady])

 function changeOffset(delta:number){
  if(!anime||demo)return
  const next=Math.max(-30,Math.min(30,Math.round((subtitleOffset+delta)*10)/10))
  setSubtitleOffset(next)
  void setPreference(`subtitle-offset:${anime.id}`,String(next)).catch(()=>{})
 }

 useEffect(()=>{
  let alive=true
  if(!demo&&anime){
   void getProgress(anime.id).then(value=>{
    if(alive&&value&&value.episode===episode&&value.seconds>0){
     setResumeAt(value.seconds)
    }
   }).catch(()=>{})
  }
  return ()=>{alive=false}
 },[anime,episode,demo])

 useEffect(()=>{
  const element=video.current
  if(!element||stream.format==='embed')return
  let alive=true
  let hls:Hls|null=null
  setError('')
  setReady(false)
  setQualityLevels([])
  setQualityIndex(null)
  setQualityNote('')
  cueBaselines.current=new WeakMap()

  // Keep HLS adaptive by default. If a manual representation stalls repeatedly,
  // return control to ABR instead of forcing another fixed level.
  let stallTimes:number[]=[]
  const onWaiting=()=>{
   if(!hls||hls.autoLevelEnabled)return
   const now=Date.now()
   stallTimes=[...stallTimes.filter(t=>now-t<60000),now]
   if(stallTimes.length<3)return
   hls.currentLevel=-1
   setQualityIndex(null)
   setQualityNote('Kualitas otomatis diaktifkan kembali setelah buffering berulang.')
   stallTimes=[]
  }
  element.addEventListener('waiting',onWaiting)

  if(stream.format==='hls'){
   if(element.canPlayType('application/vnd.apple.mpegurl')){
    element.src=stream.url
   }else{
    void import('hls.js').then(({default:HlsModule})=>{
     if(!alive)return
     if(!HlsModule.isSupported()){
      setError('Video ini belum bisa diputar di perangkatmu.')
      return
     }
     hls=new HlsModule({enableWorker:true})
     hls.startLevel=-1
     hlsRef.current=hls
     hls.on(HlsModule.Events.MANIFEST_PARSED,()=>{
      if(!hls||!alive)return
      setQualityLevels(getAvailableQualityLevels(hls.levels))
      setQualityIndex(null)
     })
     hls.loadSource(stream.url)
     hls.attachMedia(element)
     hls.on(HlsModule.Events.ERROR,(_event,data)=>{
      if(data.fatal&&alive)setError('Video terhenti. Coba lagi atau ganti sumber.')
     })
    }).catch(()=>{
     if(alive)setError('Pemutar belum siap. Coba muat ulang.')
    })
   }
  }else{
   element.src=stream.url
  }

  const onError=()=>setError('Video belum bisa diputar. Periksa koneksi atau pilih sumber lain.')
  element.addEventListener('error',onError)
  return ()=>{
   alive=false
   element.pause()
   element.removeEventListener('error',onError)
   element.removeEventListener('waiting',onWaiting)
   hlsRef.current=null
   hls?.destroy()
   element.removeAttribute('src')
   element.load()
  }
 },[stream.url,stream.format])

 useEffect(()=>{
  if(ready&&resumeAt>0&&video.current&&video.current.duration>resumeAt+3){
   video.current.currentTime=resumeAt
  }
 },[ready,resumeAt])

 useEffect(()=>{
  if(!error||manualSource||!onRecoverSource||recoveryAttempted.current||stream.format==='embed')return
  recoveryAttempted.current=true
  let active=true
  setRecovering(true)
  void onRecoverSource().then(ok=>{
   if(active&&!ok)setRecoverMessage('Belum ada pilihan video lain yang bisa diputar.')
  }).catch(()=>{
   if(active)setRecoverMessage('Pemulihan sumber gagal.')
  }).finally(()=>{if(active)setRecovering(false)})
  return()=>{active=false}
 },[error,manualSource,onRecoverSource,stream.format])

 async function recoverManually(){
  if(!onRecoverSource)return
  setRecovering(true)
  setRecoverMessage('')
  try{
   if(!await onRecoverSource())setRecoverMessage('Belum ada pilihan video lain yang bisa diputar.')
  }catch{setRecoverMessage('Pemulihan sumber gagal.')}
  finally{setRecovering(false)}
 }
 async function prepareNextEpisode(){
  if(!autoNext||!anime||demo||!onPrepareNext||!onContinueNext||stream.format==='embed')return
  setNextMessage('Memeriksa sumber episode berikutnya…')
  try{
   const candidate=await onPrepareNext()
   if(!candidate){setNextMessage('Episode berikutnya belum bisa diputar.');return}
   setNextStream(candidate)
   setNextCountdown(8)
   setNextMessage('')
  }catch{setNextMessage('Episode berikutnya belum dapat diperiksa.')}
 }
 useEffect(()=>{
  if(nextCountdown===null)return
  if(nextCountdown<=0){
   if(nextStream)onContinueNext?.(nextStream)
   return
  }
  const timer=setTimeout(()=>setNextCountdown(value=>value===null?null:value-1),1000)
  return()=>clearTimeout(timer)
 },[nextCountdown,nextStream,onContinueNext])


 useEffect(()=>{
  if(stream.format==='embed')return
  const v=video.current
  if(!v)return
  setPipSupported(Boolean(document.pictureInPictureEnabled&&typeof v.requestPictureInPicture==='function'))
  const updateCaptions=()=>setHasActiveCaptions(Array.from(v.textTracks).some(t=>t.mode==='showing'))
  v.textTracks.addEventListener('change',updateCaptions)
  v.addEventListener('loadedmetadata',updateCaptions)
  updateCaptions()
  return()=>{
   v.textTracks.removeEventListener('change',updateCaptions)
   v.removeEventListener('loadedmetadata',updateCaptions)
  }
 },[stream.format])

 async function toggleFullscreen(){
  const root=watchRef.current
  const v=video.current
  if(!root||!v)return
  try{
   if(document.fullscreenElement){await document.exitFullscreen();return}
   if(typeof root.requestFullscreen==='function'){await root.requestFullscreen();return}
   // iOS may support native video fullscreen without DOM overlays.
   const native=v as HTMLVideoElement&{webkitEnterFullscreen?:()=>void}
   if(native.webkitEnterFullscreen){
    setDisplayNotice('Mode layar penuh pada perangkat ini mungkin menyembunyikan subtitle.')
    native.webkitEnterFullscreen()
    return
   }
   setDisplayNotice('Fullscreen tidak didukung oleh browser ini.')
  }catch{setDisplayNotice('Belum bisa membuka layar penuh.')}
 }
 async function togglePip(){
  const v=video.current
  if(!v||!pipSupported)return
  if(Array.from(v.textTracks).some(t=>t.mode==='showing')){
   setDisplayNotice('Matikan subtitle untuk memakai layar kecil. Teks mungkin tidak tampil.')
   return
  }
  try{
   if(document.pictureInPictureElement){await document.exitPictureInPicture()}
   else await v.requestPictureInPicture()
   setDisplayNotice('')
  }catch{setDisplayNotice('Mode layar kecil belum tersedia untuk video ini.')}
 }

 useEffect(()=>{
  if(stream.format==='embed')return
  const handle=(event:KeyboardEvent)=>{
   if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey)return
   const target=event.target
   if(target instanceof Element&&target.closest('input,select,textarea,[contenteditable="true"]'))return
   const v=video.current
   if(!v)return
   const key=event.key.toLowerCase()
   if(key===' '||key==='k'){
    event.preventDefault()
    if(v.paused)void v.play().catch(()=>setDisplayNotice('Video belum bisa dimulai. Ketuk tombol putar lagi.'))
    else v.pause()
   }else if(key==='arrowleft'||key==='arrowright'){
    event.preventDefault()
    const delta=key==='arrowleft'?-10:10
    v.currentTime=Math.max(0,Math.min(Number.isFinite(v.duration)?v.duration:Infinity,v.currentTime+delta))
   }else if(key==='m'){
    event.preventDefault()
    v.muted=!v.muted
   }else if(key==='f'){
    event.preventDefault()
    const root=video.current?.closest<HTMLElement>('.player-overlay')
    if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{})
    else if(root?.requestFullscreen)void root.requestFullscreen().catch(()=>{})
   }else if(key==='c'&&anime&&!demo&&stream.subtitleMode!=='hard'){
    event.preventDefault()
    setSubtitlePanel(current=>!current)
   }
  }
  document.addEventListener('keydown',handle)
  return()=>document.removeEventListener('keydown',handle)
 },[stream.format,stream.subtitleMode,anime,demo])

 const saveLocal=()=>{
  if(demo||!anime||!video.current)return
  const v=video.current
  if(!Number.isFinite(v.currentTime)||v.currentTime<0)return
  void saveProgress({
   anime,
   episode,
   seconds:v.currentTime,
   duration:Number.isFinite(v.duration)?v.duration:0,
   updatedAt:Date.now()
  }).catch(()=>{})
 }

 useEffect(()=>{
  if(stream.format!=='embed'||!anime||demo)return
  const frame=iframeRef.current
  if(!frame)return
  let controller:ReturnType<typeof connectAnimeEmbed>
  try{
   controller=connectAnimeEmbed(frame)
  }catch{
   setError('Pemutar eksternal tidak dikenal.')
   return
  }
  const unsubscribe=controller.on(msg=>{
   if(msg.event!=='progress'&&msg.event!=='pause'&&msg.event!=='ended')return
   const progress=extractValidPlaybackProgress(msg.data)
   if(!progress)return
   const now=Date.now()
   if(msg.event==='pause'||msg.event==='ended'||now-lastSave.current>=5000){
    lastSave.current=now
    void saveProgress({
     anime,episode,seconds:progress.currentTime,
     duration:progress.duration,updatedAt:now
    }).catch(()=>{})
   }
  })
  return()=>{unsubscribe();controller.destroy()}
 },[stream.format,anime,episode,demo])

 const resolvedEmbedUrl=useMemo(()=>{
  if(stream.format!=='embed')return stream.url
  try{
   const u=new URL(stream.url)
   if(resumeAt>0&&!u.searchParams.has('start')){
    u.searchParams.set('start',String(Math.floor(resumeAt)))
   }
   return u.toString()
  }catch{
   return stream.url
  }
 },[stream.url,stream.format,resumeAt])

 return <main ref={watchRef} tabIndex={-1} className="player-overlay" aria-label="Layar tonton">
  <div className="player-top">
   <button type="button" className="icon-button glass" onClick={onClose} aria-label="Kembali"><ArrowLeft size={20}/></button>
   <div className="player-heading">
    <span>{demo?'COBA PEMUTAR':'SEDANG MENONTON'}</span>
    <strong>{demo?'Contoh video':anime?.title}</strong>
    <small>{demo?'Contoh dengan subtitle Indonesia':`Episode ${episode}${resumeAt>0?` · Melanjutkan dari ${Math.floor(resumeAt/60)}m ${Math.floor(resumeAt%60)}s`:''}`}</small>
   </div>
   <div className="player-provider">{stream.format==='embed'?'Video alternatif':'Video langsung'}</div>
  </div>
  <div className="player-stage">
   {stream.format==='embed'?<div className="embedded-source">
    <div className="embed-notice">
     <Info size={16}/>
     <p>Mode video alternatif. Beberapa pengaturan dan pilihan subtitle mungkin berbeda.</p>
    </div>
    <iframe ref={iframeRef} title={`Video alternatif · Episode ${episode}`} src={resolvedEmbedUrl} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-presentation" loading="eager"/>
    <a href={resolvedEmbedUrl} target="_blank" rel="noopener noreferrer">Buka video di tab baru</a>
   </div>:<>
   {/* biome-ignore lint/a11y/useMediaCaption: Caption tracks are supplied dynamically from the active stream. */}
   <video ref={video} className={captionClasses(normalizeCaptionSettings({font:captionFont,size:captionSize,backdrop:captionBackdrop,textOpacity:captionTextOpacity,backgroundOpacity:captionBackgroundOpacity,outline:captionOutline,position:captionPosition}))} playsInline preload="metadata" crossOrigin="anonymous" onPlay={()=>setIsPaused(false)} onPause={()=>{setIsPaused(true);saveLocal()}} onVolumeChange={()=>{if(video.current){setVolume(video.current.volume);setIsMuted(video.current.muted)}}} onLoadedMetadata={()=>{setReady(true);setDuration(video.current?.duration||0);if(resumeAt>0&&video.current&&video.current.duration>resumeAt+3)video.current.currentTime=resumeAt}} onDurationChange={()=>setDuration(video.current?.duration||0)} onTimeUpdate={()=>{setPosition(video.current?.currentTime||0);if(Date.now()-lastSave.current>6000){lastSave.current=Date.now();saveLocal()}}} onEnded={()=>{setIsPaused(true);saveLocal();void prepareNextEpisode()}} autoPlay>
    {stream.tracks.map(t=><track key={t.lang+t.url} kind="subtitles" srcLang={t.lang} label={t.label} src={t.url} default={subtitlePreferenceReady&&!subtitleOff&&!selectedSubtitle&&t.lang===(subtitlePreference==='en'?'en':'id')}/>)}
    {selectedSubtitle&&!subtitleOff&&<track key={selectedSubtitle.url} kind="subtitles" srcLang={selectedSubtitle.lang} label={selectedSubtitle.id} src={selectedSubtitle.url} default onLoad={()=>{
     const tracks=video.current?.textTracks
     if(tracks)for(let i=0;i<tracks.length;i++)tracks[i].mode=tracks[i].label===selectedSubtitle.id?'showing':'disabled'
    }}/>} 
   </video>
   {ready&&isPaused&&!error&&<button type="button" className="player-center-play" aria-label="Putar video" onClick={togglePlayback}><Play size={30} fill="currentColor"/></button>}
   {!ready&&!error&&<div className="player-loading"><MonitorPlay size={34}/><span>Menyiapkan pemutaran video…</span></div>}
   {error&&<div className="player-error"><AlertTriangle size={28}/><strong>Gagal memuat video</strong><p>{error}</p>{onRecoverSource&&<button type="button" disabled={recovering} onClick={()=>void recoverManually()}>{recovering?'Mencoba sumber lain…':'Coba sumber lain'}</button>}{recoverMessage&&<p role="status">{recoverMessage}</p>}</div>}
   </>}
  </div>
  {stream.format==='embed'&&<div className="player-embed-controls"><span>Mode video alternatif</span><button type="button" className="player-subtitle-trigger" aria-expanded={subtitlePanel} aria-controls="yoru-subtitle-panel" onClick={()=>setSubtitlePanel(value=>!value)}><Subtitles size={17}/> Subtitle</button></div>}
  {nextCountdown!==null&&nextStream&&<div className="player-next" role="status">
   <strong>Episode {episode+1} dalam {nextCountdown} detik</strong>
   <button type="button" onClick={()=>setNextCountdown(null)}>Batal</button>
   <button type="button" onClick={()=>onContinueNext?.(nextStream)}>Lanjut sekarang</button>
  </div>}
  {nextMessage&&<div className="player-next" role="status">{nextMessage}</div>}
  {stream.format!=='embed'&&<div className="player-toolbar">
   <div className="player-transport">
    <button type="button" className="player-transport-play" aria-label={isPaused?'Putar video':'Jeda video'} onClick={togglePlayback}>{isPaused?<Play size={20} fill="currentColor"/>:<Pause size={20} fill="currentColor"/>}</button>
    <span className="player-time" aria-live="off">{clock(position)} <span>/</span> {clock(duration)}</span>
    <input type="range" min={0} max={Number.isFinite(duration)&&duration>0?duration:1} step="0.1" value={Math.min(position,Number.isFinite(duration)&&duration>0?duration:1)} onChange={event=>seekTo(Number(event.target.value))} aria-label="Posisi video" className="player-seek" style={{'--seek':`${duration>0?position/duration*100:0}%`} as CSSProperties}/>
    <button type="button" aria-label={isMuted||volume===0?'Aktifkan suara':'Matikan suara'} onClick={()=>{const v=video.current;if(v){v.muted=!v.muted;setIsMuted(v.muted)}}}>{isMuted||volume===0?<VolumeX size={19}/>:<Volume2 size={19}/>}</button>
    <input type="range" min="0" max="1" step="0.05" value={isMuted?0:volume} onChange={event=>setSound(Number(event.target.value))} aria-label="Volume" className="player-volume"/>
   </div>
   <div className="player-quick-actions">
    <button type="button" aria-label="Mundur 10 detik" onClick={()=>{const v=video.current;if(v)v.currentTime=Math.max(0,v.currentTime-10)}}><SkipBack size={16}/> −10s</button>
    <button type="button" aria-label="Maju 10 detik" onClick={()=>{const v=video.current;if(v)v.currentTime=Math.min(Number.isFinite(v.duration)?v.duration:Infinity,v.currentTime+10)}}><SkipForward size={16}/> +10s</button>
    <button type="button" aria-label="Fullscreen video" onClick={()=>void toggleFullscreen()}><Maximize2 size={16}/> Fullscreen</button>
    {pipSupported&&<button type="button" aria-label="Picture-in-Picture" disabled={hasActiveCaptions||Boolean(selectedSubtitle&&!subtitleOff)} title={hasActiveCaptions?'Matikan subtitle untuk PiP':'Picture-in-Picture'} onClick={()=>void togglePip()}><PictureInPicture2 size={16}/> PiP</button>}
    <button type="button" className="player-more-trigger" aria-expanded={advancedControls} onClick={()=>setAdvancedControls(value=>!value)}><SlidersHorizontal size={17}/> Pengaturan</button>
   </div>
   {advancedControls&&<div className="player-extra-controls">
   <label>Kecepatan
    <select aria-label="Kecepatan pemutaran" value={speed} onChange={e=>{const next=Number(e.target.value);setSpeed(next);void setPreference('playback-speed',String(next)).catch(()=>{})}}>
     {[0.5,0.75,1,1.25,1.5,2].map(value=><option key={value} value={value}>{value}×</option>)}
    </select>
   </label>
   {stream.format==='hls'&&<label>Kualitas
    <select aria-label="Kualitas video" disabled={qualityLevels.length<2} value={qualityIndex===null?'auto':String(qualityIndex)} onChange={e=>{
     const engine=hlsRef.current
     if(!engine)return
     if(e.target.value==='auto'){
      engine.currentLevel=-1
      setQualityIndex(null)
      setQualityNote('')
      return
     }
     const level=Number(e.target.value)
     if(qualityLevels.some(item=>item.index===level)){
      engine.currentLevel=level
      setQualityIndex(level)
      setQualityNote('')
     }
    }}>
     <option value="auto">Auto</option>
     {qualityLevels.map(level=><option key={level.index} value={level.index}>{level.height}p</option>)}
    </select>
    {qualityLevels.length<2&&<small>Perangkat atau video ini tidak menawarkan pilihan kualitas manual.</small>}
   </label>}
   {stream.subtitleMode!=='hard'&&(stream.tracks.length>0||selectedSubtitle!==null)&&<div className="player-offset">
    <span>Waktu subtitle: {subtitleOffset>0?'+':''}{subtitleOffset.toFixed(1)}s</span>
    <button type="button" onClick={()=>changeOffset(-0.5)} disabled={!anime||demo} aria-label="Subtitle 0.5 detik lebih awal">−0.5</button>
    <button type="button" onClick={()=>changeOffset(-0.1)} disabled={!anime||demo} aria-label="Subtitle 0.1 detik lebih awal">−0.1</button>
    <button type="button" onClick={()=>changeOffset(-subtitleOffset)} disabled={!anime||demo} aria-label="Reset sinkronisasi subtitle">Reset</button>
    <button type="button" onClick={()=>changeOffset(0.1)} disabled={!anime||demo} aria-label="Subtitle 0.1 detik lebih lambat">+0.1</button>
    <button type="button" onClick={()=>changeOffset(0.5)} disabled={!anime||demo} aria-label="Subtitle 0.5 detik lebih lambat">+0.5</button>
   </div>}
   </div>}
   <button type="button" className="player-subtitle-trigger" aria-controls="yoru-subtitle-panel" aria-expanded={subtitlePanel} onClick={()=>setSubtitlePanel(value=>!value)}>
    <Subtitles size={15}/> Subtitle · {selectedSubtitle?(selectedSubtitle.lang==='id'?'Indonesia':selectedSubtitle.lang==='en'?'English':'pribadi'):subtitleOff?'Off':subtitleSearch?'Mencari…':'Pilihan'}
   </button>
   {qualityNote&&<small role="status">{qualityNote}</small>}
  </div>}
  {displayNotice&&<div className="player-control-notice" role="status">{displayNotice}</div>}
  {subtitlePanel&&<div className="player-subtitle-panel" id="yoru-subtitle-panel">
   <div className="subtitle-picker-header"><strong>Subtitle episode {episode}</strong><button type="button" onClick={()=>setSubtitlePanel(false)}>Tutup</button></div>
   {stream.format==='embed'?<p className="subtitle-embed-explainer" role="status">Pilihan subtitle diatur oleh pemutar video alternatif. Buka pengaturan di dalam video jika tersedia.</p>:<>
   <div className="subtitle-section-label">Bahasa subtitle</div>
   <button type="button" onClick={disableSubtitle} aria-pressed={subtitleOff}>Off</button>
   {stream.tracks.filter(item=>item.lang==='id'||item.lang==='en').map(item=><button type="button" key={item.url} onClick={()=>chooseNativeSubtitle(item.lang as 'id'|'en')} aria-pressed={!subtitleOff&&!selectedSubtitle&&subtitlePreference===item.lang}>{item.lang==='id'?'Bahasa Indonesia':'English'} · Bawaan video</button>)}
   {subtitleChoices.map(item=><button type="button" key={item.id} onClick={()=>{setSubtitleManual(true);void activateSubtitle(item,true)}} aria-pressed={selectedSubtitle?.id===item.id}>
    {item.label} · {item.provider==='stremio'?'Sumber tambahan':'Sumber subtitle'} · Pilihan {subtitleChoices.indexOf(item)+1}
   </button>)}
   {!subtitleSearch&&!subtitleOff&&!selectedSubtitle&&!englishOfferDismissed&&subtitlePreference!=='en'&&
    !stream.tracks.some(track=>track.lang==='id')&&!subtitleChoices.some(item=>item.language==='id')&&
    (stream.tracks.some(track=>track.lang==='en')||subtitleChoices.some(item=>item.language==='en'))&&
    <fieldset className="subtitle-indonesia-state" aria-label="Konfirmasi subtitle English">
     <p>Sub Indo belum tersedia. Gunakan subtitle English untuk episode ini?</p>
     <button type="button" onClick={()=>{
      const native=stream.tracks.some(track=>track.lang==='en')
      if(native)chooseNativeSubtitle('en')
      else{
       const candidate=subtitleChoices.find(item=>item.language==='en')
       if(candidate)void activateSubtitle(candidate,true)
      }
      setEnglishOfferDismissedFor(subtitleOfferKey)
     }}>Gunakan subtitle English</button>
     <button type="button" onClick={()=>{
      setEnglishOfferDismissedFor(subtitleOfferKey)
      setSubtitleState('English tidak diaktifkan. Subtitle tetap tidak tersedia.')
     }}>Tidak sekarang</button>
    </fieldset>}
   {!subtitleSearch&&!stream.tracks.some(t=>t.lang==='id')&&!subtitleChoices.some(item=>item.language==='id')&&<p className="subtitle-indonesia-state" role="status">Sub Indo belum tersedia untuk episode ini. Tambahkan file SRT atau VTT dari perangkat.</p>}
   <div className="subtitle-upload">
    <label htmlFor="yoru-subtitle-upload"><Upload size={16}/> Tambahkan subtitle dari perangkat</label>
    <input id="yoru-subtitle-upload" type="file" accept=".srt,.vtt,text/vtt,text/plain" onChange={event=>void importSubtitle(event)} aria-label="Unggah subtitle SRT atau VTT"/>
    {uploadedName&&<small>Dipilih: {uploadedName}</small>}
   </div>
   <div className="subtitle-section-label"><SlidersHorizontal size={14}/> Tampilan dan waktu</div>
   <div className="subtitle-style-controls">
    <label>Jenis huruf <select aria-label="Font subtitle" value={captionFont} onChange={event=>saveCaptionStyle(event.target.value as 'sans'|'serif',captionSize,captionBackdrop,captionScope)}>
     <option value="sans">Sans-serif</option><option value="serif">Serif</option>
    </select></label>
    <label>Ukuran <select aria-label="Ukuran subtitle" value={captionSize} onChange={event=>saveCaptionStyle(captionFont,Number(event.target.value),captionBackdrop,captionScope)}>
     {[75,100,125,150].map(size=><option value={size} key={size}>{size}%</option>)}
    </select></label>

    <label>Transparansi teks <select aria-label="Transparansi teks subtitle" value={captionTextOpacity} onChange={event=>saveCaptionStyle(captionFont,captionSize,captionBackdrop,captionScope,{textOpacity:Number(event.target.value) as 50|75|100})}>
     <option value={100}>100%</option><option value={75}>75%</option><option value={50}>50%</option>
    </select></label>
    <label>Transparansi latar <select aria-label="Opasitas latar subtitle" value={captionBackgroundOpacity} onChange={event=>saveCaptionStyle(captionFont,captionSize,captionBackdrop,captionScope,{backgroundOpacity:Number(event.target.value) as 0|25|50|75|100})}>
     {[0,25,50,75,100].map(n=><option key={n} value={n}>{n}%</option>)}
    </select></label>
    <label>Garis tepi <select aria-label="Garis tepi subtitle" value={captionOutline} onChange={event=>saveCaptionStyle(captionFont,captionSize,captionBackdrop,captionScope,{outline:Number(event.target.value) as 0|1|2})}>
     <option value={0}>Tanpa garis</option><option value={1}>Tipis</option><option value={2}>Tebal</option>
    </select></label>
    <label>Posisi <select aria-label="Posisi subtitle" disabled={!captionPositionSupported} value={captionPosition} onChange={event=>saveCaptionStyle(captionFont,captionSize,captionBackdrop,captionScope,{position:event.target.value as CaptionPosition})}>
     <option value="original">Bawaan video</option><option value="top">Atas</option><option value="bottom">Bawah</option>
    </select></label>
    <label>Simpan untuk <select aria-label="Lingkup preferensi subtitle" value={captionScope} onChange={event=>saveCaptionStyle(captionFont,captionSize,captionBackdrop,event.target.value as 'global'|'anime')}>
     <option value="global">Seluruh Yoru</option><option value="anime">Anime ini</option>
    </select></label>
   </div>
   <figure className={`caption-preview caption-preview-${captionPosition}`}><figcaption className="sr-only">Pratinjau gaya subtitle</figcaption>
    <span style={{
     fontFamily:captionFont==='serif'?'Georgia,serif':'Arial,sans-serif',
     fontSize:`${Math.max(12,Math.round(captionSize*0.16))}px`,
     color:`rgba(255,255,255,${captionTextOpacity/100})`,
     backgroundColor:`rgba(0,0,0,${captionBackgroundOpacity/100})`,
     textShadow:captionOutline===0?'none':captionOutline===1?'0 1px 2px #000,0 0 3px #000':'1px 1px 4px #000,-1px -1px 4px #000,0 0 5px #000'
    }}>Contoh subtitle Bahasa Indonesia</span>
   </figure>
   <small role="status">{subtitleSearch?'Mencari subtitle…':subtitleState||'Pilih subtitle yang tersedia untuk video ini.'}</small>
   </>}
  </div>}
  <div className="player-footer">
   <span><Subtitles size={16}/> {stream.format==='embed'?'Pilihan subtitle mengikuti video':stream.subtitleMode==='hard'?'Subtitle menyatu dengan video':selectedSubtitle?`Subtitle ${selectedSubtitle.lang==='id'?'Indonesia':'English'} dimuat`:subtitleOff?'Subtitle mati':stream.tracks.length?`${stream.tracks.length} pilihan subtitle tersedia`:'Subtitle belum ditemukan'}</span>
   <span><Info size={16}/> {demo?'Contoh video dengan subtitle Indonesia.':stream.format==='embed'?'Progress tersimpan di browser ini.':'Riwayat menonton tersimpan di perangkat ini.'}</span>
  </div>
 </main>
}

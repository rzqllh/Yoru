import {useEffect,useMemo,useRef,useState} from 'react'
import type Hls from 'hls.js'
import {AlertTriangle,ArrowLeft,Info,MonitorPlay,Subtitles} from 'lucide-react'
import type {Anime,Stream} from '../types'
import {getPreference,getProgress,saveProgress,setPreference} from '../lib/db'
import {applySubtitleOffset,type CueBaseline} from '../lib/subtitle-offset'
import {connectAnimeEmbed,extractValidPlaybackProgress} from '../lib/animeembed'
import {useDialogFocus} from '../lib/useDialogFocus'

type Props={anime:Anime|null;episode:number;stream:Stream;demo?:boolean;onClose:()=>void}
export default function Player({anime,episode,stream,demo=false,onClose}:Props){
 const video=useRef<HTMLVideoElement>(null)
 const iframeRef=useRef<HTMLIFrameElement>(null)
 const hlsRef=useRef<Hls|null>(null)
 const cueBaselines=useRef(new WeakMap<object,CueBaseline>())
 const [speed,setSpeed]=useState(1)
 const [qualityLevels,setQualityLevels]=useState<{index:number;height:number}[]>([])
 const [qualityIndex,setQualityIndex]=useState<number|null>(null)
 const [qualityNote,setQualityNote]=useState('')
 const [subtitleOffset,setSubtitleOffset]=useState(0)
 const [error,setError]=useState('')
 const [ready,setReady]=useState(false)
 const [resumeAt,setResumeAt]=useState(0)
 const lastSave=useRef(0)
 const dialogRef=useDialogFocus()

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
 },[anime?.id,demo])

 useEffect(()=>{
  const v=video.current
  if(!v||stream.format==='embed')return
  v.playbackRate=speed
 },[speed,stream.url,stream.format])

 useEffect(()=>{
  const v=video.current
  if(!v||stream.format==='embed')return
  const apply=()=>applySubtitleOffset(v.textTracks,subtitleOffset,cueBaselines.current)
  const nodes=Array.from(v.querySelectorAll('track'))
  for(const track of nodes)track.addEventListener('load',apply)
  apply()
  return()=>{for(const track of nodes)track.removeEventListener('load',apply)}
 },[stream.url,stream.format,subtitleOffset])

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

  let stallTimes:number[]=[]
  let activeLevels:{index:number;height:number}[]=[]
  const onWaiting=()=>{
   const now=Date.now()
   stallTimes=[...stallTimes.filter(t=>now-t<60000),now]
   if(stallTimes.length<3||!hls||activeLevels.length<2)return
   const current=hls.currentLevel>=0?hls.currentLevel:activeLevels[0].index
   const position=activeLevels.findIndex(level=>level.index===current)
   if(position>=0&&position<activeLevels.length-1){
    const lower=activeLevels[position+1]
    hls.nextLevel=lower.index
    setQualityIndex(lower.index)
    setQualityNote('Kualitas diturunkan sementara setelah buffering berulang.')
    stallTimes=[]
   }
  }
  element.addEventListener('waiting',onWaiting)

  if(stream.format==='hls'){
   if(element.canPlayType('application/vnd.apple.mpegurl')){
    element.src=stream.url
   }else{
    void import('hls.js').then(({default:HlsModule})=>{
     if(!alive)return
     if(!HlsModule.isSupported()){
      setError('Perangkat ini tidak mendukung pemutaran HLS.')
      return
     }
     hls=new HlsModule({enableWorker:true})
     hlsRef.current=hls
     hls.on(HlsModule.Events.MANIFEST_PARSED,()=>{
      if(!hls||!alive)return
      activeLevels=hls.levels.map((level,index)=>({index,height:level.height||0})).filter(level=>level.height>0).sort((a,b)=>b.height-a.height)
      setQualityLevels(activeLevels)
      const highest=activeLevels[0]
      if(highest){hls.startLevel=highest.index;setQualityIndex(highest.index)}
     })
     hls.loadSource(stream.url)
     hls.attachMedia(element)
     hls.on(HlsModule.Events.ERROR,(_event,data)=>{
      if(data.fatal&&alive)setError(`HLS: ${data.details}`)
     })
    }).catch(()=>{
     if(alive)setError('Modul pemutar HLS tidak dapat dimuat.')
    })
   }
  }else{
   element.src=stream.url
  }

  const onError=()=>setError('Video tidak dapat dimuat. Periksa koneksi atau sumber stream.')
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

 return <div ref={dialogRef} tabIndex={-1} className="player-overlay" role="dialog" aria-modal="true" aria-label="Video player">
  <div className="player-top">
   <button type="button" className="icon-button glass" onClick={onClose} aria-label="Kembali"><ArrowLeft size={20}/></button>
   <div className="player-heading">
    <span>{demo?'PENGUJIAN PEMUTAR':'SEDANG MENONTON'}</span>
    <strong>{demo?'Sampel Pemutaran HLS':anime?.title}</strong>
    <small>{demo?'Video lokal dengan subtitle Indonesia':`Episode ${episode}${resumeAt>0?` · Melanjutkan dari ${Math.floor(resumeAt/60)}m ${Math.floor(resumeAt%60)}s`:''}`}</small>
   </div>
   <div className="player-provider">{stream.providerId||'Sumber default'}</div>
  </div>
  <div className="player-stage">
   {stream.format==='embed'?<div className="embedded-source">
    <div className="embed-notice">
     <Info size={16}/>
     <p>Pemutar eksternal AnimeEmbed. Ketersediaan episode dan bahasa subtitle belum diverifikasi secara menyeluruh. Bahasa subtitle dan ketersediaan video belum dapat diverifikasi Yoru. Progress dapat disimpan jika pemutar mengirim event yang valid.</p>
    </div>
    <iframe ref={iframeRef} title={`External player · Episode ${episode}`} src={resolvedEmbedUrl} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-presentation" loading="eager"/>
    <a href={resolvedEmbedUrl} target="_blank" rel="noopener noreferrer">Buka pemutar di tab baru jika iframe mengalami kendala</a>
   </div>:<>
   {/* biome-ignore lint/a11y/useMediaCaption: Caption tracks are supplied dynamically from the active stream. */}
   <video ref={video} controls playsInline preload="metadata" crossOrigin="anonymous" onLoadedMetadata={()=>{setReady(true);if(resumeAt>0&&video.current&&video.current.duration>resumeAt+3)video.current.currentTime=resumeAt}} onTimeUpdate={()=>{if(Date.now()-lastSave.current>6000){lastSave.current=Date.now();saveLocal()}}} onPause={saveLocal} onEnded={saveLocal} autoPlay>
    {stream.tracks.map(t=><track key={t.lang+t.url} kind="subtitles" srcLang={t.lang} label={t.label} src={t.url} default={t.lang==='id'}/>)}
   </video>
   {!ready&&!error&&<div className="player-loading"><MonitorPlay size={34}/><span>Menyiapkan pemutaran video…</span></div>}
   {error&&<div className="player-error"><AlertTriangle size={28}/><strong>Gagal memuat video</strong><p>{error}</p></div>}
   </>}
  </div>
  {stream.format!=='embed'&&<div className="player-toolbar" aria-label="Kontrol pemutar Yoru">
   <label>Kecepatan
    <select aria-label="Kecepatan pemutaran" value={speed} onChange={e=>setSpeed(Number(e.target.value))}>
     {[0.5,0.75,1,1.25,1.5,2].map(value=><option key={value} value={value}>{value}×</option>)}
    </select>
   </label>
   {qualityLevels.length>1&&<label>Kualitas
    <select aria-label="Kualitas video" value={qualityIndex??''} onChange={e=>{
     const level=Number(e.target.value)
     if(hlsRef.current&&qualityLevels.some(item=>item.index===level)){
      hlsRef.current.currentLevel=level
      setQualityIndex(level)
      setQualityNote('')
     }
    }}>
     {qualityLevels.map(level=><option key={level.index} value={level.index}>{level.height}p</option>)}
    </select>
   </label>}
   {stream.subtitleMode!=='hard'&&stream.tracks.length>0&&<div className="player-offset">
    <span>Sync sub: {subtitleOffset>0?'+':''}{subtitleOffset.toFixed(1)}s</span>
    <button type="button" onClick={()=>changeOffset(-0.5)} disabled={!anime||demo} aria-label="Subtitle 0.5 detik lebih awal">−0.5</button>
    <button type="button" onClick={()=>changeOffset(-0.1)} disabled={!anime||demo} aria-label="Subtitle 0.1 detik lebih awal">−0.1</button>
    <button type="button" onClick={()=>changeOffset(-subtitleOffset)} disabled={!anime||demo} aria-label="Reset sinkronisasi subtitle">Reset</button>
    <button type="button" onClick={()=>changeOffset(0.1)} disabled={!anime||demo} aria-label="Subtitle 0.1 detik lebih lambat">+0.1</button>
    <button type="button" onClick={()=>changeOffset(0.5)} disabled={!anime||demo} aria-label="Subtitle 0.5 detik lebih lambat">+0.5</button>
   </div>}
   {qualityNote&&<small role="status">{qualityNote}</small>}
  </div>}
  <div className="player-footer">
   <span><Subtitles size={16}/> {stream.format==='embed'?'Subtitle eksternal belum diverifikasi':stream.subtitleMode==='hard'?'Subtitle menyatu dengan video':stream.tracks.length?`${stream.tracks.length} track subtitle tersedia`:'Subtitle tidak tersedia'}</span>
   <span><Info size={16}/> {demo?'Sampel lokal untuk menguji HLS & VTT.':stream.format==='embed'?'Progress tersimpan di browser ini.':'Stream bersumber dari konfigurasi lokal.'}</span>
  </div>
 </div>
}

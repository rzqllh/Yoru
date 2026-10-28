import {useEffect,useRef,useState} from 'react'
import Hls from 'hls.js'
import {ArrowLeft, MonitorPlay, Subtitles, Info, AlertTriangle} from 'lucide-react'
import type {Anime,Stream} from '../types'
import {getProgress,saveProgress} from '../lib/db'

type Props={anime:Anime|null;episode:number;stream:Stream;demo?:boolean;onClose:()=>void}
export default function Player({anime,episode,stream,demo=false,onClose}:Props){
 const video=useRef<HTMLVideoElement>(null)
 const [error,setError]=useState('')
 const [ready,setReady]=useState(false)
 const [resumeAt,setResumeAt]=useState(0)
 const lastSave=useRef(0)
 useEffect(()=>{
  const element=video.current;if(!element)return
  let alive=true
  if(!demo&&anime){void getProgress(anime.id).then(value=>{if(alive&&value?.episode===episode)setResumeAt(value.seconds)}).catch(()=>{})}
  let hls:Hls|null=null
  setError('');setReady(false)
  if(stream.format==='hls'){
   if(element.canPlayType('application/vnd.apple.mpegurl')){element.src=stream.url}
   else if(Hls.isSupported()){
    hls=new Hls({enableWorker:true})
    hls.loadSource(stream.url);hls.attachMedia(element)
    hls.on(Hls.Events.ERROR,(_event,data)=>{if(data.fatal)setError(`HLS: ${data.details}`)})
   }else setError('Perangkat ini tidak mendukung HLS.')
  }else element.src=stream.url
  const onError=()=>setError('Video tidak dapat dimuat. Periksa koneksi atau sumber stream.')
  element.addEventListener('error',onError)
  return ()=>{alive=false;element.pause();element.removeEventListener('error',onError);hls?.destroy();element.removeAttribute('src');element.load()}
 },[stream.url,stream.format,demo,anime,episode])
 useEffect(()=>{if(ready&&resumeAt>0&&video.current&&video.current.duration>resumeAt+3)video.current.currentTime=resumeAt},[ready,resumeAt])
 const save=()=>{
  if(demo||!anime||!video.current)return
  const v=video.current
  if(!Number.isFinite(v.currentTime)||v.currentTime<0)return
  void saveProgress({anime,episode,seconds:v.currentTime,duration:Number.isFinite(v.duration)?v.duration:0,updatedAt:Date.now()}).catch(()=>{})
 }
 return <div className="player-overlay" role="dialog" aria-modal="true" aria-label="Video player">
  <div className="player-top">
   <button type="button" className="icon-button glass" onClick={onClose} aria-label="Kembali"><ArrowLeft size={20}/></button>
   <div className="player-heading"><span>{demo?'DEMO PLAYBACK':'SEDANG DIPUTAR'}</span><strong>{demo?'Video pengujian HLS':anime?.title}</strong><small>{demo?'Sampel video publik':`Episode ${episode}`}</small></div>
   <div className="player-provider">{stream.providerId||'Demo source'}</div>
  </div>
  <div className="player-stage">
   {/* biome-ignore lint/a11y/useMediaCaption: Caption tracks are supplied dynamically from the active stream. */}
   <video ref={video} controls playsInline preload="metadata" crossOrigin="anonymous" onLoadedMetadata={()=>{setReady(true);if(resumeAt>0&&video.current&&video.current.duration>resumeAt+3)video.current.currentTime=resumeAt}} onTimeUpdate={()=>{if(Date.now()-lastSave.current>6000){lastSave.current=Date.now();save()}}} onPause={save} onEnded={save} autoPlay>
    {stream.tracks.map(t=><track key={t.lang+t.url} kind="subtitles" srcLang={t.lang} label={t.label} src={t.url} default={t.lang==='id'}/>)}
   </video>
   {!ready&&!error&&<div className="player-loading"><MonitorPlay size={34}/><span>Menyiapkan video…</span></div>}
   {error&&<div className="player-error"><AlertTriangle size={28}/><strong>Gagal memuat video</strong><p>{error}</p></div>}
  </div>
  <div className="player-footer"><span><Subtitles size={16}/> {stream.subtitleMode==='hard'?'Subtitle menyatu dengan video':stream.tracks.length?`${stream.tracks.length} subtitle tersedia`:'Subtitle tidak tersedia'}</span><span><Info size={16}/> {demo?'Video sampel bukan anime.':'Stream dikonfigurasi dari sumber lokal.'}</span></div>
 </div>
}

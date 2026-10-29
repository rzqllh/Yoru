import type {Stream} from '../types'

/** A configured URL is a candidate, not evidence that the browser can decode it. */
export function isNativeCandidate(stream:Stream):boolean{
 if(stream.format!=='hls'&&stream.format!=='mp4')return false
 if(stream.url.startsWith('/demo/'))return true
 try{
  const url=new URL(stream.url)
  return url.protocol==='https:'&&!url.username&&!url.password&&
    !/^(localhost|127\.|10\.|192\.168\.)/i.test(url.hostname)&&
    (stream.format==='hls'?url.pathname.endsWith('.m3u8'):url.pathname.endsWith('.mp4'))
 }catch{return false}
}

/**
 * Preflight in the current browser, with CORS/codec requirements matching the
 * actual player. Success means a frame can be decoded here, not an SLA or
 * proof of availability on another device. Never automatically probe embeds.
 */
export async function verifyNativeSource(stream:Stream,timeoutMs=15000):Promise<void>{
 if(!isNativeCandidate(stream))throw new Error('Format atau URL sumber tidak didukung.')
 const video=document.createElement('video')
 video.preload='auto'
 video.muted=true
 video.playsInline=true
 video.crossOrigin='anonymous'
 let hls:{destroy:()=>void}|null=null
 await new Promise<void>((resolve,reject)=>{
  let done=false
  const finish=(error?:Error)=>{
   if(done)return
   done=true
   clearTimeout(timer)
   video.removeEventListener('loadeddata',ready)
   video.removeEventListener('error',failed)
   hls?.destroy()
   video.removeAttribute('src')
   video.load()
   if(error)reject(error)
   else resolve()
  }
  const ready=()=>finish()
  const failed=()=>finish(new Error('Media tidak dapat didekode atau diakses browser.'))
  const timer=setTimeout(()=>finish(new Error('Pemeriksaan media melewati batas waktu.')),timeoutMs)
  video.addEventListener('loadeddata',ready)
  video.addEventListener('error',failed)
  if(stream.format==='mp4'||video.canPlayType('application/vnd.apple.mpegurl')){
   video.src=stream.url
   video.load()
  }else{
   void import('hls.js').then(({default:Hls})=>{
    if(done)return
    if(!Hls.isSupported()){finish(new Error('HLS tidak didukung di browser ini.'));return}
    const instance=new Hls({enableWorker:true})
    hls=instance
    instance.on(Hls.Events.ERROR,(_event,data)=>{
     if(data.fatal)finish(new Error('Manifest atau segmen HLS tidak dapat dimuat.'))
    })
    instance.on(Hls.Events.MEDIA_ATTACHED,()=>instance.loadSource(stream.url))
    instance.attachMedia(video)
   }).catch(()=>finish(new Error('Mesin HLS gagal dimuat.')))
  }
 })
}

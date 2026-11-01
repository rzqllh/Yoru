import type {Stream} from '../types'

/** Browser-side defense in depth; DNS/CORS checks and server network policy still apply. */
function isAllowedMediaHost(hostname:string):boolean{
 const host=hostname.toLowerCase().replace(/\.+$/,'')
 if(!host.includes('.')||host.includes(':')||/(?:^|\.)(?:localhost|local|internal|lan)$/.test(host))return false
 const ipv4=/^\d+(?:\.\d+){3}$/.test(host)
 if(!ipv4)return true
 const parts=host.split('.').map(Number)
 if(parts.some(n=>n>255))return false
 const [a,b,c]=parts
 if(a===0||a===10||a===127||a>=224)return false
 if(a===100&&b>=64&&b<=127)return false
 if(a===169&&b===254)return false
 if(a===172&&b>=16&&b<=31)return false
 if(a===192&&(b===168||(b===0&&c===0)||(b===0&&c===2)))return false
 if(a===198&&(b===18||b===19||(b===51&&c===100)))return false
 if(a===203&&b===0&&c===113)return false
 return true
}

/** A configured URL is a candidate, not evidence that the browser can decode it. */
export function isNativeCandidate(stream:Stream):boolean{
 // Provider payloads are untrusted at runtime, even when typed as Stream.
 if(!stream||typeof stream!=='object'||(stream.format!=='hls'&&stream.format!=='mp4')||
  typeof stream.url!=='string')return false
 if(stream.url.startsWith('/demo/'))return stream.format==='hls'&&stream.url==='/demo/stream.m3u8'
 try{
  const url=new URL(stream.url)
  return url.protocol==='https:'&&!url.username&&!url.password&&
    isAllowedMediaHost(url.hostname)&&
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

import {readFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {lookup} from 'node:dns/promises'
import {request} from 'node:https'
import {isPublicIPv4,parseStremioStreams,classifyStremioUnplayable,normalizeStremioSubtitles,stremioStreamPath,stremioSubtitlePath,validateStremioConfig,type StremioAddon,type StremioConfig} from './stremio-core.js'

export async function getStremioConfig():Promise<StremioConfig|null>{
 const hosted=process.env.STREMIO_ADDONS_JSON
 if(hosted!==undefined){
  if(!hosted.trim()||hosted.length>65536)throw new Error('Invalid Stremio addon configuration')
  return validateStremioConfig(JSON.parse(hosted))
 }
 const root=existsSync(resolve(process.cwd(),'configs'))?process.cwd():resolve(process.cwd(),'..')
 try{
  const path=resolve(root,'configs','stremio.local.json')
  const raw=await readFile(path,'utf8')
  if(raw.length>65536)throw new Error('Config too large')
  return validateStremioConfig(JSON.parse(raw))
 }catch(error){
  if((error as NodeJS.ErrnoException).code==='ENOENT')return null
  throw error
 }
}
async function fetchJsonPinned(url:URL):Promise<unknown>{
 if(url.protocol!=='https:'||url.port||url.username||url.password||url.search||url.hash)throw new Error('Unsafe addon URL')
 const resolved=await lookup(url.hostname,{family:4})
 if(!isPublicIPv4(resolved.address))throw new Error('Addon DNS resolved to blocked address')
 return new Promise<unknown>((resolveValue,reject)=>{
  let settled=false
  const fail=(error:Error)=>{if(!settled){settled=true;reject(error)}}
  const req=request(url,{method:'GET',timeout:7000,headers:{Accept:'application/json'},
   lookup:(_host,_opts,callback)=>callback(null,resolved.address,4)},res=>{
    if(res.statusCode!==200){res.resume();fail(new Error('Addon unavailable'));return}
    const chunks:Buffer[]=[];let bytes=0
    res.on('data',(chunk:Buffer)=>{
     bytes+=chunk.length
     if(bytes>262144){req.destroy(new Error('Addon payload too large'));return}
     chunks.push(chunk)
    })
    res.on('error',fail)
    res.on('end',()=>{
     if(settled)return
     settled=true
     try{resolveValue(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch{reject(new Error('Invalid addon JSON'))}
    })
   })
  req.on('timeout',()=>req.destroy(new Error('Addon timeout')))
  req.on('error',fail)
  req.end()
 })
}
/** Only canonical decimal MAL IDs may resolve configured Stremio mappings. */
const validMappedId=(raw:string)=>/^[1-9]\d{0,7}$/.test(raw)

export async function getStremioEpisodes(animeId:string){
 const match=/^(?:mal:)?([1-9]\d{0,7})$/.exec(animeId)
 if(!match)return []
 const config=await getStremioConfig()
 const malId=Number(match[1])
 return (config?.addons??[]).flatMap(addon=>{
  const match=addon.anime.find(a=>a.malId===malId)
  if(!match)return []
  return match.episodes.map(number=>({id:`stremio-${addon.id}:${malId}:${number}`,animeId,number,title:`Episode ${number}`,providerId:`stremio-${addon.id}`}))
 })
}
export async function getStremioSourceCandidates(ref:string){
 const empty={items:[] as ReturnType<typeof parseStremioStreams>,unavailable:[] as ReturnType<typeof classifyStremioUnplayable>}
 const pieces=ref.split(':')
 if(pieces.length!==3||!/^stremio-[a-z0-9][a-z0-9-]*$/.test(pieces[0])||
  !validMappedId(pieces[1])||!validMappedId(pieces[2]))return empty
 const addonId=pieces[0].slice('stremio-'.length),malId=Number(pieces[1]),episode=Number(pieces[2])
 const cfg=await getStremioConfig()
 const addon:StremioAddon|undefined=cfg?.addons.find(a=>a.id===addonId)
 const anime=addon?.anime.find(a=>a.malId===malId)
 if(!addon||!anime?.episodes.includes(episode))return empty
 const path=stremioStreamPath(addon,anime.stremioId,anime.season,episode)
 const payload=await fetchJsonPinned(path)
 return {
  items:parseStremioStreams(payload,`stremio-${addon.id}`).map((stream,i)=>({...stream,id:`stremio-${addon.id}:${malId}:${episode}:${i}`})),
  unavailable:classifyStremioUnplayable(payload,`stremio-${addon.id}`)
 }
}
export async function getStremioStreams(ref:string){
 return (await getStremioSourceCandidates(ref)).items
}


type StremioSubtitleResult={id:string;provider:'stremio';language:'id'|'en';label:string;release:string;episode:number;score:number;sourceUrl:string}
function validSubtitleRef(ref:string){
 const match=/^([a-z0-9][a-z0-9-]{0,47}):([1-9]\d{0,8}):([1-9]\d{0,3}):(\d{1,2})$/.exec(ref)
 if(!match)return null
 return {addonId:match[1],malId:Number(match[2]),episode:Number(match[3]),index:Number(match[4])}
}
async function findMappedSubtitles(addon:StremioAddon,malId:number,episode:number){
 const mapped=addon.anime.find(a=>a.malId===malId&&a.episodes.includes(episode))
 if(!mapped)return []
 const json=await fetchJsonPinned(stremioSubtitlePath(addon,mapped.stremioId,mapped.season,episode))
 return normalizeStremioSubtitles(json,'stremio-'+addon.id)
}
export async function getStremioAddonSubtitles(malId:number,episode:number):Promise<StremioSubtitleResult[]>{
 if(!Number.isSafeInteger(malId)||malId<1||!Number.isSafeInteger(episode)||episode<1||episode>2000)return []
 const cfg=await getStremioConfig()
 if(!cfg)return []
 const settlements=await Promise.allSettled(cfg.addons.map(async addon=>{
  const items=await findMappedSubtitles(addon,malId,episode)
  return items.map((sub,i)=>({
   id:'stremio:'+addon.id+':'+malId+':'+episode+':'+i,
   provider:'stremio' as const,language:sub.lang,
   label:sub.lang==='id'?'Indonesia':'English',release:sub.label,
   episode,score:70,
   sourceUrl:'/api/subtitles/file?provider=stremio&ref='+encodeURIComponent(addon.id+':'+malId+':'+episode+':'+i)
  }))
 }))
 return settlements.flatMap(x=>x.status==='fulfilled'?x.value:[]).slice(0,45)
}

/** A signed reference is resolved again from the configured addon, not treated as an arbitrary URL. */
export async function downloadStremioAddonSubtitle(ref:string):Promise<string>{
 const parsed=validSubtitleRef(ref)
 if(!parsed)throw new Error('BAD_SUBTITLE_REF')
 const cfg=await getStremioConfig()
 const addon=cfg?.addons.find(a=>a.id===parsed.addonId)
 if(!addon)throw new Error('UNKNOWN_ADDON')
 const candidates=await findMappedSubtitles(addon,parsed.malId,parsed.episode)
 const item=candidates[parsed.index]
 if(!item)throw new Error('UNKNOWN_SUBTITLE')
 const url=new URL(item.url)
 if(url.protocol!=='https:'||url.port||url.username||url.password||url.hash)throw new Error('UNSAFE_SUBTITLE_URL')
 const dns=await lookup(url.hostname,{family:4})
 if(!isPublicIPv4(dns.address))throw new Error('BLOCKED_SUBTITLE_HOST')
 return new Promise<string>((resolveText,reject)=>{
  let done=false
  const fail=(error:Error)=>{if(!done){done=true;reject(error)}}
  const req=request(url,{method:'GET',timeout:8000,
   headers:{Accept:'text/vtt,text/plain,application/x-subrip'},
   lookup:(_host,_opts,callback)=>callback(null,dns.address,4)},res=>{
   if(res.statusCode!==200){res.resume();fail(new Error('SUBTITLE_UNAVAILABLE'));return}
   const type=res.headers['content-type']||''
   if(typeof type!=='string'||!/^(text\/|application\/x-subrip)/i.test(type)){
    res.resume();fail(new Error('UNSUPPORTED_SUBTITLE_TYPE'));return
   }
   const chunks:Buffer[]=[];let bytes=0
   res.on('data',(chunk:Buffer)=>{
    bytes+=chunk.length
    if(bytes>500000){req.destroy(new Error('SUBTITLE_TOO_LARGE'));return}
    chunks.push(chunk)
   })
   res.on('error',fail)
   res.on('end',()=>{
    if(done)return
    done=true
    resolveText(Buffer.concat(chunks).toString('utf8'))
   })
  })
  req.on('timeout',()=>req.destroy(new Error('SUBTITLE_TIMEOUT')))
  req.on('error',fail)
  req.end()
 })
}

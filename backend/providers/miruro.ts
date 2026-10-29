/**
 * Opt-in Miruro-compatible REST adapter.
 * Requires a self-hosted or explicitly approved HTTPS API base.
 * The public Miruro demo warns its stream endpoints can be blocked upstream.
 */
type RecordValue=Record<string,unknown>
const obj=(x:unknown):RecordValue|null=>x&&typeof x==='object'&&!Array.isArray(x)?x as RecordValue:null
const arr=(x:unknown):unknown[]=>Array.isArray(x)?x:[]
const str=(x:unknown,max=180)=>typeof x==='string'?x.trim().slice(0,max):''
const asId=(x:unknown)=>Number.isSafeInteger(Number(x))&&Number(x)>0&&Number(x)<100000000?Number(x):null
export function miruroBase():string|null{
 const raw=process.env.MIRURO_API_BASE
 if(!raw)return null
 try{
  const url=new URL(raw)
  const host=url.hostname.toLowerCase()
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||
   !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)||/\.(local|localhost|internal|invalid)$/.test(host)||
   host==='localhost'||host.endsWith('.example.com')||!['','/'].includes(url.pathname))return null
  return url.origin
 }catch{return null}
}
export const isMiruroConfigured=()=>miruroBase()!==null
const timeout=7000
async function readJson(url:string,options:RequestInit={}):Promise<unknown>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout)
 try{
  const response=await fetch(url,{...options,signal:controller.signal,redirect:'error',
   headers:{Accept:'application/json',...options.headers}})
  if(!response.ok)throw new Error('MIRURO_UPSTREAM_UNAVAILABLE')
  if(!(response.headers.get('content-type')||'').includes('json'))throw new Error('INVALID_MIRURO_RESPONSE')
  const body=await response.text()
  if(body.length>750000)throw new Error('MIRURO_RESPONSE_TOO_LARGE')
  return JSON.parse(body) as unknown
 }finally{clearTimeout(timer)}
}
const cache=new Map<number,{value:number|null;until:number}>()
async function anilistId(malId:number):Promise<number|null>{
 const known=cache.get(malId)
 if(known&&known.until>Date.now())return known.value
 const response=await readJson('https://graphql.anilist.co',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({query:'query ($idMal: Int) { Media(idMal: $idMal, type: ANIME) { id } }',
   variables:{idMal:malId}})
 })
 const id=asId(obj(obj(response)?.data)?.Media&&obj(obj(obj(response)?.data)?.Media)?.id)
 if(cache.size>=1000)cache.clear()
 cache.set(malId,{value:id,until:Date.now()+6*60*60*1000})
 return id
}
export type MiruroEpisode={id:string;animeId:string;number:number;title:string;providerId:string}
export function parseMiruroEpisodes(payload:unknown,malId:number,aniId:number):MiruroEpisode[]{
 const root=obj(obj(payload)?.results),providers=obj(root?.providers),out:MiruroEpisode[]=[]
 for(const [name,value] of Object.entries(providers||{}).slice(0,18)){
  if(!/^[a-z][a-z0-9-]{0,24}$/.test(name))continue
  const episodeList=obj(obj(value)?.episodes)
  const seen=new Set<number>()
  for(const ep of arr(episodeList?.sub).slice(0,2000)){
   const data=obj(ep),number=Number(data?.number),id=str(data?.id,180)
   if(!Number.isSafeInteger(number)||number<1||number>2000||seen.has(number)||
    !new RegExp('^watch/'+name+'/'+aniId+'/sub/[A-Za-z0-9_-]{1,120}$').test(id))continue
   seen.add(number)
   out.push({id:'miruro-'+name+':'+malId+':'+number,
    animeId:'mal:'+malId,number,title:str(data?.title,110)||'Episode '+number,
    providerId:'miruro-'+name})
  }
 }
 return out
}
function mediaUrl(input:unknown,format:'hls'|'mp4'):string|null{
 try{
  const url=new URL(str(input,2048))
  if(url.protocol!=='https:'||url.username||url.password||url.port||
   !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)||/\.(local|internal|invalid)$/.test(url.hostname)||
   !(format==='hls'?/\.m3u8$/i.test(url.pathname):/\.mp4$/i.test(url.pathname)))return null
  return url.toString()
 }catch{return null}
}
export function parseMiruroStreams(payload:unknown,provider:string,episode:number){
 if(!Number.isSafeInteger(episode)||episode<1||episode>2000)return []
 const root=obj(obj(payload)?.results),out:{format:'hls'|'mp4';url:string;subtitleMode:'soft'|'unknown';tracks:{lang:string;label:string;url:string}[];quality?:string;providerId:string}[]=[]
 const tracks:{lang:string;label:string;url:string}[]=[]
 for(const sub of arr(root?.subtitles).slice(0,15)){
  const item=obj(sub),language=str(item?.language||item?.lang,8).toLowerCase()
  if(!/^[a-z]{2,3}$/.test(language))continue
  const url=mediaUrl(item?.url,'hls') // replaced below for VTT source
  const actual=str(item?.url,2048)
  try{
   const u=new URL(actual)
   if(!url&&u.protocol==='https:'&&/\.(vtt|srt)$/i.test(u.pathname)&&!u.username&&!u.password&&
     !/(?:localhost|\.local|\.internal)$/.test(u.hostname)){
    tracks.push({lang:language,label:str(item?.label,60)||language,url:u.toString()})
   }
  }catch{/* ignore malformed subtitles */}
 }
 for(const raw of arr(root?.streams).slice(0,30)){
  const stream=obj(raw),format=stream?.type==='hls'?'hls':stream?.type==='mp4'?'mp4':null
  if(!format)continue
  const url=mediaUrl(stream?.url,format)
  if(!url)continue
  out.push({format,url,subtitleMode:tracks.length?'soft':'unknown',tracks,
   providerId:'miruro-'+provider,quality:str(stream?.quality,50)||undefined})
 }
 return out
}
export async function getMiruroEpisodes(malId:number):Promise<MiruroEpisode[]>{
 const base=miruroBase()
 if(!base)return []
 const id=await anilistId(malId)
 if(!id)return []
 return parseMiruroEpisodes(await readJson(base+'/api/episodes/'+id),malId,id)
}
export async function getMiruroStreams(ref:string){
 const base=miruroBase(),match=/^miruro-([a-z][a-z0-9-]{0,24}):([1-9]\d{0,8}):([1-9]\d{0,3})$/.exec(ref)
 if(!base||!match)return []
 const [,provider,malIdText,epText]=match,malId=Number(malIdText),episode=Number(epText)
 if(episode>2000)return []
 const id=await anilistId(malId)
 if(!id)return []
 const data=await readJson(base+'/api/episodes/'+id)
 const root=obj(obj(data)?.results),providers=obj(root?.providers)
 const sub=arr(obj(obj(providers?.[provider])?.episodes)?.sub)
 const exact=sub.map(obj).find(row=>row?.number===episode)
 const path=str(exact?.id,180)
 if(!new RegExp('^watch/'+provider+'/'+id+'/sub/[A-Za-z0-9_-]{1,120}$').test(path))return []
 const response=await readJson(base+'/api/'+path)
 return parseMiruroStreams(response,provider,episode).map((stream,index)=>({
  ...stream,id:'miruro-'+provider+':'+malId+':'+episode+':'+index
 }))
}

export type StremioAnime = {malId:number;stremioId:string;season:number;episodes:number[]}
export type StremioAddon = {id:string;name:string;manifestUrl:string;anime:StremioAnime[]}
export type StremioConfig = {addons:StremioAddon[]}
export type AddonTrack={lang:string;label:string;url:string}
export type AddonStream={format:'hls'|'mp4';url:string;subtitleMode:'soft'|'unknown';tracks:AddonTrack[];quality?:string;providerId:string}
const object=(value:unknown):Record<string,unknown>=>{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Expected object')
 return value as Record<string,unknown>
}
const nonempty=(value:unknown,limit=160):string=>{
 if(typeof value!=='string'||!value.trim()||value.length>limit)throw new Error('Invalid string')
 return value.trim()
}
const positive=(value:unknown):number=>{
 if(!Number.isSafeInteger(value)||Number(value)<1||Number(value)>99999999)throw new Error('Invalid integer')
 return Number(value)
}
export function isPublicIPv4(value:string):boolean{
 const parts=value.split('.');if(parts.length!==4||!parts.every(p=>/^\d{1,3}$/.test(p)&&Number(p)<=255))return false
 const [a,b,c]=parts.map(Number)
 if(a===0||a===10||a===127||a>=224)return false
 if(a===100&&b>=64&&b<=127)return false
 if(a===169&&b===254)return false
 if(a===172&&b>=16&&b<=31)return false
 if(a===192&&(b===168||(b===0&&c===0)||(b===0&&c===2)))return false
 if(a===198&&(b===18||b===19||(b===51&&c===100)))return false
 if(a===203&&b===0&&c===113)return false
 return true
}
export function validateStremioConfig(value:unknown):StremioConfig{
 const root=object(value)
 if(!Array.isArray(root.addons)||root.addons.length>5)throw new Error('Invalid addons')
 const seen=new Set<string>()
 const addons=root.addons.map(raw=>{
  const entry=object(raw),id=nonempty(entry.id,48)
  if(!/^[a-z0-9][a-z0-9-]*$/.test(id))throw new Error('Invalid addon id')
  if(seen.has(id))throw new Error('Duplicate addon id')
  seen.add(id)
  const name=nonempty(entry.name,120)
  const url=new URL(nonempty(entry.manifestUrl,2048))
  if(url.protocol!=='https:'||url.port||url.username||url.password||url.search||url.hash||
    !url.pathname.endsWith('/manifest.json')||
    !/^(?=.{4,253}$)[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)||
    url.hostname.endsWith('.local')||url.hostname.endsWith('.localhost')||url.hostname.endsWith('.internal'))throw new Error('Invalid manifest URL')
  if(!Array.isArray(entry.anime)||entry.anime.length>200)throw new Error('Invalid anime list')
  const malIds=new Set<number>()
  const anime=entry.anime.map(rawAnime=>{
   const item=object(rawAnime),malId=positive(item.malId)
   if(malIds.has(malId))throw new Error('Duplicate MAL id')
   malIds.add(malId)
   const stremioId=nonempty(item.stremioId,120)
   if(!/^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(stremioId))throw new Error('Invalid Stremio ID')
   const season=item.season===undefined?1:positive(item.season)
   if(!Array.isArray(item.episodes)||item.episodes.length>2000)throw new Error('Invalid episodes')
   const episodes=item.episodes.map(positive)
   if(new Set(episodes).size!==episodes.length)throw new Error('Duplicate episodes')
   return {malId,stremioId,season,episodes}
  })
  return {id,name,manifestUrl:url.toString(),anime}
 })
 return {addons}
}
export function stremioStreamPath(addon:StremioAddon,stremioId:string,season:number,episode:number):URL{
 return new URL(`stream/series/${encodeURIComponent(`${stremioId}:${season}:${episode}`)}.json`,addon.manifestUrl)
}
const mediaHostAllowed=(host:string)=>/^(?=.{4,253}$)[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)&&!/(?:\.local|\.localhost|\.internal|\.invalid)$/.test(host)
export function parseStremioStreams(payload:unknown,providerId:string):AddonStream[]{
 const root=object(payload)
 if(!Array.isArray(root.streams)||root.streams.length>50)throw new Error('Invalid stream response')
 const result:AddonStream[]=[]
 for(const raw of root.streams){
  try{
   const obj=object(raw),url=new URL(nonempty(obj.url,2048))
   if(url.protocol!=='https:'||url.username||url.password||!mediaHostAllowed(url.hostname))continue
   const format=url.pathname.toLowerCase().endsWith('.m3u8')?'hls':url.pathname.toLowerCase().endsWith('.mp4')?'mp4':null
   if(!format)continue
   const tracks:AddonTrack[]=[]
   if(Array.isArray(obj.subtitles))for(const rawTrack of obj.subtitles.slice(0,20)){
    try{
     const sub=object(rawTrack),lang=nonempty(sub.lang,15).toLowerCase(),subUrl=new URL(nonempty(sub.url,2048))
     if(!/^[a-z]{2,3}(?:-[a-z0-9]+)*$/.test(lang)||subUrl.protocol!=='https:'||subUrl.username||subUrl.password||!mediaHostAllowed(subUrl.hostname))continue
     tracks.push({lang,label:lang==='id'?'Bahasa Indonesia':lang,url:subUrl.toString()})
    }catch{continue}
   }
   result.push({format,url:url.toString(),tracks,subtitleMode:tracks.length?'soft':'unknown',quality:typeof obj.name==='string'?obj.name.slice(0,80):undefined,providerId})
  }catch{continue}
  if(result.length>=20)break
 }
 return result
}

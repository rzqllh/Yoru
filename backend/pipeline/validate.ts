export type SubtitleTrack = { lang:string; label:string; url:string }
export type Stream = {format:'hls'|'mp4';url:string;subtitleMode:'hard'|'soft'|'unknown';tracks:SubtitleTrack[];quality?:string}
export type EpisodeConfig = {number:number;title?:string;streams:Stream[]}
export type ProviderConfig = {id:string;name:string;anime:{malId:number;title?:string;episodes:EpisodeConfig[]}[]}

function record(value:unknown):Record<string,unknown> {
 if(!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected object')
 return value as Record<string,unknown>
}
function string(value:unknown, field:string,max=200):string{
 if(typeof value!=='string' || !value.trim() || value.length>max) throw new Error(`Invalid ${field}`)
 return value.trim()
}
const privateIp = /^(?:localhost|(?:\d{1,3}\.){3}\d{1,3}|\[[^\]]+\])$/i
export function assertSafeMediaUrl(value:unknown):string {
 const url = new URL(string(value,'url',2048))
 if(url.protocol !== 'https:' || url.username || url.password) throw new Error('Only credential-free HTTPS URLs allowed')
 const hostname=url.hostname.toLowerCase()
 if(privateIp.test(hostname)||hostname.endsWith('.local')||hostname.endsWith('.internal')||hostname.endsWith('.localhost')||hostname==='0.0.0.0') throw new Error('Private and local hosts are prohibited')
 if(!hostname.includes('.')) throw new Error('Invalid public hostname')
 return url.toString()
}
export function validateProviderConfig(input:unknown):ProviderConfig {
 const obj=record(input)
 const id=string(obj.id,'provider id',64)
 if(!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('Invalid provider id')
 const name=string(obj.name,'provider name')
 if(!Array.isArray(obj.anime)||obj.anime.length>200) throw new Error('Invalid anime entries')
 const seenAnimeIds=new Set<number>()
 const anime=obj.anime.map(item=>{
  const a=record(item)
  const malId=Number(a.malId)
  if(!Number.isSafeInteger(malId)||malId<=0) throw new Error('Invalid MAL id')
  if(seenAnimeIds.has(malId))throw new Error('Duplicate MAL id')
  seenAnimeIds.add(malId)
  if(!Array.isArray(a.episodes)||a.episodes.length>2000) throw new Error('Invalid episodes')
  const seenEpisodeNumbers=new Set<number>()
  const episodes=a.episodes.map(item=>{
   const ep=record(item);const number=Number(ep.number)
   if(!Number.isSafeInteger(number)||number<1) throw new Error('Invalid episode number')
   if(seenEpisodeNumbers.has(number))throw new Error('Duplicate episode number')
   seenEpisodeNumbers.add(number)
   if(!Array.isArray(ep.streams)||ep.streams.length>20) throw new Error('Invalid streams')
   const streams=ep.streams.map(item=>{
    const stream=record(item)
    const format=stream.format
    const subtitleMode=stream.subtitleMode
    if(format!=='hls'&&format!=='mp4') throw new Error('Unsupported format')
    if(!['hard','soft','unknown'].includes(String(subtitleMode))) throw new Error('Invalid subtitle mode')
    if(!Array.isArray(stream.tracks)||stream.tracks.length>20) throw new Error('Invalid tracks')
    return {format,url:assertSafeMediaUrl(stream.url),subtitleMode:subtitleMode as Stream['subtitleMode'],
      quality:typeof stream.quality==='string'?stream.quality.slice(0,30):undefined,
      tracks:stream.tracks.map(t=>{
        const track=record(t);const lang=string(track.lang,'track lang',15).toLowerCase();
        if(!/^[a-z]{2,3}(?:-[a-z0-9]+)*$/.test(lang))throw new Error('Invalid language code')
        return {lang,label:string(track.label,'track label',60),url:assertSafeMediaUrl(track.url)}
      })} satisfies Stream
   })
   return {number,title:typeof ep.title==='string'?ep.title.slice(0,120):undefined,streams}
  })
  return {malId,title:typeof a.title==='string'?a.title.slice(0,160):undefined,episodes}
 })
 return {id,name,anime}
}

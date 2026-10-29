/** Fixed third-party iframe player; catalog coverage and actual playback are external claims. */
const ORIGIN='https://www.animeembed.com'
const positive=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>0&&n<=99999999
export interface AnimeEmbedUrlOptions { start?:number; accent?:string }
// Retain both the existing numeric start parameter and the typed options API.
export function animeEmbedUrl(malId:number,episode:number,input?:number|AnimeEmbedUrlOptions):string{
 if(!positive(malId)||!positive(episode))throw new Error('Invalid anime or episode ID')
 const options=typeof input==='number'?{start:Number.isFinite(input)&&input>0?input:0}:input
 const params=new URLSearchParams()
 if(options?.start!==undefined){
  if(typeof options.start!=='number'||!Number.isFinite(options.start)||options.start<0||options.start>604800)
   throw new Error('Invalid start offset')
  const seconds=Math.floor(options.start)
  if(seconds>0)params.set('start',String(seconds))
 }
 if(options?.accent){
  const accent=options.accent.replace(/^#/,'')
  if(/^[0-9a-fA-F]{6}$/.test(accent))params.set('accent',accent.toLowerCase())
 }
 const query=params.toString()
 return `${ORIGIN}/embed/mal/${malId}/${episode}${query?`?${query}`:''}`
}
export function externalEpisode(malId:number,episode:number){
 if(!positive(malId)||!positive(episode))throw new Error('Invalid anime or episode ID')
 return {id:`public-embed:${malId}:${episode}`,animeId:`mal:${malId}`,number:episode,title:`Episode ${episode}`,providerId:'public-embed'}
}
export function externalStream(ref:string,start?:number){
 const match=/^public-embed:([1-9]\d{0,7}):([1-9]\d{0,7})$/.exec(ref)
 if(!match)return []
 const malId=Number(match[1]),episode=Number(match[2])
 return [{id:`public-embed:${malId}:${episode}:0`,providerId:'External embed (unverified)',format:'embed' as const,url:animeEmbedUrl(malId,episode,start),subtitleMode:'unknown' as const,tracks:[],quality:'External player'}]
}

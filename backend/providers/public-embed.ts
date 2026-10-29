/** Fixed third-party iframe player; catalog coverage and actual playback are external claims. */
const ORIGIN='https://www.animeembed.com'
const positive=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>0&&n<=99999999
export function animeEmbedUrl(malId:number,episode:number):string{
 if(!positive(malId)||!positive(episode))throw new Error('Invalid anime or episode ID')
 return `${ORIGIN}/embed/mal/${malId}/${episode}`
}
export function externalEpisode(malId:number,episode:number){
 if(!positive(malId)||!positive(episode))throw new Error('Invalid anime or episode ID')
 return {id:`public-embed:${malId}:${episode}`,animeId:`mal:${malId}`,number:episode,title:`Episode ${episode}`,providerId:'public-embed'}
}
export function externalStream(ref:string){
 const match=/^public-embed:([1-9]\d{0,7}):([1-9]\d{0,7})$/.exec(ref)
 if(!match)return []
 const malId=Number(match[1]),episode=Number(match[2])
 return [{id:`public-embed:${malId}:${episode}:0`,providerId:'External embed (unverified)',format:'embed' as const,url:animeEmbedUrl(malId,episode),subtitleMode:'unknown' as const,tracks:[],quality:'External player'}]
}

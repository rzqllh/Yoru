import type {Anime,CatalogResponse,Episode,Stream} from '../types'
/** Bound the entire response, including body reads; navigation aborts stay silent. */
export async function api<T>(url:string,signal?:AbortSignal,timeoutMs=30000):Promise<T>{
 const controller=new AbortController()
 const abort=()=>controller.abort(signal?.reason)
 if(signal?.aborted)abort()
 else signal?.addEventListener('abort',abort,{once:true})
 let timedOut=false
 const timer=setTimeout(()=>{timedOut=true;controller.abort()},timeoutMs)
 try{
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}})
  const json=response.headers.get('content-type')?.toLowerCase().includes('application/json')
  if(!response.ok){
   let message=`HTTP ${response.status}`
   if(json){
    try{
     const body:unknown=await response.json()
     if(body&&typeof body==='object'){
      const record=body as Record<string,unknown>
      const value=record.message||record.error
      if(typeof value==='string'&&value.trim())message=value
     }
    }catch{/* Retain HTTP status when an error body is malformed. */}
   }
   throw new Error(message)
  }
  if(!json)throw new Error('Layanan Yoru mengirim respons yang tidak valid. Coba lagi nanti.')
  try{return await response.json() as T}
  catch(e){
   if(controller.signal.aborted)throw e
   throw new Error('Layanan Yoru mengirim respons yang tidak valid. Coba lagi nanti.')
  }
 }catch(e){
  if(timedOut&&!signal?.aborted)throw new Error('Layanan Yoru terlalu lama merespons. Silakan coba lagi.')
  throw e
 }finally{
  clearTimeout(timer)
  signal?.removeEventListener('abort',abort)
 }
}
async function catalogResponse(url:string,signal?:AbortSignal):Promise<CatalogResponse>{
 const result=await api<CatalogResponse>(url,signal,18000)
 if(!result||!Array.isArray(result.items)||typeof result.hasNext!=='boolean'||!Number.isSafeInteger(result.page)||result.page<1)
  throw new Error('Data katalog belum dapat dibaca. Silakan coba lagi.')
 if(!result.items.every(item=>item&&Number.isSafeInteger(item.malId)&&item.malId>0&&item.id===`mal:${item.malId}`&&
  typeof item.title==='string'&&Array.isArray(item.genres)&&item.genres.every(genre=>typeof genre==='string')&&
  (item.score===null||(typeof item.score==='number'&&Number.isFinite(item.score)))))
  throw new Error('Data katalog belum dapat dibaca. Silakan coba lagi.')
 return result
}
export const catalog=(kind:'season'|'top'|'upcoming',page=1,signal?:AbortSignal)=>catalogResponse(`/api/anime/discover?kind=${kind}&page=${page}`,signal)
export const search=(query:string,page=1,signal?:AbortSignal)=>catalogResponse(`/api/anime/search?q=${encodeURIComponent(query)}&page=${page}`,signal)
export const detail=(malId:number,signal?:AbortSignal)=>api<Anime>(`/api/anime/${malId}`,signal)
export const episodes=(malId:number,page=1,signal?:AbortSignal)=>api<{items:Episode[];hasNext:boolean;page:number}>(`/api/anime/${malId}/episodes?page=${page}`,signal)
export const providerEpisodes=(malId:number,signal?:AbortSignal)=>api<{items:Episode[]}>(`/api/anime/${malId}/provider-episodes`,signal)
export type UnavailableStream={kind:'torrent'|'external'|'unsupported';label:string;reason:string}
export const streams=(providerEpisodeId:string,signal?:AbortSignal,start=0)=>api<{items:Stream[];unavailable?:UnavailableStream[]}>(`/api/streams?episodeRef=${encodeURIComponent(providerEpisodeId)}${start>0?`&start=${Math.floor(start)}`:''}`,signal)
export const providers=()=>api<{providers:{id:string;name:string;animeCount:number|null}[];warnings?:string[]}>('/api/providers')


export type BrowseRequest={
 kind:'season'|'top'|'upcoming';query:string;genre:string;format:string;
 minimumScore:number;year:string;order:string
}
export const browseFiltered=(filters:BrowseRequest,page=1,signal?:AbortSignal)=>{
 const params=new URLSearchParams({kind:filters.kind,page:String(page)})
 if(filters.query)params.set('q',filters.query)
 if(filters.genre)params.set('genre',filters.genre)
 if(filters.format)params.set('type',filters.format)
 if(filters.minimumScore)params.set('minScore',String(filters.minimumScore))
 if(filters.year)params.set('year',filters.year)
 if(filters.order!=='default')params.set('order',filters.order)
 return catalogResponse('/api/anime/browse?'+params.toString(),signal)
}


export type DailyTrendResponse={items:Anime[];source:'AniList';sourceUrl:'https://anilist.co';date:string;metric:'daily-media-activity'}
export const dailyTrends=(signal?:AbortSignal)=>api<DailyTrendResponse>('/api/anime/daily-trends',signal)

export type WatchGuideEntry={
 aniListId:number;malId:number|null;title:string;format:string;year:number|null;month:number|null;
 relation:'CURRENT'|'PREQUEL'|'SEQUEL'|'SIDE_STORY'|'ALTERNATIVE'|'SPIN_OFF'|'PARENT'|'SUMMARY'|'OTHER'|'COMPILATION'|'CONTAINS'|'SAME_UNIVERSE';image:string|null
}
export type WatchGraphNode=WatchGuideEntry&{distance:0|1|2;viaAniListId:number|null}
export type WatchGraphEdge={from:number;to:number;relation:WatchGuideEntry['relation']}
export type WatchGuideResponse={
 source:'AniList';sourceUrl:string;scope:'direct-relations';animeMalId:number;items:WatchGuideEntry[];
 graph?:{nodes:WatchGraphNode[];edges:WatchGraphEdge[];status:'expanded'|'limited'|'upstream-unavailable';
 scannedDirect:number;directTotal:number;truncated:boolean;note:string}
}
export const watchGuide=(malId:number,signal?:AbortSignal,depth:1|2=1)=>api<WatchGuideResponse>(
 `/api/anime/${malId}/watch-guide${depth===2?'?depth=2':''}`,signal)

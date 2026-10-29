import type {Anime,CatalogResponse,Episode,Stream} from '../types'
export async function api<T>(url:string,signal?:AbortSignal):Promise<T>{
 const response=await fetch(url,{signal,headers:{Accept:'application/json'}})
 if(!response.ok){let message=`HTTP ${response.status}`;try{const body=await response.json();message=body.message||body.error||message}catch{}throw new Error(message)}
 return response.json() as Promise<T>
}
export const catalog=(kind:'season'|'top'|'upcoming',page=1,signal?:AbortSignal)=>api<CatalogResponse>(`/api/anime/discover?kind=${kind}&page=${page}`,signal)
export const search=(query:string,page=1,signal?:AbortSignal)=>api<CatalogResponse>(`/api/anime/search?q=${encodeURIComponent(query)}&page=${page}`,signal)
export const detail=(malId:number,signal?:AbortSignal)=>api<Anime>(`/api/anime/${malId}`,signal)
export const episodes=(malId:number,page=1,signal?:AbortSignal)=>api<{items:Episode[];hasNext:boolean;page:number}>(`/api/anime/${malId}/episodes?page=${page}`,signal)
export const providerEpisodes=(malId:number,signal?:AbortSignal)=>api<{items:Episode[]}>(`/api/anime/${malId}/provider-episodes`,signal)
export const streams=(providerEpisodeId:string,signal?:AbortSignal,start=0)=>api<{items:Stream[]}>(`/api/streams?episodeRef=${encodeURIComponent(providerEpisodeId)}${start>0?`&start=${Math.floor(start)}`:''}`,signal)
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
 return api<CatalogResponse>('/api/anime/browse?'+params.toString(),signal)
}


export type DailyTrendResponse={items:Anime[];source:'AniList';sourceUrl:'https://anilist.co';date:string;metric:'daily-media-activity'}
export const dailyTrends=(signal?:AbortSignal)=>api<DailyTrendResponse>('/api/anime/daily-trends',signal)

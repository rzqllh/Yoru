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
export const streams=(providerEpisodeId:string,signal?:AbortSignal)=>api<{items:Stream[]}>(`/api/streams?episodeRef=${encodeURIComponent(providerEpisodeId)}`,signal)
export const providers=()=>api<{providers:{id:string;name:string;animeCount:number}[]}>('/api/providers')

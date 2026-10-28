import { normalizeAnime, normalizeEpisode, normalizeList } from './normalize.js'

const BASE = 'https://api.jikan.moe/v4'
const cache = new Map<string,{ expires:number; payload:unknown }>()
const inflight = new Map<string,Promise<unknown>>()
const CACHE_MS=1000*60*15

async function request(path:string):Promise<Record<string,unknown>> {
 const current=cache.get(path)
 if(current&&current.expires>Date.now())return current.payload as Record<string,unknown>
 const pending=inflight.get(path)
 if(pending)return pending as Promise<Record<string,unknown>>
 const operation=(async()=>{
  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),9000)
  try{
   const response=await fetch(`${BASE}${path}`,{signal:controller.signal,headers:{Accept:'application/json','User-Agent':'YoruAnimePortfolio/1.0'}})
   if(!response.ok)throw new Error(`Jikan returned HTTP ${response.status}`)
   const data=await response.json() as Record<string,unknown>
   cache.set(path,{payload:data,expires:Date.now()+CACHE_MS})
   if(cache.size>100)cache.delete(cache.keys().next().value ?? '')
   return data
  }finally{clearTimeout(timer)}
 })()
 inflight.set(path,operation)
 try{return await operation}finally{inflight.delete(path)}
}
export async function getDiscover(kind:'season'|'top'|'upcoming',page:number){
 const route=kind==='season'?'/seasons/now':kind==='upcoming'?'/seasons/upcoming':'/top/anime'
 const data=await request(`${route}?page=${page}&limit=24${kind==='top'?'&filter=bypopularity':''}`)
 return {items:normalizeList(data.data),page,hasNext:(data.pagination as {has_next_page?:boolean}|undefined)?.has_next_page??false}
}
export async function searchAnime(query:string,page:number){
 const data=await request(`/anime?q=${encodeURIComponent(query)}&page=${page}&limit=24&order_by=popularity&sort=asc`)
 return {items:normalizeList(data.data),page,hasNext:(data.pagination as {has_next_page?:boolean}|undefined)?.has_next_page??false}
}
export async function getAnime(id:number){
 const data=await request(`/anime/${id}/full`)
 return normalizeAnime(data.data as Record<string,unknown>)
}
export async function getAnimeEpisodes(id:number,page:number){
 const data=await request(`/anime/${id}/episodes?page=${page}`)
 return {items:(Array.isArray(data.data)?data.data:[]).map(x=>normalizeEpisode(`mal:${id}`,x as Record<string,unknown>)),page,hasNext:(data.pagination as {has_next_page?:boolean}|undefined)?.has_next_page??false}
}

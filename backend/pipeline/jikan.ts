import { normalizeAnime, normalizeEpisode, normalizeList } from './normalize.js'
import {getCatalogEndpoint} from './catalog-sources.js'
import {getAnimeGenreOptions} from './anime-genres.js'

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
  const timer=setTimeout(()=>controller.abort(),12000)
  try{
   const response=await fetch(getCatalogEndpoint(path),{signal:controller.signal,headers:{Accept:'application/json','User-Agent':'YoruAnimePortfolio/1.0'}})
   if(!response.ok)throw new Error(`Metadata service returned HTTP ${response.status}`)
   const payload:unknown=await response.json()
   if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('INVALID_CATALOG_RESPONSE')
   const data=payload as Record<string,unknown>
   const single=/^\/anime\/[1-9]\d*\/full$/.test(path)
   if(single?(!data.data||typeof data.data!=='object'||Array.isArray(data.data)):!Array.isArray(data.data))
    throw new Error('INVALID_CATALOG_RESPONSE')
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


export type BrowseFilters={kind:'season'|'top'|'upcoming';page:number;q?:string;genre?:string;type?:string;minScore?:number;year?:number;order?:'default'|'rating'|'newest'}
const genreIds:Record<string,number>={
 Action:1,Adventure:2,Comedy:4,Drama:8,Fantasy:10,Horror:14,
 Mystery:7,Romance:22,'Sci-Fi':24,'Slice of Life':36,Sports:30,Supernatural:37
}
/** Jikan server-side filtering; unlike an in-browser slice it covers later pages too. */
export async function browseAnime(input:BrowseFilters){
 const {kind,page}=input
 if(!Number.isInteger(page)||page<1||page>100)throw new Error('INVALID_PAGE')
 const params=new URLSearchParams({page:String(page),limit:'24',sfw:'true'})
 const query=(input.q||'').trim()
 if(query)params.set('q',query.slice(0,120))
 if(input.genre){
  let id:number|undefined
  if(Object.hasOwn(genreIds,input.genre))id=genreIds[input.genre]
  else if(/^mal:[1-9]\\d{0,2}$/.test(input.genre)){
   const options=await getAnimeGenreOptions()
   const candidate=Number(input.genre.slice(4))
   id=options.items.find(item=>item.id===candidate)?.id
  }
  if(!id)throw new Error('INVALID_GENRE')
  params.set('genres',String(id))
 }
 if(input.type)params.set('type',input.type.toLowerCase())
 if(input.minScore)params.set('min_score',String(input.minScore))
 if(input.year){
  params.set('start_date',String(input.year)+'-01-01')
  params.set('end_date',String(input.year)+'-12-31')
 }
 if(!query){
  if(kind==='upcoming')params.set('status','upcoming')
  else if(kind==='season')params.set('status','airing')
 }
 if(input.order==='rating'){params.set('order_by','score');params.set('sort','desc')}
 else if(input.order==='newest'){params.set('order_by','start_date');params.set('sort','desc')}
 else{params.set('order_by','popularity');params.set('sort','asc')}
 const data=await request('/anime?'+params.toString())
 return {items:normalizeList(data.data),page,hasNext:(data.pagination as {has_next_page?:boolean}|undefined)?.has_next_page??false}
}

import {getCatalogEndpoint} from './catalog-sources.js'

export type AnimeGenreOption={id:number;name:string}
export type GenreOptionsResponse={
 items:AnimeGenreOption[];source:'Tenrai'|'built-in';status:'upstream'|'fallback'
}

const legacyGenreIds:Record<string,number>={
 Action:1,Adventure:2,Comedy:4,Drama:8,Fantasy:10,Horror:14,
 Mystery:7,Romance:22,'Sci-Fi':24,'Slice of Life':36,Sports:30,Supernatural:37
}
const excludedAdultIds=new Set([9,12,49])
const legacyItems=Object.entries(legacyGenreIds).map(([name,id])=>({id,name}))
const fallback:GenreOptionsResponse={items:legacyItems,source:'built-in',status:'fallback'}
const CACHE_MS=15*60*1000
const RETRY_MS=60*1000
let cached:{expires:number;value:GenreOptionsResponse}|null=null
let inflight:Promise<GenreOptionsResponse>|null=null

/** Accept only the source's MAL genres; themes, demographics and AniList tags are separate taxonomies. */
export function normalizeAnimeGenres(payload:unknown):AnimeGenreOption[]{
 if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('INVALID_GENRE_RESPONSE')
 const rows=(payload as Record<string,unknown>).data
 if(!Array.isArray(rows))throw new Error('INVALID_GENRE_RESPONSE')
 const ids=new Set<number>()
 const names=new Set<string>()
 const genres:AnimeGenreOption[]=[]
 for(const row of rows){
  if(!row||typeof row!=='object'||Array.isArray(row))continue
  const value=row as Record<string,unknown>
  const id=value.mal_id
  const name=value.name
  if(typeof id!=='number'||!Number.isSafeInteger(id)||id<1||id>1000||excludedAdultIds.has(id))continue
  if(typeof name!=='string'||name.length<1||name.length>70||name!==name.trim()||!(/[A-Za-z]/.test(name))||!(/^[A-Za-z0-9 &()'.,/-]+$/.test(name)))continue
  if(ids.has(id)||names.has(name))continue
  ids.add(id);names.add(name)
  genres.push({id,name})
 }
 // Fail closed on unexpected/partial upstream taxonomy, rather than showing broken options.
 if(!legacyItems.every(genre=>genres.some(item=>item.id===genre.id&&item.name===genre.name)))
  throw new Error('INCOMPLETE_GENRE_RESPONSE')
 return genres.sort((a,b)=>a.name.localeCompare(b.name,'en'))
}

export async function getAnimeGenreOptions():Promise<GenreOptionsResponse>{
 if(cached&&cached.expires>Date.now())return cached.value
 if(inflight)return inflight
 const operation=(async()=>{
  const controller=new AbortController()
  const timer=setTimeout(()=>controller.abort(),10000)
  try{
   const response=await fetch(getCatalogEndpoint('/genres/anime?filter=genres'),{
    signal:controller.signal,headers:{Accept:'application/json','User-Agent':'YoruAnimePortfolio/1.0'}
   })
   if(!response.ok)throw new Error('GENRE_UPSTREAM_UNAVAILABLE')
   const items=normalizeAnimeGenres(await response.json() as unknown)
   const value:GenreOptionsResponse={items,source:'Tenrai',status:'upstream'}
   cached={value,expires:Date.now()+CACHE_MS}
   return value
  }catch{
   cached={value:fallback,expires:Date.now()+RETRY_MS}
   return fallback
  }finally{clearTimeout(timer)}
 })()
 inflight=operation
 try{return await operation}finally{inflight=null}
}

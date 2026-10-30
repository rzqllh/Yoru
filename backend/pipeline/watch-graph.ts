/** Bounded AniList graph retrieval; pure graph normalization lives in watch-graph-core. */
import {getWatchGuide} from './watch-guide.js'
import {graphFrontier,normalizeWatchGraph,type WatchGraphResult} from './watch-graph-core.js'
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{}
const QUERY=`query YoruGraph($ids:[Int]){Page(page:1,perPage:10){media(id_in:$ids,type:ANIME){id idMal type format startDate{year month} title{english romaji native} coverImage{medium} relations{edges{relationType node{id idMal type format startDate{year month} title{english romaji native} coverImage{medium}}}}}}}`
const cache=new Map<number,{expires:number;value:WatchGraphResult}>()
const pending=new Map<number,Promise<WatchGraphResult>>()
let budgetStart=0,budgetUsed=0
function permit(now:number){
 if(now-budgetStart>=60000){budgetStart=now;budgetUsed=0}
 if(budgetUsed>=12)return false
 budgetUsed++
 return true
}
async function load(malId:number):Promise<WatchGraphResult>{
 const guide=await getWatchGuide(malId)
 const ids=graphFrontier(guide)
 if(!ids.length)return normalizeWatchGraph(guide,{data:{Page:{media:[]}}})
 if(!permit(Date.now()))return normalizeWatchGraph(guide,null,'limited')
 const controller=new AbortController()
 const timer=setTimeout(()=>controller.abort(),7000)
 try{
  const response=await fetch('https://graphql.anilist.co',{
   method:'POST',redirect:'error',signal:controller.signal,
   headers:{'content-type':'application/json',accept:'application/json'},
   body:JSON.stringify({query:QUERY,variables:{ids}})
  })
  if(!response.ok||!String(response.headers.get('content-type')||'').includes('json'))
   return normalizeWatchGraph(guide,null,'upstream-unavailable')
  const text=await response.text()
  if(text.length>350000)return normalizeWatchGraph(guide,null,'limited')
  const raw=JSON.parse(text)
  if(!Array.isArray(obj(obj(obj(raw).data).Page).media))
   return normalizeWatchGraph(guide,null,'upstream-unavailable')
  return normalizeWatchGraph(guide,raw)
 }catch{
  return normalizeWatchGraph(guide,null,'upstream-unavailable')
 }finally{clearTimeout(timer)}
}
export async function getWatchGraph(malId:number):Promise<WatchGraphResult>{
 if(!Number.isSafeInteger(malId)||malId<1||malId>999999999)throw new Error('INVALID_ID')
 const cached=cache.get(malId)
 if(cached&&cached.expires>Date.now())return cached.value
 const existing=pending.get(malId)
 if(existing)return existing
 const work=load(malId).then(value=>{
  if(cache.size>=100)cache.delete(cache.keys().next().value??0)
  cache.set(malId,{value,expires:Date.now()+(value.graph.status==='expanded'?20*60*1000:60*1000)})
  return value
 }).finally(()=>pending.delete(malId))
 pending.set(malId,work)
 return work
}

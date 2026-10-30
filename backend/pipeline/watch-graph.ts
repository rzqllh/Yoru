/**
 * Bounded fan-out graph for anime watch-order discovery.
 * AniList metadata describes connections, NOT episode chronology, canon, or
 * a community-endorsed first-time watch path. No AI-inferred order is returned.
 */
import {getWatchGuide,normalizeEntry,type WatchGuideEntry,type WatchGuidePayload,type WatchRelation} from './watch-guide.js'
export type WatchGraphNode=WatchGuideEntry&{distance:0|1|2;viaAniListId:number|null}
export type WatchGraphEdge={from:number;to:number;relation:WatchRelation}
export type WatchGraphResult=WatchGuidePayload&{
 graph:{
  nodes:WatchGraphNode[];edges:WatchGraphEdge[];
  status:'expanded'|'limited'|'upstream-unavailable';
  scannedDirect:number;directTotal:number;truncated:boolean;
  note:string
 }
}
const FRONTIER_MAX=10
const GRAPH_MAX=75
const RELATIONS=new Set<WatchRelation>([
 'PREQUEL','SEQUEL','SIDE_STORY','ALTERNATIVE','SPIN_OFF','PARENT',
 'SUMMARY','OTHER','COMPILATION','CONTAINS','SAME_UNIVERSE'])
const relPriority=(relation:WatchRelation)=>relation==='PREQUEL'||relation==='SEQUEL'?0:
 relation==='CURRENT'?1:relation==='SIDE_STORY'||relation==='PARENT'?2:3
const obj=(v:unknown):Record<string,unknown>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{}
const safeId=(v:unknown):number|null=>Number.isSafeInteger(v)&&Number(v)>0?Number(v):null
export function graphFrontier(guide:WatchGuidePayload):number[]{
 return guide.items.filter(n=>n.relation!=='CURRENT')
  .sort((a,b)=>relPriority(a.relation)-relPriority(b.relation)||a.aniListId-b.aniListId)
  .slice(0,FRONTIER_MAX).map(n=>n.aniListId)
}
export function normalizeWatchGraph(guide:WatchGuidePayload,raw:unknown,status:'expanded'|'limited'|'upstream-unavailable'='expanded'):WatchGraphResult{
 const root=guide.items[0]
 if(!root||root.relation!=='CURRENT')throw new Error('INVALID_WATCH_GRAPH_ROOT')
 const nodes=new Map<number,WatchGraphNode>()
 for(const item of guide.items){
  nodes.set(item.aniListId,{...item,distance:item.aniListId===root.aniListId?0:1,
   viaAniListId:item.aniListId===root.aniListId?null:root.aniListId})
 }
 const edges:WatchGraphEdge[]=[]
 const seen=new Set<string>()
 function addEdge(from:number,to:number,relation:WatchRelation){
  const key=`${from}:${to}:${relation}`
  if(!seen.has(key)){seen.add(key);edges.push({from,to,relation})}
 }
 for(const item of guide.items.slice(1))addEdge(root.aniListId,item.aniListId,item.relation)
 const page=obj(obj(raw).data).Page
 const media=obj(page).media
 const rows=Array.isArray(media)?media.slice(0,FRONTIER_MAX):[]
 const allowed=new Set(graphFrontier(guide))
 let clipped=guide.items.length-1>FRONTIER_MAX
 let scanned=0
 for(const rowRaw of rows){
  const row=obj(rowRaw)
  const fromId=safeId(row.id)
  if(!fromId||!allowed.has(fromId)||row.type!=='ANIME')continue
  scanned++
  const rels=obj(row.relations).edges
  if(!Array.isArray(rels))continue
  if(rels.length>60)clipped=true
  for(const edgeRaw of rels.slice(0,60)){
   const edge=obj(edgeRaw)
   const relation=edge.relationType as WatchRelation
   if(!RELATIONS.has(relation))continue
   const normalized=normalizeEntry(edge.node,relation)
   if(!normalized)continue
   const existing=nodes.get(normalized.aniListId)
   if(!existing){
    if(nodes.size>=GRAPH_MAX){clipped=true;continue}
    nodes.set(normalized.aniListId,{...normalized,distance:2,viaAniListId:fromId})
   }
   addEdge(fromId,normalized.aniListId,relation)
  }
 }
 const missing=allowed.size>scanned
 const complete=status==='expanded'&&!clipped&&!missing
 const mode=complete?'expanded':status==='upstream-unavailable'?'upstream-unavailable':'limited'
 const note=mode==='upstream-unavailable'?
  'Perluasan sedang tidak tersedia. Hubungan langsung tetap dapat dilihat.':
  mode==='limited'?
  'Penelusuran dibatasi untuk menjaga beban API. Hasil belum mewakili seluruh franchise.':
  'Maksimal dua tingkat hubungan dari judul ini. Ini bukan kronologi canon atau panduan menonton terkurasi.'
 return {...guide,graph:{nodes:[...nodes.values()],edges,status:mode,
  scannedDirect:scanned,directTotal:guide.items.length-1,truncated:mode!=='expanded',note}}
}
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
  if(!Array.isArray(obj(obj(raw).data).Page&&obj(obj(obj(raw).data).Page).media))
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

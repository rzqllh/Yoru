import type {WatchGuideEntry,WatchGuidePayload,WatchRelation} from './watch-guide.js'
export type WatchGraphNode=WatchGuideEntry&{distance:0|1|2;viaAniListId:number|null}
export type WatchGraphEdge={from:number;to:number;relation:WatchRelation}
export type WatchGraphResult=WatchGuidePayload&{
 graph:{nodes:WatchGraphNode[];edges:WatchGraphEdge[];
  status:'expanded'|'limited'|'upstream-unavailable';
  scannedDirect:number;directTotal:number;truncated:boolean;note:string}
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
/** Mirror the narrowed AniList node contract without runtime .js imports.
 * Pure normalizers are testable with Node 22 strip-types before transpilation.
 */
function normalizeEntry(raw:unknown,relation:WatchRelation):WatchGuideEntry|null{
 const item=obj(raw)
 const aniListId=safeId(item.id)
 if(!aniListId||item.type!=='ANIME')return null
 const title=obj(item.title)
 const name=[title.english,title.romaji,title.native].find(v=>typeof v==='string'&&v.trim())
 if(typeof name!=='string')return null
 const date=obj(item.startDate)
 const image=obj(item.coverImage).medium
 const year=Number.isInteger(date.year)&&Number(date.year)>=1900&&Number(date.year)<=2200?Number(date.year):null
 const month=Number.isInteger(date.month)&&Number(date.month)>=1&&Number(date.month)<=12?Number(date.month):null
 return {aniListId,malId:safeId(item.idMal),title:name.trim().slice(0,180),
  format:typeof item.format==='string'?item.format.trim().slice(0,180):'ANIME',
  year,month,relation,image:typeof image==='string'&&image.startsWith('https://')?image.trim().slice(0,180):null}
}

export function normalizeWatchGraph(guide:WatchGuidePayload,raw:unknown,status:'expanded'|'limited'|'upstream-unavailable'='expanded'):WatchGraphResult{
 const root=guide.items[0]
 if(root?.relation!=='CURRENT')throw new Error('INVALID_WATCH_GRAPH_ROOT')
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

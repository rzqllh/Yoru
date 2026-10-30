/**
 * AniList relation explorer. This endpoint is evidence for directly linked
 * ANIME nodes only; it is NOT a full/chronological/curated watch order.
 */
export type WatchRelation='CURRENT'|'PREQUEL'|'SEQUEL'|'SIDE_STORY'|'ALTERNATIVE'|'SPIN_OFF'|'PARENT'|'SUMMARY'|'OTHER'|'COMPILATION'|'CONTAINS'|'SAME_UNIVERSE'
export type WatchGuideEntry={
 aniListId:number;malId:number|null;title:string;format:string;year:number|null;month:number|null;
 relation:WatchRelation;image:string|null
}
export type WatchGuidePayload={
 source:'AniList';sourceUrl:string;scope:'direct-relations';animeMalId:number;items:WatchGuideEntry[]
}
const QUERY=`query YoruWatchGuide($idMal:Int!){Media(idMal:$idMal,type:ANIME){id idMal type format startDate{year month} title{english romaji native} coverImage{medium} relations{edges{relationType node{id idMal type format startDate{year month} title{english romaji native} coverImage{medium}}}}}}`
const cache=new Map<number,{expires:number;payload:WatchGuidePayload}>()
const nonBlank=(value:unknown)=>typeof value==='string'?value.trim().slice(0,180):''
const record=(value:unknown):Record<string,unknown>=>value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{}
const id=(value:unknown)=>Number.isSafeInteger(value)&&Number(value)>0?Number(value):null
const year=(value:unknown)=>Number.isInteger(value)&&Number(value)>=1900&&Number(value)<=2200?Number(value):null
const month=(value:unknown)=>Number.isInteger(value)&&Number(value)>=1&&Number(value)<=12?Number(value):null
const accepted=new Set<WatchRelation>(['PREQUEL','SEQUEL','SIDE_STORY','ALTERNATIVE','SPIN_OFF','PARENT','SUMMARY','OTHER','COMPILATION','CONTAINS','SAME_UNIVERSE'])
export function normalizeEntry(raw:unknown,relation:WatchRelation):WatchGuideEntry|null{
 const item=record(raw)
 const aniListId=id(item.id)
 if(!aniListId||item.type!=='ANIME')return null
 const title=record(item.title)
 const name=nonBlank(title.english)||nonBlank(title.romaji)||nonBlank(title.native)
 if(!name)return null
 const start=record(item.startDate)
 const cover=record(item.coverImage)
 const image=nonBlank(cover.medium)
 return {aniListId,malId:id(item.idMal),title:name,format:nonBlank(item.format)||'ANIME',
  year:year(start.year),month:month(start.month),relation,image:image.startsWith('https://')?image:null}
}
export function normalizeWatchGuide(raw:unknown,requestedMalId:number):WatchGuidePayload{
 if(!Number.isSafeInteger(requestedMalId)||requestedMalId<=0)throw new Error('BAD_MAL_ID')
 const media=record(record(raw).data).Media
 const root=normalizeEntry(media,'CURRENT')
 if(!root||root.malId!==requestedMalId)throw new Error('ANILIST_MAPPING_UNAVAILABLE')
 const items=[root],seen=new Set([root.aniListId])
 const relations=record(record(media).relations)
 const edges=Array.isArray(relations.edges)?relations.edges.slice(0,60):[]
 for(const rawEdge of edges){
  const edge=record(rawEdge),kind=nonBlank(edge.relationType) as WatchRelation
  if(!accepted.has(kind))continue
  const node=normalizeEntry(edge.node,kind)
  if(!node||seen.has(node.aniListId))continue
  seen.add(node.aniListId)
  items.push(node)
  if(items.length>=40)break
 }
 return {source:'AniList',sourceUrl:`https://anilist.co/anime/${root.aniListId}`,
  scope:'direct-relations',animeMalId:requestedMalId,items}
}
export function sortWatchGuideByRelease(items:ReadonlyArray<WatchGuideEntry>):WatchGuideEntry[]{
 return [...items].sort((a,b)=> (a.year??9999)-(b.year??9999) ||
  (a.month??99)-(b.month??99) || a.title.localeCompare(b.title,'id'))
}
export async function getWatchGuide(malId:number):Promise<WatchGuidePayload>{
 if(!Number.isSafeInteger(malId)||malId<=0||malId>999999999)throw new Error('BAD_MAL_ID')
 const existing=cache.get(malId)
 if(existing&&existing.expires>Date.now())return existing.payload
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000)
 try{
  const response=await fetch('https://graphql.anilist.co',{method:'POST',signal:controller.signal,redirect:'error',
   headers:{'content-type':'application/json','accept':'application/json'},
   body:JSON.stringify({query:QUERY,variables:{idMal:malId}})})
  if(!response.ok)throw new Error('ANILIST_UNAVAILABLE')
  const contentType=response.headers.get('content-type')||''
  if(!contentType.includes('json'))throw new Error('ANILIST_RESPONSE_INVALID')
  const text=await response.text()
  if(text.length>200000)throw new Error('ANILIST_RESPONSE_TOO_LARGE')
  const payload=normalizeWatchGuide(JSON.parse(text),malId)
  if(cache.size>=100)cache.delete(cache.keys().next().value ?? 0)
  cache.set(malId,{expires:Date.now()+20*60*1000,payload})
  return payload
 }finally{clearTimeout(timer)}
}

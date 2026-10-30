import type {WatchGuideEntry,WatchGraphNode} from './api'

export type WatchGroup='all'|'tv'|'movie'|'extra'|'branch'|'summary'|'other'
export const WATCH_GROUPS:{id:WatchGroup;label:string}[]=[
 {id:'all',label:'Semua'}, {id:'tv',label:'TV / season'},
 {id:'movie',label:'Film'}, {id:'extra',label:'OVA / special / ONA'},
 {id:'branch',label:'Cabang cerita'}, {id:'summary',label:'Rangkuman'},
 {id:'other',label:'Lainnya'}
]
export function classifyWatchEntry(item:WatchGuideEntry):Exclude<WatchGroup,'all'>{
 if(['ALTERNATIVE','SPIN_OFF','SAME_UNIVERSE'].includes(item.relation))return 'branch'
 if(['SUMMARY','COMPILATION'].includes(item.relation))return 'summary'
 if(item.format==='MOVIE')return 'movie'
 if(['OVA','SPECIAL','ONA'].includes(item.format))return 'extra'
 if(['TV','TV_SHORT'].includes(item.format))return 'tv'
 return 'other'
}
export function filterWatchEntries<T extends WatchGuideEntry>(items:readonly T[],group:WatchGroup):T[]{
 return group==='all'?[...items]:items.filter(x=>classifyWatchEntry(x)===group)
}
export function sortWatchEntries<T extends WatchGuideEntry>(items:readonly T[]):T[]{
 return [...items].sort((a,b)=>(a.year??9999)-(b.year??9999) ||
  (a.month??99)-(b.month??99)||a.title.localeCompare(b.title,'id')||
  a.aniListId-b.aniListId)
}
export function isExtendedNode(item:WatchGuideEntry|WatchGraphNode):item is WatchGraphNode{
 return 'distance' in item&&item.distance===2
}

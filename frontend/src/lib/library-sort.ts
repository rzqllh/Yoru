import type {LibraryEntry} from '../types'

export type LibrarySort='recent'|'title'|'score'|'year'
export const LIBRARY_SORTS:readonly LibrarySort[]=['recent','title','score','year']
export function parseLibrarySort(value:unknown):LibrarySort{
 return typeof value==='string'&&LIBRARY_SORTS.some(choice=>choice===value)?
  value as LibrarySort:'recent'
}
/** Deterministic local-only ordering; missing catalog scores/years sort last. */
export function sortLibraryEntries(items:readonly LibraryEntry[],mode:LibrarySort):LibraryEntry[]{
 const order=(a:LibraryEntry,b:LibraryEntry)=>{
  if(mode==='title'){
   const byTitle=a.anime.title.localeCompare(b.anime.title,'id')
   if(byTitle!==0)return byTitle
  }
  if(mode==='score'){
   const x=typeof a.anime.score==='number'&&Number.isFinite(a.anime.score)?a.anime.score:-1
   const y=typeof b.anime.score==='number'&&Number.isFinite(b.anime.score)?b.anime.score:-1
   if(x!==y)return y-x
  }
  if(mode==='year'){
   const x=Number.isSafeInteger(a.anime.year)?Number(a.anime.year):-1
   const y=Number.isSafeInteger(b.anime.year)?Number(b.anime.year):-1
   if(x!==y)return y-x
  }
  return b.updatedAt-a.updatedAt||
   a.anime.title.localeCompare(b.anime.title,'id')||
   a.anime.malId-b.anime.malId
 }
 return [...items].sort(order)
}

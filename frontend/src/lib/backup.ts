import type {Anime,LibraryEntry,ProgressEntry} from '../types'

type Backup={version:number;library:LibraryEntry[];progress:ProgressEntry[]}
const isRecord=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value)
const isSafeNumber=(value:unknown)=>typeof value==='number'&&Number.isFinite(value)&&value>=0
function isAnime(value:unknown):value is Anime{
 if(!isRecord(value))return false
 return typeof value.id==='string'&&/^(?:mal:)[1-9]\d{0,8}$/.test(value.id)&&
  Number.isSafeInteger(value.malId)&&Number(value.id.slice(4))===value.malId&&
  typeof value.title==='string'&&value.title.length>0&&value.title.length<=500
}
function validLibrary(value:unknown):value is LibraryEntry{
 if(!isRecord(value))return false
 return isAnime(value.anime)&&['planned','watching','completed'].includes(String(value.status))&&isSafeNumber(value.updatedAt)
}
function validProgress(value:unknown):value is ProgressEntry{
 if(!isRecord(value))return false
 return isAnime(value.anime)&&Number.isSafeInteger(value.episode)&&Number(value.episode)>0&&
  isSafeNumber(value.seconds)&&isSafeNumber(value.duration)&&isSafeNumber(value.updatedAt)
}
function uniqueAnimeIds(rows:(LibraryEntry|ProgressEntry)[]):boolean{
 const ids=rows.map(row=>row.anime.id)
 return new Set(ids).size===ids.length
}
export function validateBackup(value:unknown):value is Backup{
 if(!isRecord(value)||value.version!==1||!Array.isArray(value.library)||!Array.isArray(value.progress))return false
 if(value.library.length>10000||value.progress.length>10000)return false
 return value.library.every(validLibrary)&&value.progress.every(validProgress)&&
   uniqueAnimeIds(value.library)&&uniqueAnimeIds(value.progress)
}

import type {Anime,LibraryEntry,ProgressEntry} from '../types'

type PreferenceRecord={key:string;value:string}
type Backup={version:number;library:LibraryEntry[];progress:ProgressEntry[];preferences?:PreferenceRecord[]}
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
function validPreferences(value:unknown):value is PreferenceRecord[]{
 if(!Array.isArray(value)||value.length>1000)return false
 const keys=new Set<string>()
 for(const item of value){
  if(!isRecord(item)||typeof item.key!=='string'||!/^[a-z0-9:._-]{1,120}$/i.test(item.key)||
   typeof item.value!=='string'||item.value.length>2048||keys.has(item.key))return false
  keys.add(item.key)
 }
 return true
}
function uniqueAnimeIds(rows:(LibraryEntry|ProgressEntry)[]):boolean{
 const ids=rows.map(row=>row.anime.id)
 return new Set(ids).size===ids.length
}
export function validateBackup(value:unknown):value is Backup{
 if(!isRecord(value)||value.version!==1||!Array.isArray(value.library)||!Array.isArray(value.progress))return false
 if(value.library.length>10000||value.progress.length>10000)return false
 return value.library.every(validLibrary)&&value.progress.every(validProgress)&&
   (value.preferences===undefined||validPreferences(value.preferences))&&
   uniqueAnimeIds(value.library)&&uniqueAnimeIds(value.progress)
}

/**
 * A v1 backup may contain only the canonical anime ID and title.
 * Rebuild the complete view model before writing imported records to IndexedDB.
 */
export function normalizeBackupAnime(value:Anime):Anime{
 const raw=value as unknown as Record<string,unknown>
 const maybeText=(item:unknown):string|null=>typeof item==='string'&&item.length<=500?item:null
 const textOr=(item:unknown,fallback:string):string=>maybeText(item)??fallback
 const httpsUrl=(item:unknown):string|null=>{
  if(typeof item!=='string'||item.length>2048)return null
  try{const url=new URL(item);return url.protocol==='https:'&&!url.username&&!url.password?url.toString():null}
  catch{return null}
 }
 const list=(item:unknown):string[]=>Array.isArray(item)?
  item.filter((entry:unknown):entry is string=>typeof entry==='string'&&entry.length<=100).slice(0,100):[]
 const score=typeof raw.score==='number'&&Number.isFinite(raw.score)&&raw.score>=0&&raw.score<=10?raw.score:null
 const episodes=Number.isSafeInteger(raw.episodes)&&Number(raw.episodes)>=0?Number(raw.episodes):null
 const year=Number.isSafeInteger(raw.year)&&Number(raw.year)>=1900&&Number(raw.year)<=2100?Number(raw.year):null
 const trailer=maybeText(raw.trailerYoutubeId)
 return {
  id:value.id,malId:value.malId,title:value.title,
  englishTitle:maybeText(raw.englishTitle),japaneseTitle:maybeText(raw.japaneseTitle),
  poster:httpsUrl(raw.poster),cover:httpsUrl(raw.cover),
  synopsis:textOr(raw.synopsis,''),score,episodes,year,
  status:textOr(raw.status,'Unknown'),type:textOr(raw.type,'Unknown'),
  rating:maybeText(raw.rating),genres:list(raw.genres),studios:list(raw.studios),
  trailerYoutubeId:trailer&&/^[a-zA-Z0-9_-]{1,30}$/.test(trailer)?trailer:null,
 }
}

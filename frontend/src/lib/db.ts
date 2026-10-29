import {openDB, type DBSchema} from 'idb'
import type {Anime,LibraryEntry,LibraryStatus,ProgressEntry} from '../types'
import {normalizeBackupAnime,validateBackup} from './backup'

interface AppSchema extends DBSchema {
 library:{key:string;value:LibraryEntry}
 progress:{key:string;value:ProgressEntry}
 preferences:{key:string;value:{key:string;value:string}}
}
const open=()=>openDB<AppSchema>('yoru-local-v1',2,{
 upgrade(db){
  if(!db.objectStoreNames.contains('library'))db.createObjectStore('library',{keyPath:'anime.id'})
  if(!db.objectStoreNames.contains('progress'))db.createObjectStore('progress',{keyPath:'anime.id'})
  if(!db.objectStoreNames.contains('preferences'))db.createObjectStore('preferences',{keyPath:'key'})
 }
})
const notify=()=>window.dispatchEvent(new Event('yoru-data-updated'))
export async function listLibrary():Promise<LibraryEntry[]>{
 const db=await open();return (await db.getAll('library')).sort((a,b)=>b.updatedAt-a.updatedAt)
}
export async function saveAnime(anime:Anime,status:LibraryStatus='planned'){
 const db=await open();await db.put('library',{anime,status,updatedAt:Date.now()});notify()
}
export async function removeAnime(id:string){const db=await open();await db.delete('library',id);notify()}
export async function getAnimeSaved(id:string){const db=await open();return db.get('library',id)}
export async function listProgress():Promise<ProgressEntry[]>{
 const db=await open();return (await db.getAll('progress')).sort((a,b)=>b.updatedAt-a.updatedAt)
}
export async function saveProgress(value:ProgressEntry){
 const db=await open();await db.put('progress',value);notify()
}
export async function getProgress(id:string){const db=await open();return db.get('progress',id)}
export async function listPreferences(){const db=await open();return db.getAll('preferences')}
export async function setPreference(key:string,value:string){const db=await open();await db.put('preferences',{key,value});notify()}
export async function getPreference(key:string,fallback=''){const db=await open();return (await db.get('preferences',key))?.value??fallback}
export async function exportUserData(){return {version:1,exportedAt:new Date().toISOString(),library:await listLibrary(),progress:await listProgress(),preferences:await listPreferences()}}
export {validateBackup} from './backup'
export async function importUserData(value:unknown){
 if(!validateBackup(value))throw new Error('Format backup tidak valid')
 const db=await open();const tx=db.transaction(['library','progress','preferences'],'readwrite')
 for(const row of value.preferences??[])await tx.objectStore('preferences').put(row)
 for(const row of value.library)await tx.objectStore('library').put({...row,anime:normalizeBackupAnime(row.anime)})
 for(const row of value.progress)await tx.objectStore('progress').put({...row,anime:normalizeBackupAnime(row.anime)})
 await tx.done;notify()
}
export async function clearUserData(){const db=await open();const tx=db.transaction(['library','progress','preferences'],'readwrite');await tx.objectStore('library').clear();await tx.objectStore('progress').clear();await tx.objectStore('preferences').clear();await tx.done;notify()}

import type {Stream} from '../types'

// Only a provider *identity* is eligible for memory: never a URL, subtitle grant,
// opaque episode resource or remote token. The chosen stream is rechecked each time.
export type SourceMemory={version:1;providerId:string;format:'hls'|'mp4';updatedAt:number}
const PROVIDER_ID=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/
const MAX_AGE=90*24*60*60*1000
const MAX_ANIME=999999999
export function sourceMemoryKey(malId:number,episode?:number):string{
 if(!Number.isSafeInteger(malId)||malId<1||malId>MAX_ANIME)throw new Error('INVALID_ANIME_ID')
 if(episode!==undefined&&(!Number.isSafeInteger(episode)||episode<1||episode>20000))
  throw new Error('INVALID_EPISODE')
 const base=`source-choice:mal:${malId}`
 return episode===undefined?base:`${base}:ep:${episode}`
}
/** Episode-specific memory takes precedence over legacy per-anime memory.
 * Both store only provider IDs: every candidate must still pass media preflight.
 */
export async function readRememberedSource(
 malId:number,episode:number,read:(key:string)=>Promise<string>,now=Date.now()
):Promise<SourceMemory|null>{
 let scopedKey:string
 let genericKey:string
 try{
  scopedKey=sourceMemoryKey(malId,episode)
  genericKey=sourceMemoryKey(malId)
 }catch{return null}
 try{
  const scoped=parseSourceMemory(await read(scopedKey),now)
  if(scoped)return scoped
 }catch{/* An unavailable scoped preference must not hide a valid generic fallback. */}
 try{return parseSourceMemory(await read(genericKey),now)}catch{return null}
}
/** Keep legacy per-anime preference as a fallback for next episodes. */
export async function saveRememberedSource(
 malId:number,episode:number,stream:Pick<Stream,'providerId'|'format'>,
 write:(key:string,value:string)=>Promise<unknown>
):Promise<boolean>{
 const memory=rememberedNativeSource(stream)
 if(!memory)return false
 try{
  const scoped=sourceMemoryKey(malId,episode)
  const generic=sourceMemoryKey(malId)
  const value=JSON.stringify(memory)
  // Persist the episode-specific choice first. A failed generic fallback must not
  // turn a successful scoped save into a reported failure or update other episodes.
  await write(scoped,value)
  try{await write(generic,value)}catch{/* The scoped choice is already saved. */}
  return true
 }catch{return false}
}
export function rememberedNativeSource(stream:Pick<Stream,'providerId'|'format'>,now=Date.now()):SourceMemory|null{
 if((stream.format!=='hls'&&stream.format!=='mp4')||typeof stream.providerId!=='string'||
  !PROVIDER_ID.test(stream.providerId)||!Number.isSafeInteger(now)||now<1)return null
 return {version:1,providerId:stream.providerId,format:stream.format,updatedAt:now}
}
export function parseSourceMemory(raw:unknown,now=Date.now()):SourceMemory|null{
 if(!Number.isSafeInteger(now)||now<1||typeof raw!=='string'||raw.length>240||raw.length===0)return null
 try{
  const value:unknown=JSON.parse(raw)
  if(!value||typeof value!=='object'||Array.isArray(value))return null
  const record=value as Record<string,unknown>
  if(record.version!==1||typeof record.providerId!=='string'||!PROVIDER_ID.test(record.providerId)||
   (record.format!=='hls'&&record.format!=='mp4')||
   typeof record.updatedAt!=='number'||!Number.isSafeInteger(record.updatedAt)||
   record.updatedAt<1||record.updatedAt>now+60_000||now-record.updatedAt>MAX_AGE)return null
  // Never propagate untrusted extra fields from IndexedDB or imported backups.
  // Provider identity is a hint only; the selected media is verified again.
  return {version:1,providerId:record.providerId,format:record.format,updatedAt:record.updatedAt}
 }catch{return null}
}
export function preferRememberedSource<T extends Pick<Stream,'providerId'|'format'>>(
 sources:readonly T[],memory:SourceMemory|null
):T[]{
 if(!memory)return [...sources]
 // Stable ordering for other sources: no unverified media becomes playable.
 return sources.map((source,index)=>({source,index})).sort((a,b)=>
  Number(b.source.providerId===memory.providerId&&b.source.format===memory.format)-
  Number(a.source.providerId===memory.providerId&&a.source.format===memory.format)||
  a.index-b.index).map(x=>x.source)
}

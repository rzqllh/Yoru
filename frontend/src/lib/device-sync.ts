import {validateBackup,type Backup} from './backup.ts'
import {parseSourceMemory} from './source-memory.ts'
import {normalizeCaptionSettings} from './caption-appearance.ts'

// Manual, user-initiated cloud snapshots. Session exists only in React memory;
// no refresh token, remote media URL or provider credential is persisted here.
export type DeviceSyncSession={accessToken:string;userId:string;email:string;expiresAt:number}
export type RemoteSnapshot={revision:number;payload:Backup}
type FetchLike=typeof fetch
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL=/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,30}$/
const CODE=/^\d{6,10}$/
const MAX_BYTES=500_000
const SYNCABLE=/^(?:auto-next|playback-speed|subtitle-default-language|subtitle-offset:mal:[1-9]\d{0,8}|subtitle-style:(?:global|mal:[1-9]\d{0,8})|watch-path:[a-z0-9-]{1,90}|source-choice:mal:[1-9]\d{0,8})$/
const record=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value)
const validRevision=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>0
export function syncConfig(url:unknown,key:unknown):{url:string;key:string}|null{
 if(typeof url!=='string'||typeof key!=='string'||key.length<12||key.length>600||url.length>400)return null
 try{
  const u=new URL(url)
  if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')return null
  return {url:u.origin,key}
 }catch{return null}
}
/** Canonicalize values, not merely keys: a known preference key can still be
 * corrupted or contain an unrelated token. Never upload unparsed JSON values.
 */
function safePreference(row:{key:string;value:string}):{key:string;value:string}|null{
 const {key,value}=row
 if(!SYNCABLE.test(key))return null
 if(key==='auto-next')return value==='on'||value==='off'?{key,value}:null
 if(key==='playback-speed')return ['0.5','0.75','1','1.25','1.5','2'].includes(value)?{key,value}:null
 if(key==='subtitle-default-language')return ['auto','id','en','off'].includes(value)?{key,value}:null
 if(key.startsWith('subtitle-offset:')){
  if(!value.trim())return null
  const offset=Number(value)
  return Number.isFinite(offset)&&offset>=-30&&offset<=30?{key,value:String(offset)}:null
 }
 if(key.startsWith('source-choice:')){
  const remembered=parseSourceMemory(value)
  return remembered?{key,value:JSON.stringify(remembered)}:null
 }
 try{
  const parsed:unknown=JSON.parse(value)
  if(!record(parsed))return null
  if(key.startsWith('subtitle-style:'))return {key,value:JSON.stringify(normalizeCaptionSettings(parsed))}
  if(key.startsWith('watch-path:')){
   if(!Number.isSafeInteger(parsed.completed)||Number(parsed.completed)<0||
    !Number.isSafeInteger(parsed.updatedAt)||Number(parsed.updatedAt)<0)return null
   return {key,value:JSON.stringify({
    completed:Math.min(Number(parsed.completed),80),updatedAt:parsed.updatedAt
   })}
  }
 }catch{return null}
 return null
}
export function syncableBackup(source:Backup):Backup{
 if(!validateBackup(source))throw new Error('Format data lokal tidak valid')
 return {...source,preferences:source.preferences?.flatMap(row=>{
  const safe=safePreference(row)
  return safe?[safe]:[]
 })??[]}
}
export function createDeviceSyncClient(config:{url:string;key:string},fetcher:FetchLike=fetch){
 const valid=syncConfig(config.url,config.key)
 if(!valid)throw new Error('Konfigurasi sinkronisasi tidak valid')
 const endpoint=valid.url
 const apiKey=valid.key
 async function request(path:string,method:'GET'|'POST'|'DELETE',body:unknown,session?:DeviceSyncSession):Promise<unknown>{
  if(session&&(!UUID.test(session.userId)||Date.now()>=session.expiresAt-10_000))
   throw new Error('Sesi berakhir. Masuk kembali untuk sinkronisasi.')
  const response=await fetcher(endpoint+path,{
   method,headers:{
    apikey:apiKey,
    ...(session?{Authorization:`Bearer ${session.accessToken}`}:{}),
    Accept:'application/json',
    ...(body===undefined?{}:{'Content-Type':'application/json'})
   },
   ...(body===undefined?{}:{body:JSON.stringify(body)}),
   signal:AbortSignal.timeout(12000),
  })
  if(!response.ok)throw new Error(`Layanan sinkronisasi gagal (HTTP ${response.status}).`)
  if(response.status===204)return null
  return response.json() as Promise<unknown>
 }
 return {
  async sendCode(email:string):Promise<void>{
   if(!EMAIL.test(email))throw new Error('Alamat email tidak valid')
   await request('/auth/v1/otp','POST',{email,create_user:true})
  },
  async verifyCode(email:string,token:string):Promise<DeviceSyncSession>{
   if(!EMAIL.test(email)||!CODE.test(token))throw new Error('Email atau kode verifikasi tidak valid')
   const response=await request('/auth/v1/verify','POST',{email,token,type:'email'})
   if(!record(response)||!record(response.user)||typeof response.access_token!=='string'||
     typeof response.user.id!=='string'||!UUID.test(response.user.id)||
     !Number.isSafeInteger(response.expires_in)||Number(response.expires_in)<60)
    throw new Error('Respons login tidak valid')
   return {accessToken:response.access_token,userId:response.user.id,email,
    expiresAt:Date.now()+Number(response.expires_in)*1000}
  },
  async read(session:DeviceSyncSession):Promise<RemoteSnapshot|null>{
   const raw=await request('/rest/v1/yoru_sync_snapshots?select=revision,payload&limit=1','GET',undefined,session)
   if(!Array.isArray(raw)||raw.length>1)throw new Error('Respons cadangan cloud tidak valid')
   if(!raw.length)return null
   const row:unknown=raw[0]
   if(!record(row)||!validRevision(row.revision)||!validateBackup(row.payload))
    throw new Error('Cadangan cloud rusak; tidak ada data yang diimpor')
   return {revision:row.revision as number,payload:row.payload}
  },
  async upload(session:DeviceSyncSession,snapshot:Backup,expectedRevision:number):Promise<number>{
   const safe=syncableBackup(snapshot)
   if(new TextEncoder().encode(JSON.stringify(safe)).length>MAX_BYTES)
    throw new Error('Data terlalu besar untuk sinkronisasi cloud (batas 500 KB)')
   if(!Number.isSafeInteger(expectedRevision)||expectedRevision<0)
    throw new Error('Revisi cloud tidak valid')
   const response=await request('/rest/v1/rpc/yoru_sync_put','POST',
    {expected_revision:expectedRevision,next_payload:safe},session)
   if(!validRevision(response))throw new Error('Cloud tidak mengembalikan revisi yang valid')
   return response as number
  },
  async remove(session:DeviceSyncSession):Promise<void>{
   const deleted=await request('/rest/v1/rpc/yoru_sync_delete','POST',{},session)
   if(typeof deleted!=='boolean')throw new Error('Respons penghapusan cloud tidak valid')
  },
 }
}

/**
 * Fixed-host subtitle adapters. Keep provider secrets server-side.
 * No arbitrary user-controlled outbound URLs or CDN proxying.
 */
export type SubtitleProvider='opensubtitles'|'subdl'|'subsource'|'stremio'
export type SubtitleCandidate={
 id:string;provider:SubtitleProvider;language:'id'|'en';label:string;
 release:string;episode:number;score:number;sourceUrl?:string;fileId?:number;
}
import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto'
const secret=process.env.YORU_SUBTITLE_SIGNING_SECRET||randomBytes(32).toString('hex')
const ttlMs=10*60*1000
const validProvider=(v:string)=>v==='subdl'||v==='subsource'||v==='opensubtitles'||v==='stremio'
function signature(provider:string,ref:string,expires:string){
 return createHmac('sha256',secret).update(JSON.stringify([provider,ref,expires])).digest('hex')
}
export function grantSubtitleUrl(sourceUrl:string,now=Date.now()):string{
 const base=new URL(sourceUrl,'http://yoru.local')
 const provider=base.searchParams.get('provider')||'',ref=base.searchParams.get('ref')||''
 if(base.pathname!=='/api/subtitles/file'||base.origin!=='http://yoru.local'||!validProvider(provider)||!ref)throw new Error('INVALID_SUBTITLE_GRANT')
 const expires=String(now+ttlMs)
 base.searchParams.set('expires',expires)
 base.searchParams.set('token',signature(provider,ref,expires))
 return base.pathname+base.search
}
export function verifySubtitleGrant(provider:string,ref:string,expires:string,token:string,now=Date.now()):boolean{
 if(!validProvider(provider)||!ref||ref.length>260||!/^[1-9]\d{12}$/.test(expires)||!/^[a-f0-9]{64}$/.test(token))return false
 const time=Number(expires)
 if(time<now||time>now+ttlMs)return false
 const expected=Buffer.from(signature(provider,ref,expires),'hex'),actual=Buffer.from(token,'hex')
 return expected.length===actual.length&&timingSafeEqual(expected,actual)
}

type Obj=Record<string,unknown>
const object=(value:unknown):Obj|null=>value&&typeof value==='object'&&!Array.isArray(value)?value as Obj:null
const string=(value:unknown,max=200)=>typeof value==='string'?value.slice(0,max).trim():''
const list=(value:unknown):unknown[]=>Array.isArray(value)?value:[]
const language=(value:unknown):'id'|'en'|null=>{
 const code=string(value,25).toLowerCase()
 return ['id','ind','indonesian','bahasa indonesia'].includes(code)?'id': ['en','eng','english'].includes(code)?'en':null
}
function confidence(episode:number,raw:unknown){
 if(raw===null||raw===undefined||raw==='')return 30
 return Number(raw)===episode?70:0
}
function add(result:SubtitleCandidate[],item:SubtitleCandidate){
 if(item.score<=0||result.length>=90)return
 if(!result.some(x=>x.provider===item.provider&&x.id===item.id))result.push(item)
}
export function normalizeSubDl(input:unknown,episode:number):SubtitleCandidate[]{
 const root=object(input),out:SubtitleCandidate[]=[]
 for(const item of list(root?.subtitles)){
  const sub=object(item);if(!sub)continue
  for(const entry of list(sub.unpack_files)){
   const file=object(entry);if(!file)continue
   const lang=language(file.language||sub.language||sub.lang)
   const path=string(file.url,250)
   if(!lang||!/^\/subtitle\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(path))continue
   const score=confidence(episode,file.episode)
   const release=string(file.release_name||file.name||sub.release_name,160)
   add(out,{id:'subdl:'+Buffer.from(path).toString('base64url'),provider:'subdl',
    language:lang,label:lang==='id'?'Indonesia':'English',release,
    episode,score,sourceUrl:'/api/subtitles/file?provider=subdl&ref='+encodeURIComponent(path)})
  }
 }
 return out
}
export function normalizeOpenSubtitles(input:unknown,episode:number):SubtitleCandidate[]{
 const out:SubtitleCandidate[]=[]
 for(const row of list(object(input)?.data)){
  const value=object(row),attr=object(value?.attributes)
  if(!value||!attr)continue
  const lang=language(attr.language),files=list(attr.files)
  const feature=object(attr.feature_details)
  const score=confidence(episode,feature?.episode_number??feature?.episode)
  if(!lang||score===0)continue
  for(const fileValue of files){
   const file=object(fileValue),fileId=Number(file?.file_id)
   if(!Number.isSafeInteger(fileId)||fileId<1)continue
   const release=string(attr.release||file?.file_name,160)
   add(out,{id:'opensubtitles:'+fileId,provider:'opensubtitles',
    language:lang,label:lang==='id'?'Indonesia':'English',release,episode,
    score:score+10,fileId,sourceUrl:'/api/subtitles/file?provider=opensubtitles&ref='+fileId})
  }
 }
 return out
}
/** SubSource documents the routes, but its response fields must be validated; unknown shapes stay empty. */
export function normalizeSubSource(input:unknown,episode:number):SubtitleCandidate[]{
 const root=object(input),out:SubtitleCandidate[]
   =[]
 for(const row of list(root?.data??root?.subtitles)){
  const value=object(row);if(!value)continue
  const id=String(value.id??'')
  const lang=language(value.language??value.lang)
  if(!/^\d{1,16}$/.test(id)||!lang)continue
  const score=confidence(episode,value.episode??value.episode_number)
  if(!score)continue
  add(out,{id:'subsource:'+id,provider:'subsource',language:lang,
   label:lang==='id'?'Indonesia':'English',release:string(value.release||value.name,160),
   episode,score,sourceUrl:'/api/subtitles/file?provider=subsource&ref='+id})
 }
 return out
}
export const subtitleStatus=()=>({
 opensubtitles:Boolean(process.env.OPENSUBTITLES_API_KEY),
 subdl:Boolean(process.env.SUBDL_API_KEY),
 subsource:Boolean(process.env.SUBSOURCE_API_KEY),
})
const allowedOrigins:Record<Exclude<SubtitleProvider,'stremio'>,string>={
 opensubtitles:'https://api.opensubtitles.com',
 subdl:'https://api.subdl.com',
 subsource:'https://api.subsource.net',
}
async function fetchKnown(provider:Exclude<SubtitleProvider,'stremio'>,path:string,params:URLSearchParams,method='GET',body?:string){
 const key=provider==='subdl'?process.env.SUBDL_API_KEY:provider==='subsource'?process.env.SUBSOURCE_API_KEY:process.env.OPENSUBTITLES_API_KEY
 if(!key)throw new Error('PROVIDER_NOT_CONFIGURED')
 // SubDL v1 explicitly requires api_key in its query (Bearer applies to v2, not v1).
 const query=new URLSearchParams(params)
 if(provider==='subdl'&&path.startsWith('/api/v1/'))query.set('api_key',key)
 const url=allowedOrigins[provider]+path+(query.size?'?'+query.toString():'')
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000)
 try{
  const headers:Record<string,string>={Accept:'application/json','User-Agent':'Yoru/1.0'}
  if(provider==='subsource')headers['X-API-Key']=key
  else if(provider==='opensubtitles'){
   headers['Api-Key']=key
   if(process.env.OPENSUBTITLES_ACCESS_TOKEN)headers.Authorization='Bearer '+process.env.OPENSUBTITLES_ACCESS_TOKEN
  }
  else if(!path.startsWith('/api/v1/'))headers.Authorization='Bearer '+key
  if(body)headers['Content-Type']='application/json'
  const response=await fetch(url,{method,body,headers,signal:controller.signal,redirect:'error'})
  if(!response.ok)throw new Error(response.status===429?'RATE_LIMITED':'PROVIDER_UNAVAILABLE')
  const type=response.headers.get('content-type')||''
  if(!type.includes('json'))throw new Error('INVALID_PROVIDER_RESPONSE')
  const data=await response.text()
  if(data.length>500000)throw new Error('RESPONSE_TOO_LARGE')
  return JSON.parse(data) as unknown
 }finally{clearTimeout(timer)}
}
export async function findSubtitles(input:{title:string;episode:number;type:string;malId?:number}){
 const {title,episode,type,malId}=input
 const query=title.trim().slice(0,120)
 if(!query||episode<1||!Number.isSafeInteger(episode))throw new Error('INVALID_SUBTITLE_QUERY')
 const jobs:[SubtitleProvider,Promise<SubtitleCandidate[]>][]=[
  ['subdl',(async()=>{
   const params=new URLSearchParams({film_name:query,languages:'ID,EN',
    unpack:'1',subs_per_page:'30',client:'custom_integration'})
   if(type!=='Movie'){params.set('type','tv');params.set('season_number','1');params.set('episode_number',String(episode))}
   else params.set('type','movie')
   const payload=await fetchKnown('subdl','/api/v1/subtitles',params)
   return normalizeSubDl(payload,episode)
  })()],
  ['opensubtitles',(async()=>{
   const params=new URLSearchParams({query,languages:'id,en'})
   if(type!=='Movie'){params.set('season_number','1');params.set('episode_number',String(episode))}
   const payload=await fetchKnown('opensubtitles','/api/v1/subtitles',params)
   return normalizeOpenSubtitles(payload,episode)
  })()],
  ['subsource',(async()=>{
   // The publicly documented API does not publish an example schema.
   // Unknown responses remain untrusted and are never auto-enabled.
   const params=new URLSearchParams({query,language:'id,en',episode:String(episode)})
   const payload=await fetchKnown('subsource','/api/v1/subtitles',params)
   return normalizeSubSource(payload,episode)
  })()],
 ]
 if(malId&&Number.isSafeInteger(malId)&&malId>0)jobs.push(['stremio',(async()=>{
  const {getStremioAddonSubtitles}=await import('./stremio.js')
  return getStremioAddonSubtitles(malId,episode)
 })()])
 const settlements=await Promise.allSettled(jobs.map(([,job])=>job))
 const warnings:string[]=[],items:SubtitleCandidate[]=[]
 settlements.forEach((s,i)=>{
  if(s.status==='fulfilled')items.push(...s.value)
  else warnings.push(jobs[i][0]+': '+(s.reason instanceof Error?s.reason.message:'UNAVAILABLE'))
 })
 return {items:items.sort((a,b)=>b.score-a.score||(a.language==='id'?-1:1)).slice(0,45)
  .map(item=>({...item,sourceUrl:item.sourceUrl?grantSubtitleUrl(item.sourceUrl):undefined})),warnings,configured:subtitleStatus()}
}
/** No upstream raw URL is accepted. Only bounded, provider-owned refs are fetched. */
export async function downloadSubtitle(provider:SubtitleProvider,ref:string){
 if(provider==='stremio'){
  const {downloadStremioAddonSubtitle}=await import('./stremio.js')
  return downloadStremioAddonSubtitle(ref)
 }
 if(provider==='subdl'){
  if(!/^\/subtitle\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(ref))throw new Error('BAD_SUBTITLE_REF')
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000)
  try{
   const response=await fetch('https://dl.subdl.com'+ref,{
    signal:controller.signal,redirect:'error',headers:{Accept:'text/plain,text/vtt,application/x-subrip'}})
   if(!response.ok)throw new Error('DOWNLOAD_FAILED')
   const contentType=response.headers.get('content-type')||''
   if(/zip|octet-stream/.test(contentType))throw new Error('ARCHIVE_NOT_SUPPORTED')
   const data=await response.text()
   if(data.length>500000)throw new Error('SUBTITLE_TOO_LARGE')
   return data
  }finally{clearTimeout(timer)}
 }
 if(provider==='subsource'){
  if(!/^\d{1,16}$/.test(ref))throw new Error('BAD_SUBTITLE_REF')
  const key=process.env.SUBSOURCE_API_KEY
  if(!key)throw new Error('PROVIDER_NOT_CONFIGURED')
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000)
  try{
   const response=await fetch('https://api.subsource.net/api/v1/subtitles/'+ref+'/download',
    {headers:{'X-API-Key':key},redirect:'error',signal:controller.signal})
   if(!response.ok)throw new Error('DOWNLOAD_FAILED')
   const type=response.headers.get('content-type')||''
   if(!/text|subrip|vtt/.test(type))throw new Error('ARCHIVE_NOT_SUPPORTED')
   const data=await response.text()
   if(data.length>500000)throw new Error('SUBTITLE_TOO_LARGE')
   return data
  }finally{clearTimeout(timer)}
 }
 if(provider==='opensubtitles'){
  if(!/^\d{1,10}$/.test(ref))throw new Error('BAD_SUBTITLE_REF')
  if(!process.env.OPENSUBTITLES_ACCESS_TOKEN)throw new Error('OPENSUBTITLES_LOGIN_REQUIRED')
  const metadata=await fetchKnown('opensubtitles','/api/v1/download',
   new URLSearchParams(),'POST',JSON.stringify({file_id:Number(ref)}))
  const link=string(object(metadata)?.link,2048)
  const fileUrl=new URL(link)
  if(fileUrl.protocol!=='https:'||!['www.opensubtitles.com','dl.opensubtitles.com'].includes(fileUrl.hostname)||
   !fileUrl.pathname.startsWith('/download/')||fileUrl.username||fileUrl.password||
   fileUrl.port)throw new Error('UNSAFE_PROVIDER_DOWNLOAD')
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000)
  try{
   const response=await fetch(fileUrl.toString(),{signal:controller.signal,redirect:'error'})
   if(!response.ok)throw new Error('DOWNLOAD_FAILED')
   const data=await response.text()
   if(data.length>500000)throw new Error('SUBTITLE_TOO_LARGE')
   return data
  }finally{clearTimeout(timer)}
 }
 throw new Error('UNSUPPORTED_PROVIDER')
}
/**
 * Uniform ASS/SSA dialogue renderer: deliberately drops animation, karaoke,
 * typesetting and custom positions. Never imply visual parity with fansubs.
 */
export function assToWebVtt(source:string):string{
 const lines=source.replace(/\r\n?/g,'\n').split('\n')
 const out:string[]=['WEBVTT','']
 let inEvents=false
 let fields=['layer','start','end','style','name','marginl','marginr','marginv','effect','text']
 const toClock=(raw:string)=>{
  const m=/^(\d{1,2}):(\d{2}):(\d{2})\.(\d{2})$/.exec(raw.trim())
  if(!m)return null
  return [m[1].padStart(2,'0'),m[2],m[3]].join(':')+'.'+m[4]+'0'
 }
 for(const raw of lines){
  const line=raw.trim()
  if(/^\[[^\]]+\]$/.test(line)){inEvents=/^\[Events\]$/i.test(line);continue}
  if(!inEvents)continue
  if(/^Format:/i.test(line)){
   fields=line.slice(7).split(',').map(v=>v.trim().toLowerCase());continue
  }
  if(!/^Dialogue:/i.test(line))continue
  const index=fields.indexOf('text'),startIndex=fields.indexOf('start'),endIndex=fields.indexOf('end')
  if(index<0||startIndex<0||endIndex<0)continue
  const parts=line.slice(9).split(',')
  if(parts.length<fields.length)continue
  const start=toClock(parts[startIndex]),end=toClock(parts[endIndex])
  if(!start||!end)continue
  const dialogue=parts.slice(index,parts.length-(fields.length-index-1)).join(',')
   .replace(/\{[^}]*\}/g,'').replace(/\\[Nn]/g,'\n').replace(/\\h/g,' ')
   .replace(/<[^>]*>/g,'').trim()
  if(!dialogue)continue
  out.push(start+' --> '+end,dialogue,'')
 }
 if(out.length===2)throw new Error('UNSUPPORTED_SUBTITLE_FORMAT')
 return out.join('\n')
}
/** Convert raw SRT/ASS to uniform WebVTT. Content is never treated as executable markup. */
export function toWebVtt(source:string):string{
 const text=source.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim()
 if(text.startsWith('WEBVTT'))return text
 if(/^\[(?:Script Info|Events)\]/i.test(text))return assToWebVtt(text)
 if(!/\d{2}:\d{2}:\d{2},\d{3}\s*-->/.test(text))throw new Error('UNSUPPORTED_SUBTITLE_FORMAT')
 return 'WEBVTT\n\n'+text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g,'$1.$2')+'\n'
}

import {readFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {lookup} from 'node:dns/promises'
import {request} from 'node:https'
import {isPublicIPv4,parseStremioStreams,stremioStreamPath,validateStremioConfig,type StremioAddon,type StremioConfig} from './stremio-core.js'

export async function getStremioConfig():Promise<StremioConfig|null>{
 const root=existsSync(resolve(process.cwd(),'configs'))?process.cwd():resolve(process.cwd(),'..')
 try{
  const path=resolve(root,'configs','stremio.local.json')
  const raw=await readFile(path,'utf8')
  if(raw.length>65536)throw new Error('Config too large')
  return validateStremioConfig(JSON.parse(raw))
 }catch(error){
  if((error as NodeJS.ErrnoException).code==='ENOENT')return null
  throw error
 }
}
async function fetchJsonPinned(url:URL):Promise<unknown>{
 if(url.protocol!=='https:'||url.port||url.username||url.password||url.search||url.hash)throw new Error('Unsafe addon URL')
 const resolved=await lookup(url.hostname,{family:4})
 if(!isPublicIPv4(resolved.address))throw new Error('Addon DNS resolved to blocked address')
 return new Promise<unknown>((resolveValue,reject)=>{
  let settled=false
  const fail=(error:Error)=>{if(!settled){settled=true;reject(error)}}
  const req=request(url,{method:'GET',timeout:7000,headers:{Accept:'application/json'},
   lookup:(_host,_opts,callback)=>callback(null,resolved.address,4)},res=>{
    if(res.statusCode!==200){res.resume();fail(new Error('Addon unavailable'));return}
    const chunks:Buffer[]=[];let bytes=0
    res.on('data',(chunk:Buffer)=>{
     bytes+=chunk.length
     if(bytes>262144){req.destroy(new Error('Addon payload too large'));return}
     chunks.push(chunk)
    })
    res.on('error',fail)
    res.on('end',()=>{
     if(settled)return
     settled=true
     try{resolveValue(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch{reject(new Error('Invalid addon JSON'))}
    })
   })
  req.on('timeout',()=>req.destroy(new Error('Addon timeout')))
  req.on('error',fail)
  req.end()
 })
}
export async function getStremioEpisodes(animeId:string){
 const config=await getStremioConfig()
 const malId=Number(animeId.replace(/^mal:/,''))
 return (config?.addons??[]).flatMap(addon=>{
  const match=addon.anime.find(a=>a.malId===malId)
  if(!match)return []
  return match.episodes.map(number=>({id:`stremio-${addon.id}:${malId}:${number}`,animeId,number,title:`Episode ${number}`,providerId:`stremio-${addon.id}`}))
 })
}
export async function getStremioStreams(ref:string){
 const pieces=ref.split(':')
 if(pieces.length!==3||!/^stremio-[a-z0-9-]+$/.test(pieces[0]))return []
 const addonId=pieces[0].slice('stremio-'.length),malId=Number(pieces[1]),episode=Number(pieces[2])
 const cfg=await getStremioConfig()
 const addon:StremioAddon|undefined=cfg?.addons.find(a=>a.id===addonId)
 const anime=addon?.anime.find(a=>a.malId===malId)
 if(!addon||!anime?.episodes.includes(episode))return []
 const path=stremioStreamPath(addon,anime.stremioId,anime.season,episode)
 const payload=await fetchJsonPinned(path)
 return parseStremioStreams(payload,`stremio-${addon.id}`).map((stream,i)=>({...stream,id:`stremio-${addon.id}:${malId}:${episode}:${i}`}))
}

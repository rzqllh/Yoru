import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateProviderConfig, type ProviderConfig, type Stream } from '../pipeline/validate.js'

export type ProviderAdapter = {
 id:string;name:string;
 search(query:string):Promise<{malId:number;title:string}[]>;
 getEpisodes(animeRef:string):Promise<{id:string;animeId:string;number:number;title:string}[]>;
 resolveStream(episodeRef:string):Promise<Stream[]>;
}
let previous:ProviderConfig|null=null
let fileHash=''
export async function getLocalProvider():Promise<ProviderConfig|null>{
 const root=existsSync(resolve(process.cwd(),'configs'))?process.cwd():resolve(process.cwd(),'..')
 const path=resolve(root,'configs','providers.local.json')
 try{
  const content=await readFile(path,'utf8')
  if(content.length>2_000_000)throw new Error('Provider config exceeds 2MB')
  if(content===fileHash)return previous
  const next=validateProviderConfig(JSON.parse(content))
  fileHash=content;previous=next
  return next
 }catch(error){
  if((error as NodeJS.ErrnoException).code==='ENOENT'){previous=null;fileHash='';return null}
  throw error
 }
}
export async function getProviderEpisodes(animeId:string){
 const cfg=await getLocalProvider()
 const malId=Number(animeId.replace(/^mal:/,''))
 return (cfg?.anime.find(a=>a.malId===malId)?.episodes??[]).map(x=>({id:`${cfg?.id}:${malId}:${x.number}`,animeId:`mal:${malId}`,number:x.number,title:x.title||`Episode ${x.number}`,providerId:cfg?.id}))
}
export async function getProviderStreams(providerEpisodeId:string){
 const cfg=await getLocalProvider();if(!cfg)return []
 const parts=providerEpisodeId.split(':')
 if(parts.length!==3||parts[0]!==cfg.id)return []
 const malId=Number(parts[1]),episodeNumber=Number(parts[2])
 if(!Number.isSafeInteger(malId)||!Number.isSafeInteger(episodeNumber))return []
 return (cfg.anime.find(a=>a.malId===malId)?.episodes.find(e=>e.number===episodeNumber)?.streams??[]).map((stream,i)=>({...stream,id:`${cfg.id}:${malId}:${episodeNumber}:${i}`,providerId:cfg.id}))
}


export const localProviderAdapter: ProviderAdapter = {
 id:'local-config',name:'Local JSON provider',
 async search(query){
  const cfg=await getLocalProvider();if(!cfg)return []
  const needle=query.trim().toLowerCase()
  if(!needle)return []
  return cfg.anime.filter(anime=>String(anime.malId).includes(needle)||(anime.title||'').toLowerCase().includes(needle))
   .map(anime=>({malId:anime.malId,title:anime.title||`Anime #${anime.malId}`}))
 },
 getEpisodes:getProviderEpisodes,
 resolveStream:getProviderStreams,
}

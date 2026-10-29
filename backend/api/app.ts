import { Hono } from 'hono'
import {combineProviderResults} from '../pipeline/provider-aggregation.js'
import { createHealthPayload } from '../pipeline/status.js'
import { getAnime, getAnimeEpisodes, getDiscover, searchAnime } from '../pipeline/jikan.js'
import { getLocalProvider, getProviderEpisodes, getProviderStreams } from '../providers/local.js'
import {getStremioConfig,getStremioEpisodes,getStremioStreams} from '../providers/stremio.js'
import {externalEpisode,externalStream} from '../providers/public-embed.js'

export const app = new Hono()
app.get('/api/health', c => c.json(createHealthPayload()))
const positive = (input:string|undefined,limit=100) => {
 const n=Number(input||'1');return Number.isInteger(n)&&n>=1&&n<=limit?n:1
}
const validId=(id:string)=>/^[1-9]\d{0,8}$/.test(id)?Number(id):null

app.get('/api/anime/discover',async c=>{
 const kind=c.req.query('kind')
 if(kind!=='season'&&kind!=='top'&&kind!=='upcoming')return c.json({error:'INVALID_KIND'},400)
 try{return c.json(await getDiscover(kind,positive(c.req.query('page'))))}catch(e){return c.json({error:'CATALOG_UNAVAILABLE',message:(e as Error).message},503)}
})
app.get('/api/anime/search',async c=>{
 const q=(c.req.query('q')||'').trim()
 if(!q||q.length>120)return c.json({error:'INVALID_QUERY'},400)
 try{return c.json(await searchAnime(q,positive(c.req.query('page'))))}catch(e){return c.json({error:'CATALOG_UNAVAILABLE',message:(e as Error).message},503)}
})
app.get('/api/anime/:id',async c=>{
 const id=validId(c.req.param('id'));if(!id)return c.json({error:'INVALID_ID'},400)
 try{return c.json(await getAnime(id))}catch(e){return c.json({error:'ANIME_UNAVAILABLE',message:(e as Error).message},503)}
})
app.get('/api/anime/:id/episodes',async c=>{
 const id=validId(c.req.param('id'));if(!id)return c.json({error:'INVALID_ID'},400)
 try{return c.json(await getAnimeEpisodes(id,positive(c.req.query('page'),1000)))}catch(e){return c.json({error:'EPISODES_UNAVAILABLE',message:(e as Error).message},503)}
})
app.get('/api/providers',async c=>{
 const results=await Promise.allSettled([
  getLocalProvider().then(local=>local?[{id:local.id,name:local.name,animeCount:local.anime.length}]:[]),
  getStremioConfig().then(config=>(config?.addons??[]).map(addon=>({
   id:`stremio-${addon.id}`,name:addon.name,animeCount:addon.anime.length
  })))
 ])
 const result=combineProviderResults(results,['local','stremio'])
 return c.json({providers:[...result.items,{id:'public-embed',name:'External anime player (unverified)',animeCount:null}],warnings:result.warnings},200)
})
app.get('/api/anime/:id/provider-episodes',async c=>{
 const id=validId(c.req.param('id'));if(!id)return c.json({error:'INVALID_ID'},400)
 const animeId=`mal:${id}`
 const results=await Promise.allSettled([
  getProviderEpisodes(animeId),
  getStremioEpisodes(animeId)
 ])
 const result=combineProviderResults(results,['local','stremio'])
 return c.json({items:[...result.items,externalEpisode(id,1)],warnings:result.warnings},200)
})
app.get('/api/streams',async c=>{
 const ref=c.req.query('episodeRef')||''
 if(ref.length>160||!(/^[a-z0-9-]+:[1-9]\d*:[1-9]\d*$/.test(ref)))return c.json({error:'INVALID_EPISODE_REF'},400)
 try{return c.json({items:ref.startsWith('public-embed:')?externalStream(ref):ref.startsWith('stremio-')?await getStremioStreams(ref):await getProviderStreams(ref)})}catch{return c.json({error:'SOURCE_UNAVAILABLE'},502)}
})
app.notFound(c=>c.json({error:'NOT_FOUND'},404))

import { Hono } from 'hono'
import { SECURITY_HEADERS } from './security.js'
import {combineProviderResults} from '../pipeline/provider-aggregation.js'
import { createHealthPayload } from '../pipeline/status.js'
import { getAnime, getAnimeEpisodes, getDiscover, searchAnime } from '../pipeline/jikan.js'
import { getLocalProvider, getProviderEpisodes, getProviderStreams } from '../providers/local.js'
import {getStremioConfig,getStremioEpisodes,getStremioStreams} from '../providers/stremio.js'
import {externalStream} from '../providers/public-embed.js'
import {getMiruroEpisodes,getMiruroStreams,isMiruroConfigured} from '../providers/miruro.js'
import {downloadSubtitle,findSubtitles,toWebVtt,subtitleStatus,type SubtitleProvider} from '../providers/subtitles.js'

export const app = new Hono()
app.use('*',async(c,next)=>{
 await next()
 for(const [name,value] of Object.entries(SECURITY_HEADERS))c.header(name,value)
 if(c.req.path.startsWith('/api/'))c.header('Cache-Control','no-store')
})
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
  }))),
  Promise.resolve(isMiruroConfigured()?[{id:'miruro',name:'Miruro-compatible HTTPS API (opt-in)',animeCount:null}]:[])
 ])
 const result=combineProviderResults(results,['local','stremio','miruro'])
 return c.json({providers:[...result.items,{id:'public-embed',name:'External anime player (unverified)',animeCount:null}],warnings:result.warnings},200)
})
app.get('/api/anime/:id/provider-episodes',async c=>{
 const id=validId(c.req.param('id'));if(!id)return c.json({error:'INVALID_ID'},400)
 const animeId=`mal:${id}`
 const results=await Promise.allSettled([
  getProviderEpisodes(animeId),
  getStremioEpisodes(animeId),
  getMiruroEpisodes(id)
 ])
 const result=combineProviderResults(results,['local','stremio'])
 return c.json({items:result.items,warnings:result.warnings},200)
})
app.get('/api/streams',async c=>{
 const ref=c.req.query('episodeRef')||''
 const start=Number(c.req.query('start')||'0')
 if(ref.length>160||!(/^[a-z0-9-]+:[1-9]\d*:[1-9]\d*$/.test(ref)))return c.json({error:'INVALID_EPISODE_REF'},400)
 try{return c.json({items:ref.startsWith('public-embed:')?externalStream(ref,start):ref.startsWith('stremio-')?await getStremioStreams(ref):ref.startsWith('miruro-')?await getMiruroStreams(ref):await getProviderStreams(ref)})}catch{return c.json({error:'SOURCE_UNAVAILABLE'},502)}
})

app.get('/api/subtitles/status',c=>c.json({configured:subtitleStatus()}))
app.get('/api/anime/:id/subtitles',async c=>{
 const id=validId(c.req.param('id'))
 const episode=Number(c.req.query('episode')||'0')
 if(!id||!Number.isInteger(episode)||episode<1||episode>2000)return c.json({error:'INVALID_REQUEST'},400)
 try{
  const anime=await getAnime(id)
  return c.json(await findSubtitles({title:anime.title,episode,type:anime.type}))
 }catch{return c.json({error:'SUBTITLE_LOOKUP_UNAVAILABLE'},503)}
})
app.get('/api/subtitles/file',async c=>{
 const provider=c.req.query('provider')
 const ref=c.req.query('ref')||''
 if(!['subdl','subsource','opensubtitles'].includes(provider||'')||ref.length>260)return c.json({error:'INVALID_REQUEST'},400)
 try{
  const content=toWebVtt(await downloadSubtitle(provider as SubtitleProvider,ref))
  c.header('Content-Type','text/vtt; charset=utf-8')
  c.header('X-Content-Type-Options','nosniff')
  c.header('Cache-Control','private, max-age=180')
  return c.body(content)
 }catch{return c.json({error:'SUBTITLE_FILE_UNAVAILABLE'},502)}
})

app.notFound(c=>c.json({error:'NOT_FOUND'},404))

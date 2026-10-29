import assert from 'node:assert/strict'
import {writeFile,unlink} from 'node:fs/promises'
import {join} from 'node:path'

const localPath=join('configs','providers.local.json')
const addonPath=join('configs','stremio.local.json')
const base='http://127.0.0.1:8787'
async function readApi(path){
 const response=await fetch(base+path)
 return {status:response.status,data:await response.json()}
}
try{
 const streamUrl='https://media.example.org/episode-1.m3u8'
 await writeFile(localPath,JSON.stringify({
  id:'ci-local',name:'Configured test provider',anime:[{
   malId:1,title:'Fixture',episodes:[{
    number:1,streams:[{format:'hls',url:streamUrl,subtitleMode:'unknown',tracks:[]}]
   }]
  }]
 }))
 let result=await readApi('/api/providers')
 assert.equal(result.status,200)
 assert.deepEqual(result.data.providers.map(value=>value.id),['ci-local','public-embed'])
 result=await readApi('/api/anime/1/provider-episodes')
 assert.equal(result.status,200)
 assert.deepEqual(result.data.items.map(value=>value.id),['ci-local:1:1','public-embed:1:1'])
 result=await readApi('/api/streams?episodeRef=ci-local%3A1%3A1')
 assert.equal(result.status,200)
 assert.equal(result.data.items[0].url,streamUrl)

 await writeFile(addonPath,JSON.stringify({addons:[{
  id:'ci-addon',name:'Configured test addon',
  manifestUrl:'https://addon.example.com/manifest.json',
  anime:[{malId:1,stremioId:'kitsu:1',season:1,episodes:[1]}]
 }]}))
 await writeFile(localPath,'{ broken json')

 result=await readApi('/api/providers')
 assert.equal(result.status,200)
 assert.deepEqual(result.data.warnings,['local'])
 assert.deepEqual(result.data.providers.map(value=>value.id),['stremio-ci-addon','public-embed'])
 result=await readApi('/api/anime/1/provider-episodes')
 assert.equal(result.status,200)
 assert.deepEqual(result.data.warnings,['local'])
 assert.deepEqual(result.data.items.map(value=>value.id),['stremio-ci-addon:1:1','public-embed:1:1'])
 result=await readApi('/api/streams?episodeRef=public-embed%3A1%3A1')
 assert.equal(result.status,200)
 assert.equal(result.data.items[0].format,'embed')
 assert.equal(result.data.items[0].url,'https://api.aniweeb.net/embed/mal/1/1?track=sub')
 console.log('Verified: configured provider -> episodes -> stream, and healthy addon survives invalid local provider.')
}finally{
 await Promise.all([
  unlink(localPath).catch(()=>{}),
  unlink(addonPath).catch(()=>{})
 ])
}

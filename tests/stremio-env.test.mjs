import {test} from 'node:test'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'

const config={addons:[{id:'subtitles-demo',name:'Subtitle addon',manifestUrl:'https://addon.example.com/manifest.json',anime:[{malId:1,stremioId:'tmdb:100',season:1,episodes:[1]}]}]}

test('hosted Stremio mapping supports explicit server-side JSON while rejecting malformed or oversized configuration',()=>{
 const script=`import {getStremioConfig} from './backend/providers/stremio.ts';const result=await getStremioConfig();console.log(JSON.stringify(result))`
 const call=(env)=>spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',script],{encoding:'utf8',timeout:10000,env:{...process.env,...env}})
 const success=call({STREMIO_ADDONS_JSON:JSON.stringify(config)})
 assert.equal(success.status,0,success.stderr)
 assert.equal(JSON.parse(success.stdout).addons[0].id,'subtitles-demo')
 const bad=call({STREMIO_ADDONS_JSON:'{bad json'})
 assert.notEqual(bad.status,0)
 const large=call({STREMIO_ADDONS_JSON:'x'.repeat(66000)})
 assert.notEqual(large.status,0)
})

test('configured Stremio mappings reject coerced MAL IDs and episode references before network access',()=>{
 const script=`import {getStremioEpisodes,getStremioSourceCandidates} from './backend/providers/stremio.ts';
const invalidAnime=['mal:1e0','mal:0x1','mal:01','mal:+1','mal:1.0','mal: 1','mal:1\\n','mal:1:2'];
const invalidRefs=['stremio-subtitles-demo:1e0:1','stremio-subtitles-demo:1:1e0','stremio-subtitles-demo:01:1','stremio-subtitles-demo:1:01','stremio-subtitles-demo:0x1:1','stremio-subtitles-demo:1:1.0','stremio-subtitles-demo:1:1\\n'];
const good=await getStremioEpisodes('mal:1');
const legacy=await getStremioEpisodes('1');
const badEpisodes=await Promise.all(invalidAnime.map(getStremioEpisodes));
const badSources=await Promise.all(invalidRefs.map(getStremioSourceCandidates));
console.log(JSON.stringify({good,legacy,badEpisodes,badSources}));`
 const run=spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',script],{
  encoding:'utf8',timeout:10000,env:{...process.env,STREMIO_ADDONS_JSON:JSON.stringify(config)}
 })
 assert.equal(run.status,0,run.stderr||run.error?.message)
 const result=JSON.parse(run.stdout)
 assert.deepEqual(result.good.map(x=>x.id),['stremio-subtitles-demo:1:1'])
 assert.deepEqual(result.legacy.map(x=>x.id),['stremio-subtitles-demo:1:1'])
 assert.deepEqual(result.badEpisodes,Array(8).fill([]))
 assert.deepEqual(result.badSources,Array.from({length:7},()=>({items:[],unavailable:[]})))
})

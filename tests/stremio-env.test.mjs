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

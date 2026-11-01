import assert from 'node:assert/strict'
import {test} from 'node:test'
import {spawnSync} from 'node:child_process'
import {auditStremioManifests,summarizeStremioManifest} from '../scripts/stremio-manifest-report.mjs'

const addon={id:'torrentio',manifestUrl:'https://addon.example.org/private-secret/manifest.json'}
const manifest={id:'com.example.addon',name:'Example',version:'1.0.0',
 types:['movie','series'],resources:[{name:'stream',types:['movie','series']},'subtitles']}

test('manifest report distinguishes advertised series resources from real playback',()=>{
 const result=summarizeStremioManifest('torrentio',manifest)
 assert.deepEqual(result,{
  id:'torrentio',status:'REACHABLE',advertisesSeriesStream:true,advertisesSeriesSubtitles:true
 })
 assert.equal(JSON.stringify(result).includes('https://'),false)
 assert.equal(JSON.stringify(result).includes('private-secret'),false)
 assert.deepEqual(summarizeStremioManifest('only-movie',{
  ...manifest,types:['movie']
 }),{
  id:'only-movie',status:'REACHABLE',advertisesSeriesStream:false,advertisesSeriesSubtitles:false
 })
})

test('malformed manifest fails without disclosing response fields',()=>{
 const secret='private-token-do-not-log'
 const report=summarizeStremioManifest('addon',{id:secret,resources:secret})
 assert.equal(report.status,'INVALID_MANIFEST')
 assert.equal(JSON.stringify(report).includes(secret),false)
})

test('manifest audit handles unavailable addons without exposing secrets or breaking other results',async()=>{
 const output=await auditStremioManifests([addon,{id:'offline'}],async item=>{
  if(item.id==='offline')throw new Error('https://private-secret.example/failure')
  return manifest
 })
 assert.deepEqual(output.map(x=>x.status),['REACHABLE','UNAVAILABLE'])
 assert.equal(JSON.stringify(output).includes('private-secret'),false)
 assert.equal(JSON.stringify(output).includes('https://'),false)
})

test('CLI requires explicit --live before any network or private config lookup',()=>{
 const run=spawnSync(process.execPath,['scripts/verify-stremio-manifests.mjs'],{
  encoding:'utf8',timeout:5000,env:{...process.env,STREMIO_ADDONS_JSON:'{secret-input'}
 })
 assert.equal(run.status,2,run.stderr)
 assert.match(run.stderr,/LIVE_OPT_IN_REQUIRED/)
 assert.equal(run.stderr.includes('secret-input')||run.stdout.includes('secret-input'),false)
})

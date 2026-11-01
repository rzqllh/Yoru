import assert from 'node:assert/strict'
import {test} from 'node:test'
import {spawnSync} from 'node:child_process'
import {summarizeStremioConfig} from '../scripts/stremio-config-report.mjs'

const config={addons:[
 {id:'torrentio',name:'Private addon',manifestUrl:'https://addon.example.org/private-token/manifest.json',
  anime:[{malId:1,stremioId:'tt1234567',season:1,episodes:[1,2,3]},
   {malId:2,stremioId:'tt9876543',season:2,episodes:[1]}]},
 {id:'subtitle-addon',name:'Private subtitle addon',manifestUrl:'https://sub.example.org/key-value/manifest.json',
  anime:[{malId:2,stremioId:'tt9876543',season:2,episodes:[1]}]}
]}

test('static addon audit reports verified mappings but never manifest URLs, private segments or titles',()=>{
 const report=summarizeStremioConfig(config,'server-env')
 assert.equal(report.status,'CONFIGURED')
 assert.equal(report.addonCount,2)
 assert.equal(report.mappedAnime,3)
 assert.equal(report.mappedEpisodes,5)
 assert.deepEqual(report.addons,[
  {id:'torrentio',mappedAnime:2,mappedEpisodes:4},
  {id:'subtitle-addon',mappedAnime:1,mappedEpisodes:1}
 ])
 assert.equal(report.liveManifestChecked,false)
 assert.equal(report.nativePlaybackVerified,false)
 assert.equal(report.subtitleDownloadsVerified,false)
 const output=JSON.stringify(report)
 for(const forbidden of ['manifestUrl','private-token','key-value','https://','tt1234567','Private addon'])
  assert.equal(output.includes(forbidden),false,forbidden)
})

test('zero configured addons does not imply addon availability',()=>{
 const report=summarizeStremioConfig({addons:[]},'local-file')
 assert.equal(report.status,'EMPTY')
 assert.equal(report.addonCount,0)
 assert.equal(report.nativePlaybackVerified,false)
})

test('CLI audits hosted Stremio JSON without exposing private manifest paths',()=>{
 const proc=spawnSync(process.execPath,['--import','tsx','scripts/verify-stremio-config.mjs'],{
  encoding:'utf8',timeout:15000,env:{...process.env,STREMIO_ADDONS_JSON:JSON.stringify(config)}
 })
 assert.equal(proc.status,0,proc.stderr||proc.error?.message)
 const data=JSON.parse(proc.stdout)
 assert.equal(data.addonCount,2)
 assert.equal(data.source,'server-env')
 assert.equal(data.liveManifestChecked,false)
 assert.equal(proc.stdout.includes('private-token'),false)
 assert.equal(proc.stdout.includes('https://'),false)
})

test('CLI fails closed on malformed hosted config without echoing secrets',()=>{
 const secret='secret-in-malformed-addon-config'
 const proc=spawnSync(process.execPath,['--import','tsx','scripts/verify-stremio-config.mjs'],{
  encoding:'utf8',timeout:15000,env:{...process.env,STREMIO_ADDONS_JSON:'{'+secret}
 })
 assert.equal(proc.status,2,proc.stderr||proc.error?.message)
 assert.match(proc.stderr,/INVALID_CONFIG/)
 assert.equal(proc.stdout.includes(secret)||proc.stderr.includes(secret),false)
})

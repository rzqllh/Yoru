import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'

test('Vercel function dispatches health, nested routes and rejects unsafe paths',()=>{
 const script = `
import assert from 'node:assert/strict'
import entry from './api/index.ts'
async function dispatch(route,rest=''){
 return entry.fetch(new Request('https://yoru-preview.example/api/index?__yoru_route='+encodeURIComponent(route)+rest))
}
const health=await dispatch('health')
assert.equal(health.status,200)
assert.equal(health.headers.get('cache-control'),'no-store')
assert.equal((await health.json()).version,1)
const nested=await dispatch('anime/discover','&kind=invalid')
assert.equal(nested.status,400)
assert.equal((await nested.json()).error,'INVALID_KIND')
const subtitles=await dispatch('subtitles/status')
assert.equal(subtitles.status,200)
const blocked=await dispatch('../health')
assert.equal(blocked.status,400)
const external=await dispatch('https://evil.invalid')
assert.equal(external.status,400)
const out=await entry.fetch(new Request('https://yoru-preview.example/not-api'))
assert.equal(out.status,400)
`
 const result=spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',script],{
  encoding:'utf8',timeout:30000
 })
 assert.equal(result.status,0,result.stderr||result.stdout||'Vercel adapter integration failed')
})

test('Vercel config routes API before SPA fallback',()=>{
 const config=JSON.parse(readFileSync('vercel.json','utf8'))
 assert.equal(config.framework,'vite')
 assert.equal(config.outputDirectory,'frontend/dist')
 assert.equal(config.rewrites[0].source,'/api/:path*')
 assert.equal(config.rewrites[0].destination,'/api/index?__yoru_route=:path*')
 assert.equal(config.rewrites.at(-1).destination,'/index.html')
})

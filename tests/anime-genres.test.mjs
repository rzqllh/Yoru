import assert from 'node:assert/strict'
import {test} from 'node:test'
import {spawnSync} from 'node:child_process'

const legacy=[
 [1,'Action'],[2,'Adventure'],[4,'Comedy'],[8,'Drama'],[10,'Fantasy'],[14,'Horror'],
 [7,'Mystery'],[22,'Romance'],[24,'Sci-Fi'],[36,'Slice of Life'],[30,'Sports'],[37,'Supernatural']
].map(([mal_id,name])=>({mal_id,name}))

test('Tenrai normalization rejects malformed payloads and excludes adult metadata',()=>{
 const script=`
import assert from 'node:assert/strict'
import {normalizeAnimeGenres} from './backend/pipeline/anime-genres.ts'
const legacy=${JSON.stringify(legacy)}
const payload={data:[
 ...legacy,{mal_id:46,name:'Award Winning'},{mal_id:41,name:'Suspense'},
 {mal_id:9,name:'Ecchi'},{mal_id:12,name:'Hentai'},{mal_id:49,name:'Erotica'},
 {mal_id:46,name:'Duplicate'},{mal_id:500,name:'<script>'},
 {mal_id:'77',name:'Untrusted'},{mal_id:90,name:'Action'}
]}
const result=normalizeAnimeGenres(payload)
assert.ok(result.some(x=>x.id===46&&x.name==='Award Winning'))
assert.ok(result.some(x=>x.id===41&&x.name==='Suspense'))
assert.ok(result.some(x=>x.id===36&&x.name==='Slice of Life'))
assert.equal(result.some(x=>[9,12,49,500,77,90].includes(x.id)),false)
assert.deepEqual(result.map(x=>x.name),[...result.map(x=>x.name)].sort((a,b)=>a.localeCompare(b,'en')))
for(const bad of [null,{}, {data:null},{data:[]},{data:[legacy[0]]}]){
 assert.throws(()=>normalizeAnimeGenres(bad),/GENRE_RESPONSE/)
}
`
 const proc=spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',script],{encoding:'utf8',timeout:30000})
 assert.equal(proc.status,0,proc.stderr||proc.stdout)
})

test('genre API exposes upstream provenance and reuses validated cached results',()=>{
 const script=`
import assert from 'node:assert/strict'
import entry from './api/index.ts'
const legacy=${JSON.stringify(legacy)}
let calls=0
globalThis.fetch=async(url)=>{
 calls++
 assert.match(String(url),/https:\\/\\/api\\.tenrai\\.org\\/v1\\/genres\\/anime\\?filter=genres$/)
 return Response.json({data:[...legacy,{mal_id:46,name:'Award Winning'}]})
}
const url='https://yoru.example/api/index?__yoru_route=anime/genres'
const first=await entry.fetch(new Request(url))
assert.equal(first.status,200)
const result=await first.json()
assert.equal(result.source,'Tenrai')
assert.equal(result.status,'upstream')
assert.ok(result.items.some(x=>x.id===46&&x.name==='Award Winning'))
const second=await entry.fetch(new Request(url))
assert.equal(second.status,200)
assert.equal(calls,1)
`
 const proc=spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',script],{encoding:'utf8',timeout:30000})
 assert.equal(proc.status,0,proc.stderr||proc.stdout)
})

test('genre API returns explicit safe built-in fallback when upstream is unavailable',()=>{
 const script=`
import assert from 'node:assert/strict'
import entry from './api/index.ts'
globalThis.fetch=async()=>new Response('maintenance',{status:503})
const response=await entry.fetch(new Request('https://yoru.example/api/index?__yoru_route=anime/genres'))
assert.equal(response.status,200)
const result=await response.json()
assert.equal(result.source,'built-in')
assert.equal(result.status,'fallback')
assert.equal(result.items.length,12)
assert.equal(result.items.some(x=>x.name==='Award Winning'),false)
`
 const proc=spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',script],{encoding:'utf8',timeout:30000})
 assert.equal(proc.status,0,proc.stderr||proc.stdout)
})

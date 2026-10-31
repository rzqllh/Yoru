import assert from 'node:assert/strict'
import {test} from 'node:test'
import {spawnSync} from 'node:child_process'

const legacy=[
 [1,'Action'],[2,'Adventure'],[4,'Comedy'],[8,'Drama'],[10,'Fantasy'],[14,'Horror'],
 [7,'Mystery'],[22,'Romance'],[24,'Sci-Fi'],[36,'Slice of Life'],[30,'Sports'],[37,'Supernatural']
].map(([mal_id,name])=>({mal_id,name}))

test('validated numeric MAL genre options translate to server-side multi-filter paginated search',()=>{
 const script=`
import assert from 'node:assert/strict'
import entry from './api/index.ts'
let genreRequests=0,searchRequests=0
globalThis.fetch=async(url)=>{
 const current=new URL(String(url))
 if(current.pathname==='/v1/genres/anime'){
  genreRequests++
  return Response.json({data:[...${JSON.stringify(legacy)},{mal_id:46,name:'Award Winning'}]})
 }
 if(current.pathname==='/v1/anime'){
  searchRequests++
  const p=current.searchParams
  for(const [key,value] of Object.entries({
   genres:'46',page:'2',limit:'24',sfw:'true',type:'tv',min_score:'8',
   start_date:'2024-01-01',end_date:'2024-12-31',order_by:'score',sort:'desc'
  }))assert.equal(p.get(key),value,key)
  return Response.json({data:[{mal_id:1337,title:'Verified genre fixture'}],pagination:{has_next_page:false}})
 }
 throw new Error('Unexpected source: '+current.pathname)
}
const url='https://yoru.example/api/index?__yoru_route=anime/browse&kind=top&page=2&genre=mal%3A46&type=TV&minScore=8&year=2024&order=rating'
const response=await entry.fetch(new Request(url))
assert.equal(response.status,200)
const body=await response.json()
assert.equal(body.items[0].malId,1337)
assert.equal(body.page,2)
assert.equal(genreRequests,1)
assert.equal(searchRequests,1)
`
 const run=spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',script],{encoding:'utf8',timeout:30000})
 assert.equal(run.status,0,run.stderr||run.stdout)
})

test('unknown, adult or malformed MAL genre filters reject instead of executing an unfiltered query',()=>{
 const script=`
import assert from 'node:assert/strict'
import entry from './api/index.ts'
let queries=0
globalThis.fetch=async(url)=>{
 const u=new URL(String(url))
 if(u.pathname==='/v1/genres/anime')return Response.json({data:[...${JSON.stringify(legacy)},{mal_id:46,name:'Award Winning'},{mal_id:9,name:'Ecchi'}]})
 if(u.pathname==='/v1/anime'){queries++;return Response.json({data:[]})}
 throw new Error('Unexpected fetch')
}
for(const genre of ['mal:9','mal:999','mal:0','mal:-1']){
 const r=await entry.fetch(new Request('https://yoru.example/api/index?__yoru_route=anime/browse&kind=top&genre='+encodeURIComponent(genre)))
 assert.equal(r.status,400,genre)
 assert.equal((await r.json()).error,'INVALID_FILTER',genre)
}
assert.equal(queries,0)
`
 const run=spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',script],{encoding:'utf8',timeout:30000})
 assert.equal(run.status,0,run.stderr||run.stdout)
})

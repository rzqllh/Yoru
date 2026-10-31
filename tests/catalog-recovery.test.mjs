import assert from 'node:assert/strict'
import {test} from 'node:test'
import {spawnSync} from 'node:child_process'
import {api,catalog} from '../frontend/src/lib/api.ts'

test('rewritten catalog rejects malformed upstream data without caching failures or inventing an empty catalog',()=>{
 const script=`
import assert from 'node:assert/strict'
import entry from './api/index.ts'
let payload={data:null}
let calls=0
globalThis.fetch=async()=>{calls++;return Response.json(payload)}
const url='https://yoru.example/api/index?__yoru_route=anime/discover&kind=top&page=73'
const broken=await entry.fetch(new Request(url))
assert.equal(broken.status,503)
assert.equal((await broken.json()).error,'CATALOG_UNAVAILABLE')
payload={data:[{mal_id:1,title:'Recovered metadata'}],pagination:{has_next_page:false}}
const recovered=await entry.fetch(new Request(url))
assert.equal(recovered.status,200)
assert.equal((await recovered.json()).items[0].malId,1)
assert.equal(calls,2)
await entry.fetch(new Request(url))
assert.equal(calls,2,'Only validated success may be cached')
payload={data:[]}
const empty=await entry.fetch(new Request(url.replace('page=73','page=74')))
assert.equal(empty.status,200)
assert.deepEqual((await empty.json()).items,[])
`
 const result=spawnSync(process.execPath,['--import','tsx','--input-type=module','--eval',script],{encoding:'utf8',timeout:30000})
 assert.equal(result.status,0,result.stderr||result.stdout)
})

test('client rejects SPA HTML, malformed JSON and malformed catalog instead of crashing rendering',async()=>{
 const original=globalThis.fetch
 try{
  globalThis.fetch=async()=>new Response('<div id="root"></div>',{headers:{'Content-Type':'text/html'}})
  await assert.rejects(()=>catalog('top'),/respons yang tidak valid/)
  globalThis.fetch=async()=>new Response('{broken',{headers:{'Content-Type':'application/json'}})
  await assert.rejects(()=>catalog('top'),/respons yang tidak valid/)
  globalThis.fetch=async()=>Response.json({items:null})
  await assert.rejects(()=>catalog('top'),/Data katalog/)
  globalThis.fetch=async()=>Response.json({items:[null],page:1,hasNext:false})
  await assert.rejects(()=>catalog('top'),/Data katalog/)
  globalThis.fetch=async()=>Response.json({items:[],page:1,hasNext:false})
  assert.deepEqual(await catalog('top'),{items:[],page:1,hasNext:false})
 }finally{globalThis.fetch=original}
})

test('client preserves HTTP diagnostics without stringifying untrusted error objects',async()=>{
 const original=globalThis.fetch
 try{
  globalThis.fetch=async()=>Response.json({error:{message:'nested'}},{status:404})
  await assert.rejects(()=>api('/api/health'),/^Error: HTTP 404$/)
  globalThis.fetch=async()=>Response.json({error:'CATALOG_UNAVAILABLE'},{status:503})
  await assert.rejects(()=>api('/api/anime/discover'),/CATALOG_UNAVAILABLE/)
 }finally{globalThis.fetch=original}
})

test('client times out stalled response bodies and preserves caller cancellation',async()=>{
 const original=globalThis.fetch
 try{
  globalThis.fetch=async(_url,{signal})=>({
   ok:true,headers:new Headers({'Content-Type':'application/json'}),
   json:()=>new Promise((_resolve,reject)=>{
    signal.addEventListener('abort',()=>reject(signal.reason),{once:true})
   })
  })
  await assert.rejects(()=>api('/api/health',undefined,10),/terlalu lama/)
  globalThis.fetch=async(_url,{signal})=>new Promise((_resolve,reject)=>{
   if(signal.aborted)reject(signal.reason)
   else signal.addEventListener('abort',()=>reject(signal.reason),{once:true})
  })
  const controller=new AbortController()
  const pending=api('/api/health',controller.signal,1000)
  controller.abort()
  await assert.rejects(pending,{name:'AbortError'})
  await assert.rejects(()=>api('/api/health',controller.signal),{name:'AbortError'})
 }finally{globalThis.fetch=original}
})

test('client preserves caller cancellation while reading an HTTP error body',async()=>{
 const original=globalThis.fetch
 try{
  globalThis.fetch=async(_url,{signal})=>({
   ok:false,status:503,headers:new Headers({'Content-Type':'application/json'}),
   json:()=>new Promise((_resolve,reject)=>{
    if(signal.aborted)reject(signal.reason)
    else signal.addEventListener('abort',()=>reject(signal.reason),{once:true})
   })
  })
  const controller=new AbortController()
  const pending=api('/api/anime/discover',controller.signal,1000)
  await Promise.resolve()
  controller.abort()
  await assert.rejects(pending,{name:'AbortError'})
  await assert.rejects(()=>api('/api/anime/discover',undefined,10),/terlalu lama/)
 }finally{globalThis.fetch=original}
})

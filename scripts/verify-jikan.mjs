import assert from 'node:assert/strict'
import {getDiscover,searchAnime} from '../backend/dist/pipeline/jikan.js'

const upstream='https://api.jikan.moe/v4'
const fixture={data:[{mal_id:98765,title:'Yoru metadata fixture',genres:[{name:'Action'}]}],pagination:{has_next_page:false}}
const calls=[]
const originalFetch=globalThis.fetch
globalThis.fetch=async url=>{
 const request=String(url)
 assert.ok(request.startsWith(upstream+'/'),`Unexpected upstream: ${request}`)
 calls.push(request)
 await new Promise(resolve=>setTimeout(resolve,10))
 if(request.includes('429%20scenario')&&calls.filter(x=>x===request).length===1){
  return new Response('{}',{status:429})
 }
 return new Response(JSON.stringify(fixture),{
  status:200,headers:{'Content-Type':'application/json'}
 })
}
try{
 const search=await searchAnime('Yoru Integration',1)
 assert.equal(search.items[0].id,'mal:98765')
 assert.equal(search.items[0].title,'Yoru metadata fixture')
 assert.deepEqual(search.items[0].genres,['Action'])
 assert.equal(search.hasNext,false)
 assert.ok(calls[0].includes('q=Yoru%20Integration'))
 await searchAnime('Yoru Integration',1)
 assert.equal(calls.filter(x=>x.includes('q=Yoru%20Integration')).length,1,'Cache should eliminate the duplicate metadata request')

 const [left,right]=await Promise.all([getDiscover('season',1),getDiscover('season',1)])
 assert.deepEqual(left,right)
 assert.equal(calls.filter(x=>x.includes('/seasons/now')).length,1,'Concurrent requests should dedupe upstream fetches')

 await assert.rejects(()=>searchAnime('429 scenario',1),/429/)
 const recovered=await searchAnime('429 scenario',1)
 assert.equal(recovered.items[0].malId,98765)
 assert.equal(calls.filter(x=>x.includes('q=429%20scenario')).length,2,'Failure must not poison inflight cache')
 console.log('Verified compiled Jikan pipeline: search, normalized metadata, cache, inflight dedupe and retry after upstream 429.')
}finally{
 globalThis.fetch=originalFetch
}

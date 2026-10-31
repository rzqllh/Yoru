import assert from 'node:assert/strict'
import {test} from 'node:test'
import {verifyHostedCatalog} from '../scripts/verify-hosted-catalog.mjs'

test('hosted acceptance checks shell, versioned API and nonempty metadata',async()=>{
 const paths=[]
 const result=await verifyHostedCatalog('https://yoru.example',async(url,options)=>{
  const path=new URL(url).pathname
  paths.push(path)
  assert.equal(options.redirect,'manual')
  if(path==='/')return new Response('<div id="root"></div>')
  if(path==='/api/health')return Response.json({status:'ok',service:'anime-pwa-api',version:1})
  return Response.json({items:[{malId:1,title:'Actual metadata fixture'}],page:1,hasNext:false})
 })
 assert.equal(result.length,3)
 assert.deepEqual(paths,['/','/api/health','/api/anime/discover'])
})

test('hosted gate stops on auth, missing API, quota and HTML masquerading as JSON without retries',async()=>{
 for(const status of [302,401,402,404,429]){
  let calls=0
  await assert.rejects(()=>verifyHostedCatalog('https://yoru.example',async()=>{calls++;return new Response('',{status})}),/HTTP/)
  assert.equal(calls,1)
 }
 await assert.rejects(()=>verifyHostedCatalog('https://yoru.example',async()=>new Response('<div id="root"></div>',{headers:{'Content-Type':'text/html'}})),/not JSON/)
 await assert.rejects(()=>verifyHostedCatalog('https://yoru.example?token=do-not-send'),/only a deployment origin/)
})

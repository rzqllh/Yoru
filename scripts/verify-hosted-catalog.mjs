import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'

/** Read-only: no deployment, retries, credentials, or external media requests. */
export async function verifyHostedCatalog(origin,fetcher=fetch){
 const base=new URL(origin)
 assert.equal(base.protocol,'https:','HTTPS origin required')
 assert.ok(!base.username&&!base.password&&!base.search&&!base.hash&&base.pathname==='/','Provide only a deployment origin')
 const evidence=[]
 for(const path of ['/','/api/health','/api/anime/discover?kind=top&page=1']){
  const response=await fetcher(base.origin+path,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{Accept:path==='/'?'text/html':'application/json'}})
  const label=`${path}: HTTP ${response.status}`
  assert.equal(response.status,200,label+' (check deployment SHA, routing, protection and quota; no automatic retry)')
  const text=await response.text()
  if(path==='/')assert.match(text,/<div[^>]+id=["']root["']/,'SPA root missing')
  else{
   assert.match(response.headers.get('content-type')||'',/application\/json/i,label+' is not JSON (possible SPA rewrite)')
   const data=JSON.parse(text)
   if(path==='/api/health'){
    assert.equal(data.status,'ok')
    assert.equal(data.service,'anime-pwa-api')
    assert.equal(data.version,1)
   }else{
    assert.ok(Array.isArray(data.items)&&data.items.length>0,'Live catalog sample must contain actual metadata')
    assert.equal(data.page,1)
    assert.equal(typeof data.hasNext,'boolean')
    assert.ok(data.items.every(item=>Number.isSafeInteger(item.malId)&&item.malId>0&&typeof item.title==='string'))
   }
  }
  evidence.push({path,status:response.status})
 }
 return evidence
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  assert.ok(process.argv[2],'Usage: node scripts/verify-hosted-catalog.mjs https://EXACT-DEPLOYMENT.vercel.app')
  console.log(JSON.stringify({status:'VERIFIED',scope:'hosted shell/API/catalog metadata only',evidence:await verifyHostedCatalog(process.argv[2])}))
 }catch(error){
  console.error('HOSTED_CATALOG_BLOCKED:',error instanceof Error?error.message:'Unknown failure')
  process.exitCode=1
 }
}

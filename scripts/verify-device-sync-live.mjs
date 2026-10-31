// Live acceptance for a dedicated Yoru staging project using two real users.
// Run only with consent, on empty test accounts; never print tokens or emails.
import assert from 'node:assert/strict'

const url=process.env.YORU_SYNC_TEST_URL
const apiKey=process.env.YORU_SYNC_TEST_PUBLISHABLE_KEY
const tokens=[process.env.YORU_SYNC_TEST_TOKEN_A,process.env.YORU_SYNC_TEST_TOKEN_B]
const ref=process.env.YORU_SYNC_TEST_PROJECT_REF
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
if(!url||!apiKey||!tokens.every(Boolean)||!ref){
 console.error('Missing YORU_SYNC_TEST_URL, _PUBLISHABLE_KEY, _TOKEN_A, _TOKEN_B or _PROJECT_REF')
 process.exitCode=2
}else{
 await run().catch(error=>{
  console.error('SYNC_INTEGRATION_FAIL:',error instanceof Error?error.message:'Unknown failure')
  process.exitCode=1
 })
}
async function run(){
 const endpoint=new URL(url)
 assert.equal(endpoint.protocol,'https:','HTTPS required')
 assert.equal(endpoint.hostname,ref+'.supabase.co','Project ref mismatch')
 assert.match(ref,/^[a-z0-9]{20}$/)
 assert.match(apiKey,/^sb_publishable_[A-Za-z0-9_-]{10,200}$/)
 assert.notEqual(tokens[0],tokens[1])
 async function request(path,token,method='GET',body){
  const headers={apikey:apiKey,Accept:'application/json'}
  if(token)headers.Authorization='Bearer '+token
  if(body!==undefined)headers['Content-Type']='application/json'
  const response=await fetch(endpoint.origin+path,{
   method,headers,...(body===undefined?{}:{body:JSON.stringify(body)}),
   signal:AbortSignal.timeout(12000)
  })
  const data=await response.text()
  let value
  try{value=JSON.parse(data)}catch{value=data}
  return {status:response.status,value}
 }
 async function identity(token){
  const r=await request('/auth/v1/user',token)
  assert.equal(r.status,200,'Auth token rejected')
  assert.ok(r.value&&UUID.test(r.value.id),'Missing verified user identity')
  return r.value.id
 }
 const [a,b]=await Promise.all(tokens.map(identity))
 assert.notEqual(a,b,'Independent users required')
 const path='/rest/v1/yoru_sync_snapshots?select=user_id,revision,payload'
 const anon=await request(path,null)
 assert.ok([401,403].includes(anon.status),'Anon table read not denied')
 const before=await Promise.all(tokens.map(token=>request(path,token)))
 assert.ok(before.every(r=>r.status===200&&Array.isArray(r.value)&&r.value.length===0),
  'Refuse test: a user already has cloud data')
 const upload='/rest/v1/rpc/yoru_sync_put'
 const removal='/rest/v1/rpc/yoru_sync_delete'
 const fixture={version:1,library:[],progress:[],preferences:[]}
 const inserted=[false,false]
 try{
  for(let i=0;i<tokens.length;i++){
   const made=await request(upload,tokens[i],'POST',{expected_revision:0,next_payload:fixture})
   assert.equal(made.status,200,'Create failed')
   assert.equal(made.value,1,'Initial revision must equal 1')
   inserted[i]=true
  }
  const snapshots=await Promise.all(tokens.map(token=>request(path,token)))
  assert.ok(snapshots.every(r=>r.status===200&&r.value.length===1&&r.value[0].revision===1))
  assert.equal(snapshots[0].value[0].user_id,a)
  assert.equal(snapshots[1].value[0].user_id,b)
  const filtered=await request(path+'&user_id=eq.'+a,tokens[1])
  assert.equal(filtered.status,200)
  assert.deepEqual(filtered.value,[],'Cross-account visibility')
  const stale=await request(upload,tokens[0],'POST',{expected_revision:0,next_payload:fixture})
  assert.ok(stale.status>=400,'Stale revision unexpectedly accepted')
  const update=await request(upload,tokens[0],'POST',{expected_revision:1,next_payload:fixture})
  assert.equal(update.status,200)
  assert.equal(update.value,2)
  const anonWrite=await request(upload,null,'POST',{expected_revision:0,next_payload:fixture})
  assert.ok([401,403,404].includes(anonWrite.status),'Anon RPC write accepted')
  console.log('SYNC_LIVE_ACCEPTANCE_PASS: two users, isolation, CAS and anon denial')
 }finally{
  for(let i=0;i<tokens.length;i++){
   if(!inserted[i])continue
   try{
    const cleaned=await request(removal,tokens[i],'POST',{})
    assert.equal(cleaned.status,200)
    assert.equal(cleaned.value,true)
   }catch{
    console.error('SYNC_TEST_CLEANUP_FAILED: inspect test user',i+1)
    process.exitCode=1
   }
  }
 }
}

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createDeviceSyncClient,syncConfig,syncableBackup} from '../frontend/src/lib/device-sync.ts'
const UUID='11111111-2222-4333-8444-555555555555'
const SETTINGS={url:'https://example.supabase.co',key:'sb_publishable_example_public_key'}
const baseline={version:1,library:[],progress:[],preferences:[
 {key:'auto-next',value:'on'},
 {key:'source-choice:mal:1',value:'{"version":1,"providerId":"fixture","format":"hls","updatedAt":1}'},
 {key:'unknown-secret',value:'DO_NOT_SYNC'}
]}
test('reject unsafe or unconfigured sync endpoints and publishable keys',()=>{
 assert.equal(syncConfig('',SETTINGS.key),null)
 assert.equal(syncConfig('http://insecure.example',SETTINGS.key),null)
 assert.equal(syncConfig('https://user:pass@example.supabase.co',SETTINGS.key),null)
 assert.equal(syncConfig('https://example.supabase.co/?code=abc',SETTINGS.key),null)
 assert.deepEqual(syncConfig(SETTINGS.url,SETTINGS.key),SETTINGS)
})
test('cloud snapshot excludes unknown preferences and never stores unrelated secret strings',()=>{
 const safe=syncableBackup(baseline)
 assert.deepEqual(safe.preferences?.map(x=>x.key),['auto-next','source-choice:mal:1'])
 assert.equal(JSON.stringify(safe).includes('DO_NOT_SYNC'),false)
 assert.deepEqual(baseline.preferences.map(x=>x.key),['auto-next','source-choice:mal:1','unknown-secret'])
})
test('OTP and cloud requests use publishable key and only signed-in bearer token',async()=>{
 const captured=[]
 const fake=async(url,init)=>{
  captured.push({url,init})
  if(url.endsWith('/auth/v1/otp'))return Response.json({})
  if(url.endsWith('/auth/v1/verify'))return Response.json({
   access_token:'opaque-session-access-token',expires_in:3600,user:{id:UUID}
  })
  if(url.includes('?select=revision'))return Response.json([])
  if(url.endsWith('/rpc/yoru_sync_put'))return Response.json(1)
  if(init.method==='DELETE')return new Response(null,{status:204})
  throw new Error('unexpected '+url)
 }
 const api=createDeviceSyncClient(SETTINGS,fake)
 await api.sendCode('demo@example.com')
 const session=await api.verifyCode('demo@example.com','123456')
 assert.equal(session.userId,UUID)
 assert.equal(await api.read(session),null)
 assert.equal(await api.upload(session,baseline,0),1)
 await api.remove(session)
 assert.equal(captured[0].init.headers.apikey,SETTINGS.key)
 assert.equal(captured[0].init.headers.Authorization,undefined)
 assert.equal(captured[2].init.headers.Authorization,'Bearer opaque-session-access-token')
 assert.equal(JSON.stringify(captured[3].init.body).includes('DO_NOT_SYNC'),false)
 assert.equal(captured[4].init.method,'DELETE')
})
test('reject corrupt cloud responses, expired sessions and invalid verification codes',async()=>{
 const broken=async(url)=>url.includes('select=revision')?
  Response.json([{revision:1,payload:{version:1,library:'invalid',progress:[]}}]):Response.json({})
 const api=createDeviceSyncClient(SETTINGS,broken)
 const session={accessToken:'access',userId:UUID,email:'a@b.com',expiresAt:Date.now()+100000}
 await assert.rejects(api.verifyCode('a@b.com','not-an-otp'),/tidak valid/)
 await assert.rejects(api.read(session),/rusak/)
 await assert.rejects(api.read({...session,expiresAt:Date.now()-1}),/Sesi berakhir/)
})

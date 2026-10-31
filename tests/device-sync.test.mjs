import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createDeviceSyncClient,syncConfig,syncableBackup} from '../frontend/src/lib/device-sync.ts'
const UUID='11111111-2222-4333-8444-555555555555'
const SETTINGS={url:'https://example.supabase.co',key:'sb_publishable_example_public_key'}
const baseline={version:1,library:[],progress:[],preferences:[
 {key:'auto-next',value:'on'},
 {key:'source-choice:mal:1',value:JSON.stringify({version:1,providerId:'fixture',format:'hls',updatedAt:Date.now()})},
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
  if(url.endsWith('/rpc/yoru_sync_delete'))return Response.json(true)
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
 assert.equal(captured[4].init.method,'POST')
 assert.match(captured[4].url,/\/rpc\/yoru_sync_delete$/)
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

test('known preference keys do not smuggle secrets or executable remote URLs',()=>{
 const dirty={...baseline,preferences:[
  {key:'auto-next',value:'Bearer gho_fake-secret'},
  {key:'subtitle-style:global',value:JSON.stringify({font:'serif',apiKey:'sb_secret_fake'})},
  {key:'watch-path:story-one',value:JSON.stringify({completed:3,updatedAt:1000,token:'secret-token'})},
  {key:'source-choice:mal:42',value:JSON.stringify({version:1,providerId:'https://evil.example/token',format:'hls',updatedAt:Date.now()})},
  {key:'subtitle-offset:mal:42',value:'javascript:alert(1)'},
  {key:'playback-speed',value:'1'},
  {key:'subtitle-default-language',value:'id'},
 ]}
 const safe=syncableBackup(dirty)
 const payload=JSON.stringify(safe)
 assert.equal(/sb_secret_fake|gho_fake-secret|secret-token|evil.example|javascript:/i.test(payload),false)
 assert.deepEqual(safe.preferences?.map(p=>p.key),[
  'subtitle-style:global','watch-path:story-one','playback-speed','subtitle-default-language'
 ])
 assert.deepEqual(JSON.parse(safe.preferences[0].value),{
  font:'serif',size:100,backdrop:'dark',textOpacity:100,
  backgroundOpacity:75,outline:1,position:'original'
 })
 assert.deepEqual(JSON.parse(safe.preferences[1].value),{completed:3,updatedAt:1000})
})

test('privileged SQL lives in unexposed schema with narrow invoker RPC entrypoints',async()=>{
 const {readFileSync}=await import('node:fs')
 const sql=readFileSync(new URL('../supabase/migrations/20261031_yoru_device_sync.sql',import.meta.url),'utf8')
 assert.match(sql,/create schema if not exists yoru_private;/i)
 assert.match(sql,/revoke all on schema yoru_private from public, anon;/i)
 assert.match(sql,/grant usage on schema yoru_private to authenticated;/i)
 assert.match(sql,/grant select on public\.yoru_sync_snapshots to authenticated;/i)
 assert.doesNotMatch(sql,/grant (?:select,\s*)?insert,\s*update,\s*delete on public\.yoru_sync_snapshots/i)
 assert.match(sql,/create policy "yoru_sync_select_own"/i)
 assert.equal((sql.match(/language plpgsql\s+security definer/g)??[]).length,2)
 assert.equal((sql.match(/language sql\s+security invoker/g)??[]).length,2)
 assert.equal((sql.match(/owner_id := \(select auth\.uid\(\)\)/g)??[]).length,2)
 assert.match(sql,/where user_id = owner_id/i)
 assert.match(sql,/where snapshot\.revision = expected_revision/i)
 assert.match(sql,/revoke all on function public\.yoru_sync_put\(bigint,jsonb\)\s+from public, anon, authenticated/i)
 assert.match(sql,/revoke all on function public\.yoru_sync_delete\(\)\s+from public, anon, authenticated/i)
 assert.match(sql,/grant execute on function public\.yoru_sync_delete\(\)\s+to authenticated;/i)
 assert.match(sql,/grant execute on function yoru_private\.sync_put\(bigint,jsonb\)\s+to authenticated;/i)
 assert.equal((sql.match(/\bas \$\$/g)??[]).length,4)
 assert.equal((sql.match(/^\$\$;$/gm)??[]).length,4)
 assert.doesNotMatch(sql,/create or replace function public\.\w+\([^]*?language plpgsql\s+security definer/i)
})

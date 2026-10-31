import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {test} from 'node:test'

function run(mode){
 const script=`
process.env.YORU_SYNC_TEST_URL='https://abcdefghijklmnopqrst.supabase.co'
process.env.YORU_SYNC_TEST_PROJECT_REF='abcdefghijklmnopqrst'
process.env.YORU_SYNC_TEST_PUBLISHABLE_KEY='sb_publishable_fixture_key_only'
process.env.YORU_SYNC_TEST_TOKEN_A='fixture-A'
process.env.YORU_SYNC_TEST_TOKEN_B='fixture-B'
const mode=${JSON.stringify(mode)}
const ids={'fixture-A':'11111111-1111-4111-8111-111111111111','fixture-B':'22222222-2222-4222-8222-222222222222'}
const rows=new Map()
globalThis.fetch=async(input,options={})=>{
 const url=new URL(input)
 const token=options.headers?.Authorization?.replace('Bearer ','')
 const user=ids[token]
 if(url.pathname==='/auth/v1/user')return Response.json({id:user})
 if(!user)return Response.json({error:'denied'},{status:403})
 if(url.pathname==='/rest/v1/yoru_sync_snapshots'){
  if(options.method&&options.method!=='GET')return Response.json({error:'denied'},{status:403})
  const row=rows.get(user)
  const filter=url.searchParams.get('user_id')
  return Response.json(row&&(!filter||filter==='eq.'+user)?[{user_id:user,...row}]:[])
 }
 if(url.pathname.endsWith('/yoru_sync_put')){
  const {expected_revision:revision,next_payload:payload}=JSON.parse(options.body)
  if(!payload||payload.version!==1||!Array.isArray(payload.library)||!Array.isArray(payload.progress))return Response.json({error:'INVALID_PAYLOAD'},{status:400})
  if(revision!==(rows.get(user)?.revision||0))return Response.json({error:'SYNC_CONFLICT'},{status:409})
  rows.set(user,{revision:revision+1,payload})
  return Response.json(revision+1)
 }
 if(url.pathname.endsWith('/yoru_sync_delete')){
  if(mode==='cleanup-error')return Response.json({error:'unavailable'},{status:503})
  if(mode!=='cleanup-lies')rows.delete(user)
  return Response.json(true)
 }
 throw new Error('Unexpected fixture request')
}
await import('./scripts/verify-device-sync-live.mjs')
`
 return spawnSync(process.execPath,['--input-type=module','--eval',script],{encoding:'utf8',timeout:15000})
}
test('live harness reports success only after verified cleanup',()=>{
 const success=run('healthy')
 assert.equal(success.status,0,success.stderr)
 assert.match(success.stdout,/SYNC_LIVE_ACCEPTANCE_PASS/)
 for(const mode of ['cleanup-error','cleanup-lies']){
  const result=run(mode)
  assert.equal(result.status,1,result.stderr)
  assert.equal(result.stdout.includes('SYNC_LIVE_ACCEPTANCE_PASS'),false)
  assert.match(result.stderr,/SYNC_INTEGRATION_FAIL/)
 }
})

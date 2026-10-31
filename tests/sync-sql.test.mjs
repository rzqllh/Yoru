import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
import {PGlite} from '@electric-sql/pglite'

test('actual PostgreSQL rejects missing snapshot fields and preserves owner/RPC boundaries after corrective migration',async()=>{
 const db=new PGlite()
 const a='11111111-1111-4111-8111-111111111111'
 const b='22222222-2222-4222-8222-222222222222'
 const valid={version:1,library:[],progress:[]}
 const asUser=async(id)=>{
  await db.exec('reset role; set role authenticated')
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id])
 }
 const put=(revision,payload)=>db.query('select public.yoru_sync_put($1,$2::jsonb) as revision',[revision,JSON.stringify(payload)])
 try{
  // Local role/JWT-claim fixture, not Supabase Auth or live RLS sign-off.
  await db.exec(`
create role anon;
create role authenticated;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
grant usage on schema auth to anon,authenticated;
insert into auth.users values ('${a}'),('${b}');
`)
  await db.exec(readFileSync(new URL('../supabase/migrations/20261031072944_yoru_device_sync_initial.sql',import.meta.url),'utf8'))
  await asUser(a)
  assert.equal((await put(0,valid)).rows[0].revision,1)
  await db.exec('reset role')
  await db.exec(readFileSync(new URL('../supabase/migrations/20261031134607_yoru_sync_required_payload_fields.sql',import.meta.url),'utf8'))
  await asUser(a)
  for(const payload of [{},{version:1,progress:[]},{version:1,library:[]},
   {version:1,library:null,progress:[]},{...valid,preferences:null}]){
   await assert.rejects(()=>put(1,payload),/INVALID_PAYLOAD/)
  }
  assert.equal((await db.query('select revision from public.yoru_sync_snapshots')).rows[0].revision,1)
  assert.equal((await put(1,{...valid,preferences:[]})).rows[0].revision,2)
  await assert.rejects(()=>put(1,valid),/SYNC_CONFLICT/)
  await assert.rejects(()=>db.query('update public.yoru_sync_snapshots set revision=20'),{code:'42501'})
  await asUser(b)
  assert.deepEqual((await db.query('select * from public.yoru_sync_snapshots')).rows,[])
  assert.equal((await put(0,valid)).rows[0].revision,1)
  assert.deepEqual((await db.query('select * from public.yoru_sync_snapshots where user_id=$1',[a])).rows,[])
  assert.equal((await db.query('select public.yoru_sync_delete() as removed')).rows[0].removed,true)
  await asUser(a)
  assert.equal((await db.query('select revision from public.yoru_sync_snapshots')).rows[0].revision,2)
  await db.exec('reset role')
  await assert.rejects(()=>db.query("update public.yoru_sync_snapshots set payload='{}'::jsonb where user_id=$1",[a]),{code:'23514'})
  await db.exec('set role anon')
  await assert.rejects(()=>db.query('select * from public.yoru_sync_snapshots'),{code:'42501'})
  await assert.rejects(()=>db.query('select public.yoru_sync_delete()'),{code:'42501'})
 }finally{await db.close()}
})

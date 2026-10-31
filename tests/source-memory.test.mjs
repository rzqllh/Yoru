import assert from 'node:assert/strict'
import {test} from 'node:test'
import {sourceMemoryKey,readRememberedSource,saveRememberedSource,rememberedNativeSource,parseSourceMemory,preferRememberedSource} from '../frontend/src/lib/source-memory.ts'

const NOW=1_800_000_000_000
const stream=(providerId,format='hls')=>({providerId,format})
test('source memory contains only provider identity and preserves backup v1 preference limits',()=>{
 const memo=rememberedNativeSource(stream('fixture-source'),NOW)
 assert.deepEqual(memo,{version:1,providerId:'fixture-source',format:'hls',updatedAt:NOW})
 const serialized=JSON.stringify(memo)
 assert.ok(serialized.length<2048)
 assert.deepEqual(parseSourceMemory(serialized,NOW+100),memo)
 assert.equal(sourceMemoryKey(123),'source-choice:mal:123')
 assert.throws(()=>sourceMemoryKey(0),/INVALID_ANIME_ID/)
})
test('never remember embeds, credentials, URLs, unsafe provider ids or expired entries',()=>{
 for(const value of [
  stream('my-provider','embed'),stream('https://host/token'),stream('x?api_key=secret'),
  stream('private provider'),stream(''),stream('a'.repeat(100))
 ])assert.equal(rememberedNativeSource(value,NOW),null)
 const memo=rememberedNativeSource(stream('safe','mp4'),NOW)
 assert.equal(parseSourceMemory(JSON.stringify(memo),NOW+91*24*60*60*1000),null)
 assert.equal(parseSourceMemory(JSON.stringify({...memo,updatedAt:NOW+100000}),NOW),null)
 assert.equal(parseSourceMemory(JSON.stringify({...memo,providerId:'https://token'}),NOW),null)
 assert.equal(parseSourceMemory('not json',NOW),null)
})
test('remembered candidate is preferred but other candidates retain stable order',()=>{
 const options=[stream('quality-high'),stream('remembered','mp4'),stream('fallback')]
 const memo=rememberedNativeSource(options[1],NOW)
 assert.deepEqual(preferRememberedSource(options,memo).map(x=>x.providerId),
  ['remembered','quality-high','fallback'])
 assert.deepEqual(preferRememberedSource(options,null),options)
 assert.notEqual(preferRememberedSource(options,memo),options)
})

test('episode-specific preference wins and legacy anime-wide key remains fallback',async()=>{
 const records=new Map()
 const read=async key=>records.get(key)??''
 const write=async(key,value)=>{records.set(key,value)}
 const first=stream('original-source')
 const second=stream('episode-two-source','mp4')
 assert.equal(await saveRememberedSource(17,1,first,write),true)
 assert.equal(sourceMemoryKey(17,1),'source-choice:mal:17:ep:1')
 assert.equal(parseSourceMemory(records.get(sourceMemoryKey(17,1)))?.providerId,'original-source')
 assert.equal((await readRememberedSource(17,2,read))?.providerId,'original-source')
 assert.equal(await saveRememberedSource(17,2,second,write),true)
 assert.equal((await readRememberedSource(17,1,read))?.providerId,'original-source')
 assert.equal((await readRememberedSource(17,2,read))?.providerId,'episode-two-source')
 assert.equal((await readRememberedSource(17,3,read))?.providerId,'episode-two-source')
 assert.equal(records.size,3)
})
test('episode memory rejects invalid identity, unverified embed and invalid persisted payload',async()=>{
 const records=new Map()
 const write=async(k,v)=>{records.set(k,v)}
 assert.throws(()=>sourceMemoryKey(1,0),/INVALID_EPISODE/)
 assert.throws(()=>sourceMemoryKey(1,20001),/INVALID_EPISODE/)
 assert.equal(await saveRememberedSource(1,1,stream('embed-source','embed'),write),false)
 assert.equal(await saveRememberedSource(1,-1,stream('native'),write),false)
 assert.equal(records.size,0)
 records.set(sourceMemoryKey(1,1),'{"providerId":"https://evil.example/token"}')
 records.set(sourceMemoryKey(1),JSON.stringify(rememberedNativeSource(stream('legacy-safe'),NOW)))
 assert.equal((await readRememberedSource(1,1,async key=>records.get(key)??'',NOW))?.providerId,'legacy-safe')
 assert.equal(await readRememberedSource(1,1,async()=>{throw new Error('Storage unavailable')}),null)
})

test('scoped read failure falls back to safe anime-wide memory, but invalid IDs do not',async()=>{
 const fallback=JSON.stringify(rememberedNativeSource(stream('generic-safe'),NOW))
 const calls=[]
 const read=async key=>{
  calls.push(key)
  if(key==='source-choice:mal:17:ep:2')throw new Error('Scoped IndexedDB read failed')
  return fallback
 }
 assert.equal((await readRememberedSource(17,2,read,NOW))?.providerId,'generic-safe')
 assert.deepEqual(calls,['source-choice:mal:17:ep:2','source-choice:mal:17'])
 calls.length=0
 assert.equal(await readRememberedSource(17,0,read,NOW),null)
 assert.deepEqual(calls,[])
})

test('scoped save succeeds despite generic write failure and never writes generic first',async()=>{
 const saved=new Map()
 const write=async(key,value)=>{
  if(key==='source-choice:mal:17')throw new Error('Generic IndexedDB write failed')
  saved.set(key,value)
 }
 assert.equal(await saveRememberedSource(17,2,stream('scoped-safe'),write),true)
 assert.equal(parseSourceMemory(saved.get('source-choice:mal:17:ep:2'))?.providerId,'scoped-safe')
 assert.equal(saved.has('source-choice:mal:17'),false)
 const calls=[]
 const failScoped=async key=>{
  calls.push(key)
  throw new Error('Scoped IndexedDB write failed')
 }
 assert.equal(await saveRememberedSource(17,2,stream('scoped-safe'),failScoped),false)
 assert.deepEqual(calls,['source-choice:mal:17:ep:2'])
})

test('source memory rejects nonpositive timestamps and invalid current clocks',()=>{
 const memo=rememberedNativeSource(stream('safe'),NOW)
 assert.equal(parseSourceMemory(JSON.stringify({...memo,updatedAt:0}),NOW),null)
 assert.equal(parseSourceMemory(JSON.stringify({...memo,updatedAt:-1}),NOW),null)
 for(const now of [0,-1,NaN,Infinity,1.5])
  assert.equal(parseSourceMemory(JSON.stringify(memo),now),null)
})

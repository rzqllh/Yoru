import assert from 'node:assert/strict'
import {test} from 'node:test'
import {sourceMemoryKey,rememberedNativeSource,parseSourceMemory,preferRememberedSource} from '../frontend/src/lib/source-memory.ts'

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

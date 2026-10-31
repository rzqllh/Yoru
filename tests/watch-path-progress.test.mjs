import assert from 'node:assert/strict'
import {test} from 'node:test'
import {watchPathPreferenceKey,normalizeWatchPathProgress,updateWatchPathProgress} from '../frontend/src/lib/watch-path-progress.ts'
test('manual progress key is backup-compatible and rejects unsafe path identifiers',()=>{
 assert.equal(watchPathPreferenceKey('fate-anime-newcomer'),'watch-path:fate-anime-newcomer')
 assert.throws(()=>watchPathPreferenceKey('../foo'),/INVALID_PATH/)
 assert.throws(()=>watchPathPreferenceKey('x'.repeat(101)),/INVALID_PATH/)
})
test('invalid, stale or excessive progress cannot overstate the curated watch path',()=>{
 assert.deepEqual(normalizeWatchPathProgress('not-json',4),{completed:0,updatedAt:0})
 assert.deepEqual(normalizeWatchPathProgress('{"completed":99,"updatedAt":123}',4),{completed:4,updatedAt:123})
 assert.deepEqual(normalizeWatchPathProgress('{"completed":-1,"updatedAt":"bad"}',4),{completed:0,updatedAt:0})
})
test('manual forward and backward progression uses bounded steps, not actual playback assertions',()=>{
 const start={completed:0,updatedAt:0}
 const a=updateWatchPathProgress(start,3,1,100)
 assert.deepEqual(a,{completed:1,updatedAt:100})
 const b=updateWatchPathProgress({completed:3,updatedAt:200},3,1,300)
 assert.deepEqual(b,{completed:3,updatedAt:200})
 assert.deepEqual(updateWatchPathProgress(a,3,-1,350),{completed:0,updatedAt:350})
})
test('invalid path lengths cannot advance manual progress beyond normalized limits',()=>{
 for(const count of [-1,81,NaN,Infinity,1.5]){
  assert.deepEqual(updateWatchPathProgress({completed:2,updatedAt:50},count,1,100),{completed:0,updatedAt:50})
 }
 assert.deepEqual(updateWatchPathProgress({completed:79,updatedAt:50},80,1,100),{completed:80,updatedAt:100})
})
test('manual progress timestamps never regress or persist invalid clock values',()=>{
 const start={completed:1,updatedAt:200}
 assert.deepEqual(updateWatchPathProgress(start,3,1,100),{completed:2,updatedAt:200})
 assert.deepEqual(updateWatchPathProgress(start,3,1,NaN),{completed:2,updatedAt:200})
 assert.deepEqual(updateWatchPathProgress(start,3,1,-10),{completed:2,updatedAt:200})
 assert.deepEqual(updateWatchPathProgress(start,3,0,300),start)
})

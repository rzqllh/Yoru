import assert from 'node:assert/strict'
import {test} from 'node:test'
import {getAvailableQualityLevels} from '../frontend/src/lib/quality-options.ts'

test('only HLS manifest declared heights are selectable, with no phantom quality',()=>{
 assert.deepEqual(getAvailableQualityLevels([{height:720},{height:480},{height:0}]),[
  {index:0,height:720},{index:1,height:480}
 ])
})
test('duplicate and unsupported manifest heights do not become UI options',()=>{
 assert.deepEqual(getAvailableQualityLevels([{height:1080},{height:1080},{height:NaN},{height:-1},{height:360}]),[
  {index:0,height:1080},{index:4,height:360}
 ])
 assert.deepEqual(getAvailableQualityLevels([]),[])
})
test('malformed HLS level entries are ignored without changing genuine manifest indices',()=>{
 const levels=[null,undefined,false,'720',{height:'1080'},[],{height:Infinity},
  {height:720},{height:480},{height:720},{height:1080},{}]
 assert.deepEqual(getAvailableQualityLevels(levels),[
  {index:10,height:1080},{index:7,height:720},{index:8,height:480}
 ])
 assert.deepEqual(getAvailableQualityLevels([null,undefined,{},[]]),[])
})

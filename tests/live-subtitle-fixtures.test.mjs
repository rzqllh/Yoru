import assert from 'node:assert/strict'
import {test} from 'node:test'
import {parseLiveFixtures} from '../scripts/live-subtitle-fixtures.mjs'

const valid=[
 {provider:'subdl',title:'Title A',episode:1,type:'TV',language:'id'},
 {provider:'subsource',title:'Title B',episode:2,type:'TV',language:'en'},
 {provider:'opensubtitles',title:'Title C',episode:1,type:'Movie',language:'id'},
]
test('live provider fixtures require all three distinct providers and explicit episode',()=>{
 assert.deepEqual(parseLiveFixtures(valid),valid)
 assert.throws(()=>parseLiveFixtures(valid.slice(0,2)),/THREE/)
 assert.throws(()=>parseLiveFixtures([...valid.slice(0,2),valid[0]]),/INVALID/)
 assert.throws(()=>parseLiveFixtures([{...valid[0],episode:0},...valid.slice(1)]),/INVALID/)
 assert.throws(()=>parseLiveFixtures([{...valid[0],language:'xx'},...valid.slice(1)]),/INVALID/)
})

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {summarizeSourceSearch} from '../frontend/src/lib/source-lifecycle.ts'
const hls={format:'hls',url:'https://test.example/media.m3u8',tracks:[],subtitleMode:'unknown'}
test('partial provider failures remain visible alongside unverified candidate metadata',()=>{
 const s=summarizeSourceSearch([{status:'fulfilled',value:{items:[hls],unavailable:[]}},
  {status:'rejected',reason:new Error('Provider timed out')}])
 assert.equal(s.state,'degraded')
 assert.equal(s.items.length,1)
 assert.equal(s.failed,1)
 assert.match(s.message,/Sebagian penyedia gagal/)
 assert.match(s.message,/perlu diperiksa/)
})
test('all failures are distinguishable from empty successful provider results',()=>{
 const down=summarizeSourceSearch([{status:'rejected',reason:new Error('503')}])
 const empty=summarizeSourceSearch([{status:'fulfilled',value:{items:[],unavailable:[]}}])
 assert.equal(down.state,'failed')
 assert.equal(empty.state,'no-direct')
 assert.equal(down.responded,0)
 assert.equal(empty.responded,1)
})
test('hash-only metadata stays unavailable even if all providers respond successfully',()=>{
 const result=summarizeSourceSearch([{status:'fulfilled',value:{items:[],unavailable:[
  {kind:'torrent',label:'1080p source',reason:'Needs a resolver'},
  {kind:'torrent',label:'1080p source',reason:'Needs a resolver'}]}}])
 assert.equal(result.state,'no-direct')
 assert.equal(result.items.length,0)
 assert.equal(result.unavailable.length,1)
})
test('pure resolver never reports candidates as playable or verified',()=>{
 const result=summarizeSourceSearch([{status:'fulfilled',value:{items:[hls]}}])
 assert.equal(result.state,'candidates')
 assert.match(result.message,/belum diverifikasi/i)
})

test('malformed fulfilled provider payloads count as failures without hiding healthy candidates',()=>{
 const result=summarizeSourceSearch([
  {status:'fulfilled',value:null},
  {status:'fulfilled',value:{items:'not-an-array'}},
  {status:'fulfilled',value:{items:[hls],unavailable:[]}}
 ])
 assert.equal(result.queried,3)
 assert.equal(result.responded,1)
 assert.equal(result.failed,2)
 assert.equal(result.state,'degraded')
 assert.deepEqual(result.items,[hls])
})
test('invalid unavailable collection is not reported as a healthy empty response',()=>{
 const result=summarizeSourceSearch([{status:'fulfilled',value:{items:[],unavailable:{kind:'torrent'}}}])
 assert.equal(result.state,'failed')
 assert.equal(result.responded,0)
 assert.equal(result.failed,1)
 assert.deepEqual(result.unavailable,[])
})

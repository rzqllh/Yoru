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

test('malformed individual source entries are discarded without losing valid provider candidates',()=>{
 const result=summarizeSourceSearch([{status:'fulfilled',value:{items:[
  null,false,'bad',{},
  {format:'hls',url:null},
  {format:'mp4',url:'   '},
  {format:'torrent',url:'https://test.example/file'},
  hls
 ]}}])
 assert.equal(result.state,'candidates')
 assert.equal(result.responded,1)
 assert.equal(result.failed,0)
 assert.deepEqual(result.items,[hls])
 assert.match(result.message,/1 kandidat sumber/)
})
test('only malformed entries do not create false video candidates',()=>{
 const result=summarizeSourceSearch([{status:'fulfilled',value:{items:[null,{format:'hls',url:42}]}}])
 assert.equal(result.state,'no-direct')
 assert.equal(result.responded,1)
 assert.deepEqual(result.items,[])
})

test('uncontrolled iframe-only response is not a playable candidate (D02)',()=>{
 const result=summarizeSourceSearch([{status:'fulfilled',value:{items:[{
  format:'embed',url:'https://www.animeembed.com/embed/mal/1/1',tracks:[],subtitleMode:'unknown'
 }]}}])
 assert.equal(result.state,'no-direct')
 assert.deepEqual(result.items,[])
 assert.equal(result.responded,1)
})
test('uncontrolled embed cannot remove valid native candidate',()=>{
 const result=summarizeSourceSearch([{status:'fulfilled',value:{items:[
  {format:'embed',url:'https://www.animeembed.com/embed/mal/1/1'},hls
 ]}}])
 assert.equal(result.state,'candidates')
 assert.deepEqual(result.items,[hls])
})

test('malformed unavailable metadata is ignored without hiding valid provider evidence',()=>{
 const valid={kind:'torrent',label:'1080p source',reason:'Needs a resolver'}
 const result=summarizeSourceSearch([{status:'fulfilled',value:{items:[hls],unavailable:[
  null,false,{},[],
  {kind:'arbitrary',label:'fake',reason:'Not a supported category'},
  {kind:'external',label:'  ',reason:'Missing label'},
  {kind:'unsupported',label:'Missing reason',reason:'   '},
  {kind:'torrent',label:'x'.repeat(161),reason:'Oversize label'},
  {kind:'torrent',label:'Bounded label',reason:'x'.repeat(251)},
  valid,valid
 ]}}])
 assert.equal(result.state,'candidates')
 assert.equal(result.responded,1)
 assert.deepEqual(result.items,[hls])
 assert.deepEqual(result.unavailable,[valid])
})

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {parseMiruroEpisodes,parseMiruroStreams,miruroBase,aggregatorBase,isAggregatorConfigured} from '../backend/providers/miruro.ts'

test('Aggregator base respects AGGREGATOR_API_BASE and MIRURO_API_BASE safely',()=>{
 const prevAgg=process.env.AGGREGATOR_API_BASE
 const prevMir=process.env.MIRURO_API_BASE
 try{
  delete process.env.AGGREGATOR_API_BASE
  delete process.env.MIRURO_API_BASE
  assert.equal(miruroBase(),null)
  assert.equal(isAggregatorConfigured(),false)

  process.env.AGGREGATOR_API_BASE='https://aggregator.example.org'
  assert.equal(aggregatorBase(),'https://aggregator.example.org')
  assert.equal(isAggregatorConfigured(),true)

  // Unsafe bases are rejected
  process.env.AGGREGATOR_API_BASE='http://insecure.example.org'
  assert.equal(aggregatorBase(),null)

  process.env.AGGREGATOR_API_BASE='https://127.0.0.1'
  assert.equal(aggregatorBase(),null)
 }finally{
  if(prevAgg!==undefined)process.env.AGGREGATOR_API_BASE=prevAgg;else delete process.env.AGGREGATOR_API_BASE
  if(prevMir!==undefined)process.env.MIRURO_API_BASE=prevMir;else delete process.env.MIRURO_API_BASE
 }
})

test('Miruro episode adapter accepts exact provider identity and drops wrong mappings',()=>{
 const input={results:{providers:{kiwi:{episodes:{sub:[
  {id:'watch/kiwi/20/sub/ep-1',number:1,title:'Episode One'},
  {id:'watch/kiwi/21/sub/ep-2',number:2},
  {id:'watch/kiwi/20/sub/ep-1-duplicate',number:1}
 ]}}}}}
 const result=parseMiruroEpisodes(input,52991,20)
 assert.equal(result.length,1)
 assert.equal(result[0].id,'miruro-kiwi:52991:1')
})
test('Miruro stream adapter excludes embeds, private and non-media URLs',()=>{
 const input={results:{streams:[
  {type:'embed',url:'https://embed.example.com/watch'},
  {type:'hls',url:'https://cdn.example.org/master.m3u8',quality:'1080p'},
  {type:'hls',url:'https://localhost/a.m3u8'},
  {type:'mp4',url:'https://cdn.example.org/video.mp4'}
 ],subtitles:[{url:'https://cdn.example.org/subs.vtt',language:'id',label:'Indonesia'}]}}
 const result=parseMiruroStreams(input,'kiwi',1)
 assert.equal(result.length,2)
 assert.equal(result[0].subtitleMode,'soft')
 assert.equal(result[0].tracks[0].lang,'id')
 assert.equal(result[0].quality,'1080p')
})

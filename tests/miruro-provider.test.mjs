import assert from 'node:assert/strict'
import {test} from 'node:test'
import {parseMiruroEpisodes,parseMiruroStreams} from '../backend/providers/miruro.ts'

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

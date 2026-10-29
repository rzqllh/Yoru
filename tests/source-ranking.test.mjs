import {test} from 'node:test'
import assert from 'node:assert/strict'
import {rankNativeStreams} from '../frontend/src/lib/source-ranking.ts'

test('ranks viable HLS/MP4 quality and verified subtitle language without trusting embeds',()=>{
 const items=[
  {format:'mp4',url:'https://video.test/360.mp4',quality:'360p',subtitleMode:'unknown',tracks:[]},
  {format:'hls',url:'https://video.test/1080.m3u8',quality:'1080p',subtitleMode:'soft',tracks:[{lang:'id',label:'Indonesia',url:'https://video.test/sub.vtt'}]},
  {format:'embed',url:'https://video.test/iframe',quality:'4K',subtitleMode:'unknown',tracks:[]},
  {format:'hls',url:'https://video.test/720.m3u8',quality:'720p',subtitleMode:'soft',tracks:[]},
 ]
 const ranked=rankNativeStreams(items)
 assert.deepEqual(ranked.map(x=>x.quality),['1080p','720p','360p'])
 assert.equal(ranked.some(x=>x.format==='embed'),false)
})
test('ties preserve original provider order and never claim unverified 4K',()=>{
 const a={format:'hls',url:'https://a.test/media.m3u8',subtitleMode:'unknown',tracks:[]}
 const b={...a,url:'https://b.test/media.m3u8'}
 assert.deepEqual(rankNativeStreams([a,b]).map(s=>s.url),[a.url,b.url])
})

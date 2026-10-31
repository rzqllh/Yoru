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

test('malformed subtitle and quality metadata cannot hide healthy native candidates',()=>{
 const malformed=[
  {format:'hls',quality:'720p',subtitleMode:'unknown',tracks:null,providerId:'missing-tracks'},
  {format:'mp4',quality:720,subtitleMode:'soft',tracks:[null,{lang:42}],providerId:'bad-track'},
  {format:'hls',quality:'720p',subtitleMode:'soft',tracks:[{lang:'ID'}],providerId:'healthy'}
 ]
 const ranked=rankNativeStreams(malformed)
 assert.deepEqual(ranked.map(x=>x.providerId),['healthy','missing-tracks','bad-track'])
 assert.equal(ranked.length,3)
})
test('untrusted non-Indonesian tracks do not receive an invented subtitle ranking bonus',()=>{
 const sources=[
  {format:'hls',quality:'480p',subtitleMode:'unknown',tracks:[{lang:null}],providerId:'invalid-lang'},
  {format:'mp4',quality:'480p',subtitleMode:'soft',tracks:[{lang:'id'}],providerId:'verified-id'}
 ]
 assert.deepEqual(rankNativeStreams(sources).map(x=>x.providerId),['verified-id','invalid-lang'])
})

test('bitrate and dimension labels never masquerade as advertised video height',()=>{
 const sources=[
  {format:'hls',quality:'2160kbps',subtitleMode:'unknown',tracks:[],providerId:'bitrate-2160'},
  {format:'mp4',quality:'720p',subtitleMode:'unknown',tracks:[],providerId:'explicit-720'},
  {format:'hls',quality:'1920x1080',subtitleMode:'unknown',tracks:[],providerId:'dimensions'},
  {format:'mp4',quality:'1080px',subtitleMode:'unknown',tracks:[],providerId:'pixels'},
  {format:'hls',quality:'1080p60',subtitleMode:'unknown',tracks:[],providerId:'explicit-1080'},
  {format:'hls',quality:'480p HDR',subtitleMode:'unknown',tracks:[],providerId:'explicit-480'},
 ]
 assert.deepEqual(rankNativeStreams(sources).map(s=>s.providerId),[
  'explicit-1080','explicit-720','explicit-480','bitrate-2160','dimensions','pixels'
 ])
})

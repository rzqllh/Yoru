import assert from 'node:assert/strict'
import {test} from 'node:test'
import {normalizeStremioSubtitles,stremioSubtitlePath} from '../backend/providers/stremio-core.ts'

const addon={id:'subtest',name:'Subtitle addon',manifestUrl:'https://addon.example.org/manifest.json',anime:[]}

test('maps a configured episode to standard Stremio subtitle resource',()=>{
 const url=stremioSubtitlePath(addon,'tmdb:123',1,5)
 assert.equal(url.toString(),'https://addon.example.org/subtitles/series/tmdb%3A123%3A1%3A5.json')
})

test('keeps only original Indonesian and English subtitle tracks',()=>{
 const result=normalizeStremioSubtitles({subtitles:[
  {id:'id-1',lang:'ind',label:'Indonesia',url:'https://sub.example.org/id.srt'},
  {id:'en-1',lang:'eng',label:'English',url:'https://sub.example.org/en.vtt'},
  {id:'dub',lang:'ja',label:'日本語',url:'https://sub.example.org/ja.vtt'},
  {id:'private',lang:'id',url:'https://127.0.0.1/caption.vtt'},
  {id:'evil',lang:'id',url:'http://sub.example.org/bad.vtt'},
  {id:'bad-format',lang:'id',url:'https://sub.example.org/subtitle.exe'}
 ]},'stremio-subtest')
 assert.deepEqual(result.map(s=>s.lang),['id','en'])
 assert.equal(result[0].label,'Indonesia')
})

test('limits malformed subtitle resources and forbids embedded markup URLs',()=>{
 assert.throws(()=>normalizeStremioSubtitles({subtitles:new Array(60).fill({})},'x'),/Invalid subtitle response/)
 assert.deepEqual(normalizeStremioSubtitles({subtitles:[{id:'x',lang:'id',url:'https://user:password@sub.example.org/sub.srt'}]},'x'),[])
})

test('Stremio subtitle resources recognize regional ISO language aliases without accepting unrelated languages',()=>{
 const results=normalizeStremioSubtitles({subtitles:[
  {id:'i1',lang:'id-ID',url:'https://cdn.example.com/id.srt'},
  {id:'i2',lang:'ind_ID',url:'https://cdn.example.com/ind.srt'},
  {id:'e1',lang:'eng',url:'https://cdn.example.com/eng.vtt'},
  {id:'e2',lang:'en-US',url:'https://cdn.example.com/en.vtt'},
  {id:'j1',lang:'ja-JP',url:'https://cdn.example.com/jp.vtt'},
  {id:'not-id',lang:'india',url:'https://cdn.example.com/bad.vtt'}
 ]},'stremio-subtest')
 assert.deepEqual(results.map(x=>x.lang),['id','id','en','en'])
 assert.deepEqual(results.map(x=>x.id),['i1','i2','e1','e2'])
})

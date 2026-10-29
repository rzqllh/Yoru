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

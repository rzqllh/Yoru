import assert from 'node:assert/strict'
import {test} from 'node:test'
import {normalizeSubDl,normalizeOpenSubtitles,normalizeSubSource,toWebVtt} from '../backend/providers/subtitles.ts'

test('SubDL episode unpacking requires exact episode and allowed raw download path',()=>{
 const result=normalizeSubDl({subtitles:[{unpack_files:[
  {episode:5,language:'ID',url:'/subtitle/20/file10',release_name:'Episode 05'},
  {episode:6,language:'EN',url:'/subtitle/20/file11'},
  {episode:5,language:'ID',url:'https://127.0.0.1/private'},
 ]}]},5)
 assert.equal(result.length,1)
 assert.equal(result[0].language,'id')
 assert.match(result[0].sourceUrl,/provider=subdl/)
})
test('OpenSubtitles exact episode and language normalization',()=>{
 const result=normalizeOpenSubtitles({data:[
  {attributes:{language:'ind',release:'OVA',feature_details:{episode_number:4},files:[{file_id:11}]}},
  {attributes:{language:'eng',release:'Episode 5',feature_details:{episode_number:5},files:[{file_id:12}]}}
 ]},5)
 assert.equal(result.length,1)
 assert.equal(result[0].fileId,12)
})
test('SubSource rejects uncertain shapes and mismatched episodes',()=>{
 assert.deepEqual(normalizeSubSource({data:[{id:'25',language:'ID',episode_number:2}]},1),[])
 assert.equal(normalizeSubSource({data:[{id:'25',language:'Indonesian',episode_number:1}]},1).length,1)
 assert.deepEqual(normalizeSubSource({results:[{url:'https://localhost/srt'}]},1),[])
})
test('SRT to VTT conversion keeps cue text and rejects unknown formats',()=>{
 const result=toWebVtt('1\\n00:00:01,123 --> 00:00:02,500\\nHello\\n')
 assert.ok(result.startsWith('WEBVTT'))
 assert.ok(result.includes('00:00:01.123'))
 assert.throws(()=>toWebVtt('[Script Info]'),/UNSUPPORTED/)
})

test('ASS dialogue is converted to uniform WebVTT without styling or code tags',()=>{
 const source=[
  '[Script Info]','Title: test','[Events]',
  'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  'Dialogue: 0,0:00:01.00,0:00:03.50,Default,,0,0,0,,{\\\\k30}Halo, dunia\\\\Nbaris dua'
 ].join('\\n')
 const result=toWebVtt(source)
 assert.match(result,/00:00:01.000 --> 00:00:03.500/)
 assert.match(result,/Halo, dunia/)
 assert.doesNotMatch(result,/\\\\k30/)
})

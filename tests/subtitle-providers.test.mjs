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
test('provider episode matching rejects boolean, array and exponent coercion without losing decimal episode strings',()=>{
 const malformed=[true,[5],{value:5},'5e0','5.0',5.5]
 const subdl=normalizeSubDl({subtitles:[{unpack_files:[
  ...malformed.map((episode,i)=>({episode,language:'ID',url:`/subtitle/20/bad${i}`})),
  {episode:'05',language:'ID',url:'/subtitle/20/good'}
 ]}]},5)
 assert.deepEqual(subdl.map(x=>x.score),[70])
 assert.equal(subdl.length,1)
 const opensubtitles=normalizeOpenSubtitles({data:[
  ...malformed.map((episode,i)=>({attributes:{language:'ind',feature_details:{episode_number:episode},files:[{file_id:i+1}]}})),
  {attributes:{language:'ind',feature_details:{episode_number:'05'},files:[{file_id:99}]}}
 ]},5)
 assert.deepEqual(opensubtitles.map(x=>x.fileId),[99])
 const subsource=normalizeSubSource({data:[
  ...malformed.map((episode,i)=>({id:String(i+1),language:'ID',episode_number:episode})),
  {id:'99',language:'ID',episode_number:'05'}
 ]},5)
 assert.deepEqual(subsource.map(x=>x.id),['subsource:99'])
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
 ].join('\n')
 const result=toWebVtt(source)
 assert.match(result,/00:00:01.000 --> 00:00:03.500/)
 assert.match(result,/Halo, dunia/)
 assert.doesNotMatch(result,/\\\\k30/)
})

import {grantSubtitleUrl,verifySubtitleGrant} from '../backend/providers/subtitles.ts'
import {findSubtitles} from '../backend/providers/subtitles.ts'

test('SubDL v1 sends api_key in query, not an unsupported Bearer header',async()=>{
 const oldKey=process.env.SUBDL_API_KEY,oldFetch=globalThis.fetch
 delete process.env.OPENSUBTITLES_API_KEY
 delete process.env.SUBSOURCE_API_KEY
 process.env.SUBDL_API_KEY='fixture-v1-key'
 let seen=false
 try{
  globalThis.fetch=async(url,options)=>{
   const parsed=new URL(String(url))
   assert.equal(parsed.origin,'https://api.subdl.com')
   assert.equal(parsed.pathname,'/api/v1/subtitles')
   assert.equal(parsed.searchParams.get('api_key'),'fixture-v1-key')
   assert.equal(options.headers.Authorization,undefined)
   seen=true
   return new Response(JSON.stringify({status:true,subtitles:[{unpack_files:[{
    episode:5,language:'ID',url:'/subtitle/parent/abc123',release_name:'Episode 05'}]}]}),
    {status:200,headers:{'content-type':'application/json'}})
  }
  const res=await findSubtitles({title:'Example Anime',episode:5,type:'TV'})
  assert.equal(seen,true)
  assert.equal(res.items.length,1)
  const signed=new URL(res.items[0].sourceUrl,'http://yoru.local')
  assert.equal(signed.searchParams.has('api_key'),false)
  assert.equal(verifySubtitleGrant('subdl',signed.searchParams.get('ref'),signed.searchParams.get('expires'),signed.searchParams.get('token')),true)
 }finally{
  globalThis.fetch=oldFetch
  if(oldKey===undefined)delete process.env.SUBDL_API_KEY
  else process.env.SUBDL_API_KEY=oldKey
 }
})
test('subtitle grant rejects tampering and expires',()=>{
 const url=new URL(grantSubtitleUrl('/api/subtitles/file?provider=subdl&ref=%2Fsubtitle%2F20%2Ffile1',1000000000000),'http://yoru.local')
 const query=url.searchParams
 const expiry=query.get('expires'),token=query.get('token'),ref=query.get('ref')
 assert.equal(verifySubtitleGrant('subdl',ref,expiry,token,1000000000000),true)
 assert.equal(verifySubtitleGrant('subdl',ref+'-evil',expiry,token,1000000000000),false)
 assert.equal(verifySubtitleGrant('subdl',ref,expiry,token,1000000000000+600001),false)
 assert.equal(verifySubtitleGrant('subdl',ref,expiry,'0'.repeat(64),1000000000000),false)
})


import {compareSubtitleCandidates} from '../backend/providers/subtitles.ts'
test('Indonesian addon subtitles outrank other verified Indonesian tracks and English alternatives',()=>{
 const example=(id,provider,language,score)=>({id,provider,language,score,episode:1,label:language==='id'?'Indonesia':'English',release:'',sourceUrl:'/api/subtitles/file?ref=x'})
 const list=[
  example('english-stremio','stremio','en',99),
  example('id-subdl','subdl','id',99),
  example('id-stremio','stremio','id',70),
  example('en-subsource','subsource','en',70)
 ]
 list.sort(compareSubtitleCandidates)
 assert.deepEqual(list.map(x=>x.id),['id-stremio','id-subdl','english-stremio','en-subsource'])
})

test('later-season metadata is accepted only when provider season and episode are exact',async()=>{
 const {explicitSubtitleSeason}=await import('../backend/providers/subtitles.ts')
 assert.equal(explicitSubtitleSeason('The Apothecary Diaries Season 3'),3)
 assert.equal(explicitSubtitleSeason('Kusuriya no Hitorigoto 3rd Season'),3)
 assert.equal(explicitSubtitleSeason('Series Season 2 Part 2'),null)
 assert.equal(explicitSubtitleSeason('Original Anime'),null)
 assert.equal(explicitSubtitleSeason('Series Season 2024'),null)
 const files=[
  {episode:1,season_number:1,language:'ID',url:'/subtitle/20/wrong'},
  {episode:1,language:'ID',url:'/subtitle/20/unknown'},
  {episode:1,season_number:3,language:'ID',url:'/subtitle/20/good'}
 ]
 assert.deepEqual(normalizeSubDl({subtitles:[{unpack_files:files}]},1,3).map(x=>x.id),
  normalizeSubDl({subtitles:[{unpack_files:[files[2]]}]},1,3).map(x=>x.id))
 const opensubs=normalizeOpenSubtitles({data:[
  {attributes:{language:'ind',feature_details:{episode_number:1,season_number:1},files:[{file_id:1}]}},
  {attributes:{language:'ind',feature_details:{episode_number:1},files:[{file_id:2}]}},
  {attributes:{language:'ind',feature_details:{episode_number:1,season_number:3},files:[{file_id:3}]}}
 ]},1,3)
 assert.deepEqual(opensubs.map(x=>x.fileId),[3])
 const subsource=normalizeSubSource({data:[
  {id:'1',language:'ID',episode_number:1,season_number:1},
  {id:'2',language:'ID',episode_number:1},
  {id:'3',language:'ID',episode_number:1,season_number:3}
 ]},1,3)
 assert.deepEqual(subsource.map(x=>x.id),['subsource:3'])
})
test('search uses an explicit season 3 rather than incorrectly searching season 1',async()=>{
 const previous={subdl:process.env.SUBDL_API_KEY,subsource:process.env.SUBSOURCE_API_KEY,
  opensub:process.env.OPENSUBTITLES_API_KEY}
 const oldFetch=globalThis.fetch
 process.env.SUBDL_API_KEY='test-key'
 delete process.env.OPENSUBTITLES_API_KEY
 delete process.env.SUBSOURCE_API_KEY
 const seen=[]
 try{
  globalThis.fetch=async(url)=>{
   const parsed=new URL(String(url))
   seen.push({origin:parsed.origin,season:parsed.searchParams.get('season_number'),
    episode:parsed.searchParams.get('episode_number')})
   return new Response(JSON.stringify({subtitles:[{unpack_files:[
    {episode:1,season_number:1,language:'ID',url:'/subtitle/20/wrong'},
    {episode:1,season_number:3,language:'ID',url:'/subtitle/20/right'}
   ]}]}),{status:200,headers:{'content-type':'application/json'}})
  }
  const later=await findSubtitles({title:'Kusuriya no Hitorigoto 3rd Season',episode:1,type:'TV'})
  assert.equal(seen[0].origin,'https://api.subdl.com')
  assert.equal(seen[0].season,'3')
  assert.equal(seen[0].episode,'1')
  assert.equal(later.items.length,1)
  assert.equal(later.items[0].release,'')
  seen.length=0
  await findSubtitles({title:'Original Anime',episode:1,type:'TV'})
  assert.equal(seen[0].season,null)
 }finally{
  globalThis.fetch=oldFetch
  for(const [name,value]of [['SUBDL_API_KEY',previous.subdl],['SUBSOURCE_API_KEY',previous.subsource],['OPENSUBTITLES_API_KEY',previous.opensub]]){
   if(value===undefined)delete process.env[name]
   else process.env[name]=value
  }
 }
})

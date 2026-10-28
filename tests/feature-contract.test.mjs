import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeAnime, normalizeList, normalizeEpisode } from '../backend/pipeline/normalize.ts'
import { assertSafeMediaUrl, validateProviderConfig } from '../backend/pipeline/validate.ts'

const sample = { mal_id: 100, title: 'Fullmetal Alchemist', title_english: 'Fullmetal Alchemist', title_japanese:'鋼の錬金術師', images: { jpg: { large_image_url:'https://cdn.myanimelist.net/test.jpg' } }, score:9.1, episodes:64, year:2009, status:'Finished Airing', synopsis:'Two brothers...', genres:[{name:'Action'}], studios:[{name:'Bones'}], trailer:{youtube_id:'abc'} }
test('Jikan anime response preserves canonical MAL identity and metadata',()=>{
  const anime = normalizeAnime(sample)
  assert.equal(anime.id,'mal:100')
  assert.equal(anime.title,'Fullmetal Alchemist')
  assert.equal(anime.poster,'https://cdn.myanimelist.net/test.jpg')
  assert.equal(anime.episodes,64)
  assert.deepEqual(anime.genres,['Action'])
})
test('Jikan list normalizer removes duplicate IDs',()=>{
  assert.equal(normalizeList([sample,sample]).length,1)
})
test('Jikan episode normalizer creates canonical episode key independent of provider',()=>{
  const ep = normalizeEpisode('mal:100',{mal_id:1,title:'Episode One',filler:false})
  assert.equal(ep.id,'mal:100:1')
  assert.equal(ep.number,1)
})
test('media URL validation rejects private network, auth and non-https URLs',()=>{
  for(const uri of ['http://example.com/video.m3u8','https://127.0.0.1/a','https://192.168.1.2/v','https://localhost/a','https://[::1]/a','https://username:password@host.example/v','https://10.0.1.1/v']) {
    assert.throws(()=>assertSafeMediaUrl(uri),undefined,uri)
  }
  assert.equal(assertSafeMediaUrl('https://media.example.org/video.m3u8'),'https://media.example.org/video.m3u8')
})
test('provider config validates episode mapping, tracks and stream mode',()=>{
 const config=validateProviderConfig({id:'local-demo',name:'Local Demo',anime:[{malId:100,episodes:[{number:1,streams:[{format:'hls',url:'https://media.example.org/v.m3u8',subtitleMode:'soft',tracks:[{lang:'id',label:'Bahasa Indonesia',url:'https://media.example.org/sub.vtt'}]}]}]}]})
 assert.equal(config.anime[0].episodes[0].streams[0].tracks[0].lang,'id')
 assert.throws(()=>validateProviderConfig({id:'unsafe',name:'Unsafe',anime:[{malId:3,episodes:[{number:1,streams:[{format:'mp4',url:'http://localhost/private',subtitleMode:'unknown',tracks:[]}]}]}]}))
})

test('provider config retains optional searchable anime title',()=>{
 const cfg=validateProviderConfig({id:'hello',name:'Hello',anime:[{malId:4,title:'Cowboy Bebop',episodes:[]}]})
 assert.equal(cfg.anime[0].title,'Cowboy Bebop')
})

test('provider config rejects ambiguous anime and episode identifiers',()=>{
 const stream={format:'mp4',url:'https://media.example.org/watch.mp4',subtitleMode:'unknown',tracks:[]}
 const ep={number:1,streams:[stream]}
 const anime={malId:101,episodes:[ep]}
 assert.throws(()=>validateProviderConfig({id:'dub',name:'Duplicate Anime',anime:[anime,{...anime}]}),/duplicate/i)
 assert.throws(()=>validateProviderConfig({id:'dub',name:'Duplicate Episodes',anime:[{malId:101,episodes:[ep,{...ep}]}]}),/duplicate/i)
})

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {normalizeWatchGuide,sortWatchGuideByRelease} from '../backend/pipeline/watch-guide.ts'
const n=(id,idMal,type='ANIME',year=2020,format='TV')=>({id,idMal,type,format,title:{romaji:'Anime '+id},startDate:{year,month:1},coverImage:{medium:'https://images.example.com/'+id+'.jpg'}})
test('AniList relation explorer returns mapped anime nodes without inventing canonical order',()=>{
 const input={data:{Media:{...n(10,100),relations:{edges:[
  {relationType:'PREQUEL',node:n(9,99,'ANIME',2018)},
  {relationType:'ALTERNATIVE',node:n(11,null,'ANIME',2021,'MOVIE')},
  {relationType:'SEQUEL',node:n(11,null,'ANIME',2021,'MOVIE')},
  {relationType:'ADAPTATION',node:n(22,222,'MANGA',2015)},
 ]}}}}
 const result=normalizeWatchGuide(input,100)
 assert.equal(result.scope,'direct-relations')
 assert.equal(result.items.length,3)
 assert.deepEqual(result.items.map(x=>x.relation),['CURRENT','PREQUEL','ALTERNATIVE'])
 assert.equal(result.items[2].malId,null)
 assert.deepEqual(sortWatchGuideByRelease(result.items).map(x=>x.aniListId),[9,10,11])
})
test('watch guide refuses mismatched/missing MAL identity and unknown relation nodes',()=>{
 assert.throws(()=>normalizeWatchGuide({data:{Media:n(1,222)}},100),/MAPPING/)
 assert.throws(()=>normalizeWatchGuide({data:{Media:null}},100),/MAPPING/)
 assert.throws(()=>normalizeWatchGuide({},0),/BAD_MAL/)
})

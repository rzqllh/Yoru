import assert from 'node:assert/strict'
import {test} from 'node:test'
import {normalizeAnime,normalizeEpisode,normalizeList} from '../backend/pipeline/normalize.ts'

test('catalog rejects fractional and unsafe MAL anime IDs instead of fabricating identities',()=>{
 for(const mal_id of [1.5,0,-1,Number.MAX_SAFE_INTEGER+1,Infinity,NaN,'100']){
  assert.throws(()=>normalizeAnime({mal_id,title:'Bad ID'}),/Invalid MAL anime id/)
 }
 assert.deepEqual(normalizeList([
  {mal_id:1.5,title:'Invalid'},
  {mal_id:42,title:'Valid',score:8.7},
  {mal_id:Number.MAX_SAFE_INTEGER+1,title:'Unsafe'}
 ]).map(anime=>anime.malId),[42])
 assert.equal(normalizeAnime({mal_id:42,title:'Valid',score:8.7}).score,8.7)
})

test('episode normalization requires positive safe integer episode identity',()=>{
 for(const mal_id of [0,1.5,-1,Number.MAX_SAFE_INTEGER+1,Infinity,NaN,'2']){
  assert.throws(()=>normalizeEpisode('mal:42',{mal_id,title:'Invalid'}),/Invalid episode number/)
 }
 assert.deepEqual(normalizeEpisode('mal:42',{mal_id:2,title:'Episode Two'}),{
  id:'mal:42:2',animeId:'mal:42',number:2,title:'Episode Two',filler:false,recap:false
 })
})

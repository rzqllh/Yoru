import assert from 'node:assert/strict'
import {test} from 'node:test'
import {validateProviderConfig} from '../backend/pipeline/validate.ts'

const valid={
 id:'fixture',name:'Local test provider',
 anime:[{malId:42,title:'Valid',episodes:[{
  number:2,title:'Episode 2',
  streams:[{format:'mp4',url:'https://cdn.example.org/episode.mp4',
   subtitleMode:'soft',tracks:[{lang:'id',label:'Indonesia',url:'https://cdn.example.org/id.vtt'}]}]
 }]}]
}

test('local provider keeps numeric MAL/episode identities and supported subtitle modes',()=>{
 const result=validateProviderConfig(valid)
 assert.equal(result.anime[0].malId,42)
 assert.equal(result.anime[0].episodes[0].number,2)
 assert.equal(result.anime[0].episodes[0].streams[0].subtitleMode,'soft')
})

test('local provider rejects coerced MAL IDs instead of mapping unrelated anime',()=>{
 for(const malId of [true,'42',[42],{valueOf:()=>42},0,-1,1.5,Infinity,Number.MAX_SAFE_INTEGER+1]){
  assert.throws(()=>validateProviderConfig({...valid,anime:[{...valid.anime[0],malId}]}),
   /Invalid MAL id/,String(malId))
 }
})

test('local provider rejects coerced episode numbers instead of matching wrong episodes',()=>{
 for(const number of [true,'2',[2],{valueOf:()=>2},0,-1,1.5,Infinity,Number.MAX_SAFE_INTEGER+1]){
  const anime={...valid.anime[0],episodes:[{...valid.anime[0].episodes[0],number}]}
  assert.throws(()=>validateProviderConfig({...valid,anime:[anime]}),
   /Invalid episode number/,String(number))
 }
})

test('local provider rejects object-coerced subtitle modes without affecting valid modes',()=>{
 const base=valid.anime[0].episodes[0].streams[0]
 for(const subtitleMode of [true,['soft'],{toString:()=> 'soft'},null,0,'invalid']){
  const episode={...valid.anime[0].episodes[0],streams:[{...base,subtitleMode}]}
  const anime={...valid.anime[0],episodes:[episode]}
  assert.throws(()=>validateProviderConfig({...valid,anime:[anime]}),
   /Invalid subtitle mode/)
 }
 for(const subtitleMode of ['hard','soft','unknown']){
  const episode={...valid.anime[0].episodes[0],streams:[{...base,subtitleMode}]}
  assert.equal(validateProviderConfig({...valid,anime:[{...valid.anime[0],episodes:[episode]}]})
   .anime[0].episodes[0].streams[0].subtitleMode,subtitleMode)
 }
})

import assert from 'node:assert/strict'
import {test} from 'node:test'
import {validateBackup} from '../frontend/src/lib/backup.ts'

const anime={id:'mal:100',malId:100,title:'Fullmetal Alchemist'}
const row={anime,status:'watching',updatedAt:1700000000000}
const progress={anime,episode:1,seconds:28,duration:1400,updatedAt:1700000000100}
const backup={version:1,library:[row],progress:[progress]}

test('accepts a valid, versioned local-first backup',()=>{
 assert.equal(validateBackup(backup),true)
})

test('rejects corrupt or malicious backup rows before any IndexedDB write',()=>{
 for(const item of [
  {...backup,library:[{...row,anime:{id:'',title:'Invalid',malId:-1}}]},
  {...backup,library:[{...row,status:'__proto__'}]},
  {...backup,library:[{...row,updatedAt:Infinity}]},
  {...backup,progress:[{...progress,seconds:-10}]},
  {...backup,progress:[{...progress,duration:-1}]},
  {...backup,progress:[{...progress,episode:0}]},
  {...backup,progress:[{...progress,anime:{id:'mal:101',malId:100,title:'Wrong'}}]},
  {...backup,progress:[progress,{...progress}]},
  {...backup,library:[row,{...row}]},
  {...backup,library:[null]},
  {...backup,progress:[null]},
  {...backup,progress:'nope'},
  {...backup,version:2},
 ]){
  assert.equal(validateBackup(item),false,JSON.stringify(item))
 }
})

test('accepts a legacy backup with additional anime metadata',()=>{
 assert.equal(validateBackup({...backup,library:[{...row,anime:{...anime,year:2009,score:9.5,poster:null,genres:[]}}]}),true)
})

test('legacy backup anime metadata gets normalized before entering IndexedDB',async()=>{
 const {normalizeBackupAnime}=await import('../frontend/src/lib/backup.ts')
 const normalized=normalizeBackupAnime({id:'mal:100',malId:100,title:'Fullmetal Alchemist'})
 assert.deepEqual(normalized.genres,[])
 assert.deepEqual(normalized.studios,[])
 assert.equal(normalized.poster,null)
 assert.equal(normalized.score,null)
 assert.equal(normalized.englishTitle,null)
 assert.equal(normalized.episodes,null)
 assert.equal(normalized.synopsis,'')
})
test('corrupt optional backup metadata cannot be carried into app rendering',async()=>{
 const {normalizeBackupAnime}=await import('../frontend/src/lib/backup.ts')
 const normalized=normalizeBackupAnime({
  id:'mal:100',malId:100,title:'Fullmetal Alchemist',genres:['Action',33,null],
  studios:'not-array',poster:404,score:Infinity,episodes:'?',year:0,
  synopsis:{value:'bad'},trailerYoutubeId:{value:'bad'},status:null,type:33
 })
 assert.deepEqual(normalized.genres,['Action'])
 assert.deepEqual(normalized.studios,[])
 assert.equal(normalized.poster,null)
 assert.equal(normalized.score,null)
 assert.equal(normalized.episodes,null)
 assert.equal(normalized.year,null)
 assert.equal(normalized.synopsis,'')
 assert.equal(normalized.trailerYoutubeId,null)
 assert.equal(normalized.status,'Unknown')
})

test('backup v1 can optionally include safe preferences without breaking old exports',()=>{
 assert.equal(validateBackup(backup),true)
 assert.equal(validateBackup({...backup,preferences:[{key:'subtitle:mal:100:offset',value:'-2.0'}]}),true)
 for(const preferences of [
  [{key:'subtitle:mal:100:offset',value:'0'},{key:'subtitle:mal:100:offset',value:'1'}],
  [{key:'__proto__[x]',value:'attack'}],
  [{key:'test',value:'a'.repeat(2049)}],
  'bad-value',
  [null],
 ])assert.equal(validateBackup({...backup,preferences}),false)
})

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

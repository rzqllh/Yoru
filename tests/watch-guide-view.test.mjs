import assert from 'node:assert/strict'
import {test} from 'node:test'
import {classifyWatchEntry,filterWatchEntries,sortWatchEntries} from '../frontend/src/lib/watch-guide-view.ts'
const item=(id,format,relation,year)=>({aniListId:id,malId:id,title:'Title '+id,format,relation,year,month:1,image:null})
test('genre filters never equate continuity branches and compilation with main movie',()=>{
 const entries=[item(1,'TV','CURRENT',2021),item(2,'MOVIE','SEQUEL',2022),
  item(3,'MOVIE','ALTERNATIVE',2020),item(4,'OVA','SIDE_STORY',2021),
  item(5,'MOVIE','SUMMARY',2020),item(6,'TV','SPIN_OFF',2018)]
 assert.deepEqual(entries.map(classifyWatchEntry),['tv','movie','branch','extra','summary','branch'])
 assert.deepEqual(filterWatchEntries(entries,'branch').map(x=>x.aniListId),[3,6])
 assert.deepEqual(sortWatchEntries(entries).map(x=>x.aniListId),[6,3,5,1,4,2])
})

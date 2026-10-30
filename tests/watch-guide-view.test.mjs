import assert from 'node:assert/strict'
import {test} from 'node:test'
import {classifyWatchEntry,filterWatchEntries,sortWatchEntries} from '../frontend/src/lib/watch-guide-view.ts'
import {CURATED_WATCH_PATHS,getStoryChronologyPath} from '../frontend/src/lib/curated-watch-paths.ts'
const item=(id,format,relation,year)=>({aniListId:id,malId:id,title:'Title '+id,format,relation,year,month:1,image:null})
test('genre filters never equate continuity branches and compilation with main movie',()=>{
 const entries=[item(1,'TV','CURRENT',2021),item(2,'MOVIE','SEQUEL',2022),
  item(3,'MOVIE','ALTERNATIVE',2020),item(4,'OVA','SIDE_STORY',2021),
  item(5,'MOVIE','SUMMARY',2020),item(6,'TV','SPIN_OFF',2018)]
 assert.deepEqual(entries.map(classifyWatchEntry),['tv','movie','branch','extra','summary','branch'])
 assert.deepEqual(filterWatchEntries(entries,'branch').map(x=>x.aniListId),[3,6])
 assert.deepEqual(sortWatchEntries(entries).map(x=>x.aniListId),[6,3,5,1,4,2])
})

test('story chronology is unavailable for recommended, source and broadcast routes',()=>{
 assert.equal(getStoryChronologyPath(CURATED_WATCH_PATHS),null)
 const example=CURATED_WATCH_PATHS[0]
 assert.equal(getStoryChronologyPath([{...example,id:'test-broadcast',pathType:'broadcast'}]),null)
 assert.equal(getStoryChronologyPath([{...example,id:'test-alternative',pathType:'alternative'}]),null)
})
test('story chronology needs explicit classification and valid reviewed source evidence',()=>{
 const example=CURATED_WATCH_PATHS[0]
 const verified={...example,id:'test-story-chronology',pathType:'chronology'}
 assert.equal(getStoryChronologyPath([verified])?.id,'test-story-chronology')
 assert.equal(getStoryChronologyPath([{...verified,sources:[]}]),null)
 assert.equal(getStoryChronologyPath([{...verified,reviewedAt:''}]),null)
 assert.equal(getStoryChronologyPath([{...verified,steps:[]}]),null)
})

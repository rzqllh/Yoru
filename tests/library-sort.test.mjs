import assert from 'node:assert/strict'
import {test} from 'node:test'
import {parseLibrarySort,sortLibraryEntries} from '../frontend/src/lib/library-sort.ts'

const row=(id,title,score,year,updatedAt)=>({
 anime:{id:'mal:'+id,malId:id,title,score,year},
 status:'planned',updatedAt
})
const entries=[
 row(1,'Zeta',8.5,2023,100),
 row(2,'Alpha',null,null,300),
 row(3,'Beta',9.3,2020,200),
 row(4,'Delta',9.3,2024,150)
]
test('library sorts by recency, title, score and year without mutating IndexedDB order',()=>{
 assert.deepEqual(sortLibraryEntries(entries,'recent').map(r=>r.anime.malId),[2,3,4,1])
 assert.deepEqual(sortLibraryEntries(entries,'title').map(r=>r.anime.malId),[2,3,4,1])
 assert.deepEqual(sortLibraryEntries(entries,'score').map(r=>r.anime.malId),[3,4,1,2])
 assert.deepEqual(sortLibraryEntries(entries,'year').map(r=>r.anime.malId),[4,1,3,2])
 assert.equal(entries[0].anime.malId,1)
})
test('missing metadata is last, ties break deterministically and unknown sort falls back',()=>{
 const equal=[row(7,'Z',null,null,2),row(8,'A',null,null,2)]
 assert.deepEqual(sortLibraryEntries(equal,'recent').map(r=>r.anime.malId),[8,7])
 assert.deepEqual(sortLibraryEntries(equal,'score').map(r=>r.anime.malId),[8,7])
 assert.deepEqual(sortLibraryEntries(equal,'year').map(r=>r.anime.malId),[8,7])
 assert.equal(parseLibrarySort('year'),'year')
 assert.equal(parseLibrarySort('score'),'score')
 assert.equal(parseLibrarySort('__proto__'),'recent')
 assert.equal(parseLibrarySort(null),'recent')
})

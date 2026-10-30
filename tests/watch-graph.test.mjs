import assert from 'node:assert/strict'
import {test} from 'node:test'
import {normalizeWatchGuide} from '../backend/pipeline/watch-guide.ts'
import {normalizeWatchGraph,graphFrontier} from '../backend/pipeline/watch-graph-core.ts'

const media=(id,malId=id,format='TV',year=2024)=>({
 id,idMal:malId,type:'ANIME',format,startDate:{year,month:1},
 title:{romaji:'Anime '+id},coverImage:{medium:'https://art.example.test/'+id+'.jpg'}
})
const edge=(relationType,node)=>({relationType,node})
const direct=(other)=>normalizeWatchGuide({data:{Media:{
 ...media(10,100),relations:{edges:other}
}}},100)

test('two-hop graph covers unrelated franchise names, preserves edges and deduplicates cycles',()=>{
 const guide=direct([
  edge('PREQUEL',media(9,99,'TV',2022)),
  edge('ALTERNATIVE',media(11,111,'MOVIE',2023))
 ])
 const expanded={data:{Page:{media:[
  {...media(9,99),relations:{edges:[
   edge('SEQUEL',media(10,100)),edge('SIDE_STORY',media(8,88,'OVA',2021))]}},
  {...media(11,111),relations:{edges:[
   edge('SAME_UNIVERSE',media(12,null,'MOVIE',2025)),edge('PREQUEL',media(9,99))]}}
 ]}}}
 const graph=normalizeWatchGraph(guide,expanded).graph
 assert.equal(graph.status,'expanded')
 assert.deepEqual(graph.nodes.map(n=>n.aniListId).sort((a,b)=>a-b),[8,9,10,11,12])
 assert.equal(graph.edges.filter(e=>e.from===9&&e.to===10).length,1)
 assert.equal(graph.nodes.find(n=>n.aniListId===12).distance,2)
 assert.equal(graph.nodes.find(n=>n.aniListId===12).malId,null)
 assert.ok(graph.edges.some(e=>e.relation==='SAME_UNIVERSE'))
})
test('invalid manga nodes, duplicate and unsupported relations do not expand the graph',()=>{
 const guide=direct([edge('SEQUEL',media(11,111))])
 const expanded={data:{Page:{media:[{
  ...media(11),relations:{edges:[
   edge('ADAPTATION',{...media(33,333),type:'MANGA'}),
   edge('CHARACTER',media(34,334)),
   edge('SPIN_OFF',media(12,112)),
   edge('SPIN_OFF',media(12,112))
  ]}}]}}}
 const g=normalizeWatchGraph(guide,expanded).graph
 assert.equal(g.nodes.length,3)
 assert.equal(g.edges.filter(e=>e.to===12).length,1)
})
test('limited fanout and upstream outages are never labeled complete',()=>{
 const many=direct(Array.from({length:18},(_,i)=>edge('SEQUEL',media(1000+i,1000+i))))
 assert.equal(graphFrontier(many).length,10)
 const limited=normalizeWatchGraph(many,{data:{Page:{media:[]}}}).graph
 assert.equal(limited.status,'limited')
 assert.equal(limited.truncated,true)
 const unavailable=normalizeWatchGraph(many,null,'upstream-unavailable').graph
 assert.equal(unavailable.status,'upstream-unavailable')
 assert.equal(unavailable.nodes.length,many.items.length)
 assert.ok(unavailable.note.includes('tidak tersedia'))
})
test('every format keeps independent classification instead of fabricated canon order',()=>{
 const guide=direct([edge('SUMMARY',media(2,2,'MOVIE',2020)),edge('SIDE_STORY',media(3,3,'SPECIAL',2019))])
 const result=normalizeWatchGraph(guide,{data:{Page:{media:[
  {...media(2,2,'MOVIE',2020),relations:{edges:[]}},
  {...media(3,3,'SPECIAL',2019),relations:{edges:[]}}
 ]}}})
 assert.ok(result.graph.edges.some(x=>x.relation==='SUMMARY'))
 assert.equal(result.graph.nodes.find(x=>x.aniListId===3).format,'SPECIAL')
})

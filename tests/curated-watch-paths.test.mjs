import assert from 'node:assert/strict'
import {test} from 'node:test'
import {CURATED_WATCH_PATHS,discoverCuratedPaths,validateCuratedPaths} from '../frontend/src/lib/curated-watch-paths.ts'

test('all published editorial paths have checked HTTPS sources and valid step identities',()=>{
 assert.deepEqual(validateCuratedPaths(CURATED_WATCH_PATHS),[])
 assert.deepEqual(CURATED_WATCH_PATHS.map(p=>p.id),[
  'fate-anime-newcomer','fate-prequel-first','monogatari-editorial'
 ])
 assert.ok(CURATED_WATCH_PATHS.every(p=>p.scope==='selected-route'&&p.sources.length>0))
})
test('only paths anchored to actual AniList graph entries appear',()=>{
 assert.deepEqual(discoverCuratedPaths([9876543]),[])
 assert.deepEqual(discoverCuratedPaths([19603]).map(p=>p.id),['fate-anime-newcomer','fate-prequel-first'])
 assert.deepEqual(discoverCuratedPaths([5081]).map(p=>p.id),['monogatari-editorial'])
 assert.deepEqual(discoverCuratedPaths([20791,5081]).map(p=>p.id),[
  'fate-anime-newcomer','fate-prequel-first','monogatari-editorial'
 ])
})
test('reject invented sources, duplicate steps, missing anchors and invalid ranges',()=>{
 const original=CURATED_WATCH_PATHS[0]
 const invalid={...original,
  anchorAniListIds:[],
  sources:[{title:'Unverified',url:'javascript:alert(1)',checkedAt:'2026-10-30'}],
  steps:[original.steps[0],original.steps[0],{
   ...original.steps[1],episodeRange:{start:10,end:1,edition:'TV'}
  }]
 }
 const errors=validateCuratedPaths([invalid])
 assert.ok(errors.some(e=>e.includes('invalid anchors')))
 assert.ok(errors.some(e=>e.includes('source evidence')))
 assert.ok(errors.some(e=>e.includes('duplicate media')))
 assert.ok(errors.some(e=>e.includes('episode range')))
})
test('alternative routes make spoiler caveats explicit without claiming a single Fate canon timeline',()=>{
 const fate=discoverCuratedPaths([19603])
 assert.equal(fate[0].spoilerRisk,'low')
 assert.equal(fate[1].spoilerRisk,'contextual')
 assert.match(fate[1].note,/bukan satu timeline canon linear/i)
 assert.ok(fate.every(p=>p.pathType!=='broadcast'))
})

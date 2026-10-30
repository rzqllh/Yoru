import assert from 'node:assert/strict'
import {test} from 'node:test'
import {CURATED_WATCH_PATHS,discoverCuratedPaths,validateCuratedPaths} from '../frontend/src/lib/curated-watch-paths.ts'

test('all published editorial paths have checked HTTPS sources and valid step identities',()=>{
 assert.deepEqual(validateCuratedPaths(CURATED_WATCH_PATHS),[])
 assert.deepEqual(CURATED_WATCH_PATHS.map(p=>p.id),[
  'fate-anime-newcomer','fate-prequel-first','monogatari-editorial',
  'haruhi-2006-original-airing','haruhi-2009-rebroadcast','rezero-newcomer-ovas'
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

test('Haruhi 2006 and 2009 use distinct validated episode editions',()=>{
 const originals=discoverCuratedPaths([849])
 assert.deepEqual(originals.map(x=>x.id),['haruhi-2006-original-airing','haruhi-2009-rebroadcast'])
 const broadcast=originals[0].steps
 const rerun=originals[1].steps
 assert.equal(broadcast.length,14)
 assert.equal(rerun.length,29) // 28 episodes and the later film
 assert.equal(broadcast[0].aniListId,849)
 assert.equal(broadcast[0].episodeRange.edition,'siaran asli 2006 (14 episode)')
 assert.equal(rerun[0].aniListId,4382)
 assert.equal(rerun[0].episodeRange.edition,'siaran 2009 (28 episode)')
 assert.match(broadcast[0].title,/Mikuru Asahina/)
 assert.match(rerun[24].title,/Mikuru Asahina/)
 assert.equal(rerun.at(-1).aniListId,7311)
})
test('Re:ZERO shared OVA identifier permits separate, non-overlapping episode ranges',()=>{
 const path=discoverCuratedPaths([100049]).at(-1)
 assert.equal(path.id,'rezero-newcomer-ovas')
 const ova=path.steps.filter(x=>x.aniListId===100049)
 assert.deepEqual(ova.map(x=>x.episodeRange.start),[1,2])
 assert.ok(ova.every(x=>x.optional))
 const corrupt={...path,steps:[...path.steps,{
  ...ova[0],title:'Duplicated OVA',episodeRange:{start:1,end:2,edition:ova[0].episodeRange.edition}
 }]}
 assert.ok(validateCuratedPaths([corrupt]).some(x=>x.includes('duplicate media')))
})
test('different editions cannot silently share the same episode identity within a path',()=>{
 const r=CURATED_WATCH_PATHS.find(x=>x.id==='haruhi-2009-rebroadcast')
 const steps=[r.steps[0],{...r.steps[1],episodeRange:{...r.steps[1].episodeRange,edition:'2006 siaran asli'}}]
 const altered={...r,steps}
 assert.ok(validateCuratedPaths([altered]).some(x=>x.includes('duplicate media')))
})

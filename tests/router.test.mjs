import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseRoute, routeToPath, getBreadcrumbs } from '../frontend/src/lib/router.ts'

test('router parses root path to home page', () => {
  const route = parseRoute('/', '')
  assert.equal(route.page, 'home')
  assert.equal(routeToPath(route), '/')
  assert.deepEqual(getBreadcrumbs(route), ['Yoru', 'Beranda'])
})

test('router parses canonical seasonal shortcut', () => {
  const route = parseRoute('/jelajahi/musim-ini', '')
  assert.equal(route.page, 'browse')
  assert.equal(route.browseKind, 'season')
  assert.equal(route.shortcut, 'season')
  assert.equal(routeToPath(route), '/jelajahi/musim-ini')
  assert.deepEqual(getBreadcrumbs(route), ['Yoru', 'Jelajahi', 'Musim ini'])
})

test('router parses canonical browse shortcuts and queries', () => {
  const topRoute = parseRoute('/jelajahi/populer', '')
  assert.equal(topRoute.page, 'browse')
  assert.equal(topRoute.browseKind, 'top')
  assert.equal(routeToPath(topRoute), '/jelajahi/populer')
  assert.deepEqual(getBreadcrumbs(topRoute), ['Yoru', 'Jelajahi', 'Populer'])

  const upcomingRoute = parseRoute('/jelajahi/akan-datang', '')
  assert.equal(upcomingRoute.page, 'browse')
  assert.equal(upcomingRoute.browseKind, 'upcoming')
  assert.equal(routeToPath(upcomingRoute), '/jelajahi/akan-datang')
  assert.deepEqual(getBreadcrumbs(upcomingRoute), ['Yoru', 'Jelajahi', 'Akan datang'])

  const searchRoute = parseRoute('/jelajahi', 'q=frieren')
  assert.equal(searchRoute.page, 'browse')
  assert.equal(searchRoute.searchQuery, 'frieren')
  assert.equal(routeToPath(searchRoute), '/jelajahi?q=frieren')
  assert.deepEqual(getBreadcrumbs(searchRoute), ['Yoru', 'Jelajahi', 'Cari: "frieren"'])
})

test('router parses library canonical continue shortcut', () => {
  const route = parseRoute('/koleksi/lanjut-menonton', '')
  assert.equal(route.page, 'library')
  assert.equal(route.libraryView, 'continue')
  assert.equal(route.shortcut, 'continue')
  assert.equal(routeToPath(route), '/koleksi/lanjut-menonton')
  assert.deepEqual(getBreadcrumbs(route), ['Yoru', 'Koleksi', 'Lanjut menonton'])

  const allRoute = parseRoute('/koleksi', '')
  assert.equal(allRoute.page, 'library')
  assert.equal(allRoute.libraryView, 'all')
  assert.equal(routeToPath(allRoute), '/koleksi')
  assert.deepEqual(getBreadcrumbs(allRoute), ['Yoru', 'Koleksi'])
})

test('router parses settings and fallback paths', () => {
  const settingsRoute = parseRoute('/pengaturan', '')
  assert.equal(settingsRoute.page, 'settings')
  assert.equal(routeToPath(settingsRoute), '/pengaturan')
  assert.deepEqual(getBreadcrumbs(settingsRoute), ['Yoru', 'Pengaturan'])

  const unknownRoute = parseRoute('/unknown-path', '')
  assert.equal(unknownRoute.page, 'home')
  assert.equal(routeToPath(unknownRoute), '/')
})

test('browse URL round trips validated genre, type, score, year, order and query on selected tab',()=>{
 const route=parseRoute('/jelajahi/populer','q=bleach&genre=Action&type=TV&minScore=8&year=2012&order=rating')
 assert.equal(route.browseKind,'top')
 assert.deepEqual(route.browseFilters,{genre:'Action',format:'TV',minimumScore:8,year:'2012',order:'rating'})
 assert.equal(routeToPath(route),'/jelajahi/populer?genre=Action&type=TV&minScore=8&year=2012&order=rating&q=bleach')
 assert.deepEqual(parseRoute('/jelajahi/populer',routeToPath(route).split('?')[1]),route)
})
test('browse URL discards unsupported filters and malformed scores/years rather than passing to API',()=>{
 const route=parseRoute('/jelajahi/akan-datang','q=test&genre=Hacked&type=Unknown&minScore=99&year=1200&order=evil')
 assert.deepEqual(route.browseFilters,{genre:'',format:'',minimumScore:0,year:'',order:'default'})
 assert.equal(routeToPath(route),'/jelajahi/akan-datang?q=test')
})
test('browse minimum score accepts only one canonical decimal choice',()=>{
 for(const score of ['8e0','0x8','08','+8','8.0',' 8 ','8\\n','Infinity']){
  const route=parseRoute('/jelajahi/populer','minScore='+encodeURIComponent(score))
  assert.equal(route.browseFilters.minimumScore,0,score)
  assert.equal(routeToPath(route),'/jelajahi/populer')
 }
 const duplicate=parseRoute('/jelajahi','minScore=7&minScore=8')
 assert.equal(duplicate.browseFilters.minimumScore,0)
 for(const score of [7,8,9]){
  const route=parseRoute('/jelajahi/populer','minScore='+score)
  assert.equal(route.browseFilters.minimumScore,score)
  assert.equal(routeToPath(route),'/jelajahi/populer?minScore='+score)
 }
})
test('historical year filter and canonical season shortcut survive reload',()=>{
 const route=parseRoute('/jelajahi/musim-ini','genre=Drama&year=1965')
 assert.equal(route.browseFilters.year,'1965')
 assert.equal(routeToPath(route),'/jelajahi/musim-ini?genre=Drama&year=1965')
})

test('source-backed MAL genre IDs round-trip without breaking legacy names',()=>{
 const modern=parseRoute('/jelajahi/populer','genre=mal%3A46&type=TV&year=2024')
 assert.equal(modern.browseFilters.genre,'mal:46')
 const url=routeToPath(modern)
 assert.equal(url,'/jelajahi/populer?genre=mal%3A46&type=TV&year=2024')
 assert.equal(parseRoute('/jelajahi/populer',url.split('?')[1]).browseFilters.genre,'mal:46')
 assert.equal(parseRoute('/jelajahi','genre=Action').browseFilters.genre,'Action')
 for(const unsafe of ['mal:0','mal:-1','mal:9999','mal:5<script>']){
  assert.equal(parseRoute('/jelajahi','genre='+encodeURIComponent(unsafe)).browseFilters.genre,'')
 }
})

test('watch-guide deep links reject non-decimal or malformed MAL IDs without selecting another title',()=>{
 for(const invalid of ['','0','01','-1','1.0','1e3','0x10',' 1 ','Infinity','NaN','1000000000','1<script>']){
  const route=parseRoute('/jelajahi/panduan-urutan','anime='+encodeURIComponent(invalid))
  assert.equal(route.page,'guide')
  assert.equal(route.guideMalId,undefined,`unexpected guide id for ${invalid}`)
  assert.equal(routeToPath(route),'/jelajahi/panduan-urutan')
 }
 for(const id of [1,1000,999999999]){
  const route=parseRoute('/jelajahi/panduan-urutan',`anime=${id}`)
  assert.equal(route.guideMalId,id)
  assert.equal(routeToPath(route),`/jelajahi/panduan-urutan?anime=${id}`)
 }
 for(const invalid of [0,-1,1.5,Infinity,NaN,1000000000]){
  const route={...parseRoute('/jelajahi/panduan-urutan',''),guideMalId:invalid}
  assert.equal(routeToPath(route),'/jelajahi/panduan-urutan')
 }
})


test('anime detail supports shareable canonical MAL deep links without conflating ID namespaces',()=>{
 for(const id of [1,100,999999999]){
  const parsed=parseRoute('/anime/'+id,'')
  assert.equal(parsed.page,'detail')
  assert.equal(parsed.detailMalId,id)
  assert.equal(routeToPath(parsed),'/anime/'+id)
  assert.deepEqual(getBreadcrumbs(parsed),['Yoru','Anime','Detail'])
 }
 for(const invalid of ['0','01','-1','1e3','1.2','0x10','1000000000','1%2F2','abc']){
  const route=parseRoute('/anime/'+invalid,'')
  assert.notEqual(route.page,'detail',invalid)
 }
 for(const id of [undefined,0,-1,1.2,Infinity,1000000000]){
  const state={...parseRoute('/jelajahi',''),page:'detail',detailMalId:id}
  assert.equal(routeToPath(state),'/jelajahi')
 }
})

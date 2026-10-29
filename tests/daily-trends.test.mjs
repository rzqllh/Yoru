import assert from 'node:assert/strict'
import {test} from 'node:test'
import {completedUtcDay,normalizeDailyTrends,getDailyAnimeTrends} from '../backend/pipeline/daily-trends.ts'

const day=completedUtcDay(Date.UTC(2026,9,30,12))
const fixture=()=>({data:{Page:{mediaTrends:Array.from({length:12},(_,i)=>({
 date:day,trending:1200-i,media:{
  idMal:1000+i,type:'ANIME',isAdult:false,
  title:{romaji:'Anime '+i,english:'Episode '+i,native:null},
  coverImage:{large:'https://s4.anilist.co/poster.jpg'},bannerImage:null,
  description:'<b>Anime aman</b> untuk ditonton',averageScore:85,
  format:'TV',seasonYear:2026,episodes:12,genres:['Action'],status:'RELEASING'
 }
}))}}})
test('AniList daily top ten preserves MAL identities, actual date and daily metric',()=>{
 const result=normalizeDailyTrends(fixture(),day)
 assert.equal(result.items.length,10)
 assert.equal(result.items[0].id,'mal:1000')
 assert.equal(result.items[0].score,8.5)
 assert.equal(result.items[0].synopsis,'Anime aman untuk ditonton')
 assert.equal(result.date,'2026-10-29')
 assert.equal(result.metric,'daily-media-activity')
})
test('never labels stale, adult, unmapped or incomplete trends as daily top ten',()=>{
 const source=fixture()
 source.data.Page.mediaTrends[0].date=day-86400
 source.data.Page.mediaTrends[1].media.isAdult=true
 source.data.Page.mediaTrends[2].media.idMal=0
 assert.throws(()=>normalizeDailyTrends(source,day),/INSUFFICIENT_DATED_TRENDS/)
 assert.equal(completedUtcDay(Date.UTC(2026,9,30,0)) ,day)
})
test('daily AniList query is bounded to yesterday UTC and caches verified results',async()=>{
 const old=globalThis.fetch
 let calls=0
 try{
  globalThis.fetch=async(url,options)=>{
   calls++
   assert.equal(String(url),'https://graphql.anilist.co')
   assert.equal(options.method,'POST')
   const body=JSON.parse(String(options.body))
   assert.equal(body.variables.after,day-1)
   assert.match(body.query,/mediaTrends/)
   return new Response(JSON.stringify(fixture()),{status:200,headers:{'content-type':'application/json'}})
  }
  const a=await getDailyAnimeTrends(Date.UTC(2026,9,30,12))
  const b=await getDailyAnimeTrends(Date.UTC(2026,9,30,12,10))
  assert.equal(calls,1)
  assert.deepEqual(a,b)
 }finally{globalThis.fetch=old}
})

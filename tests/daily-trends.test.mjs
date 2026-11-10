import assert from 'node:assert/strict'
import {test} from 'node:test'
import {completedUtcDay,normalizeDailyTrends,getDailyAnimeTrends} from '../backend/pipeline/daily-trends.ts'

const day=completedUtcDay(Date.UTC(2026,9,30,12))
const fixture=()=>({data:{Page:{mediaTrends:Array.from({length:12},(_,i)=>({
 date:day,trending:1200-i*50,media:{
  id:2000+i,idMal:1000+i,type:'ANIME',isAdult:false,
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

test('daily ranking is determined strictly by daily activity delta, not all-time score or popularity',()=>{
 const source={
  data:{
   Page:{
    mediaTrends:[
     {
      date:day,trending:200,media:{
       id:9001,idMal:9001,type:'ANIME',isAdult:false,
       title:{english:'All-Time Legend',romaji:'Legend'},
       averageScore:98,format:'TV',seasonYear:2020,episodes:24,genres:['Drama'],status:'FINISHED'
      }
     },
     {
      date:day,trending:15000,media:{
       id:9002,idMal:9002,type:'ANIME',isAdult:false,
       title:{english:'Breakout Underdog',romaji:'Underdog'},
       averageScore:62,format:'TV',seasonYear:2026,episodes:12,genres:['Action'],status:'RELEASING'
      }
     },
     ...Array.from({length:10},(_,i)=>({
      date:day,trending:5000-i*100,media:{
       id:1000+i,idMal:1000+i,type:'ANIME',isAdult:false,
       title:{english:'Anime '+i,romaji:'Anime '+i},
       averageScore:75,format:'TV',seasonYear:2026,episodes:12,genres:['Action'],status:'RELEASING'
      }
     }))
    ]
   }
  }
 }
 const result=normalizeDailyTrends(source,day)
 assert.equal(result.items.length,10)
 assert.equal(result.items[0].malId,9002,'Anime with lowest score but highest daily activity ranks #1')
 assert.equal(result.items[0].title,'Breakout Underdog')
 assert.notEqual(result.items[0].malId,9001,'Anime with all-time highest score does not take #1')
})

test('duplicate anime identities in the same snapshot are deduplicated preserving highest rank',()=>{
 const source={
  data:{
   Page:{
    mediaTrends:[
     {
      date:day,trending:8000,media:{
       id:5001,idMal:5001,type:'ANIME',isAdult:false,
       title:{english:'Unique Show',romaji:'Unique Show'},
       averageScore:80,format:'TV',seasonYear:2026,episodes:12,genres:['Action'],status:'RELEASING'
      }
     },
     {
      date:day,trending:3000,media:{
       id:5001,idMal:5001,type:'ANIME',isAdult:false,
       title:{english:'Duplicate Record',romaji:'Duplicate Record'},
       averageScore:80,format:'TV',seasonYear:2026,episodes:12,genres:['Action'],status:'RELEASING'
      }
     },
     ...Array.from({length:10},(_,i)=>({
      date:day,trending:7000-i*200,media:{
       id:6000+i,idMal:6000+i,type:'ANIME',isAdult:false,
       title:{english:'Other Show '+i,romaji:'Other Show '+i},
       averageScore:70,format:'TV',seasonYear:2026,episodes:12,genres:['Comedy'],status:'RELEASING'
      }
     }))
    ]
   }
  }
 }
 const result=normalizeDailyTrends(source,day)
 const ids=result.items.map(x=>x.malId)
 const count=ids.filter(id=>id===5001).length
 assert.equal(count,1,'Duplicate ID appears exactly once')
 assert.equal(result.items[0].malId,5001,'First highest trending occurrence is retained')
})

test('never labels stale, adult, unmapped or incomplete trends as daily top ten',()=>{
 const source=fixture()
 source.data.Page.mediaTrends[0].date=day-86400
 source.data.Page.mediaTrends[1].media.isAdult=true
 source.data.Page.mediaTrends[2].media.idMal=0
 assert.throws(()=>normalizeDailyTrends(source,day),/INSUFFICIENT_DATED_TRENDS/)
 assert.equal(completedUtcDay(Date.UTC(2026,9,30,0)),day)
})

test('stale snapshot preserves its actual snapshot date rather than fabricating today',()=>{
 const pastDate=1793102400
 const source={
  data:{
   Page:{
    mediaTrends:Array.from({length:12},(_,i)=>({
     date:pastDate,trending:900-i*10,media:{
      id:3000+i,idMal:3000+i,type:'ANIME',isAdult:false,
      title:{english:'Past Anime '+i,romaji:'Past Anime '+i},
      averageScore:80,format:'TV',seasonYear:2026,episodes:12,genres:['Action'],status:'FINISHED'
     }
    }))
   }
  }
 }
 const result=normalizeDailyTrends(source)
 assert.equal(result.date,'2026-10-27')
 assert.notEqual(result.date,new Date().toISOString().slice(0,10),'Never fabricates today date for older snapshot')
})

test('daily AniList query is bounded and caches verified results',async()=>{
 const old=globalThis.fetch
 let calls=0
 try{
  globalThis.fetch=async(url,options)=>{
   calls++
   assert.equal(String(url),'https://graphql.anilist.co')
   assert.equal(options.method,'POST')
   const body=JSON.parse(String(options.body))
   assert.ok(typeof body.variables.after==='number'&&body.variables.after>0)
   assert.match(body.query,/mediaTrends/)
   return new Response(JSON.stringify(fixture()),{status:200,headers:{'content-type':'application/json'}})
  }
  const a=await getDailyAnimeTrends(Date.UTC(2026,9,30,12))
  const b=await getDailyAnimeTrends(Date.UTC(2026,9,30,12,10))
  assert.equal(calls,1,'Second request within TTL reuses cache without network call')
  assert.deepEqual(a,b)
 }finally{globalThis.fetch=old}
})

import type {Anime} from './normalize.js'

type Dictionary=Record<string,unknown>
const obj=(v:unknown):Dictionary=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Dictionary:{}
const plain=(v:unknown,max=900)=>typeof v==='string'?v.replace(/<[^>]*>/g,' ').replace(/&(?:amp|quot|lt|gt|#39);/g,' ').replace(/\s+/g,' ').trim().slice(0,max):''
const integer=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)?v:0

export type DailyTrendResponse={items:Anime[];source:'AniList';sourceUrl:'https://anilist.co';date:string;metric:'daily-media-activity'}
/** Select one completed UTC day or snapshot query baseline. */
export function completedUtcDay(now=Date.now()):number{
 return Math.floor(now/86_400_000)*86_400-86_400
}
export function normalizeDailyTrends(raw:unknown,requestedDay?:number):DailyTrendResponse{
 const root=obj(obj(raw).data)
 const page=obj(root.Page)
 const rows=Array.isArray(page.mediaTrends)?page.mediaTrends:[]

 let targetDate=0
 if(typeof requestedDay==='number'&&requestedDay>0){
  if(rows.some(r=>integer(obj(r).date)===requestedDay)){
   targetDate=requestedDay
  }
 }

 if(!targetDate){
  const dateCounts=new Map<number,Set<number>>()
  for(const row of rows){
   const trend=obj(row),media=obj(trend.media),id=integer(media.idMal),d=integer(trend.date),act=integer(trend.trending)
   if(!d||!id||act<1||media.type!=='ANIME'||media.isAdult===true)continue
   let ids=dateCounts.get(d)
   if(!ids){ids=new Set();dateCounts.set(d,ids)}
   ids.add(id)
  }
  const candidateDates=[...dateCounts.keys()].sort((a,b)=>b-a)
  for(const d of candidateDates){
   if((dateCounts.get(d)?.size||0)>=10){
    targetDate=d
    break
   }
  }
 }

 if(!targetDate)throw new Error('INSUFFICIENT_DATED_TRENDS')

 type Candidate={activity:number;anime:Anime}
 const candidates:Candidate[]=[]
 const seen=new Set<number>()

 for(const row of rows){
  const trend=obj(row),media=obj(trend.media),id=integer(media.idMal),aniId=integer(media.id),activity=integer(trend.trending)
  if(integer(trend.date)!==targetDate||!id||activity<1||media.type!=='ANIME'||media.isAdult===true||seen.has(id))continue
  const title=obj(media.title),images=obj(media.coverImage)
  const headline=plain(title.english,180)||plain(title.romaji,180)||plain(title.native,180)
  if(!headline)continue
  const poster=plain(images.extraLarge,600)||plain(images.large,600)
  const banner=plain(media.bannerImage,600)
  const format=plain(media.format,32)
  const status=plain(media.status,32)
  const genres=Array.isArray(media.genres)?media.genres.filter(v=>typeof v==='string').slice(0,12) as string[]:[]
  const score=integer(media.averageScore)
  seen.add(id)
  candidates.push({
   activity,
   anime:{
    id:`mal:${id}`,malId:id,...(aniId?{aniListId:aniId}:{}),title:headline,
    englishTitle:plain(title.english,180)||null,japaneseTitle:plain(title.native,180)||null,
    poster:poster||null,cover:banner||poster||null,banner:banner||null,
    synopsis:plain(media.description,900),
    score:score>0&&score<=100?score/10:null,episodes:integer(media.episodes)||null,
    year:integer(media.seasonYear)||null,
    status:status==='RELEASING'?'Sedang tayang':status==='FINISHED'?'Selesai':status==='NOT_YET_RELEASED'?'Akan datang':'Anime',
    type:format==='MOVIE'?'Movie':format==='TV_SHORT'?'TV':format||'TV',
    rating:null,genres,studios:[],trailerYoutubeId:null
   }
  })
 }

 candidates.sort((a,b)=>b.activity-a.activity)
 const items=candidates.slice(0,10).map(c=>c.anime)
 if(items.length<10)throw new Error('INSUFFICIENT_DATED_TRENDS')

 const dateIso=targetDate%86400===0
  ?new Date(targetDate*1000).toISOString().slice(0,10)
  :new Date(targetDate*1000+9*3600*1000).toISOString().slice(0,10)

 return {
  items,
  source:'AniList',
  sourceUrl:'https://anilist.co',
  date:dateIso,
  metric:'daily-media-activity'
 }
}
const GRAPHQL='query DailyAnimeTrends($after:Int){Page(page:1,perPage:50){mediaTrends(date_greater:$after,sort:[DATE_DESC,TRENDING_DESC]){date trending media{id idMal type isAdult title{english romaji native} coverImage{extraLarge large} bannerImage description averageScore format seasonYear episodes genres status}}}}'
let cache:{expires:number;data:DailyTrendResponse}|null=null
let lastKnownGood:DailyTrendResponse|null=null
/** External AniList data is optional. Preserves verified dated snapshot, never invents ranks. */
export async function getDailyAnimeTrends(now=Date.now()):Promise<DailyTrendResponse>{
 if(cache&&cache.expires>now)return cache.data
 const controller=new AbortController()
 const timer=setTimeout(()=>controller.abort(),8500)
 try{
  const response=await fetch('https://graphql.anilist.co',{
   method:'POST',signal:controller.signal,redirect:'error',
   headers:{Accept:'application/json','Content-Type':'application/json'},
   body:JSON.stringify({query:GRAPHQL,variables:{after:Math.floor(now/1000)-86_400*3}})
  })
  if(!response.ok)throw new Error('ANILIST_UNAVAILABLE')
  if(!(response.headers.get('content-type')||'').includes('json'))throw new Error('ANILIST_INVALID_RESPONSE')
  const body=await response.text()
  if(body.length>400_000)throw new Error('ANILIST_RESPONSE_TOO_LARGE')
  const parsed=JSON.parse(body) as unknown
  if(Array.isArray(obj(parsed).errors)&&((obj(parsed).errors as unknown[]).length>0))throw new Error('ANILIST_QUERY_FAILED')
  const data=normalizeDailyTrends(parsed)
  cache={data,expires:now+20*60*1000}
  lastKnownGood=data
  return data
 }catch(err){
  if(lastKnownGood)return lastKnownGood
  throw err
 }finally{clearTimeout(timer)}
}

import type {Anime} from './normalize.js'

type Dictionary=Record<string,unknown>
const obj=(v:unknown):Dictionary=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Dictionary:{}
const plain=(v:unknown,max=900)=>typeof v==='string'?v.replace(/<[^>]*>/g,' ').replace(/&(?:amp|quot|lt|gt|#39);/g,' ').replace(/\s+/g,' ').trim().slice(0,max):''
const integer=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)?v:0

export type DailyTrendResponse={items:Anime[];source:'AniList';sourceUrl:'https://anilist.co';date:string;metric:'daily-media-activity'}
/** Select one completed UTC day, not an hourly or historic-all-time popularity score. */
export function completedUtcDay(now=Date.now()):number{
 return Math.floor(now/86_400_000)*86_400-86_400
}
export function normalizeDailyTrends(raw:unknown,day:number):DailyTrendResponse{
 const items:Anime[]=[]
 const seen=new Set<number>()
 const root=obj(obj(raw).data)
 const page=obj(root.Page)
 const rows=Array.isArray(page.mediaTrends)?page.mediaTrends:[]
 for(const row of rows){
  const trend=obj(row),media=obj(trend.media),id=integer(media.idMal),activity=integer(trend.trending)
  if(integer(trend.date)!==day||!id||activity<1||media.type!=='ANIME'||media.isAdult===true||seen.has(id))continue
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
  items.push({
   id:'mal:'+id,malId:id,title:headline,
   englishTitle:plain(title.english,180)||null,japaneseTitle:plain(title.native,180)||null,
   poster:poster||null,cover:banner||poster||null,
   synopsis:plain(media.description,900),
   score:score>0&&score<=100?score/10:null,episodes:integer(media.episodes)||null,
   year:integer(media.seasonYear)||null,
   status:status==='RELEASING'?'Sedang tayang':status==='FINISHED'?'Selesai':status==='NOT_YET_RELEASED'?'Akan datang':'Anime',
   type:format==='MOVIE'?'Movie':format==='TV_SHORT'?'TV':format||'TV',
   rating:null,genres,studios:[],trailerYoutubeId:null
  })
  if(items.length===10)break
 }
 if(items.length<10)throw new Error('INSUFFICIENT_DATED_TRENDS')
 return {items,source:'AniList',sourceUrl:'https://anilist.co',date:new Date(day*1000).toISOString().slice(0,10),metric:'daily-media-activity'}
}
const GRAPHQL='query DailyAnimeTrends($after:Int,$before:Int){Page(page:1,perPage:50){mediaTrends(date_greater:$after,date_lesser:$before,sort:TRENDING_DESC){date trending media{idMal type isAdult title{english romaji native} coverImage{extraLarge large} bannerImage description averageScore format seasonYear episodes genres status}}}}'
let cache:{day:number;expires:number;data:DailyTrendResponse}|null=null
/** External AniList data is optional. Never replace failures with invented rankings. */
export async function getDailyAnimeTrends(now=Date.now()):Promise<DailyTrendResponse>{
 const day=completedUtcDay(now)
 if(cache&&cache.day===day&&cache.expires>now)return cache.data
 const controller=new AbortController()
 const timer=setTimeout(()=>controller.abort(),8500)
 try{
  const response=await fetch('https://graphql.anilist.co',{
   method:'POST',signal:controller.signal,redirect:'error',
   headers:{Accept:'application/json','Content-Type':'application/json'},
   body:JSON.stringify({query:GRAPHQL,variables:{after:day-1,before:day+86400}})
  })
  if(!response.ok)throw new Error('ANILIST_UNAVAILABLE')
  if(!(response.headers.get('content-type')||'').includes('json'))throw new Error('ANILIST_INVALID_RESPONSE')
  const body=await response.text()
  if(body.length>400_000)throw new Error('ANILIST_RESPONSE_TOO_LARGE')
  const parsed=JSON.parse(body) as unknown
  if(Array.isArray(obj(parsed).errors)&&((obj(parsed).errors as unknown[]).length>0))throw new Error('ANILIST_QUERY_FAILED')
  const data=normalizeDailyTrends(parsed,day)
  cache={day,data,expires:now+20*60*1000}
  return data
 }finally{clearTimeout(timer)}
}

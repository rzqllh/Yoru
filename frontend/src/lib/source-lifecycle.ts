import type {Stream} from '../types'
import type {UnavailableStream} from './api'
import {isNativeCandidate} from './source-readiness.ts'

export type ProviderSourceResponse={items:Stream[];unavailable?:UnavailableStream[]}
export type SourceSearchResult={
 items:Stream[];unavailable:UnavailableStream[];
 queried:number;responded:number;failed:number;
 state:'candidates'|'no-direct'|'degraded'|'failed';
 message:string
}
function isProviderSourceResponse(value:unknown):value is ProviderSourceResponse{
 if(!value||typeof value!=='object'||Array.isArray(value))return false
 const data=value as Record<string,unknown>
 return Array.isArray(data.items)&&
  (data.unavailable===undefined||Array.isArray(data.unavailable))
}
/** Normalize untrusted provider records before they reach the source picker. */
function normalizeSourceCandidate(value:unknown):Stream|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null
 const source=value as Record<string,unknown>
 if((source.format!=='hls'&&source.format!=='mp4')||typeof source.url!=='string')return null
 const tracks=Array.isArray(source.tracks)?source.tracks.slice(0,40).filter(
  (track):track is Stream['tracks'][number]=>!!track&&typeof track==='object'&&!Array.isArray(track)&&
   typeof track.lang==='string'&&typeof track.label==='string'&&typeof track.url==='string'
 ):[]
 const candidate:Stream={
  format:source.format,url:source.url,tracks,
  subtitleMode:source.subtitleMode==='hard'||source.subtitleMode==='soft'?source.subtitleMode:'unknown',
  ...(typeof source.id==='string'?{id:source.id}:{}),
  ...(typeof source.providerId==='string'?{providerId:source.providerId}:{}),
  ...(typeof source.quality==='string'&&source.quality.length<=100?{quality:source.quality}:{})
 }
 // A URL that cannot pass the native browser preflight must not appear selectable.
 return isNativeCandidate(candidate)?candidate:null
}

/** Untrusted provider metadata must not invent unsupported unavailable categories or unbounded UI copy. */
function isUnavailableStream(value:unknown):value is UnavailableStream{
 if(!value||typeof value!=='object'||Array.isArray(value))return false
 const item=value as Record<string,unknown>
 return (item.kind==='torrent'||item.kind==='external'||item.kind==='unsupported')&&
  typeof item.label==='string'&&item.label.trim().length>0&&item.label.length<=160&&
  typeof item.reason==='string'&&item.reason.trim().length>0&&item.reason.length<=250
}

/**
 * Search responses are candidate *metadata*, never proof that video can decode.
 * An individual failed provider must not erase evidence from healthy providers.
 */
export function summarizeSourceSearch(
 results:readonly PromiseSettledResult<ProviderSourceResponse>[]
):SourceSearchResult{
 const successful=results.flatMap(r=>r.status==='fulfilled'&&isProviderSourceResponse(r.value)?[r.value]:[])
 const responded=successful.length
 const failed=results.length-responded
 const items=successful.flatMap(r=>r.items).map(normalizeSourceCandidate)
  .filter((item):item is Stream=>item!==null).slice(0,60)
 const unavailable=[...new Map(successful.flatMap(r=>r.unavailable??[])
  .filter(isUnavailableStream)
  .map(item=>[`${item.kind}:${item.label}:${item.reason}`,item] as const)).values()].slice(0,20)
 const state:SourceSearchResult['state']=!responded&&failed?'failed':
  failed?'degraded':items.length?'candidates':'no-direct'
 const message=state==='failed'?'Semua penyedia video gagal dihubungi. Belum ada sumber video terverifikasi.':
  state==='degraded'?`Sebagian penyedia gagal dihubungi (${failed} dari ${results.length}). Semua kandidat video masih perlu diperiksa.`:
  state==='candidates'?`${items.length} kandidat sumber ditemukan. Ketersediaan pemutaran belum diverifikasi.`:
  'Belum ada sumber video langsung yang bisa dipilih dari respons penyedia.'
 return {items,unavailable,queried:results.length,responded,failed,state,message}
}

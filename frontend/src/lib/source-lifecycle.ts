import type {Stream} from '../types'
import type {UnavailableStream} from './api'

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
/** Discard malformed individual records without losing valid provider candidates. */
function isSourceCandidate(value:unknown):value is Stream{
 if(!value||typeof value!=='object'||Array.isArray(value))return false
 const source=value as Record<string,unknown>
 return (source.format==='hls'||source.format==='mp4'||source.format==='embed')&&
  typeof source.url==='string'&&source.url.trim().length>0
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
 const items=successful.flatMap(r=>r.items).filter(isSourceCandidate).slice(0,60)
 const unavailable=[...new Map(successful.flatMap(r=>r.unavailable??[])
  .filter(x=>x&&typeof x.reason==='string'&&typeof x.label==='string')
  .map(item=>[`${item.kind}:${item.label}:${item.reason}`,item] as const)).values()].slice(0,20)
 const state:SourceSearchResult['state']=!responded&&failed?'failed':
  failed?'degraded':items.length?'candidates':'no-direct'
 const message=state==='failed'?'Semua penyedia video gagal dihubungi. Pilihan alternatif belum diperiksa.':
  state==='degraded'?`Sebagian penyedia gagal dihubungi (${failed} dari ${results.length}). Semua kandidat video masih perlu diperiksa.`:
  state==='candidates'?`${items.length} kandidat sumber ditemukan. Ketersediaan pemutaran belum diverifikasi.`:
  'Belum ada sumber video langsung yang bisa dipilih dari respons penyedia.'
 return {items,unavailable,queried:results.length,responded,failed,state,message}
}

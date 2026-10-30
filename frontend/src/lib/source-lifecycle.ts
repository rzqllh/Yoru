import type {Stream} from '../types'
import type {UnavailableStream} from './api'

export type ProviderSourceResponse={items:Stream[];unavailable?:UnavailableStream[]}
export type SourceSearchResult={
 items:Stream[];unavailable:UnavailableStream[];
 queried:number;responded:number;failed:number;
 state:'candidates'|'no-direct'|'degraded'|'failed';
 message:string
}
/**
 * Search responses are candidate *metadata*, never proof that video can decode.
 * An individual failed provider must not erase evidence from healthy providers.
 */
export function summarizeSourceSearch(
 results:readonly PromiseSettledResult<ProviderSourceResponse>[]
):SourceSearchResult{
 const successful=results.flatMap(r=>r.status==='fulfilled'?[r.value]:[])
 const responded=successful.length
 const failed=results.length-responded
 const items=successful.flatMap(r=>r.items??[]).slice(0,60)
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

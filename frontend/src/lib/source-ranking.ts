import type {Stream} from '../types'

/** Presentation order only; actual playback still requires browser decoding preflight. */
export function rankNativeStreams<T extends Pick<Stream,'format'|'quality'|'tracks'|'subtitleMode'>>(streams:T[]):T[]{
 const native=streams.filter(stream=>stream.format==='hls'||stream.format==='mp4')
 const score=(stream:T)=>{
  const height=Number(/(?:^|\D)(2160|1440|1080|720|480|360|240)(?:p|\D|$)/i.exec(stream.quality||'')?.[1]||0)
  const subtitles=stream.tracks.some(track=>track.lang.toLowerCase()==='id')?55:0
  const direct=stream.format==='hls'?15:10
  return height+subtitles+direct
 }
 return native.map((stream,index)=>({stream,index})).sort((a,b)=>score(b.stream)-score(a.stream)||a.index-b.index).map(x=>x.stream)
}

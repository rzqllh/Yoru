import type {Stream} from '../types'

/** Presentation order only; actual playback still requires browser decoding preflight. */
export function rankNativeStreams<T extends Pick<Stream,'format'|'quality'|'tracks'|'subtitleMode'>>(streams:T[]):T[]{
 const native=streams.filter(stream=>stream.format==='hls'||stream.format==='mp4')
 const score=(stream:T)=>{
  const quality=typeof stream.quality==='string'?stream.quality:''
  // Quality is untrusted provider text: bitrate (1080kbps), dimensions and
  // 1080px are not evidence of a 1080p rendition. Explicit p labels only.
  const height=Number(/(?:^|[^a-z0-9])(2160|1440|1080|720|480|360|240)p(?![a-z])/i.exec(quality)?.[1]||0)
  // Provider metadata is untrusted: malformed tracks must not hide valid video candidates.
  const tracks=Array.isArray(stream.tracks)?stream.tracks:[]
  const subtitles=tracks.some(track=>track&&typeof track.lang==='string'&&track.lang.toLowerCase()==='id')?55:0
  const direct=stream.format==='hls'?15:10
  return height+subtitles+direct
 }
 return native.map((stream,index)=>({stream,index})).sort((a,b)=>score(b.stream)-score(a.stream)||a.index-b.index).map(x=>x.stream)
}

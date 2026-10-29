/** Browser-only subtitles. Imported bytes never leave the device. */
const LIMIT = 500_000
const clean=(value:string)=>value
  .replace(/<(?:script|style|iframe)\b[^>]*>[\s\S]*?<\/(?:script|style|iframe)>/gi,'')
  .replace(/<[^>]+>/g,'')
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'')

export function parseLocalSubtitle(content:string,filename:string,byteLength:number):string{
 if(byteLength>LIMIT||content.length>LIMIT)throw new Error('SUBTITLE_TOO_LARGE')
 const extension=/\.([a-z0-9]+)$/i.exec(filename)?.[1]?.toLowerCase()
 if(extension!=='vtt'&&extension!=='srt')throw new Error('INVALID_SUBTITLE_TYPE')
 const source=content.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim()
 if(!source)throw new Error('INVALID_SUBTITLE_CONTENT')
 if(extension==='vtt'){
  if(!/^WEBVTT(?:[^\n]*)\n/.test(source))throw new Error('INVALID_SUBTITLE_CONTENT')
  if(!/(?:\d{2}:)?\d{2}:\d{2}\.\d{3}\s+-->\s+(?:\d{2}:)?\d{2}:\d{2}\.\d{3}/.test(source))throw new Error('INVALID_SUBTITLE_CONTENT')
  const body=source.replace(/^WEBVTT[^\n]*\n(?:\n)?/,'')
  return 'WEBVTT\n\n'+clean(body).trim()+'\n'
 }
 const cues=source.split(/\n\s*\n/).map(block=>{
  const lines=block.split('\n')
  if(/^\d+$/.test(lines[0]?.trim()||''))lines.shift()
  const timing=lines.shift()?.trim()||''
  const match=/^(\d{2}:\d{2}:\d{2}),(\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}),(\d{3})$/.exec(timing)
  if(!match||!lines.length)return null
  const caption=clean(lines.join('\n')).trim()
  if(!caption)return null
  return `${match[1]}.${match[2]} --> ${match[3]}.${match[4]}\n${caption}`
 }).filter((cue):cue is string=>cue!==null)
 if(!cues.length)throw new Error('INVALID_SUBTITLE_CONTENT')
 return 'WEBVTT\n\n'+cues.join('\n\n')+'\n'
}

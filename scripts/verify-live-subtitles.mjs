import {readFile} from 'node:fs/promises'
import {parseLiveFixtures} from './live-subtitle-fixtures.mjs'

const file=process.env.YORU_LIVE_SUBTITLE_FIXTURES
if(!file){
 console.error('BLOCKED: YORU_LIVE_SUBTITLE_FIXTURES must point to an owner-approved local fixture JSON.')
 process.exitCode=2
}else{
 let fixtures
 try{fixtures=parseLiveFixtures(JSON.parse(await readFile(file,'utf8')))}
 catch(e){
  console.error('BLOCKED: invalid live fixtures:',e instanceof Error?e.message:'UNKNOWN')
  process.exitCode=2
 }
 if(fixtures){
  const {findSubtitles,downloadSubtitle,toWebVtt,verifySubtitleGrant,subtitleStatus}
   =await import('../backend/dist/providers/subtitles.js')
  const flags=subtitleStatus()
  if(fixtures.some(fixture=>!flags[fixture.provider])||
   !process.env.OPENSUBTITLES_ACCESS_TOKEN){
   console.error('BLOCKED: missing one or more subtitle backend keys or OpenSubtitles login token.')
   process.exitCode=2
  }else{
   let failed=false
   for(const fixture of fixtures){
    let reason='UNKNOWN',success=false
    try{
     const result=await findSubtitles({title:fixture.title,episode:fixture.episode,type:fixture.type})
     const candidates=result.items.filter(item=>item.provider===fixture.provider&&
      item.language===fixture.language&&item.episode===fixture.episode&&item.score>=70&&item.sourceUrl)
     for(const candidate of candidates.slice(0,3)){
      const url=new URL(candidate.sourceUrl,'http://yoru.local')
      const ref=url.searchParams.get('ref')||''
      if(!verifySubtitleGrant(fixture.provider,ref,url.searchParams.get('expires')||'',url.searchParams.get('token')||'')){
       reason='INVALID_SIGNED_GRANT';continue
      }
      try{
       const text=toWebVtt(await downloadSubtitle(fixture.provider,ref))
       if(text.startsWith('WEBVTT')&&/\d{2}:\d{2}:\d{2}\.\d{3}\s+-->/.test(text)){
        success=true;reason='REAL_SUBTITLE_DOWNLOADED_AND_CONVERTED';break
       }
       reason='NO_VALID_CUES'
      }catch{reason='DOWNLOAD_OR_CONVERSION_FAILED'}
     }
     if(!candidates.length)reason='NO_MATCHING_PROVIDER_CANDIDATES'
    }catch{reason='PROVIDER_SEARCH_FAILED'}
    console.log(fixture.provider.toUpperCase()+': '+(success?'PASS':'FAIL')+' '+reason)
    if(!success)failed=true
   }
   if(failed){
    console.error('BLOCKED: real subtitle integration gate failed; see provider statuses above.')
    process.exitCode=1
   }else console.log('PASS: three live subtitle provider downloads succeeded for the supplied fixtures.')
  }
 }
}

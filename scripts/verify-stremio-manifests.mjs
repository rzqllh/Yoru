import {auditStremioManifests} from './stremio-manifest-report.mjs'

/**
 * EXPLICITLY OPT-IN live GET of configured manifest URLs only.
 * Never log URL paths, secrets, addon response bodies or exception messages.
 * Does not fetch stream endpoints, media, torrent data or subtitle files.
 */
if(process.argv.length!==3||process.argv[2]!=='--live'){
 console.error('LIVE_OPT_IN_REQUIRED: pass --live to check configured addon manifests.')
 process.exitCode=2
}else{
 try{
  const {getStremioConfig,probeStremioManifest}=await import('../backend/providers/stremio.ts')
  const config=await getStremioConfig()
  if(!config?.addons.length){
   console.log(JSON.stringify({status:'NOT_CONFIGURED',liveManifestChecked:false,addonCount:0}))
   process.exitCode=2
  }else{
   const addons=await auditStremioManifests(config.addons,probeStremioManifest)
   const complete=addons.every(addon=>addon.status==='REACHABLE')
   console.log(JSON.stringify({
    status:complete?'CHECKED':'INCOMPLETE',addonCount:addons.length,addons,
    liveManifestChecked:true,streamRequestsChecked:false,
    nativePlaybackVerified:false,subtitleDownloadsVerified:false
   },null,2))
   if(!complete)process.exitCode=3
  }
 }catch{
  console.error('INVALID_CONFIG: could not load valid addon configuration; private details suppressed.')
  process.exitCode=2
 }
}

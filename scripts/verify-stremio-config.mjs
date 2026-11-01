import {summarizeStremioConfig} from './stremio-config-report.mjs'

/**
 * Read-only configuration audit. Never log the raw configuration, thrown
 * parser errors or manifest URLs: path segments can carry addon credentials.
 * Run with: npm run verify:stremio:config
 */
try{
 const {getStremioConfig}=await import('../backend/providers/stremio.ts')
 const config=await getStremioConfig()
 if(!config){
  console.log(JSON.stringify({status:'NOT_CONFIGURED',source:'none',addonCount:0,liveManifestChecked:false}))
  process.exitCode=2
 }else{
  const source=process.env.STREMIO_ADDONS_JSON!==undefined?'server-env':'local-file'
  const report=summarizeStremioConfig(config,source)
  console.log(JSON.stringify(report,null,2))
  if(report.status!=='CONFIGURED')process.exitCode=2
 }
}catch{
 // Error text can contain a config value or private URL. Fail closed.
 console.error('INVALID_CONFIG: Stremio addon configuration could not be validated. No secrets were printed.')
 process.exitCode=2
}

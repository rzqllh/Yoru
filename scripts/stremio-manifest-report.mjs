/**
 * Interpret only the advertised Stremio manifest contract. This cannot establish
 * whether a stream/subtitle URL exists, is authorized, or plays in a browser.
 */
const invalid=(id,status)=>({id,status,advertisesSeriesStream:false,advertisesSeriesSubtitles:false})
export function summarizeStremioManifest(id,payload){
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return invalid(id,'INVALID_MANIFEST')
 const {id:manifestId,name,version,types,resources}=payload
 if([manifestId,name,version].some(v=>typeof v!=='string'||!v.trim())||
  !Array.isArray(types)||!Array.isArray(resources)||resources.length>100)return invalid(id,'INVALID_MANIFEST')
 const supports=resourceName=>types.includes('series')&&resources.some(resource=>
  resource===resourceName||(resource&&typeof resource==='object'&&!Array.isArray(resource)&&
  resource.name===resourceName&&(!Array.isArray(resource.types)||resource.types.includes('series'))))
 return {id,status:'REACHABLE',advertisesSeriesStream:supports('stream'),
  advertisesSeriesSubtitles:supports('subtitles')}
}
export async function auditStremioManifests(addons,probe){
 return Promise.all(addons.map(async addon=>{
  try{return summarizeStremioManifest(addon.id,await probe(addon))}
  catch{return invalid(addon.id,'UNAVAILABLE')}
 }))
}

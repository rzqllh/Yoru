const providers=new Set(['subdl','subsource','opensubtitles'])
const languages=new Set(['id','en'])
const types=new Set(['TV','Movie','OVA','ONA','Special'])
export function parseLiveFixtures(value){
 if(!Array.isArray(value)||value.length!==3)throw new Error('EXPECTED_THREE_PROVIDER_FIXTURES')
 const found=new Set()
 return value.map(entry=>{
  if(!entry||typeof entry!=='object'||Array.isArray(entry))throw new Error('INVALID_FIXTURE')
  const {provider,title,episode,type,language}=entry
  if(!providers.has(provider)||found.has(provider)||typeof title!=='string'||title.trim().length<2||
   title.length>120||!Number.isSafeInteger(episode)||episode<1||episode>2000||
   !types.has(type)||!languages.has(language))throw new Error('INVALID_FIXTURE')
  found.add(provider)
  return {provider,title:title.trim(),episode,type,language}
 })
}

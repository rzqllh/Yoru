export type QualityLevel={index:number;height:number}

/** Use only manifest-advertised variants. Never infer clickable 1080p from a source title. */
export function getAvailableQualityLevels(levels:ReadonlyArray<{height?:number}>):QualityLevel[]{
 const seen=new Set<number>()
 const result:QualityLevel[]=[]
 levels.forEach((level,index)=>{
  const height=level.height
  if(!Number.isSafeInteger(height)||!height||height<=0||seen.has(height))return
  seen.add(height)
  result.push({index,height})
 })
 return result.sort((a,b)=>b.height-a.height)
}

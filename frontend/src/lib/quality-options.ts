export type QualityLevel={index:number;height:number}

/** Use only manifest-advertised variants. Never infer clickable 1080p from a source title. */
export function getAvailableQualityLevels(levels:ReadonlyArray<unknown>):QualityLevel[]{
 const seen=new Set<number>()
 const result:QualityLevel[]=[]
 levels.forEach((level,index)=>{
  // Malformed HLS level metadata must not crash the player's quality menu.
  const height=level&&typeof level==='object'&&!Array.isArray(level)?
   (level as {height?:unknown}).height:undefined
  if(typeof height!=='number'||!Number.isSafeInteger(height)||height<=0||seen.has(height))return
  seen.add(height)
  result.push({index,height})
 })
 return result.sort((a,b)=>b.height-a.height)
}

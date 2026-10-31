export type ProviderAggregation<T>={
 items:T[]
 warnings:string[]
 allFailed:boolean
}
/**
 * A broken provider must not erase results returned by another provider.
 * Warnings contain stable provider IDs, never the underlying exception text.
 */
export function combineProviderResults<T>(
 results:readonly PromiseSettledResult<T[]>[],
 labels:readonly string[]
):ProviderAggregation<T>{
 if(results.length!==labels.length)throw new Error('Provider result count mismatch')
 const items:T[]=[]
 const warnings:string[]=[]
 for(let i=0;i<results.length;i++){
  const result=results[i]
  // A fulfilled promise can still carry malformed adapter data at runtime.
  // Treat a non-array payload as a provider failure, preserving healthy peers.
  if(result.status==='fulfilled'&&Array.isArray(result.value))items.push(...result.value)
  else warnings.push(labels[i])
 }
 return {items,warnings,allFailed:results.length>0&&warnings.length===results.length}
}

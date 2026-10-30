/** Manual watch-path checklist state; NOT derived from video or inferred episode availability.
 * Stored using existing Yoru IndexedDB preferences, so v1 backups automatically include it.
 */
export type WatchPathProgress={completed:number;updatedAt:number}
const PATH_ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/
export function watchPathPreferenceKey(pathId:string):string{
 if(!PATH_ID.test(pathId)||pathId.length>100)throw new Error('INVALID_PATH_ID')
 return 'watch-path:'+pathId
}
export function normalizeWatchPathProgress(raw:unknown,stepCount:number):WatchPathProgress{
 const max=Number.isSafeInteger(stepCount)&&stepCount>=0&&stepCount<=80?stepCount:0
 let value:unknown=raw
 if(typeof raw==='string'){
  try{value=JSON.parse(raw)}catch{return {completed:0,updatedAt:0}}
 }
 if(!value||typeof value!=='object'||Array.isArray(value))return {completed:0,updatedAt:0}
 const data=value as Record<string,unknown>
 const completed=Number.isSafeInteger(data.completed)&&Number(data.completed)>=0?
  Math.min(Number(data.completed),max):0
 const updatedAt=typeof data.updatedAt==='number'&&Number.isSafeInteger(data.updatedAt)&&data.updatedAt>=0?
  data.updatedAt:0
 return {completed,updatedAt}
}
export function updateWatchPathProgress(
 current:WatchPathProgress,stepCount:number,direction:-1|1,now:number
):WatchPathProgress{
 const value=normalizeWatchPathProgress(current,stepCount)
 const next=Math.max(0,Math.min(stepCount,value.completed+direction))
 return {completed:next,updatedAt:next===value.completed?value.updatedAt:now}
}

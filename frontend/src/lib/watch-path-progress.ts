/** Manual watch-path checklist state; NOT derived from video or inferred episode availability.
 * Stored using existing Yoru IndexedDB preferences, so v1 backups automatically include it.
 */
export type WatchPathProgress={completed:number;updatedAt:number}
const PATH_ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_STEPS=80
function boundedStepCount(stepCount:number):number{
 return Number.isSafeInteger(stepCount)&&stepCount>=0&&stepCount<=MAX_STEPS?stepCount:0
}
export function watchPathPreferenceKey(pathId:string):string{
 if(!PATH_ID.test(pathId)||pathId.length>100)throw new Error('INVALID_PATH_ID')
 return 'watch-path:'+pathId
}
export function normalizeWatchPathProgress(raw:unknown,stepCount:number):WatchPathProgress{
 const max=boundedStepCount(stepCount)
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
 const max=boundedStepCount(stepCount)
 const value=normalizeWatchPathProgress(current,max)
 const next=direction===1||direction===-1?
  Math.max(0,Math.min(max,value.completed+direction)):value.completed
 const timestamp=Number.isSafeInteger(now)&&now>=0?
  Math.max(value.updatedAt,now):value.updatedAt
 return {completed:next,updatedAt:next===value.completed?value.updatedAt:timestamp}
}

import type {ProgressEntry} from '../types'

/** A percentage-aware end threshold keeps short clips resumable.
 * The prior fixed 10-second cutoff excluded every 9-second fixture.
 */
export function isResumableProgress(progress:Pick<ProgressEntry,'seconds'|'duration'>):boolean{
 if(!Number.isFinite(progress.seconds)||progress.seconds<=0)return false
 if(!Number.isFinite(progress.duration)||progress.duration<=0)return true
 return progress.seconds<progress.duration-Math.min(10,progress.duration*0.05)
}

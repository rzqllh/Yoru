/** Keep the original WebVTT cue timing so repeated adjustments never accumulate drift. */
export type CueBaseline={start:number;end:number}
export function applySubtitleOffset(tracks:TextTrackList,offset:number,originals:WeakMap<object,CueBaseline>):void{
 if(!Number.isFinite(offset)||offset< -30||offset>30)return
 for(let i=0;i<tracks.length;i++){
  const cues=tracks[i].cues
  if(!cues)continue
  for(let j=0;j<cues.length;j++){
   const cue=cues[j]
   let base=originals.get(cue)
   if(!base){
    base={start:cue.startTime,end:cue.endTime}
    originals.set(cue,base)
   }
   const start=Math.max(0,base.start+offset)
   cue.startTime=start
   cue.endTime=Math.max(start+0.01,base.end+offset)
  }
 }
}

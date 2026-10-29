import assert from 'node:assert/strict'
import {test} from 'node:test'
import {applySubtitleOffset} from '../frontend/src/lib/subtitle-offset.ts'

test('per-anime offset shifts cues without accumulating timing drift',()=>{
 const cue={startTime:10,endTime:12}
 const track={cues:[cue]}
 const tracks={length:1,0:track}
 const originals=new WeakMap()
 applySubtitleOffset(tracks,2,originals)
 assert.deepEqual(cue,{startTime:12,endTime:14})
 applySubtitleOffset(tracks,-1,originals)
 assert.deepEqual(cue,{startTime:9,endTime:11})
 applySubtitleOffset(tracks,0,originals)
 assert.deepEqual(cue,{startTime:10,endTime:12})
})
test('offset clamps early cues at zero without losing ordering',()=>{
 const cue={startTime:1,endTime:2}
 const tracks={length:1,0:{cues:[cue]}}
 applySubtitleOffset(tracks,-5,new WeakMap())
 assert.equal(cue.startTime,0)
 assert.ok(cue.endTime>cue.startTime)
})

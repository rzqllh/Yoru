import assert from 'node:assert/strict'
import {test} from 'node:test'
import {isResumableProgress} from '../frontend/src/lib/resume.ts'

test('short video is resumable until near completion instead of excluded by fixed 10s',()=>{
 assert.equal(isResumableProgress({seconds:2,duration:9}),true)
 assert.equal(isResumableProgress({seconds:8.9,duration:9}),false)
})
test('progress requires meaningful nonzero position; duration may be unknown',()=>{
 for(const seconds of [0,-1,NaN,Infinity])assert.equal(isResumableProgress({seconds,duration:120}),false)
 assert.equal(isResumableProgress({seconds:34,duration:0}),true)
 assert.equal(isResumableProgress({seconds:115,duration:120}),false)
 assert.equal(isResumableProgress({seconds:109,duration:120}),true)
})

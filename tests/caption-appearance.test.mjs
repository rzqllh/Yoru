import assert from 'node:assert/strict'
import {test} from 'node:test'
import {DEFAULT_CAPTIONS,normalizeCaptionSettings,captionClasses} from '../frontend/src/lib/caption-appearance.ts'

test('caption preferences accept only bounded, known choices',()=>{
 const c=normalizeCaptionSettings({font:'serif',size:150,textOpacity:75,backgroundOpacity:25,outline:2,position:'top'})
 assert.equal(c.position,'top')
 assert.equal(c.size,150)
 assert.equal(c.backgroundOpacity,25)
 assert.ok(captionClasses(c).includes('subtitle-text-75'))
 assert.deepEqual(normalizeCaptionSettings({font:'unknown',size:999,textOpacity:-3,backgroundOpacity:150,position:'left',outline:99}),DEFAULT_CAPTIONS)
})
test('old subtitle style settings migrate without losing clear backdrop',()=>{
 const migrated=normalizeCaptionSettings({font:'serif',size:125,backdrop:'clear'})
 assert.equal(migrated.backgroundOpacity,0)
 assert.equal(migrated.font,'serif')
 assert.equal(migrated.size,125)
})

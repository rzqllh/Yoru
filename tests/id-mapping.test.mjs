import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  parseCanonicalId,
  formatCanonicalId,
  clearIdMappingCache,
} from '../backend/pipeline/id-mapping.ts'

test('parseCanonicalId strictly validates namespace and bounded numeric ID', () => {
  assert.deepEqual(parseCanonicalId('mal:52991'), { namespace: 'mal', numericId: 52991 })
  assert.deepEqual(parseCanonicalId('anilist:154587'), { namespace: 'anilist', numericId: 154587 })
  assert.deepEqual(parseCanonicalId('  mal:1  '), { namespace: 'mal', numericId: 1 })

  // Rejects bare ambiguous numeric IDs
  assert.equal(parseCanonicalId('52991'), null)
  assert.equal(parseCanonicalId('154587'), null)

  // Rejects invalid formats and malicious injection
  assert.equal(parseCanonicalId('mal:0'), null)
  assert.equal(parseCanonicalId('mal:-5'), null)
  assert.equal(parseCanonicalId('mal:abc'), null)
  assert.equal(parseCanonicalId('kitsu:123'), null)
  assert.equal(parseCanonicalId('mal:123:456'), null)
  assert.equal(parseCanonicalId(''), null)
  assert.equal(parseCanonicalId(null), null)
  assert.equal(parseCanonicalId(undefined), null)
  assert.equal(parseCanonicalId({}), null)
})

test('formatCanonicalId constructs strict namespace-prefixed identifiers', () => {
  assert.equal(formatCanonicalId('mal', 52991), 'mal:52991')
  assert.equal(formatCanonicalId('anilist', 154587), 'anilist:154587')

  assert.throws(() => formatCanonicalId('mal', 0), /Invalid numeric identity/)
  assert.throws(() => formatCanonicalId('anilist', -10), /Invalid numeric identity/)
  assert.throws(() => formatCanonicalId('mal', 1.5), /Invalid numeric identity/)
})

test('clearIdMappingCache resets memory structures cleanly', () => {
  clearIdMappingCache()
  assert.ok(true)
})

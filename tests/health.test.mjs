import assert from 'node:assert/strict'
import test from 'node:test'
import { createHealthPayload } from '../backend/pipeline/status.ts'

test('health payload has a stable, versioned contract', () => {
  assert.deepEqual(createHealthPayload(), {
    status: 'ok',
    service: 'anime-pwa-api',
    version: 1,
  })
})

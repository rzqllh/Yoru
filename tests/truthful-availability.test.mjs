import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  resolveTruthfulState,
  getAvailabilityMeta,
  summarizeSourceSearch,
} from '../frontend/src/lib/source-lifecycle.ts'

test('GAP-05: truthful availability state classification covers all 6 required states', () => {
  // 1. No provider or mapping — unavailable
  const unavailState = resolveTruthfulState({
    hasRegisteredProvider: false,
  })
  assert.equal(unavailState, 'unavailable')
  const unavailMeta = getAvailabilityMeta(unavailState)
  assert.equal(unavailMeta.label, 'Tidak tersedia')
  assert.equal(unavailMeta.detail, 'Sumber belum tersedia')
  assert.equal(unavailMeta.isPlayable, false)

  // 2. Provider registered — playback not yet checked
  const regState = resolveTruthfulState({
    hasRegisteredProvider: true,
  })
  assert.equal(regState, 'provider-registered')
  const regMeta = getAvailabilityMeta(regState)
  assert.equal(regMeta.label, 'Penyedia terdaftar')
  assert.equal(regMeta.detail, 'Penyedia terdaftar · Belum diperiksa')
  assert.equal(regMeta.isPlayable, false)

  // 3. Native candidate found — awaiting verification
  const candidateSummary = summarizeSourceSearch([
    {
      status: 'fulfilled',
      value: {
        items: [
          {
            format: 'mp4',
            url: 'https://archive.org/cors/sample/ep1.mp4',
            tracks: [],
            subtitleMode: 'soft',
          },
        ],
      },
    },
  ])
  const candState = resolveTruthfulState({
    hasRegisteredProvider: true,
    streamSummary: candidateSummary,
  })
  assert.equal(candState, 'native-candidate')
  const candMeta = getAvailabilityMeta(candState)
  assert.equal(candMeta.label, 'Kandidat ditemukan')
  assert.equal(candMeta.detail, 'Kandidat ditemukan · Menunggu verifikasi')
  assert.equal(candMeta.isPlayable, false)

  // 4. Native source verified — available to play
  const verState = resolveTruthfulState({
    hasRegisteredProvider: true,
    isVerified: true,
    streamSummary: candidateSummary,
  })
  assert.equal(verState, 'verified')
  const verMeta = getAvailabilityMeta(verState)
  assert.equal(verMeta.label, 'Tersedia')
  assert.equal(verMeta.detail, 'Tersedia · Siap diputar')
  assert.equal(verMeta.isPlayable, true)
  assert.ok(verMeta.className.includes('available'))

  // 5. Torrent-only / unsupported — no native playable source
  const torrentSummary = summarizeSourceSearch([
    {
      status: 'fulfilled',
      value: {
        items: [],
        unavailable: [
          {
            kind: 'torrent',
            label: '[Torrentio] Attack on Titan 1080p',
            reason: 'Torrent membutuhkan mesin streaming/resolver yang terhubung.',
          },
        ],
      },
    },
  ])
  const torrentState = resolveTruthfulState({
    hasRegisteredProvider: true,
    streamSummary: torrentSummary,
  })
  assert.equal(torrentState, 'torrent-only')
  const torrentMeta = getAvailabilityMeta(torrentState)
  assert.equal(torrentMeta.label, 'Torrent saja')
  assert.equal(torrentMeta.detail, 'Torrent saja · Tidak ada sumber langsung')
  assert.equal(torrentMeta.isPlayable, false)

  // 6. Provider error — recoverable degraded/failed state
  const errorSummary = summarizeSourceSearch([
    {
      status: 'rejected',
      reason: new Error('Upstream timeout'),
    },
  ])
  const errState = resolveTruthfulState({
    hasRegisteredProvider: true,
    streamSummary: errorSummary,
  })
  assert.equal(errState, 'provider-error')
  const errMeta = getAvailabilityMeta(errState)
  assert.equal(errMeta.label, 'Gangguan penyedia')
  assert.equal(errMeta.detail, 'Gangguan penyedia · Coba lagi')
  assert.equal(errMeta.isPlayable, false)

  // Search error flag also yields provider-error
  const explicitErrState = resolveTruthfulState({
    hasRegisteredProvider: true,
    searchError: true,
  })
  assert.equal(explicitErrState, 'provider-error')
})

test('GAP-05: Attack on Titan fixture simulation never claims Torrentio mapping as native playable availability', () => {
  // Attack on Titan (malId 16498) has registered provider mapping via Stremio/Torrentio
  const hasAoTProvider = true

  // Initial state on Detail page load: NOT ready/available, only registered
  const initialState = resolveTruthfulState({
    hasRegisteredProvider: hasAoTProvider,
  })
  assert.equal(initialState, 'provider-registered')
  const initialMeta = getAvailabilityMeta(initialState)
  assert.equal(initialMeta.isPlayable, false)
  assert.ok(!initialMeta.className.includes('available'))

  // When streams query executes against Torrentio: only torrent hashes returned
  const aotTorrentStreams = summarizeSourceSearch([
    {
      status: 'fulfilled',
      value: {
        items: [],
        unavailable: [
          {
            kind: 'torrent',
            label: '[Torrentio] Shingeki no Kyojin S01E01 1080p',
            reason: 'Torrent membutuhkan mesin streaming/resolver yang terhubung; belum bisa diputar langsung.',
          },
          {
            kind: 'external',
            label: '[External] Source Mirror',
            reason: 'Tautan eksternal belum diverifikasi untuk pemutaran langsung.',
          },
        ],
      },
    },
  ])

  const resolvedAoTState = resolveTruthfulState({
    hasRegisteredProvider: hasAoTProvider,
    streamSummary: aotTorrentStreams,
  })

  // Truthful state is strictly torrent-only
  assert.equal(resolvedAoTState, 'torrent-only')
  const resolvedAoTMeta = getAvailabilityMeta(resolvedAoTState)
  assert.equal(resolvedAoTMeta.label, 'Torrent saja')
  assert.equal(resolvedAoTMeta.isPlayable, false)
  assert.ok(!resolvedAoTMeta.className.includes('available'))
})

test('GAP-05: Cowboy Bebop fixture simulation advances from registered to candidate to verified', () => {
  // Cowboy Bebop (malId 1) has registered provider in providers.local.json
  const hasBebopProvider = true

  // Step 1: Initial state
  const step1 = resolveTruthfulState({ hasRegisteredProvider: hasBebopProvider })
  assert.equal(step1, 'provider-registered')
  assert.equal(getAvailabilityMeta(step1).isPlayable, false)

  // Step 2: Stream response received with direct MP4 candidate
  const bebopSummary = summarizeSourceSearch([
    {
      status: 'fulfilled',
      value: {
        items: [
          {
            format: 'mp4',
            url: 'https://archive.org/cors/db-bebop-of-the-cowboys-1080p/ep01.mp4',
            quality: '480p (Audio Asli - Softsub)',
            subtitleMode: 'soft',
            tracks: [
              {
                lang: 'id',
                label: 'Bahasa Indonesia',
                url: '/subtitles/cowboy-bebop-ep1-id.vtt',
              },
            ],
          },
        ],
      },
    },
  ])
  const step2 = resolveTruthfulState({
    hasRegisteredProvider: hasBebopProvider,
    streamSummary: bebopSummary,
  })
  assert.equal(step2, 'native-candidate')
  assert.equal(getAvailabilityMeta(step2).isPlayable, false)

  // Step 3: Native preflight verification passes in browser
  const step3 = resolveTruthfulState({
    hasRegisteredProvider: hasBebopProvider,
    streamSummary: bebopSummary,
    isVerified: true,
  })
  assert.equal(step3, 'verified')
  const step3Meta = getAvailabilityMeta(step3)
  assert.equal(step3Meta.isPlayable, true)
  assert.ok(step3Meta.className.includes('available'))
})

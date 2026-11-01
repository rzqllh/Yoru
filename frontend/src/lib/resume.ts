import type {Anime, Episode, ProgressEntry} from '../types'

export type ProgressState = 'NEVER_STARTED' | 'RESUMABLE' | 'COMPLETED' | 'INVALID'

export type ResumeTargetStatus =
 | 'RESUMABLE'
 | 'NEVER_STARTED'
 | 'COMPLETED'
 | 'INVALID'
 | 'SOURCE_UNAVAILABLE'

/** Classify playback progress into explicit semantic states.
 * - NEVER_STARTED: no entry, or seconds <= 0
 * - INVALID: non-finite or negative values, or seconds exceeding known duration
 * - COMPLETED: watched past percentage-aware end threshold
 * - RESUMABLE: valid nonzero position before completion threshold
 */
export function classifyProgressState(
 progress: Pick<ProgressEntry, 'seconds' | 'duration'> | null | undefined
): ProgressState {
 if (!progress) return 'NEVER_STARTED'
 const { seconds, duration } = progress
 if (!Number.isFinite(seconds) || seconds < 0) return 'INVALID'
 if (!Number.isFinite(duration) || duration < 0) return 'INVALID'
 if (seconds === 0) return 'NEVER_STARTED'
 if (duration > 0 && seconds > duration) return 'INVALID'
 if (duration === 0) return 'RESUMABLE'

 const completionThreshold = duration - Math.min(10, duration * 0.05)
 if (seconds >= completionThreshold) return 'COMPLETED'
 return 'RESUMABLE'
}

/** A percentage-aware end threshold keeps short clips resumable.
 * The prior fixed 10-second cutoff excluded every 9-second fixture.
 */
export function isResumableProgress(
 progress: Pick<ProgressEntry, 'seconds' | 'duration'> | null | undefined
): boolean {
 return classifyProgressState(progress) === 'RESUMABLE'
}

export function findAnimeProgress(
 progress: ProgressEntry[] | undefined,
 anime: Pick<Anime, 'id' | 'malId'>
): ProgressEntry | null {
 if (!progress || !Array.isArray(progress)) return null
 return progress.find(p => p.anime.id === anime.id || p.anime.malId === anime.malId) || null
}

export function resolveDetailResumeTarget(
 displayed: Episode[],
 progress: ProgressEntry[] | undefined,
 anime: Pick<Anime, 'id' | 'malId'>,
 availableEpisodes?: Episode[]
): {
 animeProgress: ProgressEntry | null
 progressState: ProgressState
 status: ResumeTargetStatus
 resumableProgress: ProgressEntry | null
 targetEpisode: Episode | null
} {
 const animeProgress = findAnimeProgress(progress, anime)
 const progressState = classifyProgressState(animeProgress)

 if (progressState !== 'RESUMABLE' || !animeProgress) {
  return {
   animeProgress,
   progressState,
   status: progressState,
   resumableProgress: null,
   targetEpisode: displayed[0] || null,
  }
 }

 const existing = displayed.find(e => e.number === animeProgress.episode)

 // Defect 2 fix: If the saved episode is absent from fetched metadata/catalog,
 // DO NOT invent a synthetic playable episode.
 if (!existing) {
  return {
   animeProgress,
   progressState,
   status: 'SOURCE_UNAVAILABLE',
   resumableProgress: null,
   targetEpisode: displayed[0] || null,
  }
 }

 // If provider candidates are known, verify candidate presence.
 if (availableEpisodes !== undefined && availableEpisodes.length > 0) {
  const hasDirect = availableEpisodes.some(
   e => e.number === existing.number && e.providerId !== 'public-embed'
  )
  if (!hasDirect) {
   return {
    animeProgress,
    progressState,
    status: 'SOURCE_UNAVAILABLE',
    resumableProgress: null,
    targetEpisode: existing,
   }
  }
 }

 return {
  animeProgress,
  progressState,
  status: 'RESUMABLE',
  resumableProgress: animeProgress,
  targetEpisode: existing,
 }
}


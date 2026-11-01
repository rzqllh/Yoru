import type {Anime, Episode, ProgressEntry} from '../types'

/** A percentage-aware end threshold keeps short clips resumable.
 * The prior fixed 10-second cutoff excluded every 9-second fixture.
 */
export function isResumableProgress(progress:Pick<ProgressEntry,'seconds'|'duration'>):boolean{
 if(!Number.isFinite(progress.seconds)||progress.seconds<=0)return false
 // A zero duration means not yet measured. Negative/NaN/infinite durations
 // are corrupt or non-seekable and must not become a resume target.
 if(!Number.isFinite(progress.duration)||progress.duration<0)return false
 if(progress.duration===0)return true
 return progress.seconds<progress.duration-Math.min(10,progress.duration*0.05)
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
 anime: Pick<Anime, 'id' | 'malId'>
): {
 animeProgress: ProgressEntry | null
 resumableProgress: ProgressEntry | null
 targetEpisode: Episode | null
} {
 const animeProgress = findAnimeProgress(progress, anime)
 const resumableProgress = animeProgress && isResumableProgress(animeProgress) ? animeProgress : null
 if (resumableProgress) {
  const existing = displayed.find(e => e.number === resumableProgress.episode)
  const targetEpisode = existing || {
   id: `${anime.id}:${resumableProgress.episode}`,
   animeId: anime.id,
   number: resumableProgress.episode,
   title: `Episode ${resumableProgress.episode}`,
  }
  return { animeProgress, resumableProgress, targetEpisode }
 }
 return {
  animeProgress,
  resumableProgress: null,
  targetEpisode: displayed[0] || null,
 }
}


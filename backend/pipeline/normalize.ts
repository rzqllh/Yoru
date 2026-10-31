export type Anime = {
  id: string; malId: number; title: string; englishTitle: string | null;
  japaneseTitle: string | null; poster: string | null; cover: string | null;
  synopsis: string; score: number | null; episodes: number | null;
  year: number | null; status: string; type: string; rating: string | null;
  genres: string[]; studios: string[]; trailerYoutubeId: string | null;
}

type JikanRecord = Record<string, unknown>
function text(value: unknown): string { return typeof value === 'string' ? value : '' }
function integer(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) ? value : null }
function object(value: unknown): JikanRecord { return value && typeof value === 'object' && !Array.isArray(value) ? value as JikanRecord : {} }
function names(value: unknown): string[] { return Array.isArray(value) ? value.map(x=>text(object(x).name)).filter(Boolean) : [] }

export function normalizeAnime(raw: JikanRecord): Anime {
  const id = integer(raw.mal_id)
  if (id === null || !Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid MAL anime id')
  const jpg = object(object(raw.images).jpg)
  const trailer = object(raw.trailer)
  const title = text(raw.title_english) || text(raw.title) || `Anime #${id}`
  return {
    id:`mal:${id}`, malId:id, title, englishTitle:text(raw.title_english)||null,
    japaneseTitle:text(raw.title_japanese)||null,
    poster:text(jpg.large_image_url)||text(jpg.image_url)||null,
    cover:text(jpg.large_image_url)||text(jpg.image_url)||null,
    synopsis:text(raw.synopsis).replace(/\[Written by MAL Rewrite\]/g,'').trim(),
    score: integer(raw.score), episodes: integer(raw.episodes), year:integer(raw.year),
    status:text(raw.status)||'Unknown', type:text(raw.type)||'TV', rating:text(raw.rating)||null,
    genres:names(raw.genres), studios:names(raw.studios),
    trailerYoutubeId:text(trailer.youtube_id)||null,
  }
}
export function normalizeList(rows: unknown): Anime[] {
  if (!Array.isArray(rows)) return []
  const seen = new Set<string>(); const result: Anime[] = []
  for (const value of rows) {
    try { const anime=normalizeAnime(object(value)); if(!seen.has(anime.id)){seen.add(anime.id);result.push(anime)} } catch { /* skip invalid entry */ }
  }
  return result
}
export type AnimeEpisode = { id:string; animeId:string; number:number; title:string; filler:boolean; recap:boolean }
export function normalizeEpisode(animeId:string, raw:JikanRecord): AnimeEpisode {
  const number = integer(raw.mal_id)
  if(number===null || !Number.isSafeInteger(number) || number<1) throw new Error('Invalid episode number')
  return {id:`${animeId}:${number}`,animeId,number,title:text(raw.title)||`Episode ${number}`,filler:raw.filler===true,recap:raw.recap===true}
}

export type Anime = {
 id:string;malId:number;title:string;englishTitle:string|null;japaneseTitle:string|null;
 poster:string|null;cover:string|null;synopsis:string;score:number|null;episodes:number|null;
 year:number|null;status:string;type:string;rating:string|null;genres:string[];studios:string[];
 trailerYoutubeId:string|null
}
export type Episode = {id:string;animeId:string;number:number;title:string;filler?:boolean;recap?:boolean;providerId?:string}
export type Track = {lang:string;label:string;url:string}
export type Stream = {id?:string;providerId?:string;format:'hls'|'mp4';url:string;subtitleMode:'hard'|'soft'|'unknown';tracks:Track[];quality?:string}
export type Page = 'home'|'browse'|'library'|'settings'
export type LibraryStatus = 'watching'|'planned'|'completed'
export type LibraryEntry = { anime:Anime;status:LibraryStatus;updatedAt:number }
export type ProgressEntry = {anime:Anime;episode:number;seconds:number;duration:number;updatedAt:number}
export type CatalogResponse = {items:Anime[];page:number;hasNext:boolean}

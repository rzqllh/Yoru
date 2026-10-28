export function durationDisplay(seconds:number){if(!Number.isFinite(seconds))return '0:00';const s=Math.max(0,Math.floor(seconds));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
export function scoreDisplay(score:number|null){return score===null?'—':score.toFixed(1)}
export function description(value:string){return value.replace(/\s+/g,' ').trim()}
export function yearLabel(year:number|null){return year?String(year):'Tahun tidak diketahui'}

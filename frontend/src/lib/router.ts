export type Page = 'home' | 'browse' | 'guide' | 'library' | 'settings'
export type BrowseKind = 'season' | 'top' | 'upcoming'
export type LibraryView = 'all' | 'continue'

export type BrowseFilters={
 genre:string;format:string;minimumScore:number;year:string;order:'default'|'rating'|'newest'
}
export const EMPTY_BROWSE_FILTERS:BrowseFilters={
 genre:'',format:'',minimumScore:0,year:'',order:'default'
}
const GENRES=new Set(['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Slice of Life','Sports','Supernatural'])
const FORMATS=new Set(['TV','Movie','OVA','ONA','Special','Music'])
export function sanitizeBrowseFilters(candidate:Partial<BrowseFilters>):BrowseFilters{
 const year=Number(candidate.year)
 const yearValid=typeof candidate.year==='string'&&/^\d{4}$/.test(candidate.year)&&
  Number.isSafeInteger(year)&&year>=1950&&year<=new Date().getFullYear()+2
 return {
  genre:typeof candidate.genre==='string'&&(GENRES.has(candidate.genre)||/^mal:[1-9]\d{0,2}$/.test(candidate.genre))?candidate.genre:'',
  format:typeof candidate.format==='string'&&FORMATS.has(candidate.format)?candidate.format:'',
  minimumScore:[7,8,9].includes(Number(candidate.minimumScore))?Number(candidate.minimumScore):0,
  year:yearValid?String(year):'',
  order:candidate.order==='rating'||candidate.order==='newest'?candidate.order:'default'
 }
}
export function parseBrowseFilters(params:URLSearchParams):BrowseFilters{
 return sanitizeBrowseFilters({
  genre:params.get('genre')??'',format:params.get('type')??'',
  minimumScore:Number(params.get('minScore')??0),year:params.get('year')??'',
  order:(params.get('order')??'default') as BrowseFilters['order']
 })
}
export function browseFilterParams(filters:BrowseFilters):URLSearchParams{
 const p=new URLSearchParams()
 const safe=sanitizeBrowseFilters(filters)
 if(safe.genre)p.set('genre',safe.genre)
 if(safe.format)p.set('type',safe.format)
 if(safe.minimumScore)p.set('minScore',String(safe.minimumScore))
 if(safe.year)p.set('year',safe.year)
 if(safe.order!=='default')p.set('order',safe.order)
 return p
}

export type RouteState = {
  page: Page
  browseKind: BrowseKind
  libraryView: LibraryView
  searchQuery: string
  browseFilters?: BrowseFilters
  guideMalId?: number
  shortcut?: 'season' | 'continue'
}

export function parseRoute(pathname: string, search: string): RouteState {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/'
  const params = new URLSearchParams(search)
  const q = params.get('q') || ''
  const browseFilters=parseBrowseFilters(params)

  if (cleanPath === '' || cleanPath === '/') {
    return {
      page: 'home',
      browseKind: 'season',
      libraryView: 'all',
      searchQuery: '',
    }
  }

  if (cleanPath === '/jelajahi/panduan-urutan') {
    // A deep link must contain a canonical decimal MAL ID, not JS number syntax.
    // Number('1e3') and Number('0x10') would silently select unrelated titles.
    const raw=params.get('anime')??''
    const guideMalId=/^[1-9]\d{0,8}$/.test(raw)?Number(raw):undefined
    return {page:'guide',browseKind:'season',libraryView:'all',searchQuery:'',guideMalId}
  }

  if (cleanPath === '/jelajahi/musim-ini') {
    return {
      page: 'browse',
      browseKind: 'season',
      libraryView: 'all',
      searchQuery: q,
      browseFilters,
      shortcut: 'season',
    }
  }

  if (cleanPath === '/jelajahi/populer') {
    return {
      page: 'browse',
      browseKind: 'top',
      libraryView: 'all',
      searchQuery: q,
      browseFilters,
    }
  }

  if (cleanPath === '/jelajahi/akan-datang') {
    return {
      page: 'browse',
      browseKind: 'upcoming',
      libraryView: 'all',
      searchQuery: q,
      browseFilters,
    }
  }

  if (cleanPath.startsWith('/jelajahi')) {
    return {
      page: 'browse',
      browseKind: 'season',
      libraryView: 'all',
      searchQuery: q,
      browseFilters,
    }
  }

  if (cleanPath === '/koleksi/lanjut-menonton') {
    return {
      page: 'library',
      browseKind: 'season',
      libraryView: 'continue',
      searchQuery: '',
      shortcut: 'continue',
    }
  }

  if (cleanPath.startsWith('/koleksi')) {
    return {
      page: 'library',
      browseKind: 'season',
      libraryView: 'all',
      searchQuery: '',
    }
  }

  if (cleanPath.startsWith('/pengaturan')) {
    return {
      page: 'settings',
      browseKind: 'season',
      libraryView: 'all',
      searchQuery: '',
    }
  }

  return {
    page: 'home',
    browseKind: 'season',
    libraryView: 'all',
    searchQuery: '',
  }
}

export function routeToPath(state: RouteState): string {
  if (state.page === 'home') return '/'
  if (state.page === 'guide') {
    const id=state.guideMalId
    const valid=Number.isSafeInteger(id)&&Number(id)>0&&Number(id)<=999999999
    return '/jelajahi/panduan-urutan'+(valid?`?anime=${id}`:'')
  }

  if (state.page === 'browse') {
    // Preserve the selected tab even when searching/filtering and share one canonical URL.
    const base=state.browseKind==='top'?'/jelajahi/populer':
     state.browseKind==='upcoming'?'/jelajahi/akan-datang':
     state.shortcut==='season'?'/jelajahi/musim-ini':'/jelajahi'
    const params=browseFilterParams(state.browseFilters??EMPTY_BROWSE_FILTERS)
    const query=state.searchQuery.trim()
    if(query)params.set('q',query)
    const value=params.toString()
    return value?`${base}?${value}`:base
  }

  if (state.page === 'library') {
    if (state.libraryView === 'continue') return '/koleksi/lanjut-menonton'
    return '/koleksi'
  }

  if (state.page === 'settings') return '/pengaturan'
  return '/'
}

export function getBreadcrumbs(state: RouteState): string[] {
  if (state.page === 'home') return ['Yoru', 'Beranda']
  if (state.page === 'guide') return ['Yoru', 'Jelajahi', 'Panduan urutan']

  if (state.page === 'browse') {
    if (state.searchQuery) {
      return ['Yoru', 'Jelajahi', `Cari: "${state.searchQuery}"`]
    }
    if (state.shortcut === 'season' || state.browseKind === 'season') {
      return state.shortcut === 'season' ? ['Yoru', 'Jelajahi', 'Musim ini'] : ['Yoru', 'Jelajahi']
    }
    if (state.browseKind === 'top') return ['Yoru', 'Jelajahi', 'Populer']
    if (state.browseKind === 'upcoming') return ['Yoru', 'Jelajahi', 'Akan datang']
    return ['Yoru', 'Jelajahi']
  }

  if (state.page === 'library') {
    if (state.libraryView === 'continue') return ['Yoru', 'Koleksi', 'Lanjut menonton']
    return ['Yoru', 'Koleksi']
  }

  if (state.page === 'settings') return ['Yoru', 'Pengaturan']
  return ['Yoru']
}

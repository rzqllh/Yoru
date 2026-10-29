export type Page = 'home' | 'browse' | 'library' | 'settings'
export type BrowseKind = 'season' | 'top' | 'upcoming'
export type LibraryView = 'all' | 'continue'

export type RouteState = {
  page: Page
  browseKind: BrowseKind
  libraryView: LibraryView
  searchQuery: string
  shortcut?: 'season' | 'continue'
}

export function parseRoute(pathname: string, search: string): RouteState {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/'
  const params = new URLSearchParams(search)
  const q = params.get('q') || ''

  if (cleanPath === '' || cleanPath === '/') {
    return {
      page: 'home',
      browseKind: 'season',
      libraryView: 'all',
      searchQuery: '',
    }
  }

  if (cleanPath === '/jelajahi/musim-ini') {
    return {
      page: 'browse',
      browseKind: 'season',
      libraryView: 'all',
      searchQuery: q,
      shortcut: 'season',
    }
  }

  if (cleanPath === '/jelajahi/populer') {
    return {
      page: 'browse',
      browseKind: 'top',
      libraryView: 'all',
      searchQuery: q,
    }
  }

  if (cleanPath === '/jelajahi/akan-datang') {
    return {
      page: 'browse',
      browseKind: 'upcoming',
      libraryView: 'all',
      searchQuery: q,
    }
  }

  if (cleanPath.startsWith('/jelajahi')) {
    return {
      page: 'browse',
      browseKind: 'season',
      libraryView: 'all',
      searchQuery: q,
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

  if (state.page === 'browse') {
    let base = '/jelajahi'
    if (state.shortcut === 'season' || (state.browseKind === 'season' && !state.searchQuery)) {
      base = state.shortcut === 'season' ? '/jelajahi/musim-ini' : '/jelajahi'
    } else if (state.browseKind === 'top' && !state.searchQuery) {
      base = '/jelajahi/populer'
    } else if (state.browseKind === 'upcoming' && !state.searchQuery) {
      base = '/jelajahi/akan-datang'
    }
    const q = state.searchQuery?.trim()
    return q ? `${base}?q=${encodeURIComponent(q)}` : base
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

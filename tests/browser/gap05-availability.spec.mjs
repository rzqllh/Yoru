import { expect, test } from '@playwright/test'

const aotAnime = {
  id: 'mal:16498',
  malId: 16498,
  title: 'Attack on Titan',
  englishTitle: 'Attack on Titan',
  japaneseTitle: '進撃の巨人',
  poster: null,
  cover: null,
  synopsis: 'Titans attack humanity.',
  score: 8.54,
  episodes: 25,
  year: 2013,
  status: 'Finished Airing',
  type: 'TV',
  rating: 'R - 17+',
  genres: ['Action', 'Fantasy'],
  studios: ['Wit Studio'],
  trailerYoutubeId: null,
}

const standaloneAnime = {
  id: 'mal:32281',
  malId: 32281,
  title: 'Your Name.',
  englishTitle: 'Your Name.',
  japaneseTitle: '君の名は。',
  poster: null,
  cover: null,
  synopsis: 'Mitsuha and Taki swap bodies.',
  score: 8.85,
  episodes: 1,
  year: 2016,
  status: 'Finished Airing',
  type: 'Movie',
  rating: 'PG-13',
  genres: ['Drama', 'Supernatural'],
  studios: ['CoMix Wave Films'],
  trailerYoutubeId: null,
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/anime/daily-trends', route =>
    route.fulfill({ status: 503, json: { error: 'DAILY_TRENDS_UNAVAILABLE' } })
  )
  await page.route('**/api/anime/genres', route =>
    route.fulfill({
      json: {
        items: [{ id: 1, name: 'Action' }],
        source: 'built-in',
        status: 'fallback',
      },
    })
  )
  await page.route('**/api/anime/discover?**', route =>
    route.fulfill({ json: { items: [aotAnime, standaloneAnime], page: 1, hasNext: false } })
  )
  await page.route('**/api/anime/search?**', route =>
    route.fulfill({ json: { items: [aotAnime, standaloneAnime], page: 1, hasNext: false } })
  )
})

test('GAP-05: Attack on Titan fixture truthfully displays provider registration and torrent-only states without iframe fallback', async ({
  page,
}) => {
  await page.route('**/api/anime/16498', route => route.fulfill({ json: aotAnime }))
  await page.route('**/api/anime/16498/episodes?**', route =>
    route.fulfill({
      json: {
        items: [{ id: 'mal:16498:1', animeId: 'mal:16498', number: 1, title: 'To You, in 2000 Years' }],
        page: 1,
        hasNext: false,
      },
    })
  )
  // Registered via Torrentio (Stremio addon)
  await page.route('**/api/anime/16498/provider-episodes', route =>
    route.fulfill({
      json: {
        items: [
          {
            id: 'stremio-anime-streams:16498:1',
            animeId: 'mal:16498',
            number: 1,
            title: 'Episode 1',
            providerId: 'stremio-anime-streams',
          },
        ],
      },
    })
  )
  // Torrentio returns only torrent infoHash; NO native browser stream
  await page.route('**/api/streams?**', route =>
    route.fulfill({
      json: {
        items: [],
        unavailable: [
          {
            kind: 'torrent',
            label: '[Torrentio] Attack on Titan S01E01 1080p',
            reason: 'Torrent membutuhkan mesin streaming/resolver yang terhubung; belum bisa diputar langsung.',
          },
        ],
      },
    })
  )
  await page.route('**/api/anime/16498/watch-guide**', route =>
    route.fulfill({
      json: {
        source: 'AniList',
        sourceUrl: 'https://anilist.co',
        scope: 'direct-relations',
        animeMalId: 16498,
        items: [
          { aniListId: 16498, malId: 16498, title: 'Attack on Titan', relation: 'CURRENT' },
          { aniListId: 25777, malId: 25777, title: 'Attack on Titan Season 2', relation: 'SEQUEL' },
        ],
      },
    })
  )

  await page.goto('/')
  // Open Attack on Titan detail
  await page.getByRole('button', { name: 'Buka Attack on Titan' }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Detail Attack on Titan' })
  await expect(dialog).toBeVisible()

  // 1. Initial State: Must be truthful "Penyedia terdaftar · Belum diperiksa"
  // It must NOT have class 'available' and must NOT claim "Ketuk untuk memilih video"
  const epRow = dialog.locator('.episode-row').first()
  await expect(epRow).toContainText('Penyedia terdaftar · Belum diperiksa')
  await expect(epRow).not.toHaveClass(/available/)
  await expect(epRow).toHaveClass(/status-registered/)

  // Detail CTA also reflects truthful state ("Periksa sumber episode", not "Putar")
  await expect(dialog.getByRole('button', { name: /Periksa sumber episode/ })).toBeVisible()

  // 2. Click Episode row: Fetch streams
  await epRow.click()

  // 3. Truthful state after search: Resolves to "Torrent saja · Tidak ada sumber langsung"
  await expect(epRow).toContainText('Torrent saja · Tidak ada sumber langsung')
  await expect(epRow).toHaveClass(/status-torrent/)
  await expect(epRow).not.toHaveClass(/available/)

  // 4. Must show clear feedback explaining torrent requirement, and NO iframe embed launched
  await expect(
    dialog.getByText(/Torrent membutuhkan mesin streaming\/resolver yang terhubung/i).first()
  ).toBeVisible()
  await expect(page.locator('iframe')).toHaveCount(0)
  await expect(page.locator('.player-stage')).toHaveCount(0)
})

test('Watch Guide: "Urutan cerita" only displays when meaningful relations exist', async ({
  page,
}) => {
  // 1. Anime with relations: Attack on Titan (16498) -> shows Urutan cerita
  await page.route('**/api/anime/16498', route => route.fulfill({ json: aotAnime }))
  await page.route('**/api/anime/16498/episodes?**', route =>
    route.fulfill({ json: { items: [], page: 1, hasNext: false } })
  )
  await page.route('**/api/anime/16498/provider-episodes', route =>
    route.fulfill({ json: { items: [] } })
  )
  await page.route('**/api/anime/16498/watch-guide**', route =>
    route.fulfill({
      json: {
        source: 'AniList',
        sourceUrl: 'https://anilist.co',
        scope: 'direct-relations',
        animeMalId: 16498,
        items: [
          { aniListId: 16498, malId: 16498, title: 'Attack on Titan', relation: 'CURRENT' },
          { aniListId: 25777, malId: 25777, title: 'Attack on Titan Season 2', relation: 'SEQUEL' },
        ],
      },
    })
  )

  await page.goto('/')
  await page.getByRole('button', { name: 'Buka Attack on Titan' }).first().click()
  const aotDialog = page.getByRole('dialog', { name: 'Detail Attack on Titan' })
  await expect(aotDialog.getByRole('button', { name: /Urutan cerita \(1\)/ })).toBeVisible()

  // Close dialog
  await aotDialog.getByRole('button', { name: 'Tutup detail anime' }).click()

  // 2. Standalone Anime without relations: Your Name (32281) -> does NOT show Urutan cerita
  await page.route('**/api/anime/32281', route => route.fulfill({ json: standaloneAnime }))
  await page.route('**/api/anime/32281/episodes?**', route =>
    route.fulfill({ json: { items: [], page: 1, hasNext: false } })
  )
  await page.route('**/api/anime/32281/provider-episodes', route =>
    route.fulfill({ json: { items: [] } })
  )
  await page.route('**/api/anime/32281/watch-guide**', route =>
    route.fulfill({
      json: {
        source: 'AniList',
        sourceUrl: 'https://anilist.co',
        scope: 'direct-relations',
        animeMalId: 32281,
        items: [
          // Only the CURRENT item itself
          { aniListId: 32281, malId: 32281, title: 'Your Name.', relation: 'CURRENT' },
        ],
      },
    })
  )

  await page.getByRole('button', { name: 'Buka Your Name.' }).first().click()
  const movieDialog = page.getByRole('dialog', { name: 'Detail Your Name.' })
  await expect(movieDialog).toBeVisible()
  // "Urutan cerita" button MUST NOT exist when there are 0 relations
  await expect(movieDialog.getByRole('button', { name: /Urutan cerita/ })).toHaveCount(0)
})

test('Player toolbar: No duplicated settings control and fits narrow mobile viewports (320, 375, 390, 430px)', async ({
  page,
}) => {
  const viewports = [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
  ]

  for (const vp of viewports) {
    await page.setViewportSize(vp)
    await page.goto('/pengaturan')

    // Open demo video player
    const demoBtn = page.getByRole('button', { name: /Coba pemutar/i })
    await demoBtn.click()

    const player = page.locator('.player-overlay')
    await expect(player).toBeVisible()

    // 1. Verify NO duplicated settings/Pengaturan button exists in player transport bar (exactly 1)
    const moreTrigger = player.locator('.player-more-trigger')
    await expect(moreTrigger).toHaveCount(1)
    const pengaturanButtons = player.locator('.player-toolbar button:has-text("Pengaturan")')
    await expect(pengaturanButtons).toHaveCount(1)

    // 2. Subtitle button exists and opens subtitle panel with offset & style settings
    const subtitleTrigger = player.locator('.player-subtitle-trigger')
    await expect(subtitleTrigger).toBeVisible()
    await subtitleTrigger.click()

    const subtitlePanel = player.locator('.player-subtitle-panel')
    await expect(subtitlePanel).toBeVisible()
    await expect(subtitlePanel.getByText(/Tampilan dan waktu/i)).toBeVisible()

    // Close player
    await player.locator('button[aria-label="Kembali"]').click()
    await expect(player).toHaveCount(0)
  }
})

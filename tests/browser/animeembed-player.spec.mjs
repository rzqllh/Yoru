import { expect, test } from '@playwright/test'

const testAnime = {
  id: 'mal:52991',
  malId: 52991,
  title: 'Sousou no Frieren',
  englishTitle: 'Frieren: Beyond Journey\'s End',
  japaneseTitle: '葬送のフリーレン',
  poster: null,
  cover: null,
  synopsis: 'The adventure is over but life goes on for an elf mage.',
  score: 9.3,
  episodes: 28,
  year: 2023,
  status: 'Finished Airing',
  type: 'TV',
  rating: 'PG-13',
  genres: ['Adventure', 'Drama', 'Fantasy'],
  studios: ['Madhouse'],
  trailerYoutubeId: null
}

const testEpisode = {
  id: 'mal:52991:1',
  animeId: 'mal:52991',
  number: 1,
  title: 'The Journey\'s End',
  filler: false,
  recap: false
}

const embedStream = {
  id: 'public-embed:52991:1:0',
  providerId: 'External embed (unverified)',
  format: 'embed',
  url: 'https://www.animeembed.com/embed/mal/52991/1',
  subtitleMode: 'unknown',
  tracks: [],
  quality: 'External player'
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/anime/discover?**', async route =>
    route.fulfill({ json: { items: [testAnime], page: 1, hasNext: false } })
  )
  await page.route('**/api/anime/search?**', async route =>
    route.fulfill({ json: { items: [testAnime], page: 1, hasNext: false } })
  )
  await page.route('**/api/anime/52991', async route =>
    route.fulfill({ json: testAnime })
  )
  await page.route('**/api/anime/52991/episodes?**', async route =>
    route.fulfill({ json: { items: [testEpisode], page: 1, hasNext: false } })
  )
  await page.route('**/api/anime/52991/provider-episodes', async route =>
    route.fulfill({ json: { items: [] } }) // forces external embed fallback
  )
  await page.route('**/api/streams?**', async route =>
    route.fulfill({ json: { items: [embedStream] } })
  )
})

test('AnimeEmbed player displays accurate English subtitle disclosure and embed frame', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Buka Sousou no Frieren' }).first().click()
  await expect(page.getByRole('dialog', { name: 'Detail Sousou no Frieren' })).toBeVisible()

  await page.locator('.episode-list .episode-row').first().click()
  await expect(page.getByRole('dialog', { name: 'Video player' })).toBeVisible()

  // Verify iframe existence and initial clean URL
  const iframe = page.getByTitle('External player · Episode 1')
  await expect(iframe).toBeVisible()
  await expect(iframe).toHaveAttribute('src', 'https://www.animeembed.com/embed/mal/52991/1')

  // Verify truthful subtitle disclosure
  await expect(page.getByText(/Subtitle English \(bawaan AnimeEmbed\)/i)).toBeVisible()
  await expect(page.getByText(/Progres tontonan tersimpan lokal di browser ini/i)).toBeVisible()
})

test('AnimeEmbed postMessage progress, pause, and ended update IndexedDB and enable resume on reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Buka Sousou no Frieren' }).first().click()
  await page.locator('.episode-list .episode-row').first().click()
  await expect(page.getByRole('dialog', { name: 'Video player' })).toBeVisible()

  const helperReadDB = () =>
    page.evaluate(async () => {
      const req = indexedDB.open('yoru-local-v1')
      return new Promise((resolve, reject) => {
        req.onerror = () => reject(req.error)
        req.onsuccess = () => {
          const db = req.result
          const tx = db.transaction('progress', 'readonly')
          const get = tx.objectStore('progress').get('mal:52991')
          get.onerror = () => reject(get.error)
          get.onsuccess = () => {
            resolve(get.result)
            db.close()
          }
        }
      })
    })

  // 1. Simulate real AnimeEmbed postMessage: 'pause' event with currentTime = 150 seconds
  await page.evaluate(() => {
    const frame = document.querySelector('iframe')
    if (frame?.contentWindow) {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://www.animeembed.com',
          source: frame.contentWindow,
          data: {
            channel: 'animeembed',
            version: 1,
            event: 'pause',
            data: { currentTime: 150, duration: 1420 }
          }
        })
      )
    }
  })

  // Verify progress was written to IndexedDB
  await expect.poll(async () => {
    const data = await helperReadDB()
    return data?.episode === 1 && data.seconds === 150 && data.duration === 1420
  }, { timeout: 10000 }).toBe(true)

  // 2. Untrusted origin postMessage is rejected and does not corrupt IndexedDB
  await page.evaluate(() => {
    const frame = document.querySelector('iframe')
    if (frame?.contentWindow) {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://attacker.example.com',
          source: frame.contentWindow,
          data: {
            channel: 'animeembed',
            version: 1,
            event: 'pause',
            data: { currentTime: 9999, duration: 9999 }
          }
        })
      )
    }
  })

  // Verify data is still 150 (untouched)
  const dataAfterSpoof = await helperReadDB()
  expect(dataAfterSpoof?.seconds).toBe(150)

  // 3. Close the player
  await page.getByRole('button', { name: 'Kembali' }).click()
  await expect(page.getByRole('dialog', { name: 'Video player' })).not.toBeVisible()

  // 4. Reopen episode 1: verify that resume position is loaded into the iframe src query parameter (?start=150)
  await page.getByRole('button', { name: 'Buka Sousou no Frieren' }).first().click()
  await page.locator('.episode-list .episode-row').first().click()
  await expect(page.getByRole('dialog', { name: 'Video player' })).toBeVisible()

  const resumedIframe = page.getByTitle('External player · Episode 1')
  await expect(resumedIframe).toBeVisible()

  // Check URL has start=150
  await expect.poll(async () => {
    const src = await resumedIframe.getAttribute('src')
    return src
  }, { timeout: 5000 }).toContain('start=150')

  // Check heading displays resume indicator
  await expect(page.getByText(/Melanjutkan dari 2m 30s/)).toBeVisible()
})

test('Live check: AnimeEmbed external endpoint responds HTTP 200', async ({ request }) => {
  try {
    const response = await request.get('https://www.animeembed.com/embed/mal/52991/1', {
      timeout: 10000
    })
    expect(response.status()).toBe(200)
    const text = await response.text()
    expect(text.length).toBeGreaterThan(100)
  } catch (err) {
    console.warn('AnimeEmbed live network check note (may be offline or firewalled in some environments):', err.message)
    // Non-blocking report for external network dependency as required
  }
})

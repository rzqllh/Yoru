import { chromium } from 'playwright'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'docs/screenshots')

async function run() {
  const browser = await chromium.launch({ headless: true })
  
  // Desktop 1440x900
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const dPage = await desktopCtx.newPage()

  console.log('Capturing Desktop Beranda...')
  await dPage.goto('http://127.0.0.1:5173/')
  await dPage.waitForTimeout(2000)
  await dPage.screenshot({ path: resolve(outDir, 'desktop-beranda.png'), fullPage: false })

  console.log('Capturing Desktop Jelajahi...')
  await dPage.goto('http://127.0.0.1:5173/jelajahi')
  await dPage.waitForTimeout(2000)
  await dPage.screenshot({ path: resolve(outDir, 'desktop-jelajahi.png'), fullPage: false })

  console.log('Capturing Desktop Koleksi...')
  await dPage.goto('http://127.0.0.1:5173/koleksi')
  await dPage.waitForTimeout(1000)
  await dPage.screenshot({ path: resolve(outDir, 'desktop-koleksi.png'), fullPage: false })

  console.log('Capturing Desktop Pengaturan...')
  await dPage.goto('http://127.0.0.1:5173/pengaturan')
  await dPage.waitForTimeout(1000)
  await dPage.screenshot({ path: resolve(outDir, 'desktop-pengaturan.png'), fullPage: false })

  await desktopCtx.close()

  // Mobile 390x844 (iPhone 14/15 size)
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const mPage = await mobileCtx.newPage()

  console.log('Capturing Mobile Beranda...')
  await mPage.goto('http://127.0.0.1:5173/')
  await mPage.waitForTimeout(2000)
  await mPage.screenshot({ path: resolve(outDir, 'mobile-beranda.png'), fullPage: false })

  console.log('Capturing Mobile Jelajahi...')
  await mPage.goto('http://127.0.0.1:5173/jelajahi')
  await mPage.waitForTimeout(2000)
  await mPage.screenshot({ path: resolve(outDir, 'mobile-jelajahi.png'), fullPage: false })

  console.log('Capturing Mobile Koleksi...')
  await mPage.goto('http://127.0.0.1:5173/koleksi')
  await mPage.waitForTimeout(1000)
  await mPage.screenshot({ path: resolve(outDir, 'mobile-koleksi.png'), fullPage: false })

  console.log('Capturing Mobile Pengaturan...')
  await mPage.goto('http://127.0.0.1:5173/pengaturan')
  await mPage.waitForTimeout(1000)
  await mPage.screenshot({ path: resolve(outDir, 'mobile-pengaturan.png'), fullPage: false })

  await mobileCtx.close()
  await browser.close()
  console.log('Done capturing screenshots!')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})

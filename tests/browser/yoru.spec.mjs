import {expect,test} from '@playwright/test'

const anime={
 id:'mal:1',malId:1,title:'Yoru Test Anime',englishTitle:'Yoru Test Anime',
 japaneseTitle:'テストアニメ',poster:null,cover:null,synopsis:'A test anime for deterministic browser verification.',
 score:8.5,episodes:1,year:2024,status:'Finished Airing',type:'TV',rating:'PG-13',
 genres:['Action'],studios:['Test Studio'],trailerYoutubeId:null,
}
const episode={id:'mal:1:1',animeId:'mal:1',number:1,title:'Episode 1',filler:false,recap:false}
const configured={...episode,id:'fixture:1:1',providerId:'fixture'}
const testStream={
 id:'fixture:1:1:0',providerId:'fixture',format:'hls',
 url:'/demo/stream.m3u8',subtitleMode:'soft',
 tracks:[{lang:'id',label:'Bahasa Indonesia',url:'/demo-id.vtt'}],
}
test.beforeEach(async({page})=>{
 await page.route('**/api/anime/discover?**',async route=>
  route.fulfill({json:{items:[anime],page:1,hasNext:false}}))
 await page.route('**/api/anime/search?**',async route=>
  route.fulfill({json:{items:[anime],page:1,hasNext:false}}))
 await page.route('**/api/anime/1',async route=>
  route.fulfill({json:anime}))
 await page.route('**/api/anime/1/episodes?**',async route=>
  route.fulfill({json:{items:[episode],page:1,hasNext:false}}))
 await page.route('**/api/anime/1/provider-episodes',async route=>
  route.fulfill({json:{items:[configured]}}))
 await page.route('**/api/streams?**',async route=>
  route.fulfill({json:{items:[testStream]}}))
})
test('desktop: catalog, search, detail, library and playback with Indonesian VTT',async({page})=>{
 await page.goto('/')
 await expect(page.getByRole('heading',{name:/^(Beranda|Koleksi)/})).toBeVisible()
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await expect(page.getByRole('dialog',{name:'Detail Yoru Test Anime'})).toBeVisible()
 await page.getByRole('dialog',{name:'Detail Yoru Test Anime'}).getByRole('button',{name:/Koleksiku/}).click()
 await page.locator('.episode-list .episode-row').first().click()
 await expect(page.getByRole('dialog',{name:'Video player'})).toBeVisible()
 await expect(page.locator('video track[srclang="id"]')).toHaveCount(1)
 await expect.poll(async()=>page.locator('video').evaluate(video=>video.readyState),{timeout:20000}).toBeGreaterThan(0)
 await page.screenshot({path:'test-results/desktop-player.png',fullPage:true})
 await page.getByRole('button',{name:'Kembali'}).click()
 // Starting playback closes the detail modal by design.
 await page.locator('.main-nav').getByRole('button',{name:'Koleksi'}).click()
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
 await page.reload()
 await expect(page.getByRole('heading',{name:/^(Beranda|Koleksi)/})).toBeVisible()
 await page.locator('.main-nav').getByRole('button',{name:'Koleksi'}).click()
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
})
test('mobile: navigation and sample player remain usable at iPhone-sized viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await page.getByRole('button',{name:'Buka menu'}).click()
 await page.locator('.main-nav').getByRole('button',{name:'Pengaturan'}).click()
 await expect(page.getByRole('heading',{name:/^Pengaturan/})).toBeVisible()
 await page.getByRole('button',{name:/Test player/}).click()
 await expect(page.getByRole('dialog',{name:'Video player'})).toBeVisible()
 await expect(page.locator('video track[srclang="id"]')).toHaveCount(1)
 await page.screenshot({path:'test-results/mobile-player.png',fullPage:true})
})
test('PWA manifest and offline shell exist on production server',async({request})=>{
 const manifest=await request.get('/manifest.webmanifest')
 expect(manifest.ok()).toBeTruthy()
 const info=await manifest.json()
 expect(info.name).toContain('Yoru')
 const sw=await request.get('/sw.js')
 expect(sw.ok()).toBeTruthy()
 expect(await sw.text()).toContain('yoru-shell-')
})

test('search query always restarts from page one after browsing another page',async({page})=>{
 await page.route('**/api/anime/discover?**',async route=>{
  const pageNo=Number(new URL(route.request().url()).searchParams.get('page'))
  await route.fulfill({json:{items:[anime],page:pageNo,hasNext:pageNo===1}})
 })
 const searchPages=[]
 await page.route('**/api/anime/search?**',async route=>{
  searchPages.push(Number(new URL(route.request().url()).searchParams.get('page')))
  await route.fulfill({json:{items:[anime],page:1,hasNext:false}})
 })
 await page.goto('/')
 await page.locator('.main-nav').getByRole('button',{name:'Jelajahi'}).click()
 await page.getByRole('button',{name:/Muat lebih banyak/}).click()
 await page.getByRole('textbox',{name:'Cari judul anime'}).fill('Yoru')
 await expect.poll(()=>searchPages.at(-1),{timeout:10000}).toBe(1)
})

test('multiple providers for one episode appear as separate source options',async({page})=>{
 const providerA={...configured,id:'local:1:1',providerId:'local'}
 const providerB={...configured,id:'stremio-demo:1:1',providerId:'stremio-demo'}
 await page.route('**/api/anime/1/provider-episodes',async route=>route.fulfill({json:{items:[providerA,providerB]}}))
 await page.route('**/api/streams?**',async route=>{
  const reference=new URL(route.request().url()).searchParams.get('episodeRef')
  const item={...testStream,id:`${reference}:0`,providerId:reference?.startsWith('stremio-')?'stremio-demo':'local'}
  await route.fulfill({json:{items:[item]}})
 })
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 await expect(page.locator('.source-options button')).toHaveCount(2)
 await page.locator('.source-options button').last().click()
 await expect(page.getByRole('dialog',{name:'Video player'})).toBeVisible()
})

test('legacy backup imports without missing-metadata crashes and persists after reload',async({page})=>{
 const restored={version:1,library:[{
  anime:{id:'mal:1',malId:1,title:'Yoru Test Anime'},
  status:'watching',updatedAt:Date.now()
 }],progress:[]}
 await page.goto('/')
 await page.locator('.main-nav').getByRole('button',{name:'Pengaturan'}).click()
 await page.locator('input[type=file]').setInputFiles({
  name:'yoru-backup.json',mimeType:'application/json',
  buffer:Buffer.from(JSON.stringify(restored))
 })
 await expect(page.getByRole('status')).toContainText('dipulihkan')
 await page.locator('.main-nav').getByRole('button',{name:'Koleksi'}).click()
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
 await page.reload()
 await page.locator('.main-nav').getByRole('button',{name:'Koleksi'}).click()
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
})

test('real HLS playback writes progress to IndexedDB and keeps it after reload',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const video=page.locator('video')
 await expect(video).toBeVisible()
 await video.evaluate(async element=>{await element.play()})
 await expect.poll(()=>video.evaluate(element=>element.currentTime),{timeout:20000}).toBeGreaterThan(0.75)
 await video.evaluate(element=>element.pause())
 const readSaved=()=>page.evaluate(async()=>{
  const request=indexedDB.open('yoru-local-v1')
  return new Promise((resolve,reject)=>{
   request.onerror=()=>reject(request.error)
   request.onsuccess=()=>{
    const db=request.result
    const tx=db.transaction('progress','readonly')
    const get=tx.objectStore('progress').get('mal:1')
    get.onerror=()=>reject(get.error)
    get.onsuccess=()=>{resolve(get.result);db.close()}
   }
  })
 })
 await expect.poll(async()=>{
  const data=await readSaved()
  return data?.episode===1&&data.seconds>0.75
 },{timeout:10000}).toBe(true)
 await page.getByRole('button',{name:'Kembali'}).click()
 await page.reload()
 const saved=await readSaved()
 expect(saved.episode).toBe(1)
 expect(saved.seconds).toBeGreaterThan(0.75)
})

test('settings reports a degraded provider while keeping healthy providers listed',async({page})=>{
 await page.route('**/api/providers',async route=>route.fulfill({json:{
  providers:[{id:'local',name:'Configured local source',animeCount:2}],
  warnings:['stremio']
 }}))
 await page.goto('/')
 await page.locator('.main-nav').getByRole('button',{name:'Pengaturan'}).click()
 await expect(page.getByText('Configured local source')).toBeVisible()
 await expect(page.locator('.config-error')).toContainText('stremio')
})

test('detail modal traps keyboard focus and restores the opener after closing',async({page})=>{
 await page.goto('/')
 const trigger=page.getByRole('button',{name:'Buka Yoru Test Anime'}).first()
 await trigger.focus()
 await trigger.click()
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 const activeButtons=dialog.locator('button:not([disabled])')
 await expect(activeButtons.first()).toBeFocused()
 await page.keyboard.press('Shift+Tab')
 await expect(activeButtons.last()).toBeFocused()
 await page.keyboard.press('Escape')
 await expect(dialog).toHaveCount(0)
 await expect(trigger).toBeFocused()
})
test('player modal restores focus to the Settings test-player button',async({page})=>{
 await page.goto('/')
 await page.locator('.main-nav').getByRole('button',{name:'Pengaturan'}).click()
 const opener=page.getByRole('button',{name:/Test player/})
 await opener.focus()
 await opener.click()
 const dialog=page.getByRole('dialog',{name:'Video player'})
 await expect(dialog.getByRole('button',{name:'Kembali'})).toBeFocused()
 await page.keyboard.press('Escape')
 await expect(dialog).toHaveCount(0)
 await expect(opener).toBeFocused()
})

test('quick links navigate to different views: current season vs saved progress',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:/Anime musim ini/}).click()
 await expect(page.getByRole('heading',{name:/^Jelajahi/})).toBeVisible()
 await expect(page.locator('.category-switch button').first()).toHaveClass(/active/)
 await page.getByRole('button',{name:/Lanjut menonton/}).first().click()
 await expect(page.getByRole('heading',{name:/^Koleksi/})).toBeVisible()
 await expect(page.getByRole('heading',{name:'Lanjut menonton'})).toBeVisible()
 await expect(page.getByText('Belum ada tontonan untuk dilanjutkan')).toBeVisible()
})
test('anime without configured sources provides clearly labelled external embed attempt',async({page})=>{
 await page.route('**/api/anime/1/provider-episodes',async route=>route.fulfill({json:{items:[]}}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 await expect(page.getByText(/Buka pemutar eksternal \(belum diverifikasi\)/i)).toBeVisible()
 await page.locator('.source-options button').first().click()
 await expect(page.getByRole('dialog',{name:'Video player'})).toBeVisible()
 const frame=page.getByTitle('External player · Episode 1')
 await expect(frame).toHaveAttribute('src','https://www.animeembed.com/embed/mal/1/1')
 await expect(page.getByText(/ketersediaan episode dan bahasa subtitle belum diverifikasi/i)).toBeVisible()
})


test('browse search failure clears stale results instead of showing old anime',async({page})=>{
 await page.route('**/api/anime/search?**',async route=>{
  await route.fulfill({status:503,json:{error:'CATALOG_UNAVAILABLE',message:'Katalog sedang tidak tersedia'}})
 })
 await page.goto('/jelajahi')
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
 await page.getByRole('textbox',{name:'Cari anime'}).fill('judul tidak tersedia')
 await expect(page.getByText('Tidak dapat memuat katalog')).toBeVisible()
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(0)
 await expect(page.getByRole('button',{name:/Coba lagi/})).toBeVisible()
})


test('browse keeps results when a search changes only in trailing whitespace',async({page})=>{
 await page.goto('/jelajahi')
 const input=page.getByRole('textbox',{name:'Cari anime'})
 await input.fill('Yoru')
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
 await input.fill('Yoru ')
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
 await expect(page.getByText('Tidak ada judul yang cocok')).toHaveCount(0)
})

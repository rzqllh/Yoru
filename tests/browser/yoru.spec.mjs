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
 await expect(page.getByRole('heading',{name:'Beranda.'})).toBeVisible()
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
 await page.getByRole('button',{name:'Tutup detail'}).click()
 await page.locator('.main-nav').getByRole('button',{name:'Koleksi'}).click()
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
 await page.reload()
 await expect(page.getByRole('heading',{name:'Beranda.'})).toBeVisible()
 await page.locator('.main-nav').getByRole('button',{name:'Koleksi'}).click()
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
})
test('mobile: navigation and sample player remain usable at iPhone-sized viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await page.getByRole('button',{name:'Buka menu'}).click()
 await page.locator('.main-nav').getByRole('button',{name:'Pengaturan'}).click()
 await expect(page.getByRole('heading',{name:'Pengaturan.'})).toBeVisible()
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

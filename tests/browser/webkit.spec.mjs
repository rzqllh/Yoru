import {expect,test} from '@playwright/test'

const anime={
 id:'mal:1',malId:1,title:'Yoru WebKit Fixture',englishTitle:null,japaneseTitle:null,
 poster:null,cover:null,synopsis:'Offline-compatible sample catalog for WebKit smoke.',
 score:8,episodes:1,year:2025,status:'Finished Airing',type:'TV',
 rating:'PG-13',genres:['Action'],studios:[],trailerYoutubeId:null
}
const episode={id:'mal:1:1',animeId:'mal:1',number:1,title:'Episode One',filler:false,recap:false}

test.beforeEach(async({page})=>{
 await page.route('**/api/anime/discover?**',async route=>route.fulfill({json:{items:[anime],page:1,hasNext:false}}))
 await page.route('**/api/anime/search?**',async route=>route.fulfill({json:{items:[anime],page:1,hasNext:false}}))
 await page.route('**/api/anime/1',async route=>route.fulfill({json:anime}))
 await page.route('**/api/anime/1/episodes?**',async route=>route.fulfill({json:{items:[episode],page:1,hasNext:false}}))
 await page.route('**/api/anime/1/provider-episodes',async route=>route.fulfill({json:{items:[]}}))
})
test('WebKit desktop displays anime catalog and does not invent playable episode',async({page})=>{
 await page.goto('/')
 await expect(page.getByRole('button',{name:'Buka Yoru WebKit Fixture'}).first()).toBeVisible()
 await page.getByRole('button',{name:'Buka Yoru WebKit Fixture'}).first().click()
 const dialog=page.getByRole('dialog',{name:'Detail Yoru WebKit Fixture'})
 await expect(dialog).toBeVisible()
 await expect(dialog.getByText(/Belum ada sumber native terverifikasi/).first()).toBeVisible()
 await dialog.locator('.episode-list .episode-row').first().click()
 await expect(dialog.getByText(/Buka pemutar eksternal \(belum diverifikasi\)/)).toBeVisible()
 await expect(page.getByRole('dialog',{name:'Video player'})).toHaveCount(0)
})
test('WebKit iPhone-sized layout keeps navigation and unverified fallback accessible',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await page.getByRole('button',{name:'Buka menu'}).click()
 await page.locator('.main-nav').getByRole('button',{name:'Pengaturan'}).click()
 await expect(page.getByRole('heading',{name:'Pengaturan'})).toBeVisible()
 await expect(page.locator('body').evaluate(el=>el.scrollWidth<=window.innerWidth+1)).resolves.toBeTruthy()
})

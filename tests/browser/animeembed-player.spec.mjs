import {expect,test} from '@playwright/test'

const anime={
 id:'mal:52991',malId:52991,title:'Sousou no Frieren',
 englishTitle:"Frieren: Beyond Journey's End",japaneseTitle:null,poster:null,cover:null,
 synopsis:'Fixture.',score:9,episodes:1,year:2023,status:'Finished Airing',type:'TV',
 rating:'PG-13',genres:['Fantasy'],studios:[],trailerYoutubeId:null
}
test.beforeEach(async({page})=>{
 await page.route('**/api/anime/daily-trends',route=>route.fulfill({status:503,json:{error:'DAILY_TRENDS_UNAVAILABLE'}}))
 await page.route('**/api/anime/discover?**',route=>route.fulfill({json:{items:[anime],page:1,hasNext:false}}))
 await page.route('**/api/anime/52991',route=>route.fulfill({json:anime}))
 await page.route('**/api/anime/52991/episodes?**',route=>route.fulfill({json:{items:[{id:'mal:52991:1',animeId:anime.id,number:1,title:'Episode 1'}],page:1,hasNext:false}}))
})
test('no configured provider never offers uncontrolled AnimeEmbed fallback (D02)',async({page})=>{
 await page.route('**/api/anime/52991/provider-episodes',route=>route.fulfill({json:{items:[]}}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Sousou no Frieren'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const detail=page.getByRole('dialog',{name:'Detail Sousou no Frieren'})
 await expect(detail.getByText(/Video alternatif tanpa kontrol subtitle tidak ditawarkan/)).toBeVisible()
 await expect(detail.locator('.source-options button')).toHaveCount(0)
 await expect(page.getByRole('main',{name:'Layar tonton'})).toHaveCount(0)
 await expect(page.locator('iframe[src*="animeembed.com"]')).toHaveCount(0)
})
test('embed-only provider response remains unplayable (D02)',async({page})=>{
 await page.route('**/api/anime/52991/provider-episodes',route=>route.fulfill({json:{items:[{id:'fixture:52991:1',animeId:anime.id,number:1,title:'Episode 1',providerId:'fixture'}]}}))
 await page.route('**/api/streams?**',route=>route.fulfill({json:{items:[{
  id:'fixture:embed',providerId:'fixture',format:'embed',
  url:'https://www.animeembed.com/embed/mal/52991/1',tracks:[],subtitleMode:'unknown'
 }]}}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Sousou no Frieren'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const detail=page.getByRole('dialog',{name:'Detail Sousou no Frieren'})
 await expect(detail.getByText(/Belum ada video yang dapat diperiksa/)).toBeVisible()
 await expect(detail.locator('.source-options button')).toHaveCount(0)
 await expect(page.locator('iframe[src*="animeembed.com"]')).toHaveCount(0)
})

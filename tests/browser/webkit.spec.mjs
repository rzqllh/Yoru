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
 await expect(dialog.getByText(/Belum menemukan kandidat video/).first()).toBeVisible()
 await dialog.locator('.episode-list .episode-row').first().click()
 await expect(dialog.getByText(/Coba video alternatif/)).toBeVisible()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toHaveCount(0)
})
test('WebKit iPhone-sized layout keeps navigation and unverified fallback accessible',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await expect(page.locator('.mobile-bottom')).toBeVisible()
 await expect(page.locator('.sidebar')).toBeHidden()
 await page.locator('.mobile-bottom').getByRole('button',{name:'Pengaturan'}).click()
 await expect(page.getByRole('heading',{name:'Pengaturan'})).toBeVisible()
 const noHorizontalOverflow=await page.locator('body').evaluate(el=>el.scrollWidth<=window.innerWidth+1)
 expect(noHorizontalOverflow).toBeTruthy()
})

for(const failure of ['html','malformed-catalog']){
 test(`catalog recovers from ${failure} without a page crash`,async({page})=>{
  let broken=true
  const errors=[]
  page.on('pageerror',error=>errors.push(error.message))
  await page.route('**/api/anime/daily-trends',route=>route.fulfill({status:503,json:{error:'DAILY_TRENDS_UNAVAILABLE'}}))
  await page.route('**/api/anime/discover?**',route=>{
   if(!broken)return route.fulfill({json:{items:[anime],page:1,hasNext:false}})
   return failure==='html'?route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}):
    route.fulfill({json:{items:null,page:1,hasNext:false}})
  })
  await page.goto('/')
  await expect(page.getByText('Katalog belum dapat dimuat')).toBeVisible()
  broken=false
  await page.getByRole('button',{name:'Coba lagi',exact:true}).first().click()
  await expect(page.getByRole('button',{name:'Buka Yoru WebKit Fixture'}).first()).toBeVisible()
  expect(errors).toEqual([])
 })
}

test('catalog posters decode lazily inside a reserved image box',async({page})=>{
 const poster='https://images.example.test/yoru.svg'
 await page.route(poster,route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="150" height="210"><rect width="150" height="210" fill="#52664b"/></svg>'}))
 await page.route('**/api/anime/discover?**',route=>route.fulfill({json:{items:[{...anime,poster}],page:1,hasNext:false}}))
 await page.goto('/jelajahi')
 const box=page.locator('.browse-grid .poster').first()
 const image=box.locator('img')
 await expect(image).toHaveAttribute('loading','lazy')
 await expect(image).toHaveAttribute('decoding','async')
 await expect.poll(()=>image.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true)
 const size=await box.boundingBox()
 expect(size.width).toBeGreaterThan(50)
 expect(size.height).toBeGreaterThan(size.width)
})

test('a failed poster keeps its accessible placeholder and reserved space',async({page})=>{
 const poster='https://images.example.test/missing.svg'
 await page.route(poster,route=>route.fulfill({status:404,body:''}))
 await page.route('**/api/anime/discover?**',route=>route.fulfill({json:{items:[{...anime,poster}],page:1,hasNext:false}}))
 await page.goto('/jelajahi')
 const box=page.locator('.browse-grid .poster').first()
 await expect(box).toHaveAttribute('aria-label','Poster Yoru WebKit Fixture')
 await expect(box.locator('img')).toHaveCount(0)
 expect((await box.boundingBox()).height).toBeGreaterThan(50)
 await expect(page.getByRole('button',{name:'Buka Yoru WebKit Fixture'})).toBeVisible()
})

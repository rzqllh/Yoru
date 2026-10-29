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
 await page.route('**/api/anime/browse?**',async route=>{
  const params=new URL(route.request().url()).searchParams
  const matches=(!params.get('genre')||anime.genres.includes(params.get('genre'))) &&
   (!params.get('type')||anime.type===params.get('type')) &&
   (!params.get('minScore')||anime.score>=Number(params.get('minScore'))) &&
   (!params.get('year')||anime.year===Number(params.get('year')))
  await route.fulfill({json:{items:matches?[anime]:[],page:Number(params.get('page')||1),hasNext:false}})
 })

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
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
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
test('player keyboard shortcuts control native playback without hijacking input selection',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const video=page.locator('video')
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
 await video.evaluate(async v=>{await v.play();v.currentTime=1.2})
 await page.getByRole('button',{name:'Fullscreen video'}).focus()
 await page.keyboard.press('k')
 await expect.poll(()=>video.evaluate(v=>v.paused)).toBe(true)
 await page.keyboard.press('k')
 await expect.poll(()=>video.evaluate(v=>v.paused)).toBe(false)
 await page.keyboard.press('m')
 await expect.poll(()=>video.evaluate(v=>v.muted)).toBe(true)
 await page.keyboard.press('ArrowLeft')
 await expect.poll(()=>video.evaluate(v=>v.currentTime)).toBeGreaterThanOrEqual(0)
 await expect(page.getByRole('button',{name:'Mundur 10 detik'})).toBeVisible()
 await expect(page.getByRole('button',{name:'Maju 10 detik'})).toBeVisible()
 await page.getByRole('button',{name:'Pengaturan'}).click()
 const speed=page.getByRole('combobox',{name:'Kecepatan pemutaran'})
 await speed.focus()
 await page.keyboard.press('k')
 await expect.poll(()=>video.evaluate(v=>v.paused)).toBe(false)
})
test('native player speed and per-anime subtitle offset survive playback reopening',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const player=page.getByRole('main',{name:'Layar tonton'})
 await expect(player).toBeVisible()
 await page.getByRole('button',{name:'Pengaturan'}).click()
 const speed=page.getByRole('combobox',{name:'Kecepatan pemutaran'})
 await speed.selectOption('1.5')
 await expect.poll(()=>page.locator('video').evaluate(video=>video.playbackRate)).toBe(1.5)
 await player.getByRole('button',{name:'Subtitle 0.5 detik lebih lambat'}).click()
 await expect(player.getByText('Waktu subtitle: +0.5s')).toBeVisible()
 await expect.poll(async()=>page.evaluate(async()=>{
  const request=indexedDB.open('yoru-local-v1')
  return new Promise(resolve=>{
   request.onsuccess=()=>{
    const db=request.result
    const tx=db.transaction('preferences','readonly')
    const get=tx.objectStore('preferences').get('subtitle-offset:mal:1')
    get.onsuccess=()=>{resolve(get.result?.value);db.close()}
   }
  })
 })).toBe('0.5')
 await player.getByRole('button',{name:'Kembali'}).click()
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 await page.getByRole('main',{name:'Layar tonton'}).getByRole('button',{name:'Pengaturan'}).click()
await expect(page.getByRole('main',{name:'Layar tonton'}).getByText('Waktu subtitle: +0.5s')).toBeVisible()
})

test('Q7 subtitle Off persists when reopening the same anime player',async({page})=>{
 await page.route('**/api/anime/1/subtitles?**',async route=>route.fulfill({json:{items:[],warnings:[]}}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const player=page.getByRole('main',{name:'Layar tonton'})
 const cc=player.locator('.player-subtitle-trigger')
 await cc.click()
 await player.getByRole('button',{name:'Off',exact:true}).click()
 await expect(cc).toContainText('Off')
 await player.getByRole('button',{name:'Kembali'}).click()
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const reopened=page.getByRole('main',{name:'Layar tonton'})
 await expect(reopened.locator('.player-subtitle-trigger')).toContainText('Off')
 await reopened.locator('.player-subtitle-trigger').click()
 await expect(reopened.getByRole('button',{name:'Off',exact:true})).toHaveAttribute('aria-pressed','true')
})

test('native subtitle picker loads a validated Indonesian external track and respects Off override',async({page})=>{
 await page.route('**/api/anime/1/subtitles?**',async route=>route.fulfill({json:{
  items:[
   {id:'subdl:test-id',provider:'subdl',language:'id',label:'Indonesia',release:'Episode 1',
    episode:1,score:70,sourceUrl:'/api/subtitles/file?provider=subdl&ref=%2Fsubtitle%2F1%2F2'}
  ],warnings:[]
 }}))
 await page.route('**/api/subtitles/file?**',async route=>route.fulfill({
  status:200,contentType:'text/vtt',
  body:'WEBVTT\\n\\n00:00:00.100 --> 00:00:02.000\\nHalo Indonesia\\n'
 }))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const player=page.getByRole('main',{name:'Layar tonton'})
 await expect(player).toBeVisible()
 const cc=page.locator('.player-subtitle-trigger')
 await expect(cc).toContainText(/Indonesia/)
 await cc.click()
 await expect(page.getByText(/Subtitle Indonesia siap|Subtitle Indonesia dipilih otomatis/i)).toBeVisible()
 await page.getByRole('button',{name:'Off',exact:true}).click()
 await expect(cc).toContainText('Off')
 await expect(page.getByText(/dimatikan atas pilihan pengguna/i)).toBeVisible()
})

test('verified episode two activates auto-next countdown and navigates only after confirmation',async({page})=>{
 const second={...configured,id:'fixture:1:2',number:2,title:'Episode 2'}
 await page.route('**/api/anime/1/provider-episodes',async route=>route.fulfill({json:{items:[configured,second]}}))
 await page.route('**/api/streams?**',async route=>{
  const episodeRef=new URL(route.request().url()).searchParams.get('episodeRef')
  await route.fulfill({json:{items:[{...testStream,id:episodeRef+':0'}]}})
 })
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const first=page.getByRole('main',{name:'Layar tonton'})
 await expect(first).toBeVisible()
 await page.locator('video').evaluate(video=>video.dispatchEvent(new Event('ended')))
 await expect(page.getByText(/Episode 2 dalam \d+ detik/)).toBeVisible({timeout:25000})
 await page.getByRole('button',{name:'Lanjut sekarang'}).click()
 await expect(page.getByRole('main',{name:'Layar tonton'}).getByText(/Episode 2/).first()).toBeVisible()
})

test('when episode next native is unavailable, auto-next never fabricates an embed',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 await page.locator('video').evaluate(video=>video.dispatchEvent(new Event('ended')))
 await expect(page.getByText('Episode berikutnya belum bisa diputar.')).toBeVisible()
 await expect(page.getByRole('button',{name:'Lanjut sekarang'})).toHaveCount(0)
})

test('mobile: navigation and sample player remain usable at iPhone-sized viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await page.getByRole('button',{name:'Buka menu'}).click()
 await page.locator('.main-nav').getByRole('button',{name:'Pengaturan'}).click()
 await expect(page.getByRole('heading',{name:/^Pengaturan/})).toBeVisible()
 await page.getByRole('button',{name:/Coba pemutar/}).click()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
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
 await page.getByRole('textbox',{name:'Cari anime'}).fill('Yoru')
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
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
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
  providers:[{id:'local',name:'Sumber pribadi',animeCount:2}],
  warnings:['stremio']
 }}))
 await page.goto('/')
 await page.locator('.main-nav').getByRole('button',{name:'Pengaturan'}).click()
 await expect(page.getByText('Sumber pribadi')).toBeVisible()
 await expect(page.locator('.config-error')).toContainText('Beberapa sumber sedang tidak tersedia')
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
test('watch screen restores focus to the Settings preview button',async({page})=>{
 await page.goto('/')
 await page.locator('.main-nav').getByRole('button',{name:'Pengaturan'}).click()
 const opener=page.getByRole('button',{name:/Coba pemutar/})
 await opener.focus()
 await opener.click()
 const dialog=page.getByRole('main',{name:'Layar tonton'})
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
 await expect(page.getByText(/Coba video alternatif/i)).toBeVisible()
 await page.locator('.source-options button').first().click()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
 const frame=page.getByTitle('Video alternatif · Episode 1')
 await expect(frame).toHaveAttribute('src','https://www.animeembed.com/embed/mal/1/1')
 await expect(page.getByText('Mode video alternatif',{exact:true})).toBeVisible()
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


test('glass watch screen has Yoru-owned transport and local subtitle upload',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const player=page.getByRole('main',{name:'Layar tonton'})
 await expect(player).toBeVisible()
 await expect(page.locator('video')).not.toHaveAttribute('controls')
 await expect(player.getByRole('slider',{name:'Posisi video'})).toBeVisible()
 await expect(player.getByRole('button',{name:/Putar video|Jeda video/})).toBeVisible()
 await player.locator('.player-subtitle-trigger').click()
 await player.locator('input[type=file][accept*=".srt"]').setInputFiles({
  name:'uji.srt',mimeType:'text/plain',
  buffer:Buffer.from('1\n00:00:01,000 --> 00:00:03,000\nHalo dari berkas pribadi\n')
 })
 await expect(player.getByText(/Subtitle pribadi.*siap/i)).toBeVisible()
 await expect(player.locator('video track[src^="blob:"]')).toHaveCount(1)
})

test('embedded fallback keeps an honest Yoru subtitle panel',async({page})=>{
 await page.route('https://www.animeembed.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Video alternative</title>'}))
 await page.route('**/api/streams?**',route=>route.fulfill({json:{items:[]}}))
 await test.step('Choose an episode without playable native streams',async()=>{
  await page.goto('/')
  await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
  await page.locator('.episode-list .episode-row').first().click()
  await expect(page.locator('.source-picker .source-options button')).toHaveCount(1)
 })
 await test.step('Select the explicit embedded fallback',async()=>{
  await page.locator('.source-picker .source-options button').first().click()
  await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
 })
 await test.step('Expose a truthful subtitle limitation and no fake seek',async()=>{
  const player=page.getByRole('main',{name:'Layar tonton'})
  await player.locator('.player-subtitle-trigger').click()
  await expect(player.getByText(/diatur oleh pemutar video alternatif/i)).toBeVisible()
  await expect(player.getByRole('slider',{name:'Posisi video'})).toHaveCount(0)
 })
})

test('browse filters loaded anime and header has a single deliberate discovery entry',async({page})=>{
 await page.goto('/')
 await expect(page.locator('.topbar .search-control')).toHaveCount(0)
 await page.getByRole('button',{name:'Jelajahi anime'}).click()
 await expect(page.getByRole('heading',{name:'Jelajahi'})).toBeVisible()
 await page.getByRole('combobox',{name:'Genre'}).selectOption('Action')
 await expect(page.getByText('Yoru Test Anime').first()).toBeVisible()
 await page.getByRole('combobox',{name:'Genre'}).selectOption('Romance')
 await expect(page.getByText('Yoru Test Anime')).toHaveCount(0)
 await expect(page.getByText(/seluruh katalog/i)).toBeVisible()
})


test('mobile has one visible navigation dock and resets scroll on page changes',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await expect(page.locator('.sidebar')).toBeHidden()
 await expect(page.locator('.mobile-menu')).toBeHidden()
 await expect(page.locator('.mobile-bottom')).toBeVisible()
 await page.evaluate(()=>window.scrollTo(0,600))
 await page.locator('.mobile-bottom button').nth(1).click()
 await expect(page.getByRole('heading',{name:'Jelajahi'})).toBeVisible()
 await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBe(0)
 await expect(page.locator('.browse-filter-group')).toBeVisible()
 await expect(page.locator('.category-switch').getByRole('button',{name:'Musim ini'})).toBeVisible()
 await expect(page.locator('.category-switch').getByRole('button',{name:'Populer'})).toBeVisible()
 await expect(page.locator('.category-switch').getByRole('button',{name:'Akan datang'})).toHaveCount(0)
 await expect(page.getByRole('button',{name:/Musim berikutnya/})).toBeVisible()
})

test('watch page replaces catalog rather than opening a modal over its scroll',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const watch=page.getByRole('main',{name:'Layar tonton'})
 await expect(watch).toBeVisible()
 await expect(page.getByRole('dialog',{name:'Video player'})).toHaveCount(0)
 await expect(page.locator('.app-shell')).toHaveCount(0)
 await expect(page.locator('.mobile-bottom')).toHaveCount(0)
 await watch.getByRole('button',{name:'Kembali'}).click()
 await expect(page.locator('.app-shell')).toBeVisible()
})

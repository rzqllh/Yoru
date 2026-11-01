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
 await page.route('**/api/anime/daily-trends',route=>route.fulfill({status:503,json:{error:'DAILY_TRENDS_UNAVAILABLE'}}))
 await page.route('**/api/anime/genres',route=>route.fulfill({json:{
  items:[
   [1,'Action'],[2,'Adventure'],[4,'Comedy'],[8,'Drama'],[10,'Fantasy'],[14,'Horror'],
   [7,'Mystery'],[22,'Romance'],[24,'Sci-Fi'],[36,'Slice of Life'],[30,'Sports'],[37,'Supernatural']
  ].map(([id,name])=>({id,name})),source:'built-in',status:'fallback'
 }}))
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
test('collection sort choice is accessible and persists through reload',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.getByRole('dialog',{name:'Detail Yoru Test Anime'}).getByRole('button',{name:/Koleksiku/}).click()
 await expect(page.getByRole('dialog',{name:'Detail Yoru Test Anime'}).getByRole('button',{name:/Tersimpan/})).toBeVisible()
 await page.getByRole('button',{name:'Tutup detail anime'}).click()
 await page.goto('/koleksi')
 const sort=page.getByRole('combobox',{name:'Urutkan koleksi'})
 await expect(sort).toBeVisible()
 await sort.selectOption('title')
 await expect(sort).toHaveValue('title')
 await page.reload()
 await expect(page.getByRole('combobox',{name:'Urutkan koleksi'})).toHaveValue('title')
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
test('a verified native source remembers only its provider identity for later playback',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
 const getChoice=(key='source-choice:mal:1')=>page.evaluate(async key=>{
  const request=indexedDB.open('yoru-local-v1')
  return await new Promise((resolve,reject)=>{
   request.onerror=()=>reject(request.error)
   request.onsuccess=()=>{
    const db=request.result
    const tx=db.transaction('preferences','readonly')
    const get=tx.objectStore('preferences').get(key)
    get.onsuccess=()=>{db.close();resolve(get.result?.value??'')}
    get.onerror=()=>{db.close();reject(get.error)}
   }
  })
 },key)
 await expect.poll(async()=>JSON.parse(await getChoice()).providerId).toBe('fixture')
 await expect.poll(async()=>JSON.parse(await getChoice('source-choice:mal:1:ep:1')).providerId).toBe('fixture')
 const remembered=JSON.parse(await getChoice())
 expect(remembered).toMatchObject({version:1,providerId:'fixture',format:'hls'})
 expect(JSON.stringify(remembered)).not.toContain('/demo/')
 expect(JSON.stringify(remembered)).not.toContain('api_key')
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
 await expect(page.locator('.mobile-bottom')).toBeVisible()
 await page.locator('.mobile-bottom').getByRole('button',{name:'Pengaturan'}).click()
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
test('anime without configured sources hides uncontrolled iframe choices (D02)',async({page})=>{
 await page.route('**/api/anime/1/provider-episodes',route=>route.fulfill({json:{items:[]}}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 await expect(dialog.getByText(/Belum ada sumber video langsung/)).toBeVisible()
 await expect(dialog.locator('.source-options button')).toHaveCount(0)
 await expect(page.getByRole('main',{name:'Layar tonton'})).toHaveCount(0)
 await expect(page.locator('iframe[src*="animeembed.com"]')).toHaveCount(0)
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

test('embed-only provider data cannot open uncontrolled player (D02)',async({page})=>{
 await page.route('**/api/streams?**',route=>route.fulfill({json:{items:[{
  providerId:'public-embed',format:'embed',
  url:'https://www.animeembed.com/embed/mal/1/1',subtitleMode:'unknown',tracks:[]
 }]}}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 await expect(dialog.getByText(/Belum ada video yang dapat diperiksa/)).toBeVisible()
 await expect(dialog.locator('.source-options button')).toHaveCount(0)
 await expect(page.locator('iframe[src*="animeembed.com"]')).toHaveCount(0)
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
 await expect(page.locator('.browse-destinations').getByRole('button',{name:'Akan Datang'})).toBeVisible()
 await expect(page.getByRole('button',{name:/Musim berikutnya/})).toHaveCount(0)
})

test('watch page exclusively owns visible controls while preserving hidden catalog context',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const watch=page.getByRole('main',{name:'Layar tonton'})
 await expect(watch).toBeVisible()
 await expect(page.getByRole('dialog',{name:'Video player'})).toHaveCount(0)
 await expect(page.locator('.app-shell')).toHaveAttribute('hidden','')
 await expect(page.locator('.app-shell')).toBeHidden()
 await expect(page.locator('.mobile-bottom')).toBeHidden()
 await watch.getByRole('button',{name:'Kembali'}).click()
 await expect(page.locator('.app-shell')).toBeVisible()
})


test('mobile routed detail scrolls in the full-page viewport, never behind it',async({page})=>{
 await page.setViewportSize({width:390,height:680})
 await page.route('**/api/streams?**',route=>route.fulfill({json:{items:[]}}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 await expect(dialog).toBeVisible()
 await expect.poll(()=>page.evaluate(()=>document.body.style.position)).toBe('fixed')
 const scrollArea=page.locator('.detail-page-view')
 await expect.poll(()=>scrollArea.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true)
 await scrollArea.evaluate(el=>{el.scrollTop=el.scrollHeight})
 await expect.poll(()=>scrollArea.evaluate(el=>el.scrollTop)).toBeGreaterThan(0)
 await dialog.locator('.episode-list .episode-row').first().click()
 const picker=dialog.locator('.source-picker')
 await expect(picker).toBeVisible()
 await expect(picker).toBeInViewport({ratio:0.35})
 await dialog.getByRole('button',{name:'Tutup detail anime'}).click()
 await expect.poll(()=>page.evaluate(()=>document.body.style.position)).not.toBe('fixed')
})

test('mobile discover keeps season/popular tabs and makes upcoming a separate destination',async({page})=>{
 await page.setViewportSize({width:390,height:680})
 await page.goto('/')
 await page.locator('.mobile-bottom').getByRole('button',{name:'Jelajahi'}).click()
 await expect(page.locator('.browse-controls')).toHaveCount(1)
 await expect(page.locator('.browse-controls .category-switch button')).toHaveCount(2)
 await expect(page.locator('.topbar-discover')).toHaveCount(0)
 await expect(page.locator('.browse-controls input[aria-label="Cari anime"]')).toBeVisible()
 await expect(page.locator('.browse-controls select[aria-label="Genre"]')).toBeVisible()
})


test('hero removes numbered controls but remains keyboard navigable',async({page})=>{
 await page.route('**/api/anime/discover?**',async route=>{
  const kind=new URL(route.request().url()).searchParams.get('kind')
  const items=kind==='top'?Array.from({length:10},(_,i)=>({...anime,id:`mal:${i+1}`,malId:i+1,title:`Anime Pilihan ${i+1}`})):[anime]
  await route.fulfill({json:{items,page:1,hasNext:false}})
 })
 await page.goto('/')
 const hero=page.getByRole('region',{name:/Anime unggulan/})
 await expect(hero).toBeVisible()
 await expect(page.locator('.hero-navigation,.hero-top-ten')).toHaveCount(0)
 await hero.getByRole('button',{name:'Buka anime'}).focus()
 await page.keyboard.press('ArrowRight')
 await expect(page.locator('.hero-copy h2')).toHaveText('Anime Pilihan 2')
 await page.keyboard.press('ArrowLeft')
 await expect(page.locator('.hero-copy h2')).toHaveText('Anime Pilihan 1')
 await expect(page.getByRole('heading',{name:'Anime Popular'})).toBeVisible()
})
test('library uses its own responsive layout without changing navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/')
 await page.locator('.mobile-bottom').getByRole('button',{name:'Koleksi'}).click()
 await expect(page.locator('.library-page')).toBeVisible()
 await expect(page.getByRole('heading',{name:'Koleksi',exact:true})).toBeVisible()
})


test('AniList hero rotates every 8 seconds, pauses on hover and supports swipe',async({page})=>{
 await page.route('**/api/anime/daily-trends',route=>route.fulfill({json:{
  items:Array.from({length:10},(_,i)=>({...anime,id:'mal:'+(i+100),malId:i+100,title:'Tren AniList '+(i+1)})),
  source:'AniList',sourceUrl:'https://anilist.co',date:'2026-10-29',metric:'daily-media-activity'
 }}))
 await page.clock.install()
 await page.goto('/')
 const hero=page.getByRole('region',{name:/Anime unggulan/})
 await expect(page.getByText(/Aktivitas AniList · 29 Okt 2026/)).toBeVisible()
 await expect(page.locator('.hero-copy h2')).toHaveText('Tren AniList 1')
 await page.clock.fastForward(8000)
 await expect(page.locator('.hero-copy h2')).toHaveText('Tren AniList 2')
 await hero.hover()
 await page.clock.fastForward(16000)
 await expect(page.locator('.hero-copy h2')).toHaveText('Tren AniList 2')
 await page.mouse.move(0,0)
 await page.clock.fastForward(8000)
 await expect(page.locator('.hero-copy h2')).toHaveText('Tren AniList 3')
 await hero.evaluate(el=>{
  const touch=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y})
  el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[touch(280,150)],targetTouches:[touch(280,150)],changedTouches:[touch(280,150)]}))
  el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],targetTouches:[],changedTouches:[touch(110,157)]}))
 })
 await expect(page.locator('.hero-copy h2')).toHaveText('Tren AniList 4')
 await expect(page.getByRole('link',{name:'Lihat sumber'})).toHaveAttribute('href','https://anilist.co')
})
test('reduced motion prevents hero auto-rotation while keyboard access remains',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.route('**/api/anime/daily-trends',route=>route.fulfill({json:{
  items:Array.from({length:10},(_,i)=>({...anime,id:'mal:'+(i+200),malId:i+200,title:'Tren Tenang '+(i+1)})),
  source:'AniList',sourceUrl:'https://anilist.co',date:'2026-10-29',metric:'daily-media-activity'
 }}))
 await page.clock.install()
 await page.goto('/')
 const hero=page.getByRole('region',{name:/Anime unggulan/})
 await expect(page.locator('.hero-copy h2')).toHaveText('Tren Tenang 1')
 await page.clock.fastForward(9000)
 await expect(page.locator('.hero-copy h2')).toHaveText('Tren Tenang 1')
 await hero.getByRole('button',{name:'Buka anime'}).focus()
 await page.keyboard.press('ArrowRight')
 await expect(page.locator('.hero-copy h2')).toHaveText('Tren Tenang 2')
})
test('watch guide is a secondary discover route with truthful unsupported chronology',async({page})=>{
 await page.route('**/api/anime/1/watch-guide',route=>route.fulfill({json:{
  source:'AniList',sourceUrl:'https://anilist.co/anime/10',scope:'direct-relations',animeMalId:1,
  items:[
   {aniListId:10,malId:1,title:'Yoru Test Anime',format:'TV',year:2024,month:1,relation:'CURRENT',image:null},
   {aniListId:9,malId:null,title:'Related OVA',format:'OVA',year:2023,month:6,relation:'SIDE_STORY',image:null}
  ]
 }}))
 await page.goto('/jelajahi')
 await expect(page.getByRole('button',{name:'Panduan urutan anime'})).toBeVisible()
 await page.getByRole('button',{name:'Panduan urutan anime'}).click()
 await expect(page).toHaveURL(/\/jelajahi\/panduan-urutan$/)
 await expect(page.getByRole('heading',{name:'Panduan urutan anime'})).toBeVisible()
 await page.goto('/jelajahi/panduan-urutan?anime=1')
 await expect(page.getByRole('heading',{name:'Jaringan judul yang berhubungan'})).toBeVisible()
 await expect(page.locator('.guide-mode button')).toHaveCount(2)
 await expect(page.getByRole('button',{name:'Tahun rilis'})).toHaveAttribute('aria-pressed','true')
 await expect(page.getByRole('button',{name:'Kronologi'})).toBeDisabled()
 await expect(page.getByText(/Kronologi cerita belum tersedia/)).toBeVisible()
 await expect(page.getByText('Related OVA')).toBeVisible()
 await expect(page.getByRole('button',{name:'Belum terpetakan'})).toBeDisabled()
 await expect(page.getByRole('link',{name:'Sumber: AniList'})).toHaveAttribute('href','https://anilist.co/anime/10')
})


test('continue watching verifies a source then resumes the same episode without reopening detail',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const video=page.locator('video')
 await expect.poll(()=>video.evaluate(v=>v.readyState),{timeout:20000}).toBeGreaterThan(0)
 await video.evaluate(v=>{v.currentTime=2;v.pause();v.dispatchEvent(new Event('pause'))})
 await expect.poll(async()=>page.evaluate(async()=>{
  const request=indexedDB.open('yoru-local-v1')
  return new Promise(resolve=>{
   request.onsuccess=()=>{
    const db=request.result,tx=db.transaction('progress','readonly'),get=tx.objectStore('progress').get('mal:1')
    get.onsuccess=()=>{resolve(get.result?.seconds??0);db.close()}
   }
  })
 })).toBeGreaterThan(1)
 await page.getByRole('button',{name:'Kembali'}).click()
 await expect(page.locator('.continue-card')).toHaveCount(1)
 await page.locator('.continue-card').click()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible({timeout:30000})
 await expect(page.getByRole('dialog',{name:'Detail Yoru Test Anime'})).toHaveCount(0)
 await expect(page.getByRole('main',{name:'Layar tonton'}).getByText(/Episode 1/)).toBeVisible()
})

test('caption styling settings persist and remain scoped to the native video player',async({page})=>{
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const player=page.getByRole('main',{name:'Layar tonton'})
 await player.getByRole('button',{name:/Subtitle ·/}).click()
 await player.getByRole('combobox',{name:'Transparansi teks subtitle'}).selectOption('75')
 await player.getByRole('combobox',{name:'Opasitas latar subtitle'}).selectOption('25')
 await player.getByRole('combobox',{name:'Garis tepi subtitle'}).selectOption('2')
 await expect(player.locator('video')).toHaveClass(/subtitle-text-75/)
 await expect(player.locator('video')).toHaveClass(/subtitle-bg-25/)
 await expect(player.locator('video')).toHaveClass(/subtitle-outline-2/)
 await player.getByRole('button',{name:'Kembali'}).click()
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 await expect(page.locator('video')).toHaveClass(/subtitle-text-75/)
 await expect(page.locator('video')).toHaveClass(/subtitle-bg-25/)
})

test('Torrentio hash-only metadata stays disabled without uncontrolled iframe fallback',async({page})=>{
 await page.route('**/api/streams?**',route=>route.fulfill({json:{
  items:[],unavailable:[{kind:'torrent',label:'Torrentio 1080p',reason:'Torrent membutuhkan mesin streaming/resolver yang terhubung; belum bisa diputar langsung.'}]
 }}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 const disabled=dialog.getByRole('button',{name:'Torrentio 1080p · Belum bisa diputar'})
 await expect(disabled).toBeDisabled()
 await expect(dialog.getByText('Torrent membutuhkan mesin streaming/resolver yang terhubung; belum bisa diputar langsung.')).toBeVisible()
 await expect(dialog.locator('.source-options button:not([disabled])')).toHaveCount(0)
 await expect(page.getByRole('main',{name:'Layar tonton'})).toHaveCount(0)
})


test('generic franchise guide expands on demand, filters alternatives and never calls them canon',async({page})=>{
 const base={
  source:'AniList',sourceUrl:'https://anilist.co/anime/10',scope:'direct-relations',animeMalId:1,
  items:[
   {aniListId:10,malId:1,title:'Generic Anime',format:'TV',year:2024,month:1,relation:'CURRENT',image:null},
   {aniListId:11,malId:11,title:'Generic Sequel',format:'TV',year:2025,month:1,relation:'SEQUEL',image:null}
  ]
 }
 let graphCalls=0
 await page.route('**/api/anime/1/watch-guide?depth=2',route=>{
  graphCalls++
  return route.fulfill({json:{...base,graph:{
   status:'expanded',scannedDirect:1,directTotal:1,truncated:false,
   note:'Maksimal dua tingkat hubungan dari judul ini. Ini bukan kronologi canon atau panduan menonton terkurasi.',
   edges:[{from:10,to:11,relation:'SEQUEL'},{from:11,to:12,relation:'ALTERNATIVE'}],
   nodes:[
    {...base.items[0],distance:0,viaAniListId:null},
    {...base.items[1],distance:1,viaAniListId:10},
    {aniListId:12,malId:null,title:'Generic Alternate Movie',format:'MOVIE',
     year:2022,month:2,relation:'ALTERNATIVE',image:null,distance:2,viaAniListId:11}
   ]
  }}})
 })
 await page.route('**/api/anime/1/watch-guide',route=>route.fulfill({json:base}))
 await page.goto('/jelajahi/panduan-urutan?anime=1')
 await expect(page.getByRole('heading',{name:'Jaringan judul yang berhubungan'})).toBeVisible()
 await expect(page.getByRole('button',{name:'Kronologi'})).toBeDisabled()
 await expect(page.getByText('Generic Alternate Movie')).toHaveCount(0)
 await expect.poll(()=>graphCalls).toBe(0)
 await page.getByRole('button',{name:/Perluas hubungan/}).click()
 await expect(page.getByText('Generic Alternate Movie')).toBeVisible()
 await expect.poll(()=>graphCalls).toBe(1)
 await page.getByRole('button',{name:/Cabang cerita/}).click()
 await expect(page.getByText('Generic Alternate Movie')).toBeVisible()
 await expect(page.getByText('Generic Sequel',{exact:true})).toHaveCount(0)
 await expect(page.getByRole('button',{name:'Belum terpetakan'})).toBeDisabled()
 await expect(page.getByText(/Ditemukan melalui Generic Sequel/)).toBeVisible()
 await expect(page.getByText(/bukan daftar franchise lengkap/)).toBeVisible()
})

test('curated Fate routes are sourced, switchable and never presented as one canon chronology',async({page})=>{
 const anime={source:'AniList',sourceUrl:'https://anilist.co/anime/19603',
  scope:'direct-relations',animeMalId:1,
  items:[
   {aniListId:19603,malId:1,title:'Fate/stay night: Unlimited Blade Works',format:'TV',year:2014,month:10,relation:'CURRENT',image:null},
   {aniListId:20791,malId:null,title:'Heaven\'s Feel I',format:'MOVIE',year:2017,month:10,relation:'ALTERNATIVE',image:null}
  ]
 }
 await page.route('**/api/anime/1/watch-guide',route=>route.fulfill({json:anime}))
 await page.goto('/jelajahi/panduan-urutan?anime=1')
 const curated=page.getByRole('region',{name:'Panduan menonton dengan sumber'})
 await expect(curated).toBeVisible()
 await expect(curated.getByRole('button',{name:'Mulai Fate lewat anime modern'})).toHaveAttribute('aria-pressed','true')
 await expect(curated.getByRole('button',{name:'Alternatif: mulai dari Fate/Zero'})).toBeVisible()
 await expect(curated.getByRole('link',{name:/Anime Meridian/})).toBeVisible()
 await expect(curated.getByText('Fate/stay night: Unlimited Blade Works (2014)',{exact:true})).toBeVisible()
 await expect(page.getByRole('button',{name:'Kronologi'})).toBeDisabled()
 await curated.getByRole('button',{name:'Alternatif: mulai dari Fate/Zero'}).click()
 await expect(curated.getByRole('button',{name:'Alternatif: mulai dari Fate/Zero'})).toHaveAttribute('aria-pressed','true')
 await expect(curated.getByRole('listitem').first()).toContainText('Fate/Zero')
 await expect(curated.getByText(/bukan satu timeline canon linear/i)).toBeVisible()
 await expect(curated.getByRole('link',{name:/Popverse/})).toBeVisible()
})
test('curated editorial notes only appear when AniList IDs match, not from vague title text',async({page})=>{
 await page.route('**/api/anime/1/watch-guide',route=>route.fulfill({json:{
  source:'AniList',sourceUrl:'https://anilist.co/anime/1',scope:'direct-relations',animeMalId:1,
  items:[{aniListId:5081,malId:1,title:'Bakemonogatari',format:'TV',year:2009,month:7,relation:'CURRENT',image:null}]
 }}))
 await page.goto('/jelajahi/panduan-urutan?anime=1')
 const curated=page.getByRole('region',{name:'Panduan menonton dengan sumber'})
 await expect(curated.getByText('Panduan menonton Monogatari')).toBeVisible()
 await expect(curated.getByRole('link',{name:/Crunchyroll/})).toBeVisible()
 await expect(curated.getByText('Kizumonogatari II: Nekketsu-hen')).toBeVisible()
 await expect(page.getByRole('button',{name:'Kronologi'})).toBeDisabled()
})


test('manual franchise path completion persists separately for alternate routes and survives reload',async({page})=>{
 await page.route('**/api/anime/1/watch-guide',route=>route.fulfill({json:{
  source:'AniList',sourceUrl:'https://anilist.co/anime/19603',scope:'direct-relations',animeMalId:1,
  items:[{aniListId:19603,malId:1,title:'Fate/stay night: Unlimited Blade Works',format:'TV',year:2014,month:10,relation:'CURRENT',image:null}]
 }}))
 await page.goto('/jelajahi/panduan-urutan?anime=1')
 const guide=page.getByRole('region',{name:'Panduan menonton dengan sumber'})
 const done=guide.getByRole('button',{name:'Tandai langkah berikutnya selesai'})
 await expect(guide.getByText('0 dari 7 langkah ditandai selesai')).toBeVisible()
 await done.click()
 await expect(guide.getByText('1 dari 7 langkah ditandai selesai')).toBeVisible()
 await expect(guide.getByText(/Berikutnya: Fate\/stay night: Unlimited Blade Works 2nd Season/)).toBeVisible()
 const key=async()=>page.evaluate(async()=>{
  const db=await new Promise((resolve,reject)=>{
   const request=indexedDB.open('yoru-local-v1')
   request.onsuccess=()=>resolve(request.result)
   request.onerror=()=>reject(request.error)
  })
  const item=await new Promise((resolve,reject)=>{
   const tx=db.transaction('preferences','readonly')
   const get=tx.objectStore('preferences').get('watch-path:fate-anime-newcomer')
   get.onsuccess=()=>resolve(get.result?.value)
   get.onerror=()=>reject(get.error)
  })
  db.close()
  return item
 })
 await expect.poll(async()=>JSON.parse(await key()).completed).toBe(1)
 await guide.getByRole('button',{name:'Alternatif: mulai dari Fate/Zero'}).click()
 await expect(guide.getByText('0 dari 7 langkah ditandai selesai')).toBeVisible()
 await page.reload()
 await expect(guide.getByText('1 dari 7 langkah ditandai selesai')).toBeVisible()
 await guide.getByRole('button',{name:'Batalkan langkah terakhir'}).click()
 await expect(guide.getByText('0 dari 7 langkah ditandai selesai')).toBeVisible()
 await expect.poll(async()=>JSON.parse(await key()).completed).toBe(0)
})


test('provider outage displays failure rather than falsely claiming no video exists',async({page})=>{
 await page.route('**/api/streams?**',route=>route.fulfill({status:503,json:{error:'PROVIDER_UNAVAILABLE'}}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 await expect(dialog.getByRole('status').filter({hasText:'Semua penyedia video gagal dihubungi.'})).toBeVisible()
 await expect(dialog.locator('.source-options button:not([disabled])')).toHaveCount(0)
 await expect(page.getByRole('main',{name:'Layar tonton'})).toHaveCount(0)
})
test('mixed provider failures retain candidates and report partial metadata uncertainty',async({page})=>{
 await page.route('**/api/anime/1/provider-episodes',route=>route.fulfill({json:{items:[
  {id:'healthy:1',animeId:'mal:1',number:1,title:'Episode 1',providerId:'healthy'},
  {id:'unreachable:1',animeId:'mal:1',number:1,title:'Episode 1',providerId:'unreachable'}
 ]}}))
 await page.route('**/api/streams?**',route=>{
  const ep=new URL(route.request().url()).searchParams.get('episodeRef')
  if(ep==='unreachable:1')return route.fulfill({status:503,json:{error:'Provider down'}})
  return route.fulfill({json:{items:[
   {id:'a',format:'hls',url:'https://media.example.test/a.m3u8',tracks:[],subtitleMode:'unknown'},
   {id:'b',format:'mp4',url:'https://media.example.test/b.mp4',tracks:[],subtitleMode:'unknown'}
  ]}})
 })
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 await expect(dialog.getByRole('status').filter({hasText:/Sebagian penyedia gagal dihubungi/})).toBeVisible()
 await expect(dialog.locator('.source-options button')).toHaveCount(2)
 await expect(page.getByRole('main',{name:'Layar tonton'})).toHaveCount(0)
})


test('edition-aware Haruhi route switches 2006 broadcast and 2009 re-airing without mixing episode numbers',async({page})=>{
 const payload={
  source:'AniList',sourceUrl:'https://anilist.co/anime/849',scope:'direct-relations',animeMalId:1,
  items:[
   {aniListId:849,malId:1,title:'Haruhi Suzumiya 2006',format:'TV',year:2006,month:4,relation:'CURRENT',image:null},
   {aniListId:4382,malId:2,title:'Haruhi Suzumiya 2009',format:'TV',year:2009,month:4,relation:'ALTERNATIVE',image:null},
   {aniListId:7311,malId:3,title:'Haruhi Disappearance',format:'MOVIE',year:2010,month:2,relation:'SEQUEL',image:null}
  ]
 }
 await page.route('**/api/anime/1/watch-guide',route=>route.fulfill({json:payload}))
 await page.goto('/jelajahi/panduan-urutan?anime=1')
 const guide=page.getByRole('region',{name:'Panduan menonton dengan sumber'})
 await expect(guide.getByRole('button',{name:'2006: urutan siaran asli (14 episode)'})).toHaveAttribute('aria-pressed','true')
 await expect(guide.locator('.guide-curated-steps li')).toHaveCount(14)
 await expect(guide.getByText('Episode 01 — The Adventures of Mikuru Asahina Episode 00',{exact:true})).toBeVisible()
 await expect(guide.getByText('Episode 1 · edisi siaran asli 2006 (14 episode)')).toBeVisible()
 await guide.getByRole('button',{name:'2009: susunan 28 episode + film'}).click()
 await expect(guide.locator('.guide-curated-steps li')).toHaveCount(29)
 await expect(guide.getByText('Episode 25 — The Adventures of Mikuru Asahina Episode 00')).toBeVisible()
 await expect(guide.getByText('Episode 25 · edisi siaran 2009 (28 episode)')).toBeVisible()
 await expect(guide.getByText('The Disappearance of Haruhi Suzumiya (film 2010)')).toBeVisible()
 await expect(guide.getByRole('button',{name:'Detail serial'}).first()).toBeEnabled()
 await expect(guide.getByText(/tidak membuka episode tertentu secara otomatis/)).toBeVisible()
 await expect(page.getByRole('button',{name:'Kronologi'})).toBeDisabled()
})
test('Re:ZERO OVA duo is mapped as episode 1 and episode 2 within one AniList release',async({page})=>{
 await page.route('**/api/anime/1/watch-guide',route=>route.fulfill({json:{
  source:'AniList',sourceUrl:'https://anilist.co/anime/21355',scope:'direct-relations',animeMalId:1,
  items:[
   {aniListId:21355,malId:1,title:'Re:ZERO Season 1',format:'TV',year:2016,month:4,relation:'CURRENT',image:null},
   {aniListId:100049,malId:2,title:'Re:ZERO OVAs',format:'OVA',year:2018,month:10,relation:'SIDE_STORY',image:null}
  ]
 }}))
 await page.goto('/jelajahi/panduan-urutan?anime=1')
 const guide=page.getByRole('region',{name:'Panduan menonton dengan sumber'})
 await expect(guide.getByRole('button',{name:'Season + OVA: jalur penonton baru'})).toBeVisible()
 await expect(guide.locator('.guide-curated-steps li')).toHaveCount(6)
 await expect(guide.getByText('OVA 1 — Memory Snow')).toBeVisible()
 await expect(guide.getByText('OVA 2 — The Frozen Bond')).toBeVisible()
 await expect(guide.getByText('Episode 1 · edisi Re:ZERO OVAs (2 episode dalam 1 entri AniList)')).toBeVisible()
 await expect(guide.getByText('Episode 2 · edisi Re:ZERO OVAs (2 episode dalam 1 entri AniList)')).toBeVisible()
 await expect(guide.getByText(/Director’s Cut merupakan versi sunting ulang/)).toBeVisible()
})

test('browse filters survive deep links, reload, and back-forward navigation without resetting the tab',async({page})=>{
 await page.goto('/jelajahi/populer?genre=Action&type=TV&minScore=8&year=2024&order=rating')
 await expect(page.getByRole('combobox',{name:'Genre'})).toHaveValue('Action')
 await expect(page.getByRole('combobox',{name:'Jenis anime'})).toHaveValue('TV')
 await expect(page.getByRole('combobox',{name:'Skor minimum'})).toHaveValue('8')
 await expect(page.getByRole('combobox',{name:'Tahun rilis'})).toHaveValue('2024')
 await expect(page.getByRole('combobox',{name:'Urutkan anime'})).toHaveValue('rating')
 await expect(page.getByRole('button',{name:'Populer'})).toHaveAttribute('aria-pressed','true')
 await expect(page.getByRole('button',{name:'Hapus filter Genre: Action'})).toBeVisible()
 await page.reload()
 await expect(page.getByRole('combobox',{name:'Genre'})).toHaveValue('Action')
 await page.getByRole('combobox',{name:'Genre'}).selectOption('Drama')
 await expect(page).toHaveURL(/\/jelajahi\/populer\?[^#]*genre=Drama/)
 await page.goBack()
 await expect(page.getByRole('combobox',{name:'Genre'})).toHaveValue('Action')
 await page.goForward()
 await expect(page.getByRole('combobox',{name:'Genre'})).toHaveValue('Drama')
 await page.getByRole('button',{name:'Hapus filter Genre: Drama'}).click()
 await expect(page.getByRole('combobox',{name:'Genre'})).toHaveValue('')
 await expect(page).not.toHaveURL(/genre=Drama/)
 await page.getByRole('button',{name:'Reset filter'}).click()
 await expect(page).toHaveURL(/\/jelajahi\/populer$/)
})
test('unsupported URL filters are discarded and long-tail historical year is selected',async({page})=>{
 await page.goto('/jelajahi/musim-ini?genre=Unknown&type=INVALID&minScore=999&year=1965&order=wat')
 await expect(page.getByRole('combobox',{name:'Genre'})).toHaveValue('')
 await expect(page.getByRole('combobox',{name:'Jenis anime'})).toHaveValue('')
 await expect(page.getByRole('combobox',{name:'Tahun rilis'})).toHaveValue('1965')
 await expect(page.getByRole('combobox',{name:'Skor minimum'})).toHaveValue('0')
 await expect(page.getByRole('combobox',{name:'Urutkan anime'})).toHaveValue('default')
 await expect(page.getByRole('button',{name:'Musim ini',exact:true})).toHaveAttribute('aria-pressed','true')
})

test('noncanonical score deep link does not select a different browse filter',async({page})=>{
 await page.goto('/jelajahi/populer?minScore=8e0')
 await expect(page.getByRole('combobox',{name:'Skor minimum'})).toHaveValue('0')
 await page.goto('/jelajahi/populer?minScore=8')
 await expect(page.getByRole('combobox',{name:'Skor minimum'})).toHaveValue('8')
})
test('D01: external English-only subtitle is not downloaded until explicit confirmation',async({page})=>{
 let downloads=0
 await page.route('**/api/streams?**',route=>route.fulfill({json:{items:[{...testStream,tracks:[],subtitleMode:'unknown'}]}}))
 await page.route('**/api/anime/1/subtitles?**',route=>route.fulfill({json:{items:[
  {id:'subdl:english',provider:'subdl',language:'en',label:'English',release:'Episode 1',episode:1,
   score:70,sourceUrl:'/api/subtitles/file?provider=subdl&ref=english'}
 ],warnings:[]}}))
 await page.route('**/api/subtitles/file?**',route=>{
  downloads++
  return route.fulfill({status:200,contentType:'text/vtt',body:'WEBVTT\\n\\n00:00:00.100 --> 00:00:02.000\\nHello\\n'})
 })
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const player=page.getByRole('main',{name:'Layar tonton'})
 await expect(player).toBeVisible()
 await player.locator('.player-subtitle-trigger').click()
 const confirm=player.getByRole('group',{name:'Konfirmasi subtitle English'})
 await expect(confirm).toBeVisible()
 await expect(player.locator('video track[srclang="en"]')).toHaveCount(0)
 expect(downloads).toBe(0)
 await confirm.getByRole('button',{name:'Gunakan subtitle English'}).click()
 await expect(player.locator('video track[srclang="en"]')).toHaveCount(1)
 await expect(player.locator('.player-subtitle-trigger')).toContainText('English')
 expect(downloads).toBe(1)
})
test('D01: declining English-only offer keeps native English track inactive',async({page})=>{
 await page.route('**/api/streams?**',route=>route.fulfill({json:{items:[{
  ...testStream,tracks:[{lang:'en',label:'English',url:'/demo-id.vtt'}]
 }]}}))
 await page.route('**/api/anime/1/subtitles?**',route=>route.fulfill({json:{items:[],warnings:[]}}))
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await page.locator('.episode-list .episode-row').first().click()
 const player=page.getByRole('main',{name:'Layar tonton'})
 await expect(player).toBeVisible()
 await expect(player.locator('video track[srclang="en"][default]')).toHaveCount(0)
 await player.locator('.player-subtitle-trigger').click()
 const confirm=player.getByRole('group',{name:'Konfirmasi subtitle English'})
 await expect(confirm).toBeVisible()
 await confirm.getByRole('button',{name:'Tidak sekarang'}).click()
 await expect(confirm).toHaveCount(0)
 await expect(player.locator('video track[srclang="en"][default]')).toHaveCount(0)
 await expect(player.getByText(/English tidak diaktifkan/)).toBeVisible()
})

test('Anime Popular posters fill equal two-column grid cells on mobile',async({page})=>{
 await page.route('**/api/anime/discover?**',route=>{
  const kind=new URL(route.request().url()).searchParams.get('kind')
  const items=kind==='top'?Array.from({length:10},(_,i)=>({...anime,id:`mal:${i+1}`,malId:i+1,title:i===2?'A Very Long Fullmetal Alchemist Brotherhood Title':`Popular Anime ${i+1}`})):[anime]
  return route.fulfill({json:{items,page:1,hasNext:false}})
 })
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844})
  await page.goto('/')
  const section=page.locator('.content-section').filter({has:page.getByRole('heading',{name:'Anime Popular'})})
  const tiles=section.locator('.ranked-anime')
  await expect(tiles).toHaveCount(10)
  const geometry=await tiles.evaluateAll(nodes=>nodes.slice(0,4).map(node=>{
   const cell=node.getBoundingClientRect()
   const card=node.querySelector('.anime-card')?.getBoundingClientRect()
   const art=node.querySelector('.card-art')?.getBoundingClientRect()
   const number=node.querySelector('.ranked-anime-number')?.getBoundingClientRect()
   const score=node.querySelector('.score-tag')?.getBoundingClientRect()
   return {left:cell.left,top:cell.top,width:cell.width,card:card?.width,
    posterWidth:art?.width,posterHeight:art?.height,
    badgesOverlap:Boolean(number&&score&&number.right>score.left&&score.right>number.left&&number.bottom>score.top)}
  }))
  expect(geometry).toHaveLength(4)
  for(const item of geometry){
   expect(Math.abs(item.width-item.card)).toBeLessThan(2)
   expect(Math.abs(item.width-item.posterWidth)).toBeLessThan(2)
   expect(Math.abs(item.posterHeight/item.posterWidth-1.5)).toBeLessThan(0.04)
   expect(item.badgesOverlap).toBe(false)
  }
  expect(Math.abs(geometry[0].width-geometry[1].width)).toBeLessThan(2)
  expect(Math.abs(geometry[0].left-geometry[2].left)).toBeLessThan(2)
  expect(Math.abs(geometry[0].top-geometry[1].top)).toBeLessThan(2)
  expect(await page.locator('body').evaluate(el=>el.scrollWidth<=window.innerWidth+1)).toBe(true)
 }
})

test('browse displays loaded title count, not an unverified total across pages',async({page})=>{
 const second={...anime,id:'mal:2',malId:2,title:'Yoru Test Anime Dua'}
 await page.route('**/api/anime/discover?**',route=>{
  const currentPage=Number(new URL(route.request().url()).searchParams.get('page')||1)
  return route.fulfill({json:{
   items:currentPage===1?[anime]:[anime,second],
   page:currentPage,hasNext:currentPage===1
  }})
 })
 await page.goto('/jelajahi')
 const label=page.locator('.browse-results-header .results-label')
 await expect(page.getByRole('combobox',{name:'Urutkan anime'}).locator('option[value="default"]')).toHaveText('Paling populer')
 await expect(label).toHaveText('1 ditampilkan')
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(1)
 await page.getByRole('button',{name:/Muat lebih banyak/}).click()
 await expect(label).toHaveText('2 ditampilkan')
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(2)
})

test('Tenrai genre choices use validated MAL IDs, preserve deep links and keep old names compatible',async({page})=>{
 const genreRequests=[]
 await page.route('**/api/anime/genres',route=>route.fulfill({json:{
  source:'Tenrai',status:'upstream',
  items:[
   [1,'Action'],[2,'Adventure'],[4,'Comedy'],[8,'Drama'],[10,'Fantasy'],[14,'Horror'],
   [7,'Mystery'],[22,'Romance'],[24,'Sci-Fi'],[36,'Slice of Life'],[30,'Sports'],[37,'Supernatural'],
   [46,'Award Winning']
  ].map(([id,name])=>({id,name}))
 }}))
 await page.route('**/api/anime/browse?**',route=>{
  const genre=new URL(route.request().url()).searchParams.get('genre')
  genreRequests.push(genre)
  return route.fulfill({json:{items:[anime],page:1,hasNext:false}})
 })
 await page.goto('/jelajahi')
 const select=page.getByRole('combobox',{name:'Genre'})
 await expect(select.locator('option[value="mal:46"]')).toHaveText('Award Winning')
 await select.selectOption('mal:46')
 await expect(page).toHaveURL(/genre=mal%3A46/)
 await expect.poll(()=>genreRequests.at(-1)).toBe('mal:46')
 await page.reload()
 await expect(select).toHaveValue('mal:46')
 await select.selectOption('Action')
 await expect(page).toHaveURL(/genre=Action/)
 await expect.poll(()=>genreRequests.at(-1)).toBe('Action')
})

test('genre taxonomy failure preserves legacy filter choices and discloses partial list',async({page})=>{
 await page.goto('/jelajahi')
 await expect(page.getByRole('combobox',{name:'Genre'}).locator('option')).toHaveCount(13)
 await expect(page.getByText('Daftar genre tambahan belum tersedia. Genre umum tetap bisa dipakai.')).toBeVisible()
})

test('invalid guide deep-link IDs keep the unselected guide landing state',async({page})=>{
 for(const value of ['1e3','0x10','01']){
  await page.goto('/jelajahi/panduan-urutan?anime='+encodeURIComponent(value))
  await expect(page.getByRole('heading',{name:'Panduan urutan anime'})).toBeVisible()
  await expect(page.getByText(/Mulai dari judul apa pun/)).toBeVisible()
  await expect(page.getByRole('region',{name:'Panduan menonton dengan sumber'})).toHaveCount(0)
 }
})

test('Akan Datang is a shareable separate destination, not a filter tab (D08)',async({page})=>{
 await page.setViewportSize({width:390,height:844})
 await page.goto('/jelajahi')
 await expect(page.locator('.category-switch button')).toHaveCount(2)
 await expect(page.locator('.category-switch').getByRole('button',{name:'Akan Datang'})).toHaveCount(0)
 await page.locator('.browse-destinations').getByRole('button',{name:'Akan Datang'}).click()
 await expect(page).toHaveURL(/\/jelajahi\/akan-datang$/)
 await expect(page.getByRole('heading',{name:'Akan Datang'})).toBeVisible()
 await expect(page.locator('.category-switch')).toHaveCount(0)
 expect(await page.locator('body').evaluate(el=>el.scrollWidth<=window.innerWidth+1)).toBe(true)
 await page.reload()
 await expect(page.getByRole('heading',{name:'Akan Datang'})).toBeVisible()
 await page.locator('.browse-destinations').getByRole('button',{name:'Jelajahi anime'}).click()
 await expect(page).toHaveURL(/\/jelajahi$/)
 await expect(page.locator('.category-switch button')).toHaveCount(2)
 await expect(page.getByRole('heading',{name:'Jelajahi'})).toBeVisible()
})

test('detail does not invent episode one when metadata and providers list no episodes',async({page})=>{
 await page.route('**/api/anime/1/episodes?**',route=>route.fulfill({json:{items:[],page:1,hasNext:false}}))
 await page.route('**/api/anime/1/provider-episodes',route=>route.fulfill({json:{items:[]}}))
 let streamRequests=0
 await page.route('**/api/streams?**',route=>{
  streamRequests++
  return route.fulfill({json:{items:[]}})
 })
 await page.goto('/')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 const action=dialog.getByRole('button',{name:'Episode belum tersedia'})
 await expect(action).toBeVisible()
 await expect(action).toBeDisabled()
 await expect(dialog.locator('.episode-list .episode-row')).toHaveCount(0)
 expect(streamRequests).toBe(0)
})
test('Phase 05 episode pagination loads 100 titles without overlapping requests',async({page})=>{
 const requested=[]
 let releasePageTwo=()=>{}
 const pageTwoGate=new Promise(resolve=>{releasePageTwo=resolve})
 await page.route('**/api/anime/1/provider-episodes',route=>route.fulfill({json:{items:[]}}))
 await page.route('**/api/anime/1/episodes?**',async route=>{
  const p=Number(new URL(route.request().url()).searchParams.get('page')||1)
  requested.push(p)
  if(p===2)await pageTwoGate
  const start=(p-1)*24+1
  const count=Math.max(0,Math.min(24,101-start))
  const items=Array.from({length:count},(_,i)=>({...episode,id:`mal:1:${start+i}`,number:start+i,title:`Episode ${start+i}`}))
  return route.fulfill({json:{items,page:p,hasNext:p<5}})
 })
 await page.goto('/anime/1')
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 const rows=dialog.locator('.episode-list .episode-row')
 const load=dialog.getByRole('button',{name:/Muat episode berikutnya/})
 await expect(rows).toHaveCount(24)
 await load.click()
 await expect(load).toBeDisabled()
 await expect(load).toHaveAttribute('aria-busy','true')
 expect(requested.filter(p=>p===2)).toHaveLength(1)
 releasePageTwo()
 await expect(rows).toHaveCount(48)
 for(const count of [72,96,100]){
  await load.click()
  await expect(rows).toHaveCount(count)
 }
 await expect(dialog.locator('.load-episodes')).toHaveCount(0)
 expect(requested).toEqual([1,2,3,4,5])
 await expect(rows.last()).toContainText('Episode 100')
})

test('Phase 05 failed episode page can retry without losing loaded episodes',async({page})=>{
 let secondPageCalls=0
 await page.route('**/api/anime/1/provider-episodes',route=>route.fulfill({json:{items:[]}}))
 await page.route('**/api/anime/1/episodes?**',route=>{
  const p=Number(new URL(route.request().url()).searchParams.get('page')||1)
  if(p===2&&++secondPageCalls===1)return route.fulfill({status:503,json:{error:'Provider sementara tidak tersedia'}})
  const start=(p-1)*24+1
  const items=Array.from({length:24},(_,i)=>({...episode,id:`mal:1:${start+i}`,number:start+i,title:`Episode ${start+i}`}))
  return route.fulfill({json:{items,page:p,hasNext:p<2}})
 })
 await page.goto('/anime/1')
 const dialog=page.getByRole('dialog',{name:'Detail Yoru Test Anime'})
 const rows=dialog.locator('.episode-list .episode-row')
 const load=dialog.locator('.load-episodes')
 await expect(rows).toHaveCount(24)
 await load.click()
 await expect(dialog.locator('.detail-error')).toContainText('Tidak dapat mengambil daftar episode berikutnya')
 await expect(load).toBeEnabled()
 await expect(rows).toHaveCount(24)
 await load.click()
 await expect(rows).toHaveCount(48)
 await expect(dialog.locator('.detail-error')).toHaveCount(0)
 await expect(load).toHaveCount(0)
 expect(secondPageCalls).toBe(2)
})

test('Phase 05 detail has a direct URL, supports Back/Forward and reload, and fills mobile viewport',async({page})=>{
 await page.goto('/jelajahi')
 await page.getByRole('button',{name:'Buka Yoru Test Anime'}).first().click()
 await expect(page).toHaveURL(/\/anime\/1$/)
 await expect(page.getByRole('dialog',{name:'Detail Yoru Test Anime'})).toBeVisible()
 await page.getByRole('button',{name:'Tutup detail anime'}).click()
 await expect(page).toHaveURL(/\/jelajahi$/)
 await expect(page.getByRole('dialog',{name:'Detail Yoru Test Anime'})).toHaveCount(0)
 await page.goForward()
 await expect(page).toHaveURL(/\/anime\/1$/)
 await expect(page.getByRole('dialog',{name:'Detail Yoru Test Anime'})).toBeVisible()
 await page.reload()
 await expect(page.getByRole('dialog',{name:'Detail Yoru Test Anime'})).toBeVisible()
 await page.setViewportSize({width:390,height:844})
 const bounds=await page.locator('.detail-modal').boundingBox()
 expect(bounds).not.toBeNull()
 expect(bounds.x).toBeGreaterThanOrEqual(-1)
 expect(bounds.width).toBeGreaterThanOrEqual(389)
 expect(await page.locator('.detail-page-view').evaluate(el=>Math.abs(el.getBoundingClientRect().width-window.innerWidth))).toBeLessThan(2)
})

test('Phase 05 invalid detail ID does not fetch unrelated anime',async({page})=>{
 let calls=0
 await page.route('**/api/anime/1000',route=>{calls++;return route.fulfill({json:anime})})
 await page.goto('/anime/1e3')
 await expect(page.getByRole('heading',{name:'Beranda'})).toBeVisible()
 expect(calls).toBe(0)
})

test('Phase 05 returning from detail preserves loaded browse pages, filters and focus',async({page})=>{
 const browseRequests=[]
 await page.route('**/api/anime/discover?**',route=>{
  const params=new URL(route.request().url()).searchParams
  const currentPage=Number(params.get('page')||1)
  browseRequests.push(currentPage)
  const items=currentPage===1
   ?Array.from({length:24},(_,i)=>({...anime,id:'mal:'+(i+1),malId:i+1,title:'Page one anime '+(i+1)}))
   :[{...anime,id:'mal:25',malId:25,title:'Page two anime'}]
  return route.fulfill({json:{items,page:currentPage,hasNext:currentPage===1}})
 })
 await page.route('**/api/anime/25/episodes?**',route=>route.fulfill({json:{items:[],page:1,hasNext:false}}))
 await page.route('**/api/anime/25/provider-episodes',route=>route.fulfill({json:{items:[]}}))
 await page.goto('/jelajahi')
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(24)
 await page.getByRole('button',{name:/Muat lebih banyak/}).click()
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(25)
 await expect(page.locator('.browse-results-header .results-label')).toHaveText('25 ditampilkan')
 const target=page.getByRole('button',{name:'Buka Page two anime'})
 await target.scrollIntoViewIfNeeded()
 const originalScroll=await page.evaluate(()=>window.scrollY)
 expect(originalScroll).toBeGreaterThan(0)
 const requestsBeforeDetail=browseRequests.length
 await target.click()
 await expect(page).toHaveURL(/\/anime\/25$/)
 await expect(page.getByRole('dialog',{name:'Detail Page two anime'})).toBeVisible()
 await page.getByRole('button',{name:'Tutup detail anime'}).click()
 await expect(page).toHaveURL(/\/jelajahi$/)
 await expect(page.locator('.browse-results-header .results-label')).toHaveText('25 ditampilkan')
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(25)
 await expect(page.getByRole('button',{name:'Buka Page two anime'})).toBeFocused()
 expect(browseRequests.length).toBe(requestsBeforeDetail)
 expect(await page.evaluate(()=>window.scrollY)).toBeGreaterThan(0)
})

test('D05 guide to detail to Back retains expanded graph, branch filter and focus',async({page})=>{
 const base={
  source:'AniList',sourceUrl:'https://anilist.co/anime/10',scope:'direct-relations',animeMalId:1,
  items:[
   {aniListId:10,malId:1,title:'Guide Root',format:'TV',year:2024,month:1,relation:'CURRENT',image:null},
   {aniListId:11,malId:2,title:'Guide Sequel',format:'TV',year:2025,month:1,relation:'SEQUEL',image:null}
  ]
 }
 let guideCalls=0
 await page.route('**/api/anime/1/watch-guide?depth=2',route=>{
  guideCalls++
  return route.fulfill({json:{...base,graph:{
   status:'expanded',scannedDirect:1,directTotal:1,truncated:false,
   note:'Peta dua tingkat terbatas',edges:[{from:10,to:11,relation:'SEQUEL'},{from:11,to:12,relation:'ALTERNATIVE'}],
   nodes:[
    {...base.items[0],distance:0,viaAniListId:null},
    {...base.items[1],distance:1,viaAniListId:10},
    {aniListId:12,malId:3,title:'Guide Alternative',format:'MOVIE',year:2022,month:1,
     relation:'ALTERNATIVE',image:null,distance:2,viaAniListId:11}
   ]
  }}})
 })
 await page.route('**/api/anime/1/watch-guide',route=>{guideCalls++;return route.fulfill({json:base})})
 await page.route('**/api/anime/3',route=>route.fulfill({json:{...anime,id:'mal:3',malId:3,title:'Guide Alternative'}}))
 await page.route('**/api/anime/3/episodes?**',route=>route.fulfill({json:{items:[],page:1,hasNext:false}}))
 await page.route('**/api/anime/3/provider-episodes',route=>route.fulfill({json:{items:[]}}))
 await page.goto('/jelajahi/panduan-urutan?anime=1')
 await expect(page.getByRole('heading',{name:'Jaringan judul yang berhubungan'})).toBeVisible()
 await page.getByRole('button',{name:/Perluas hubungan/}).click()
 await expect(page.getByText('Guide Alternative',{exact:true})).toBeVisible()
 await page.getByRole('button',{name:/Cabang cerita/}).click()
 await expect(page.getByText('Guide Sequel',{exact:true})).toHaveCount(0)
 const opener=page.locator('.guide-entries .guide-entry').filter({hasText:'Guide Alternative'}).getByRole('button',{name:'Buka'})
 const requestsBefore=guideCalls
 await opener.click()
 await expect(page).toHaveURL(/\/anime\/3$/)
 await expect(page.getByRole('dialog',{name:'Detail Guide Alternative'})).toBeVisible()
 await page.getByRole('button',{name:'Tutup detail anime'}).click()
 await expect(page).toHaveURL(/\/jelajahi\/panduan-urutan\?anime=1$/)
 await expect(page.getByText('Guide Alternative',{exact:true})).toBeVisible()
 await expect(page.getByRole('button',{name:/Cabang cerita/})).toHaveAttribute('aria-pressed','true')
 await expect(page.getByText('Guide Sequel',{exact:true})).toHaveCount(0)
 await expect(opener).toBeFocused()
 expect(guideCalls).toBe(requestsBefore)
})

test('Phase 05 Escape from native playback returns to originating Browse',async({page})=>{
 await page.goto('/jelajahi')
 const opener=page.getByRole('button',{name:'Buka Yoru Test Anime'}).first()
 await expect(opener).toBeVisible()
 await opener.click()
 await expect(page).toHaveURL(/\/anime\/1$/)
 await page.getByRole('dialog',{name:'Detail Yoru Test Anime'}).locator('.episode-list .episode-row').first().click()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
 await page.keyboard.press('Escape')
 await expect(page).toHaveURL(/\/jelajahi$/)
 await expect(page.locator('.app-shell[hidden]')).toHaveCount(0)
 await expect(page.getByRole('main',{name:'Layar tonton'})).toHaveCount(0)
 await expect(page.getByRole('dialog',{name:'Detail Yoru Test Anime'})).toHaveCount(0)
 await expect(opener).toBeFocused()
})

test('Phase 05 player Back restores two loaded Browse pages without refetch',async({page})=>{
 const browsePages=[]
 const second={...anime,id:'mal:25',malId:25,title:'Page two playback anime'}
 await page.route('**/api/anime/discover?**',route=>{
  const pageNo=Number(new URL(route.request().url()).searchParams.get('page')||1)
  browsePages.push(pageNo)
  const items=pageNo===1
   ?Array.from({length:24},(_,i)=>({...anime,id:'mal:'+(i+1),malId:i+1,title:'Browse page one '+(i+1)}))
   :[second]
  return route.fulfill({json:{items,page:pageNo,hasNext:pageNo===1}})
 })
 await page.route('**/api/anime/25',route=>route.fulfill({json:second}))
 await page.route('**/api/anime/25/episodes?**',route=>route.fulfill({json:{items:[{...episode,id:'mal:25:1',animeId:'mal:25'}],page:1,hasNext:false}}))
 await page.route('**/api/anime/25/provider-episodes',route=>route.fulfill({json:{items:[{...configured,id:'fixture:25:1',animeId:'mal:25'}]}}))
 await page.goto('/jelajahi')
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(24)
 await page.getByRole('button',{name:/Muat lebih banyak/}).click()
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(25)
 const target=page.getByRole('button',{name:'Buka Page two playback anime'})
 await target.scrollIntoViewIfNeeded()
 await target.click()
 await expect(page).toHaveURL(/\/anime\/25$/)
 await page.getByRole('dialog',{name:'Detail Page two playback anime'}).locator('.episode-list .episode-row').first().click()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
 await expect(page.locator('.app-shell[hidden]')).toHaveCount(1)
 await expect(page.getByRole('dialog',{name:'Detail Page two playback anime'})).toHaveCount(0)
 const requestsBeforeReturn=browsePages.length
 await page.getByRole('main',{name:'Layar tonton'}).getByRole('button',{name:'Kembali'}).click()
 await expect(page).toHaveURL(/\/jelajahi$/)
 await expect(page.locator('.app-shell[hidden]')).toHaveCount(0)
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(25)
 await expect(page.locator('.browse-results-header .results-label')).toHaveText('25 ditampilkan')
 await expect(target).toBeFocused()
 expect(browsePages.length).toBe(requestsBeforeReturn)
})

test('Phase 05 player Back retains combined Browse filters and page two results',async({page})=>{
 const browseRequests=[]
 const selected={...anime,id:'mal:25',malId:25,title:'Filtered page two anime'}
 await page.route('**/api/anime/browse?**',route=>{
  const params=new URL(route.request().url()).searchParams
  browseRequests.push(Object.fromEntries(params))
  const currentPage=Number(params.get('page')||1)
  const items=currentPage===1
   ?Array.from({length:24},(_,i)=>({...anime,id:'mal:'+(i+1),malId:i+1,title:'Filtered page one '+(i+1)}))
   :[selected]
  return route.fulfill({json:{items,page:currentPage,hasNext:currentPage===1}})
 })
 await page.route('**/api/anime/25',route=>route.fulfill({json:selected}))
 await page.route('**/api/anime/25/episodes?**',route=>route.fulfill({json:{items:[{...episode,id:'mal:25:1',animeId:'mal:25'}],page:1,hasNext:false}}))
 await page.route('**/api/anime/25/provider-episodes',route=>route.fulfill({json:{items:[{...configured,id:'fixture:25:1',animeId:'mal:25'}]}}))
 const original='/jelajahi?genre=Action&type=TV&minScore=8&year=2025&order=rating'
 await page.goto(original)
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(24)
 await expect(page.getByRole('combobox',{name:'Genre'})).toHaveValue('Action')
 await expect(page.getByRole('combobox',{name:'Jenis anime'})).toHaveValue('TV')
 await expect(page.getByRole('combobox',{name:'Skor minimum'})).toHaveValue('8')
 await expect(page.getByRole('combobox',{name:'Tahun rilis'})).toHaveValue('2025')
 await expect(page.getByRole('combobox',{name:'Urutkan anime'})).toHaveValue('rating')
 await page.getByRole('button',{name:/Muat lebih banyak/}).click()
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(25)
 const opener=page.getByRole('button',{name:'Buka Filtered page two anime'})
 await opener.scrollIntoViewIfNeeded()
 const originalScroll=await page.evaluate(()=>window.scrollY)
 expect(originalScroll).toBeGreaterThan(0)
 const requestsBeforePlayback=browseRequests.length
 for(const request of browseRequests){
  expect(request).toMatchObject({genre:'Action',type:'TV',minScore:'8',year:'2025',order:'rating'})
 }
 await opener.click()
 await expect(page).toHaveURL(/\/anime\/25$/)
 await page.getByRole('dialog',{name:'Detail Filtered page two anime'}).locator('.episode-list .episode-row').first().click()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
 await expect(page.locator('.app-shell[hidden]')).toHaveCount(1)
 await page.getByRole('main',{name:'Layar tonton'}).getByRole('button',{name:'Kembali'}).click()
 await expect(page).toHaveURL(new RegExp(original.replace(/[?]/g,'\\?')))
 await expect(page.locator('.browse-grid .anime-card')).toHaveCount(25)
 await expect(page.locator('.browse-results-header .results-label')).toHaveText('25 ditampilkan')
 await expect(page.getByRole('combobox',{name:'Genre'})).toHaveValue('Action')
 await expect(page.getByRole('combobox',{name:'Jenis anime'})).toHaveValue('TV')
 await expect(page.getByRole('combobox',{name:'Skor minimum'})).toHaveValue('8')
 await expect(page.getByRole('combobox',{name:'Tahun rilis'})).toHaveValue('2025')
 await expect(page.getByRole('combobox',{name:'Urutkan anime'})).toHaveValue('rating')
 await expect(opener).toBeFocused()
 expect(await page.evaluate(()=>window.scrollY)).toBeGreaterThan(0)
 expect(browseRequests.length).toBe(requestsBeforePlayback)
})

test('Phase 06 player Back preserves Watch Guide branch filter and expanded graph',async({page})=>{
 const base={source:'AniList',sourceUrl:'https://anilist.co/anime/10',scope:'direct-relations',animeMalId:1,
  items:[
   {aniListId:10,malId:1,title:'Root',format:'TV',year:2024,month:1,relation:'CURRENT',image:null},
   {aniListId:11,malId:2,title:'Sequel',format:'TV',year:2025,month:1,relation:'SEQUEL',image:null}
  ]}
 let guideCalls=0
 await page.route('**/api/anime/1/watch-guide?depth=2',route=>{
  guideCalls++
  return route.fulfill({json:{...base,graph:{status:'expanded',scannedDirect:1,directTotal:1,truncated:false,
   note:'Dua tingkat terbatas',edges:[{from:10,to:11,relation:'SEQUEL'},{from:11,to:12,relation:'ALTERNATIVE'}],
   nodes:[{...base.items[0],distance:0,viaAniListId:null},{...base.items[1],distance:1,viaAniListId:10},
    {aniListId:12,malId:3,title:'Guide playable alternative',format:'MOVIE',year:2022,month:1,relation:'ALTERNATIVE',image:null,distance:2,viaAniListId:11}]}}})
 })
 await page.route('**/api/anime/1/watch-guide',route=>{guideCalls++;return route.fulfill({json:base})})
 const alternative={...anime,id:'mal:3',malId:3,title:'Guide playable alternative'}
 await page.route('**/api/anime/3',route=>route.fulfill({json:alternative}))
 await page.route('**/api/anime/3/episodes?**',route=>route.fulfill({json:{items:[{...episode,id:'mal:3:1',animeId:'mal:3'}],page:1,hasNext:false}}))
 await page.route('**/api/anime/3/provider-episodes',route=>route.fulfill({json:{items:[{...configured,id:'fixture:3:1',animeId:'mal:3'}]}}))
 await page.goto('/jelajahi/panduan-urutan?anime=1')
 await expect(page.getByRole('heading',{name:'Jaringan judul yang berhubungan'})).toBeVisible()
 await page.getByRole('button',{name:/Perluas hubungan/}).click()
 await expect(page.getByText('Guide playable alternative',{exact:true})).toBeVisible()
 await page.getByRole('button',{name:/Cabang cerita/}).click()
 const opener=page.locator('.guide-entries .guide-entry').filter({hasText:'Guide playable alternative'}).getByRole('button',{name:'Buka'})
 await opener.click()
 await expect(page).toHaveURL(/\/anime\/3$/)
 await page.getByRole('dialog',{name:'Detail Guide playable alternative'}).locator('.episode-list .episode-row').first().click()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
 const requestsBeforeReturn=guideCalls
 await page.getByRole('main',{name:'Layar tonton'}).getByRole('button',{name:'Kembali'}).click()
 await expect(page).toHaveURL(/\/jelajahi\/panduan-urutan\?anime=1$/)
 await expect(page.getByText('Guide playable alternative',{exact:true})).toBeVisible()
 await expect(page.getByRole('button',{name:/Cabang cerita/})).toHaveAttribute('aria-pressed','true')
 await expect(opener).toBeFocused()
 expect(guideCalls).toBe(requestsBeforeReturn)
})

test('Phase 05 browser history Back dismisses player and restores Browse context',async({page})=>{
 await page.goto('/jelajahi')
 const opener=page.getByRole('button',{name:'Buka Yoru Test Anime'}).first()
 await expect(opener).toBeVisible()
 await opener.click()
 await expect(page).toHaveURL(/\/anime\/1$/)
 await page.getByRole('dialog',{name:'Detail Yoru Test Anime'}).locator('.episode-list .episode-row').first().click()
 await expect(page.getByRole('main',{name:'Layar tonton'})).toBeVisible()
 await page.goBack()
 await expect(page).toHaveURL(/\/jelajahi$/)
 await expect(page.getByRole('main',{name:'Layar tonton'})).toHaveCount(0)
 await expect(page.locator('.app-shell[hidden]')).toHaveCount(0)
 await expect(page.getByRole('dialog',{name:'Detail Yoru Test Anime'})).toHaveCount(0)
 await expect(opener).toBeFocused()
})

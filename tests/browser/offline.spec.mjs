import {expect,test} from '@playwright/test'

test.use({serviceWorkers:'allow'})

test('installed PWA shell still loads while offline after initial cache',async({page,context})=>{
 await page.goto('/')
 await expect(page.getByRole('heading',{name:/^Beranda/})).toBeVisible()
 await page.evaluate(async()=>{await navigator.serviceWorker.ready})
 await page.reload()
 await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller))
 await expect(page.getByRole('heading',{name:/^Beranda/})).toBeVisible()
 await context.setOffline(true)
 await page.reload()
 await expect(page.getByRole('heading',{name:/^Beranda/})).toBeVisible()
 await context.setOffline(false)
})

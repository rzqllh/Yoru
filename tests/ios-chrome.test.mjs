import assert from 'node:assert/strict'
import {test} from 'node:test'
import {readFileSync} from 'node:fs'

const html=readFileSync('frontend/index.html','utf8')
const manifest=JSON.parse(readFileSync('frontend/public/manifest.webmanifest','utf8'))
const css=readFileSync('frontend/src/styles.css','utf8')

test('Safari theme, root canvas and installed PWA splash share one dark color',()=>{
 assert.match(html,/<meta name="theme-color" content="#090e16"/)
 assert.equal(manifest.background_color,'#090e16')
 assert.equal(manifest.theme_color,'#090e16')
 assert.match(css,/html\s*\{[^}]*background-color:\s*#090e16/s)
 assert.match(html,/viewport-fit=cover/)
})

test('Home Screen status bar retains translucent option with safe area padding',()=>{
 assert.match(html,/apple-mobile-web-app-capable" content="yes"/)
 assert.match(html,/apple-mobile-web-app-status-bar-style" content="black-translucent"/)
 assert.match(css,/@media \(display-mode: standalone\) and \(max-width: 600px\)/)
 assert.match(css,/padding-top:\s*env\(safe-area-inset-top/)
 assert.match(css,/padding-bottom:\s*env\(safe-area-inset-bottom/)
})

test('fixed mobile navigation extends through safe area without reducing button space',()=>{
 assert.match(css,/height:\s*calc\(58px \+ env\(safe-area-inset-bottom, 0px\)\)/)
 assert.match(css,/-webkit-backdrop-filter:\s*blur\(24px\)/)
})

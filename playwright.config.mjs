import {defineConfig,devices} from '@playwright/test'

export default defineConfig({
 testDir:'./tests/browser',
 timeout:30000,
 expect:{timeout:10000},
 retries:1,
 reporter:[['line'],['html',{open:'never',outputFolder:'playwright-report'}]],
 use:{...devices['Desktop Chrome'],baseURL:'http://127.0.0.1:8787',serviceWorkers:'block',
  screenshot:'only-on-failure',trace:'on-first-retry'},
 webServer:{command:'npm start',url:'http://127.0.0.1:8787/api/health',
  reuseExistingServer:!process.env.CI,timeout:30000},
})

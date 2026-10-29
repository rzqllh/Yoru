import {defineConfig,devices} from '@playwright/test'

const testPort = process.env.PORT || '8799'

export default defineConfig({
 testDir:'./tests/browser',
 timeout:30000,
 expect:{timeout:10000},
 retries:1,
 reporter:[['line'],['html',{open:'never',outputFolder:'playwright-report'}]],
 use:{...devices['Desktop Chrome'],baseURL:`http://127.0.0.1:${testPort}`,serviceWorkers:'block',
  screenshot:'only-on-failure',trace:'on-first-retry'},
 webServer:{command:'node scripts/start.mjs',url:`http://127.0.0.1:${testPort}/api/health`,
  env:{PORT:testPort,NODE_ENV:'production'},
  reuseExistingServer:false,timeout:30000},
})

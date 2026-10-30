import { defineConfig, devices } from '@playwright/test'

// Checkly sets CHECKLY=1 on every run. Use it to point monitoring at
// production while local runs keep hitting your dev server.
const onCheckly = process.env.CHECKLY === '1'

export default defineConfig({
  testDir: './tests',
  retries: onCheckly ? 2 : 0,
  // Stop after the first failure on Checkly so alerts fire sooner.
  maxFailures: onCheckly ? 1 : 0,
  use: {
    baseURL: onCheckly ? 'https://danube-web.shop' : 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    // Everything, for local runs and CI.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Only the flows worth waking someone up for.
    {
      name: 'monitoring',
      grep: /@monitor/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

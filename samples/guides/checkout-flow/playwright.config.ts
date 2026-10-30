import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  retries: process.env.CHECKLY === '1' ? 2 : 0,
  use: {
    // SHOP_URL is set per environment: on the Checkly check for production,
    // in your shell or CI for staging. Local runs fall back to the dev server.
    baseURL: process.env.SHOP_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },
})

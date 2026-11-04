import { test, expect } from '@playwright/test'

test('shop displays books', async ({ page }) => {
  console.log(`Environment: ${process.env.ENVIRONMENT_URL}`)
  await page.goto(process.env.ENVIRONMENT_URL!)
  await expect(page.locator('.preview-title').first()).toBeVisible()
})

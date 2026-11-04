import { test, expect } from '@playwright/test'

test('homepage renders the book list', async ({ page }) => {
  const response = await page.goto('https://danube-web.shop/')

  expect(response?.status()).toBeLessThan(400)
  await expect(page).toHaveTitle(/Danube/)
  await expect(page.locator('.preview').first()).toBeVisible()
})

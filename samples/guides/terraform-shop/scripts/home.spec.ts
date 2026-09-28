import { test, expect } from '@playwright/test'

// SHOP_URL comes from the check group in Terraform. Locally, it falls
// back to the production shop so the same file runs in both places.
const shopUrl = process.env.SHOP_URL ?? 'https://danube-web.shop'

test('home page lists the top sellers', async ({ page }) => {
  await page.goto(shopUrl)

  await expect(page.getByRole('heading', { name: 'Top sellers' })).toBeVisible()
  await expect(page.locator('.preview').first()).toBeVisible()
})

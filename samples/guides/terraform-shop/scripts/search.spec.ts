import { test, expect } from '@playwright/test'

const shopUrl = process.env.SHOP_URL ?? 'https://danube-web.shop'

test('search returns the matching books', async ({ page }) => {
  await page.goto(shopUrl)

  await page.locator('input[name="searchbar"]').fill('for')
  await page.getByRole('button', { name: 'Search' }).click()

  await expect(page.locator('.preview-title')).toHaveText([
    'The Foreigner',
    'The Transformation',
    'For Whom the Ball Tells',
    'Baiting for Robot',
  ])
})

import { test, expect } from '@playwright/test'

test('a shopper can search for a book', async ({ page }) => {
  await page.goto('https://danube-web.shop/')

  await page.locator('input[name="searchbar"]').fill('haben')
  await page.getByRole('button', { name: 'Search' }).click()

  await expect(page.locator('.preview').first()).toContainText('Haben oder haben')
})

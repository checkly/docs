import { test, expect } from '@playwright/test'

test('search finds a book', async ({ page }) => {
  await page.goto('/')

  await page.locator('input[name="searchbar"]').fill('haben')
  await page.getByRole('button', { name: 'Search' }).click()

  await expect(page.locator('.preview').first()).toContainText('Haben oder haben')
})

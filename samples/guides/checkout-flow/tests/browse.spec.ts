import { test, expect } from '@playwright/test'

test('browse to a product', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('.preview').first()).toBeVisible()
  await page.locator('.preview:nth-child(1) > .preview-author').click()

  await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible()
})

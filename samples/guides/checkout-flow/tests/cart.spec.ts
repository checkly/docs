import { test, expect } from '@playwright/test'

test('add to cart', async ({ page }) => {
  await page.goto('/')

  await page.locator('.preview:nth-child(1) > .preview-author').click()
  const title = await page.locator('.detail-wrapper h2').innerText()
  await page.getByRole('button', { name: 'Add to cart' }).click()
  await page.locator('#logo').click()

  await page.locator('#cart').click()
  await expect(page.locator('.cart')).toContainText(title)
})

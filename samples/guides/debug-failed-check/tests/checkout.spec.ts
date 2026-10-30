import { test, expect } from '@playwright/test'

test('checkout completes', async ({ page }) => {
  await page.goto('/')

  await page.locator('.preview:nth-child(1) > .preview-author').click()
  await page.getByRole('button', { name: 'Add to cart' }).click()
  await page.locator('#logo').click()

  await page.locator('#cart').click()
  await page.getByRole('button', { name: 'Checkout' }).click()

  await page.getByPlaceholder('Name', { exact: true }).fill('Max')
  await page.getByPlaceholder('Surname', { exact: true }).fill('Mustermann')
  await page.getByPlaceholder('Address').fill('Musterstrasse 1')
  await page.getByPlaceholder('Zipcode').fill('10115')
  await page.getByPlaceholder('City').fill('Berlin')
  await page.getByLabel('as soon as possible').check()
  await page.getByRole('button', { name: 'Buy' }).click()

  await expect(page.getByText('All good, order is on the way. Thank you!!')).toBeVisible()
})

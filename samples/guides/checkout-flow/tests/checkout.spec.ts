import { test, expect } from '@playwright/test'
import { shopper } from './shopper'

test('checkout completes', async ({ page }) => {
  await page.goto('/')

  await page.locator('.preview:nth-child(1) > .preview-author').click()
  await page.getByRole('button', { name: 'Add to cart' }).click()
  await page.locator('#logo').click()

  await page.locator('#cart').click()
  await page.getByRole('button', { name: 'Checkout' }).click()

  await page.getByPlaceholder('Name', { exact: true }).fill(shopper.name)
  await page.getByPlaceholder('Surname', { exact: true }).fill(shopper.surname)
  await page.getByPlaceholder('Address').fill(shopper.address)
  await page.getByPlaceholder('Zipcode').fill(shopper.zipcode)
  await page.getByPlaceholder('City').fill(shopper.city)
  await page.getByPlaceholder('Company (optional)').fill(shopper.company)
  await page.getByLabel('as soon as possible').check()
  await page.getByRole('button', { name: 'Buy' }).click()

  // A page that loads is not a page that worked. Assert the confirmation text.
  await expect(page.getByText('All good, order is on the way. Thank you!!')).toBeVisible()
})

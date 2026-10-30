import { test, expect } from '@playwright/test'

// Same flow as tests/checkout.spec.ts, self-contained for a Browser Check.
test('checkout completes', async ({ page }) => {
  await page.goto(process.env.SHOP_URL ?? 'https://danube-web.shop')

  await page.locator('.preview:nth-child(1) > .preview-author').click()
  await page.getByRole('button', { name: 'Add to cart' }).click()
  await page.locator('#logo').click()

  await page.locator('#cart').click()
  await page.getByRole('button', { name: 'Checkout' }).click()

  await page.getByPlaceholder('Name', { exact: true }).fill('Checkly')
  await page.getByPlaceholder('Surname', { exact: true }).fill('Monitor')
  await page.getByPlaceholder('Address').fill('Charlottenstr. 57')
  await page.getByPlaceholder('Zipcode').fill('10117')
  await page.getByPlaceholder('City').fill('Berlin')
  await page.getByPlaceholder('Company (optional)').fill('synthetic-monitoring')
  await page.getByLabel('as soon as possible').check()
  await page.getByRole('button', { name: 'Buy' }).click()

  await expect(page.getByText('All good, order is on the way. Thank you!!')).toBeVisible()
})

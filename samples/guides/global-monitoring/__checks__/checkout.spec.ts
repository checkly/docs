import { test, expect } from '@playwright/test'

test('checkout completes', async ({ page }) => {
  await page.goto('https://danube-web.shop/')

  // Add the first two books to the cart.
  for (const position of [1, 2]) {
    await page.locator(`.preview:nth-child(${position}) > .preview-author`).click()
    await page.getByRole('button', { name: 'Add to cart' }).click()
    await page.locator('#logo').click()
  }

  await page.locator('#cart').click()
  await page.getByRole('button', { name: 'Checkout' }).click()

  await page.getByPlaceholder('Name', { exact: true }).fill('Max')
  await page.getByPlaceholder('Surname', { exact: true }).fill('Mustermann')
  await page.getByPlaceholder('Address').fill('Charlottenstr. 57')
  await page.getByPlaceholder('Zipcode').fill('10117')
  await page.getByPlaceholder('City').fill('Berlin')
  await page.getByPlaceholder('Company (optional)').fill('Firma GmbH')
  await page.getByLabel('as soon as possible').check()
  await page.getByRole('button', { name: 'Buy' }).click()

  await expect(page.locator('#order-confirmation')).toContainText('Thank you')
})

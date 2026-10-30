import { test, expect } from '@playwright/test'

test('checkout completes', async ({ page }) => {
  // frontend-proxy is the shop's name on the demo's Docker network, where the agent runs.
  await page.goto('http://frontend-proxy:8080')

  await page.locator('[data-cy="product-card"]').first().click()
  await page.locator('[data-cy="product-add-to-cart"]').click()
  await page.locator('[data-cy="checkout-place-order"]').click()

  await expect(page.getByText('Your order is complete!')).toBeVisible()
})

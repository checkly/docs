import { test, expect } from '@playwright/test'

test('home page shows the content that sells', async ({ page }) => {
  await page.goto('https://danube-web.shop/')

  // The best seller is the first book on the page, not just somewhere on it.
  const bestSeller = page.locator('.preview').first()
  await expect(bestSeller.locator('.preview-title')).toHaveText('Haben oder haben')

  // "$9.95" appears on every book. Scope the price to the best seller's card.
  await expect(bestSeller.locator('.preview-price')).toHaveText('$9.95')

  // The offer banner must be there exactly once.
  await expect(page.getByText(/special offer/i)).toHaveCount(1)

  // Marketing rewords the call to action. Accept any of the approved wordings.
  await expect(
    page.getByRole('button', { name: /sign up|register|create an account/i }),
  ).toBeVisible()

  // Error copy must never reach the storefront.
  await expect(page.getByText(/something went wrong|internal server error/i)).toHaveCount(0)
})

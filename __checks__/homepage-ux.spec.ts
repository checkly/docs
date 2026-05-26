import { expect, test } from '@playwright/test'
import { DocsSitePage } from './poms/DocsSitePage'

test('docs homepage loads with key UI', async ({ page }) => {
  const docs = new DocsSitePage(page)

  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  const response = await docs.goto('/')
  expect(response?.status()).toBeLessThan(400)

  await expect(page).toHaveTitle(/Checkly/i)
  await expect(page.getByRole('navigation').first()).toBeVisible()

  expect(consoleErrors, `console errors: ${consoleErrors.join(' | ')}`).toEqual([])
})

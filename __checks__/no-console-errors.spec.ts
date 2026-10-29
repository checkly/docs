import { expect, test } from '@playwright/test'
import { DocsSitePage } from './poms/DocsSitePage'

// Mintlify injects every .js file in the repo into every page as a global
// script, so a stray file can break all pages at once.
const paths = ['/', '/api-reference', '/cli']

for (const path of paths) {
  test(`no console errors on ${path}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(`console.error: ${message.text()} @ ${message.location().url}`)
      }
    })

    const docs = new DocsSitePage(page)
    const response = await docs.goto(path)
    expect(response?.status()).toBeLessThan(400)
    await page.waitForLoadState('load')

    expect(errors).toEqual([])
  })
}

import { expect, test } from '@playwright/test'
import { DocsSitePage } from './poms/DocsSitePage'

// Mintlify injects every .js file in the repo into every page as a global
// script, so a stray file can break all pages at once.
const paths = ['/', '/api-reference', '/cli']

// Analytics and ad trackers fail in headless browsers and on previews.
const ignoredUrls = [
  /\/_vercel\/insights\//,
  /cdn\.segment\.com/,
  /px\.ads\.linkedin\.com/,
  /unifyintent\.com/,
]
const isIgnored = (url: string) => ignoredUrls.some((pattern) => pattern.test(url))

for (const path of paths) {
  test(`no console errors on ${path}`, async ({ page }) => {
    // Fail fast instead of using the 120s project timeout, which retries multiply.
    test.setTimeout(30_000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error' && !isIgnored(message.location().url)) {
        errors.push(`console.error: ${message.text()} @ ${message.location().url}`)
      }
    })
    page.on('response', (response) => {
      if (response.status() >= 400 && !isIgnored(response.url())) {
        errors.push(`HTTP ${response.status()}: ${response.request().method()} ${response.url()}`)
      }
    })
    // Chrome blocks cross-origin error responses like a missing image on
    // Mintlify's S3 (ERR_BLOCKED_BY_ORB), so they never fire 'response'.
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText ?? ''
      if (failure !== 'net::ERR_ABORTED' && !isIgnored(request.url())) {
        errors.push(`request failed: ${failure} ${request.method()} ${request.url()}`)
      }
    })

    const docs = new DocsSitePage(page)
    const response = await docs.goto(path)
    expect(response?.status()).toBeLessThan(400)
    // Mintlify injects custom JS from a React effect after hydration,
    // which can happen after the load event.
    await page.locator('script[data-mint-script]').first().waitFor({ state: 'attached' })
    // Third-party trackers can keep the network busy forever, so wait for the
    // injected scripts to load instead of 'networkidle'.
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLScriptElement>('script[data-mint-script][src]')].every(
        (script) => performance.getEntriesByName(script.src).length > 0,
      ),
    )
    // Give the scripts' async work (fetches, images) time to fail.
    await page.waitForTimeout(2_000)

    expect(errors, `Errors on ${path}:\n${errors.join('\n')}`).toHaveLength(0)
  })
}

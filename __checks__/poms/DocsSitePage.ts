import type { Page, Response } from '@playwright/test'

const baseUrl = process.env.DOCS_BASE_URL || 'https://www.checklyhq.com/docs'

export class DocsSitePage {
  constructor(public readonly page: Page) {}

  async goto(path = '/'): Promise<Response | null> {
    // LinkedIn pixel is known to hang Playwright sessions intermittently
    await this.page.route(/.*px\.ads\.linkedin.*/, (route) => route.abort())
    await this.page.setViewportSize({ width: 1280, height: 720 })
    return this.page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' })
  }
}

// Renders the Slack and email alert mockups (HTML in this folder) to 2x PNGs.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { ROOT } from '../lib.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const b = await chromium.launch()
for (const [src, out] of [['slack.html', 'slack-alert-and-recovery.png'], ['email.html', 'email-alert.png']]) {
  const p = await b.newPage({ viewport: { width: 960, height: 1200 }, deviceScaleFactor: 2 })
  await p.goto('file://' + path.join(here, src)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600)
  await p.locator('#frame').screenshot({ path: path.join(ROOT, 'images/guides/alerting', out) })
  console.log(`wrote images/guides/alerting/${out}`)
}
await b.close()

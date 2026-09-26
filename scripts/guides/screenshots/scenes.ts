import type { Page } from '@playwright/test'
import type { Scene } from './types'
import { VIEWPORTS } from './types'

// ─── Helpers ────────────────────────────────────────────────

/**
 * Wait for the main chart/content to render on a check detail page.
 */
async function waitForCheckDetail(page: Page) {
  // Wait for the response time chart or pass rate indicator
  await page
    .waitForSelector('[class*="chart"], [class*="Chart"], canvas, svg.recharts-surface', {
      timeout: 10000,
    })
    .catch(() => {})
  await page.waitForTimeout(1500)
}

// ─── Fixtures ───────────────────────────────────────────────
// Each guide's sample project in samples/guides/<slug> is deployed to the
// Checkly Marketing account. Sessions age out of retention; re-run
// `npx checkly test --record` in the sample project and update these IDs when
// a capture comes back empty.

const GUIDE_CHECKS_ON_DEPLOY = {
  passingSession: '01a0d495-01a9-724e-a8b6-ecf38090be39',
  failingSession: '01a0d494-d1ea-7164-94c3-08cacd198765',
}
const GUIDE_STRUCT = {
  webGroupId: '6874864',
  apiGroupId: '6874863',
}
const GUIDE_GLOBAL = {
  worldUrlMonitorId: 'df214e26-b266-49dd-b9b3-3d1e33efcf38',
}
const GUIDE_ALERTING = {
  booksCheckId: '543af08a-0c20-4d88-92d2-cd9883ff4cd8',
  homepageMonitorId: 'cb719a59-6a9a-4a8d-85b2-2ec8e1bf5aa9',
}
const GUIDE_CHECKOUT = {
  checkId: '4283299a-b365-4eba-9faf-91bcba403f2f',
  passingSession: '01a0d48f-d7df-70dd-852d-ee314453c954',
  failingSession: '01a0d496-98a6-7232-ac22-1332ea0b50a7',
}
const GUIDE_KEYWORD = {
  checkId: '386b2001-3d77-4347-aa12-f9930976386b',
  passingSession: '01a0dabc-9899-7648-9225-575999f303d6',
  failingSession: '01a0dabd-7289-7340-9df7-81229f61eba4',
}
const GUIDE_PW2M = {
  checkId: '60c5481c-c34e-441d-ba36-6c609bfe7cdf',
  passingSession: '01a0ce89-ce0c-74e1-8ee7-e95a2430af87',
  failingSession: '01a0ce8a-ea5e-700b-b41f-3d5b62e518d0',
}
const GUIDE_STATUS_PAGE = {
  // Public page deployed by samples/guides/communicate-availability. It needs
  // no login, and the incident IDs change every time the sample is broken.
  publicUrl: 'https://danube-shop-status.checkly-status-page.com',
  incidentId: 'a2f35110-171e-4f7f-a0c4-97b6d904243e',
}
const GUIDE_DEBUG = {
  checkId: '8c688bf9-2c0a-4614-be7b-e66008b1093a',
  failedResultId: '01a0df0e-99a6-7379-aab4-9e3f0bfcf420',
  failedSessionId: '01a0df0e-997b-74a3-ab2a-e31178ef1a07',
}
const GUIDE_UPTIME = {
  group: 6887126,
  ssl: '66c3df01-432a-4baa-a7ab-e296fc4be8a1',
  slow: '582a1604-da33-4135-8be6-4758e6ad75e0',
}

// ─── Scenes ─────────────────────────────────────────────────
// Clips start at x 240 and y 58 (or lower) to drop the app sidebar and top
// bar, so captures show only the guide's own content and no account or user
// chrome.

export const scenes: Scene[] = [
  // Guide: Run checks on every deploy
  {
    id: 'guide-checks-on-deploy-session',
    name: 'Deploy checks: passing session with git metadata',
    tags: ['guide-checks-on-deploy', 'docs', 'tier-2'],
    url: `/test-sessions/${GUIDE_CHECKS_ON_DEPLOY.passingSession}`,
    viewport: VIEWPORTS.desktop,
    delay: 3000,
    clip: { x: 240, y: 170, width: 1200, height: 505 },
  },
  {
    id: 'guide-checks-on-deploy-failure',
    name: 'Deploy checks: wrong URL fails the browser check',
    tags: ['guide-checks-on-deploy', 'docs', 'tier-2'],
    url: `/test-sessions/${GUIDE_CHECKS_ON_DEPLOY.failingSession}`,
    viewport: VIEWPORTS.desktop,
    delay: 3000,
    clip: { x: 240, y: 170, width: 1200, height: 505 },
  },
  {
    id: 'guide-checks-on-deploy-list',
    name: 'Deploy checks: Test sessions list',
    tags: ['guide-checks-on-deploy', 'docs', 'tier-2'],
    url: '/test-sessions',
    viewport: VIEWPORTS.desktop,
    delay: 3000,
    setup: async (page) => {
      const search = page.getByPlaceholder(/search/i).first()
      await search.fill('Docs guide: Run checks on every deploy | verified')
      await search.press('Enter')
      await page.waitForTimeout(2000)
    },
    clip: { x: 240, y: 58, width: 810, height: 480 },
  },

  // Guide: Monitor a checkout flow
  {
    id: 'guide-checkout-check-detail',
    name: 'Docs guide (Checkout flow) — Check Suite detail',
    tags: ['guide-checkout-flow', 'docs', 'playwright', 'detail'],
    url: `/checks/${GUIDE_CHECKOUT.checkId}`,
    viewport: VIEWPORTS.desktop,
    delay: 1500,
    setup: waitForCheckDetail,
    clip: { x: 240, y: 58, width: 1200, height: 490 },
  },
  {
    id: 'guide-checkout-result-passing',
    name: 'Docs guide (Checkout flow) — passing result with four test cases',
    tags: ['guide-checkout-flow', 'docs', 'playwright', 'check-result'],
    url: `/test-sessions/${GUIDE_CHECKOUT.passingSession}`,
    viewport: VIEWPORTS.desktop,
    delay: 3000,
    setup: async (page) => {
      await page.locator('a', { hasText: 'Shop checkout flow' }).first().click({ timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(4000)
    },
    clip: { x: 240, y: 58, width: 1200, height: 520 },
  },
  {
    id: 'guide-checkout-result-failing',
    name: 'Docs guide (Checkout flow) — failing checkout test case with screenshot and trace',
    tags: ['guide-checkout-flow', 'docs', 'playwright', 'check-result'],
    url: `/test-sessions/${GUIDE_CHECKOUT.failingSession}`,
    viewport: { width: 1440, height: 1500 },
    delay: 3000,
    setup: async (page) => {
      await page.locator('a', { hasText: 'Shop checkout flow' }).first().click({ timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(4000)
      await page.getByText('checkout completes').first().click({ timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(4000)
      // Collapse the step list so the failure screenshot is in view.
      await page.getByText('Steps', { exact: true }).first().click({ timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(1500)
    },
    clip: { x: 240, y: 170, width: 1200, height: 620 },
  },

  // Guide: Monitor the content your customers need to see
  {
    id: 'guide-keyword-check-detail',
    name: 'Docs guide (Keyword monitoring) — Check Suite detail',
    tags: ['guide-keyword-monitoring', 'docs', 'playwright', 'detail'],
    url: `/checks/${GUIDE_KEYWORD.checkId}`,
    viewport: VIEWPORTS.desktop,
    delay: 1500,
    setup: waitForCheckDetail,
    clip: { x: 240, y: 58, width: 1200, height: 490 },
  },
  {
    id: 'guide-keyword-result-failing',
    name: 'Docs guide (Keyword monitoring) — failing keyword assertion',
    tags: ['guide-keyword-monitoring', 'docs', 'playwright', 'check-result'],
    url: `/test-sessions/${GUIDE_KEYWORD.failingSession}`,
    viewport: { width: 1440, height: 1500 },
    delay: 3000,
    setup: async (page) => {
      await page.locator('a', { hasText: 'Shop home page content' }).first().click({ timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(4000)
      await page.getByText('home page shows the content that sells').first().click({ timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(4000)
    },
    clip: { x: 240, y: 170, width: 1200, height: 620 },
  },

  // Guide: Turn your Playwright tests into monitors
  {
    id: 'guide-pw2m-check-detail',
    name: 'Docs guide (Playwright to monitors) — Check Suite detail',
    tags: ['guide-playwright-to-monitoring', 'docs', 'playwright', 'detail'],
    url: `/checks/${GUIDE_PW2M.checkId}`,
    viewport: VIEWPORTS.desktop,
    delay: 1500,
    setup: waitForCheckDetail,
    clip: { x: 240, y: 58, width: 1200, height: 490 },
  },
  {
    id: 'guide-pw2m-check-list',
    name: 'Docs guide (Playwright to monitors) — check list filtered by name',
    tags: ['guide-playwright-to-monitoring', 'docs', 'playwright', 'home'],
    url: '/?search=Shop%20critical',
    viewport: VIEWPORTS.desktop,
    delay: 2500,
    clip: { x: 240, y: 150, width: 1200, height: 300 },
  },
  {
    id: 'guide-pw2m-result-passing',
    name: 'Docs guide (Playwright to monitors) — passing Check Suite result',
    tags: ['guide-playwright-to-monitoring', 'docs', 'playwright', 'check-result'],
    url: `/test-sessions/${GUIDE_PW2M.passingSession}`,
    viewport: VIEWPORTS.desktop,
    delay: 3000,
    setup: async (page) => {
      await page.locator('a', { hasText: 'Shop critical flows' }).first().click({ timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(4000)
    },
    clip: { x: 240, y: 58, width: 1200, height: 450 },
  },
  {
    id: 'guide-pw2m-result-failing',
    name: 'Docs guide (Playwright to monitors) — failing result with error and screenshot',
    tags: ['guide-playwright-to-monitoring', 'docs', 'playwright', 'check-result'],
    url: `/test-sessions/${GUIDE_PW2M.failingSession}`,
    viewport: { width: 1440, height: 1400 },
    delay: 3000,
    setup: async (page) => {
      await page.locator('a', { hasText: 'Shop critical flows' }).first().click({ timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(4000)
      // Open the failed test case to show the error, screenshot, and trace.
      await page.getByText('checkout completes').first().click({ timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(4000)
    },
    clip: { x: 240, y: 170, width: 1200, height: 620 },
  },

  // Guide: Structure a Checkly project for a real codebase
  {
    id: 'guide-struct-home-groups',
    name: 'Docs guide (Structure a project) — check list with service groups expanded',
    tags: ['guide-structure-a-project', 'docs', 'groups', 'home'],
    url: '/?search=Shop%20',
    viewport: { width: 1440, height: 1100 },
    delay: 2500,
    setup: async (page) => {
      // Expand both groups so their checks are visible. The chevron is the
      // first cell of each group row; click it by position within the row.
      for (const name of ['Shop web', 'Shop API']) {
        const row = page.locator('tr', { hasText: name }).first()
        const box = await row.boundingBox().catch(() => null)
        if (box) await page.mouse.click(box.x + 18, box.y + box.height / 2)
        await page.waitForTimeout(1500)
      }
    },
    clip: { x: 240, y: 150, width: 1200, height: 440 },
  },
  {
    id: 'guide-struct-group-web',
    name: 'Docs guide (Structure a project) — Shop web group page',
    tags: ['guide-structure-a-project', 'docs', 'groups', 'detail'],
    url: `/groups/${GUIDE_STRUCT.webGroupId}`,
    viewport: VIEWPORTS.desktop,
    delay: 3000,
    clip: { x: 240, y: 58, width: 1200, height: 600 },
  },

  // Guide: Why monitoring from around the globe is critical
  {
    id: 'guide-global-world-monitor',
    name: 'Docs guide (Global monitoring) — URL monitor detail with per-location run results',
    tags: ['guide-global-monitoring', 'docs', 'locations', 'detail'],
    url: `/checks/${GUIDE_GLOBAL.worldUrlMonitorId}`,
    viewport: { width: 1440, height: 1000 },
    delay: 2500,
    setup: waitForCheckDetail,
    clip: { x: 240, y: 58, width: 1200, height: 470 },
  },

  // Guide: Alerting that doesn't wake you up for nothing
  {
    id: 'guide-alerting-books-detail',
    name: 'Docs guide (Alerting) — API check detail with the forced failure and recovery',
    tags: ['guide-alerting', 'docs', 'alerts', 'detail'],
    url: `/checks/${GUIDE_ALERTING.booksCheckId}`,
    viewport: { width: 1440, height: 1100 },
    delay: 2500,
    setup: waitForCheckDetail,
    clip: { x: 240, y: 58, width: 1200, height: 900 },
  },
  {
    id: 'guide-alerting-homepage-detail',
    name: 'Docs guide (Alerting) — parallel URL monitor detail from three locations',
    tags: ['guide-alerting', 'docs', 'alerts', 'detail'],
    url: `/checks/${GUIDE_ALERTING.homepageMonitorId}`,
    viewport: { width: 1440, height: 1100 },
    delay: 2500,
    setup: waitForCheckDetail,
    clip: { x: 240, y: 58, width: 1200, height: 900 },
  },

  // Guide: Cover every endpoint with uptime monitors
  {
    id: 'guide-uptime-group',
    name: 'Docs guide (Uptime) — Shop uptime group',
    tags: ['guide-uptime-coverage', 'docs', 'groups', 'detail'],
    url: `/groups/${GUIDE_UPTIME.group}`,
    viewport: { ...VIEWPORTS.desktop, height: 1300 },
    colorScheme: 'light',
    delay: 3000,
    clip: { x: 240, y: 58, width: 1200, height: 1100 },
  },
  {
    id: 'guide-uptime-ssl',
    name: 'Docs guide (Uptime) — Shop certificate monitor',
    tags: ['guide-uptime-coverage', 'docs', 'detail'],
    url: `/checks/${GUIDE_UPTIME.ssl}`,
    viewport: VIEWPORTS.desktop,
    colorScheme: 'light',
    delay: 3000,
    clip: { x: 240, y: 58, width: 1200, height: 800 },
  },
  {
    id: 'guide-uptime-slow-failed',
    name: 'Docs guide (Uptime) — slow page monitor failing on a 503',
    tags: ['guide-uptime-verify', 'docs', 'detail'],
    url: `/checks/${GUIDE_UPTIME.slow}`,
    viewport: VIEWPORTS.desktop,
    colorScheme: 'light',
    delay: 3000,
    clip: { x: 240, y: 58, width: 1200, height: 800 },
  },
  {
    id: 'guide-uptime-ssl-failed',
    name: 'Docs guide (Uptime) — certificate monitor failing on an expired certificate',
    tags: ['guide-uptime-verify', 'docs', 'detail'],
    url: `/checks/${GUIDE_UPTIME.ssl}`,
    viewport: VIEWPORTS.desktop,
    colorScheme: 'light',
    delay: 3000,
    clip: { x: 240, y: 58, width: 1200, height: 800 },
  },

  // Guide: A status page backed by real monitors
  {
    id: 'guide-status-page-incident',
    name: 'Docs guide (Status page) — public page with an automated incident open',
    tags: ['guide-communicate-availability', 'docs', 'status-pages'],
    url: GUIDE_STATUS_PAGE.publicUrl,
    viewport: { width: 1280, height: 800 },
    colorScheme: 'light',
    delay: 1500,
    setup: async (page) => {
      // The component group is collapsed by default; open it to show both components.
      await page.getByText('Danube shop', { exact: true }).click()
      await page.waitForTimeout(1000)
    },
    clip: { x: 240, y: 0, width: 800, height: 740 },
  },
  {
    id: 'guide-status-page-incident-resolved',
    name: 'Docs guide (Status page) — resolved automated incident timeline',
    tags: ['guide-communicate-availability-resolved', 'docs', 'status-pages'],
    url: `${GUIDE_STATUS_PAGE.publicUrl}/incident/${GUIDE_STATUS_PAGE.incidentId}`,
    viewport: { width: 1280, height: 900 },
    colorScheme: 'light',
    delay: 2000,
    clip: { x: 240, y: 235, width: 800, height: 625 },
  },

  // Guide: Debug a failed check
  {
    id: 'guide-debug-check-detail',
    name: 'Docs guide (Debug a failed check) — check detail after the fix',
    tags: ['guide-debug-failed-check', 'docs', 'playwright', 'detail'],
    url: `/checks/${GUIDE_DEBUG.checkId}`,
    viewport: { width: 1440, height: 1100 },
    delay: 2500,
    setup: waitForCheckDetail,
    clip: { x: 240, y: 58, width: 1200, height: 900 },
  },
  {
    id: 'guide-debug-result-session',
    name: 'Docs guide (Debug a failed check) — failed check session',
    tags: ['guide-debug-failed-check', 'docs', 'playwright', 'check-result'],
    url: `/checks/${GUIDE_DEBUG.checkId}/check-sessions/${GUIDE_DEBUG.failedSessionId}`,
    viewport: { width: 1440, height: 1500 },
    delay: 4000,
    clip: { x: 240, y: 58, width: 1200, height: 1300 },
  },
  {
    id: 'guide-debug-result-failed',
    name: 'Docs guide (Debug a failed check) — failed check result with error, screenshot, and trace',
    tags: ['guide-debug-failed-check', 'docs', 'playwright', 'check-result'],
    url: `/checks/${GUIDE_DEBUG.checkId}/results/${GUIDE_DEBUG.failedResultId}`,
    viewport: { width: 1440, height: 1500 },
    delay: 4000,
    clip: { x: 240, y: 58, width: 1200, height: 1300 },
  },
]

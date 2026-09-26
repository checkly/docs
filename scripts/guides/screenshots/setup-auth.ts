import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * Interactive auth setup for the Checkly app.
 *
 * This script opens a real browser window so you can log in manually.
 * Once logged in, it saves your session (cookies + localStorage) to a file
 * that the capture script reuses — no re-login needed.
 *
 * Usage:
 *   npm run guides:screenshots:auth
 *
 * The saved session typically lasts until the Checkly session expires.
 * Re-run this script when captures start failing with auth errors.
 */

const AUTH_DIR = path.join(__dirname, '.auth')
const AUTH_FILE = path.join(AUTH_DIR, 'session.json')
const CONTEXT_FILE = path.join(AUTH_DIR, 'context.json')
const LOGIN_URL = 'https://app.checklyhq.com/'

async function setupAuth() {
  // Ensure .auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true })
  }

  console.log('🔐 Opening browser for Checkly login...')
  console.log('   Log in to your account, then come back here.\n')

  const browser = await chromium.launch({
    headless: false, // Must be visible for manual login
    args: ['--start-maximized'],
  })

  const context = await browser.newContext({
    viewport: null, // Use full window size
  })

  const page = await context.newPage()
  await page.goto(LOGIN_URL)

  // Wait for the user to complete login and reach the dashboard
  console.log('⏳ Waiting for you to log in...')
  console.log('   (Looking for the dashboard to confirm login)\n')

  try {
    // Wait for the post-login account page
    await page.waitForURL('**/accounts/**', { timeout: 300000 }) // 5 min timeout
  } catch {
    // Fallback: if URL pattern doesn't match, ask user to confirm
    console.log('⚠️  Could not auto-detect login. If you are logged in, press Enter to continue...')
    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => resolve())
    })
  }

  // Give the app a moment to fully hydrate
  await page.waitForTimeout(3000)

  // Extract account ID from the URL (e.g. /accounts/abc123/...)
  const currentUrl = page.url()
  const accountMatch = currentUrl.match(/\/accounts\/([^/]+)/)
  const accountId = accountMatch?.[1]

  if (!accountId) {
    console.error('❌ Could not extract account ID from URL:', currentUrl)
    console.error('   Expected URL pattern: /accounts/{accountId}')
    await browser.close()
    process.exit(1)
  }

  // Save the authenticated session
  await context.storageState({ path: AUTH_FILE })

  // Save account context alongside the session
  fs.writeFileSync(
    CONTEXT_FILE,
    JSON.stringify({ accountId, savedAt: new Date().toISOString() }, null, 2)
  )

  console.log(`✅ Session saved to ${AUTH_FILE}`)
  console.log(`✅ Account ID: ${accountId}`)
  console.log('   You can now run the capture script.\n')

  await browser.close()
}

setupAuth().catch((err) => {
  console.error('❌ Auth setup failed:', err)
  process.exit(1)
})

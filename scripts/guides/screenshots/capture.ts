import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { scenes } from './scenes'
import type { Scene, ScreenshotManifest, ScreenshotManifestEntry } from './types'

/**
 * Screenshot capture pipeline.
 *
 * Loads authenticated session, runs through all defined scenes,
 * captures screenshots, and generates a searchable manifest.
 *
 * Usage:
 *   npm run guides:screenshots -- --tags=guide-alerting
 *
 * Options:
 *   --tags=tag1,tag2   Only capture scenes matching ANY of these tags
 *   --ids=id1,id2      Only capture scenes matching these IDs
 *   --theme=dark        Capture in dark mode (appends "-dark" to IDs/filenames)
 *   --scale=1           Device scale factor (default 2)
 *   --account=<id>      Checkly account (default: the Marketing account the guide samples deploy to)
 *   --dry-run           List scenes that would be captured without running
 */

const AUTH_FILE = path.join(__dirname, '.auth', 'session.json')
const CONTEXT_FILE = path.join(__dirname, '.auth', 'context.json')
const OUTPUT_DIR = path.join(__dirname, 'output')
const IMAGES_DIR = path.join(OUTPUT_DIR, 'images')
const MANIFEST_FILE = path.join(OUTPUT_DIR, 'manifest.json')

const APP_BASE = 'https://app.checklyhq.com'

// Checkly Marketing account: every samples/guides/<slug> project deploys here.
const GUIDES_ACCOUNT = '5d536cc1-f076-446e-a142-21e48dd31986'

// ─── CLI argument parsing ──────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const tags: string[] = []
  const ids: string[] = []
  let dryRun = false
  let theme: 'light' | 'dark' = 'light'
  let scale = 2
  let account = GUIDES_ACCOUNT

  for (const arg of args) {
    if (arg.startsWith('--tags=')) {
      tags.push(...arg.replace('--tags=', '').split(',').map((t) => t.trim()))
    } else if (arg.startsWith('--ids=')) {
      ids.push(...arg.replace('--ids=', '').split(',').map((t) => t.trim()))
    } else if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--theme=dark') {
      theme = 'dark'
    } else if (arg.startsWith('--scale=')) {
      scale = Number(arg.replace('--scale=', '')) || 1
    } else if (arg.startsWith('--account=')) {
      account = arg.replace('--account=', '')
    }
  }

  return { tags, ids, dryRun, theme, scale, account }
}

function filterScenes(allScenes: Scene[], tags: string[], ids: string[]): Scene[] {
  let filtered = allScenes

  if (ids.length > 0) {
    filtered = filtered.filter((s) => ids.includes(s.id))
  }

  if (tags.length > 0) {
    filtered = filtered.filter((s) => s.tags.some((t) => tags.includes(t)))
  }

  return filtered
}

// ─── Main capture logic ────────────────────────────────────

async function capture() {
  const { tags, ids, dryRun, theme, scale, account } = parseArgs()
  const isDark = theme === 'dark'

  // Validate auth session and context exist
  if (!fs.existsSync(AUTH_FILE) || !fs.existsSync(CONTEXT_FILE)) {
    console.error('❌ No auth session found. Run setup-auth first:')
    console.error('   npm run guides:screenshots:auth\n')
    process.exit(1)
  }

  // Load account context
  const { accountId: defaultAccountId } = JSON.parse(fs.readFileSync(CONTEXT_FILE, 'utf-8'))
  const accountId = account || defaultAccountId
  const accountBase = `${APP_BASE}/accounts/${accountId}`
  console.log(`🔑 Account: ${accountId}`)
  console.log(`🎨 Theme: ${theme}\n`)

  // Filter scenes
  const targetScenes = filterScenes(scenes, tags, ids)

  if (targetScenes.length === 0) {
    console.log('No scenes matched your filters.')
    console.log(`  Total scenes defined: ${scenes.length}`)
    if (tags.length) console.log(`  Tag filter: ${tags.join(', ')}`)
    if (ids.length) console.log(`  ID filter: ${ids.join(', ')}`)
    process.exit(0)
  }

  console.log(`📸 Capturing ${targetScenes.length} screenshot(s)...\n`)

  if (dryRun) {
    for (const scene of targetScenes) {
      const id = isDark ? `${scene.id}-dark` : scene.id
      const name = isDark ? `${scene.name} (Dark)` : scene.name
      console.log(`  ${id} — ${name} [${scene.tags.join(', ')}]`)
    }
    console.log('\n(dry run — no screenshots taken)')
    process.exit(0)
  }

  // Ensure output directories exist
  fs.mkdirSync(IMAGES_DIR, { recursive: true })

  // Load existing manifest to merge with (preserves old entries not being recaptured)
  let existingManifest: ScreenshotManifest | null = null
  if (fs.existsSync(MANIFEST_FILE)) {
    existingManifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'))
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    storageState: AUTH_FILE,
    deviceScaleFactor: scale,
  })

  // Set dark mode if requested — the Checkly app reads localStorage.theme on init
  if (isDark) {
    await context.addInitScript(() => {
      localStorage.setItem('theme', 'dark')
    })
  }

  // Block tracking/analytics scripts
  const blockedDomains = [
    'hs-scripts.com',
    'hs-analytics.com',
    'ads-twitter.com',
    'redditstatic.com',
    'ads.linkedin.com',
    'google-analytics.com',
    'googletagmanager.com',
    'segment.io',
    'segment.com',
  ]

  await context.route('**/*', (route) => {
    const url = route.request().url()
    if (blockedDomains.some((domain) => url.includes(domain))) {
      return route.abort()
    }
    return route.continue()
  })

  const entries: ScreenshotManifestEntry[] = []
  let succeeded = 0
  let failed = 0

  for (const scene of targetScenes) {
    const page = await context.newPage()

    // Apply theme suffix for dark mode captures
    const sceneId = isDark ? `${scene.id}-dark` : scene.id
    const sceneName = isDark ? `${scene.name} (Dark)` : scene.name
    const sceneTags = isDark ? [...scene.tags, 'dark'] : scene.tags

    try {
      console.log(`  ⏳ ${sceneId} — ${sceneName}`)

      // Set viewport
      await page.setViewportSize(scene.viewport)

      // Set color scheme if specified
      if (scene.colorScheme) {
        await page.emulateMedia({ colorScheme: scene.colorScheme })
      }

      // Navigate — resolve relative scene URLs against the account base
      const fullUrl = scene.url.startsWith('http') ? scene.url : `${accountBase}${scene.url}`
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 })

      // Run setup actions if defined
      if (scene.setup) {
        await scene.setup(page)
      }

      // Wait for animations/data to settle
      if (scene.delay) {
        await page.waitForTimeout(scene.delay)
      }

      // Capture
      const filename = `${sceneId}.png`
      const filepath = path.join(IMAGES_DIR, filename)

      await page.screenshot({
        path: filepath,
        fullPage: scene.fullPage ?? false,
        clip: scene.clip,
        type: 'png',
      })

      entries.push({
        id: sceneId,
        name: sceneName,
        tags: sceneTags,
        file: `images/${filename}`,
        viewport: scene.viewport,
        colorScheme: isDark ? 'dark' : scene.colorScheme,
        url: fullUrl,
        capturedAt: new Date().toISOString(),
        fullPage: scene.fullPage ?? false,
      })

      console.log(`  ✅ ${sceneId}`)
      succeeded++
    } catch (err) {
      console.error(`  ❌ ${sceneId} — ${err instanceof Error ? err.message : err}`)
      failed++
    } finally {
      await page.close()
    }
  }

  await browser.close()

  // Merge with existing manifest: new captures overwrite old entries with same ID
  let allEntries = entries
  if (existingManifest) {
    const capturedIds = new Set(entries.map((e) => e.id))
    const preserved = existingManifest.screenshots.filter((e) => !capturedIds.has(e.id))
    allEntries = [...preserved, ...entries]
  }

  // Sort alphabetically by ID for stable output
  allEntries.sort((a, b) => a.id.localeCompare(b.id))

  // Write manifest
  const manifest: ScreenshotManifest = {
    generatedAt: new Date().toISOString(),
    baseURL: accountBase,
    total: allEntries.length,
    screenshots: allEntries,
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2))

  console.log(`\n📋 Manifest written to ${MANIFEST_FILE}`)
  console.log(`   Total: ${allEntries.length} | Captured: ${succeeded} | Failed: ${failed}`)

  if (failed > 0) {
    process.exit(1)
  }
}

capture().catch((err) => {
  console.error('❌ Capture failed:', err)
  process.exit(1)
})

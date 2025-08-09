import { test, expect } from '@playwright/test'

test('Docs Homepage User Experience', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('https://docs.checklyhq.com')
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Check that the page title is correct
  await expect(page).toHaveTitle(/Checkly Documentation/)
  
  // Verify the main heading is present
  await expect(page.locator('h1')).toContainText('Ready to get started?')
  
  // Check that key navigation elements are present
  await expect(page.locator('text=What is Checkly?')).toBeVisible()
  await expect(page.locator('text=Quick Start')).toBeVisible()
  
  // Verify the main product sections are visible
  await expect(page.locator('text=Detect')).toBeVisible()
  await expect(page.locator('text=Communicate')).toBeVisible()
  await expect(page.locator('text=Resolve')).toBeVisible()
  
  // Check that the search functionality is available
  await expect(page.locator('[data-testid="search"]')).toBeVisible()
  
  // Verify the page loads within acceptable time
  const loadTime = await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart)
  expect(loadTime).toBeLessThan(5000) // 5 seconds
  
  // Check that no console errors occurred
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  
  // Wait a bit more to catch any delayed errors
  await page.waitForTimeout(2000)
  
  if (consoleErrors.length > 0) {
    throw new Error(`Console errors found: ${consoleErrors.join(', ')}`)
  }
})

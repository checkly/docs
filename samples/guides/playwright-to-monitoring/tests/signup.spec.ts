import { test, expect } from '@playwright/test'

// Not tagged @monitor: creating accounts belongs in CI, not in production monitoring.
test('new user can sign up', async ({ page }) => {
  const email = `user-${Date.now()}@example.com`

  await page.goto('/')
  await page.getByRole('button', { name: 'Sign up' }).click()

  await page.getByPlaceholder('Name', { exact: true }).fill('John')
  await page.getByPlaceholder('Surname').fill('Doe')
  await page.getByPlaceholder('Email').fill(email)
  await page.getByPlaceholder('Password').fill('supersecure1')
  await page.getByLabel('Myself').check()
  await page.getByLabel('I have read and accept the').check()
  await page.getByRole('button', { name: 'Register' }).click()

  await expect(page.getByText(`Welcome back, ${email}`)).toBeVisible()
})

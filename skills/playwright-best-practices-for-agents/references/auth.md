# Authentication

If possible, sign in **once**, persist the session, and reuse it across tests. Logging in through the UI in every test is slow, hammers your auth provider (rate limits, lockouts), and couples unrelated tests to the login flow.

## Reuse auth via a setup project (the default)

Run the login flow in a `setup` project, save the authenticated cookies and local storage to disk with `storageState`, and have every other project depend on it. Dependent tests then start already signed in.

```ts playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],   // login runs first; this project reuses its state
    },
  ],
})
```

```ts auth.setup.ts
import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('Email').fill(process.env.USER_EMAIL!)
  await page.getByPlaceholder('Password').fill(process.env.USER_PASSWORD!)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Welcome back')).toBeVisible()   // confirm login worked
  await page.context().storageState({ path: authFile })        // persist the session
})
```

Git-ignore the state file — it holds live session cookies: add `playwright/.auth/` to `.gitignore`. See [config.md](./config.md) for the projects/`dependencies` mechanics.

## Credentials and test users

- **Never hardcode credentials**, not even while debugging — read them from env vars (`process.env.USER_PASSWORD`). It's too easy to commit a literal.
- Use a **dedicated test account**, never a real user's or a customer's — you control its data and avoid bot-detection lockouts.

## Logging in

- **Username/password and SSO/social** (Google, GitHub, Microsoft, Okta, SAML) look the same from the test's side. Third-party providers add redirects across domains; Playwright follows them automatically. Drive the provider's screens with user-facing locators like any other form.
- **Discovering the steps (as an agent):** drive the page yourself with `playwright-cli` — navigate to the login page, take an accessibility snapshot to read the real `getByRole`/`getByLabel` names, run the login, then transcribe the working steps into `auth.setup.ts`. `npx playwright codegen <your-site>` records the same steps but opens the **interactive Inspector GUI** you can't drive in an agent session, so it's a human-only shortcut. See [debugging.md](./debugging.md) for the `playwright-cli` setup.

## Two-factor auth (TOTP)

You can't read an SMS or push, but **authenticator-app (TOTP) codes are just a secret + the current time** — generate them in-process with [`otpauth`](https://www.npmjs.com/package/otpauth). Store the TOTP secret as an env var.

```ts
import * as OTPAuth from 'otpauth'

const totp = new OTPAuth.TOTP({ issuer: 'GitHub', digits: 6, period: 30, secret: process.env.TOTP_SECRET! })

await page.getByPlaceholder('XXXXXX').fill(totp.generate())   // current 6-digit code
```

## API login (skip the UI entirely)

When you only need an authenticated *session* — not coverage of the login screen — log in over HTTP and snapshot the state. It's faster and less flaky than driving the form.

```ts auth.setup.ts
import { test as setup } from '@playwright/test'

setup('authenticate via API', async ({ request }) => {
  await request.post('/api/login', { form: { email: process.env.USER_EMAIL!, password: process.env.USER_PASSWORD! } })
  await request.storageState({ path: 'playwright/.auth/user.json' })   // captures the auth cookies
})
```

Test the login *page itself* through the UI; use API login as setup for everything else. See [network.md](./network.md) for the `request` context.

## Seed session & app state directly

`storageState` and API login replay a whole session; sometimes you just need one piece of state in place before the page loads. Seed it on the **context**, before the first navigation:

```ts
// a known session cookie — skip even the API round-trip
await context.addCookies([
  { name: 'session', value: process.env.SESSION_TOKEN!, url: 'https://danube-web.shop' },
])

// runs before the page's own scripts: stub a global, force a flag, dismiss a consent banner
await context.addInitScript(() => {
  window.localStorage.setItem('feature.newCheckout', 'on')
  window.localStorage.setItem('cookie-consent', 'accepted')
})
```

`addInitScript` runs after the document exists but **before the page's own scripts**, so flags and stubs are in place by first paint. Set these in a fixture or `beforeEach` so every test starts from the same clean state. Reach for them for non-auth bootstrapping — feature flags, dismissing banners, freezing a global; for the full signed-in session, prefer `storageState` above.

## Multiple roles

Give each role its own setup step and state file, then opt a test into one with `test.use`:

```ts
setup('auth as admin', async ({ page }) => { /* … */ await page.context().storageState({ path: 'playwright/.auth/admin.json' }) })

test.describe('admin area', () => {
  test.use({ storageState: 'playwright/.auth/admin.json' })
  test('sees settings', async ({ page }) => { /* signed in as admin */ })
})
```

A persisted `storageState` is the same idea Checkly uses to keep authenticated monitors logged in across scheduled runs, so a session that survives reuse here survives in production monitoring too.

## Deeper in the docs

- [Managing authentication in Playwright](https://www.checklyhq.com/learn/playwright/authentication/)
- [Bypassing TOTP / 2FA login flows](https://www.checklyhq.com/learn/playwright/bypass-totp/)
- [Automating Google login](https://www.checklyhq.com/learn/playwright/google-login-automation/)
- [Playwright: Authentication](https://playwright.dev/docs/auth)

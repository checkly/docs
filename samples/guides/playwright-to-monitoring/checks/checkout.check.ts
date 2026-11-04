import { BrowserCheck, Frequency } from 'checkly/constructs'
import * as path from 'path'

// The single-file alternative: one spec file becomes one Browser Check.
// Browser Checks run the file on its own, without playwright.config.ts,
// so the spec uses full URLs instead of baseURL.
new BrowserCheck('shop-checkout-browser-check', {
  name: 'Shop checkout (Browser Check)',
  frequency: Frequency.EVERY_10M,
  locations: ['us-east-1', 'eu-west-1'],
  code: {
    entrypoint: path.join(__dirname, 'checkout.spec.ts'),
  },
  // Runs with `npx checkly test` but is skipped by `npx checkly deploy`,
  // so this sample deploys only the Check Suite.
  testOnly: true,
})

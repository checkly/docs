import { BrowserCheck, Frequency } from 'checkly/constructs'
import * as path from 'path'

// The single-file alternative: one spec file becomes one Browser Check.
// Browser Checks run the file on its own, without playwright.config.ts,
// so the spec reads SHOP_URL itself instead of relying on baseURL.
new BrowserCheck('shop-checkout-browser-check', {
  name: 'Shop checkout (Browser Check)',
  frequency: Frequency.EVERY_10M,
  locations: ['us-east-1', 'eu-west-1'],
  environmentVariables: [
    { key: 'SHOP_URL', value: 'https://danube-web.shop' },
  ],
  code: {
    entrypoint: path.join(__dirname, 'checkout.spec.ts'),
  },
  // Runs with `npx checkly test` but is skipped by `npx checkly deploy`,
  // so this sample deploys only the Check Suite.
  testOnly: true,
})

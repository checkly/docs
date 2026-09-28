import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: Monitor a checkout flow',
  logicalId: 'docs-guide-checkout-flow',
  checks: {
    playwrightConfigPath: './playwright.config.ts',
    playwrightChecks: [
      {
        name: 'Shop checkout flow',
        logicalId: 'shop-checkout-flow',
        frequency: Frequency.EVERY_10M,
        locations: ['us-east-1', 'eu-west-1'],
        // The production base URL lives on the check, not in the tests.
        // Point a second check at staging by changing only this value.
        environmentVariables: [
          { key: 'SHOP_URL', value: 'https://danube-web.shop' },
        ],
      },
    ],
  },
  cli: {
    runLocation: 'eu-west-1',
  },
})

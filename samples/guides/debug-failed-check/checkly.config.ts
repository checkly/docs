import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: Debug a failed check',
  logicalId: 'docs-guide-debug-failed-check',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    playwrightConfigPath: './playwright.config.ts',
    playwrightChecks: [
      {
        name: 'Shop checkout',
        logicalId: 'shop-checkout',
        frequency: Frequency.EVERY_10M,
        locations: ['us-east-1', 'eu-west-1'],
        tags: ['shop', 'checkout'],
      },
    ],
  },
  cli: {
    runLocation: 'eu-west-1',
  },
})

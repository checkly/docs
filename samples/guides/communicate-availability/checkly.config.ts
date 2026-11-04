import { defineConfig } from 'checkly'
import { Frequency, RetryStrategyBuilder } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: A status page backed by real monitors',
  logicalId: 'docs-guide-communicate-availability',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    frequency: Frequency.EVERY_5M,
    locations: ['us-east-1', 'eu-west-1'],
    // A public incident needs a confirmed failure, not a blip.
    retryStrategy: RetryStrategyBuilder.fixedStrategy({
      baseBackoffSeconds: 30,
      maxRetries: 2,
      sameRegion: true,
    }),
    checkMatch: '**/checks/**/*.check.ts',
    playwrightConfigPath: './playwright.config.ts',
    playwrightChecks: [
      {
        name: 'Storefront search',
        logicalId: 'storefront-search',
        frequency: Frequency.EVERY_10M,
        locations: ['us-east-1', 'eu-west-1'],
        // The tag is what connects this check to the Storefront component.
        tags: ['status-storefront'],
      },
    ],
  },
  cli: {
    runLocation: 'us-east-1',
  },
})

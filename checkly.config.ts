import { defineConfig } from 'checkly'
import { Frequency, RetryStrategyBuilder } from 'checkly/constructs'


export default defineConfig({
  projectName: 'Checkly Documentation Site',
  logicalId: 'checkly-docs-site-monitoring',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    activated: true,
    frequency: Frequency.EVERY_5M,
    locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    tags: ['docs', 'production', 'critical'],
    checkMatch: '**/__checks__/**/*.check?(-group).{js,ts}',
    runtimeId: '2026.04',
    retryStrategy: RetryStrategyBuilder.fixedStrategy({
      baseBackoffSeconds: 30,
      maxRetries: 2,
      sameRegion: true,
    }),
    playwrightConfig: {
      timeout: 120_000,
      expect: { timeout: 30_000 },
      use: { actionTimeout: 0 },
    },
  },
  cli: {
    runLocation: 'us-east-1',
    retries: 2
  }
})

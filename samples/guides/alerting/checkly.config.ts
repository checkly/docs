import { defineConfig } from 'checkly'
import { Frequency, RetryStrategyBuilder } from 'checkly/constructs'
import { opsSlack, onCallEmail } from './__checks__/alert-channels'

export default defineConfig({
  projectName: "Docs guide: Alerting that doesn't wake you up for nothing",
  logicalId: 'docs-guide-alerting',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    frequency: Frequency.EVERY_5M,
    locations: ['us-east-1', 'eu-west-1'],
    tags: ['shop'],
    alertChannels: [opsSlack, onCallEmail],
    // A blip is retried in the same region before it counts as a failure.
    retryStrategy: RetryStrategyBuilder.fixedStrategy({
      baseBackoffSeconds: 30,
      maxRetries: 2,
      sameRegion: true,
    }),
    checkMatch: '**/__checks__/**/*.check.ts',
  },
  cli: {
    runLocation: 'eu-west-1',
  },
})

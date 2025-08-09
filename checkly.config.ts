import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'


export default defineConfig({
  projectName: 'Checkly Documentation Site',
  logicalId: 'checkly-docs-site-monitoring',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    activated: true,
    frequency: Frequency.EVERY_5M,
    locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    tags: ['docs', 'production', 'critical'],
    checkMatch: 'monitoring/**/*.check.ts',
    runtimeId: '2025.04'
  },
  cli: {
    runLocation: 'us-east-1',
    retries: 2
  }
})

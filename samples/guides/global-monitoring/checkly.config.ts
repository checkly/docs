import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'
import { CORE } from './__checks__/locations'

export default defineConfig({
  projectName: 'Docs guide: Global monitoring',
  logicalId: 'docs-guide-global-monitoring',
  checks: {
    frequency: Frequency.EVERY_10M,
    locations: CORE,
    tags: ['global'],
    checkMatch: '**/__checks__/**/*.check.ts',
  },
  cli: {
    runLocation: 'eu-west-1',
  },
})

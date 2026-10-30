import { defineConfig } from 'checkly'
import { Frequency } from 'checkly/constructs'

export default defineConfig({
  projectName: 'Docs guide: Route alerts, traces and metrics through Cribl Stream',
  logicalId: 'docs-guide-route-telemetry-through-cribl',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    frequency: Frequency.EVERY_10M,
    // The agent runs on the same machine as the demo, so no public location.
    privateLocations: ['otel-demo-local'],
    tags: ['cribl-guide'],
    checkMatch: '**/__checks__/**/*.check.ts',
  },
  cli: {
    privateRunLocation: 'otel-demo-local',
  },
})

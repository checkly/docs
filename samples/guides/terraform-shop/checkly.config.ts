import { defineConfig } from 'checkly'

// Author verification only. The guide deploys with Terraform, not the CLI.
// `npx checkly test` runs the same spec files on Checkly, sent as raw script
// content exactly like Terraform's `script = file(...)`, without deploying.
export default defineConfig({
  projectName: 'Docs guide: Monitor a shop with Terraform',
  logicalId: 'docs-guide-terraform-shop',
  repoUrl: 'https://github.com/checkly/docs',
  checks: {
    checkMatch: 'verify/**/*.check.ts',
  },
  cli: { runLocation: 'us-east-1' },
})

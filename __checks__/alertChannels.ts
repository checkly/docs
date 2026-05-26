import { SlackAlertChannel } from 'checkly/constructs'

// Set via GitHub secret in CI (deploy-checks.yml, preview-checks.yml).
// For local `checkly test` runs, export any valid URL — the test run doesn't
// actually fire alerts, it just needs the URL to parse.
const slackWebhookUrl = process.env.SLACK_OPS_WEBHOOK_URL
if (!slackWebhookUrl) {
  throw new Error(
    'SLACK_OPS_WEBHOOK_URL is required. ' +
      'Set it as a GitHub Actions secret for CI, ' +
      'or export it locally (any valid URL works for `checkly test`).',
  )
}

const sendDefaults = {
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
}

export const slackChannelOps = new SlackAlertChannel('slack-channel-ops', {
  url: new URL(slackWebhookUrl),
  channel: '#ops',
  ...sendDefaults,
})

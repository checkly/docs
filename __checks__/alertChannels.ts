import { SlackAlertChannel } from 'checkly/constructs'

const sendDefaults = {
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
}

export const slackChannelOps = new SlackAlertChannel('slack-channel-ops', {
  url: new URL(process.env.SLACK_OPS_WEBHOOK_URL!),
  channel: '#ops',
  ...sendDefaults,
})

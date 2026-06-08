import { SlackAppAlertChannel } from 'checkly/constructs'

const sendDefaults = {
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
}

export const slackChannelOps = new SlackAppAlertChannel('slack-app-channel-ops', {
  slackChannels: ['#ops'],
  ...sendDefaults,
})

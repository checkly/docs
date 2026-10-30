import { EmailAlertChannel, SlackAppAlertChannel } from 'checkly/constructs'

// The team channel hears everything, including slow responses.
export const opsSlack = new SlackAppAlertChannel('ops-slack', {
  slackChannels: ['#ops-alerts'],
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: true,
})

// The on-call inbox only hears about real failures and their recovery.
export const onCallEmail = new EmailAlertChannel('on-call-email', {
  address: 'oncall@example.com',
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
})

import { EmailAlertChannel } from 'checkly/constructs'

// One channel, attached to every check through the project defaults.
// The alerting guide tunes when and how often it fires.
export const opsEmail = new EmailAlertChannel('ops-email', {
  address: 'ops@example.com',
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
})

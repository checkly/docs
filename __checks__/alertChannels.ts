import { OpsgenieAlertChannel, SlackAlertChannel } from 'checkly/constructs'

// Fill in the IDs from Checkly: Alert Settings → Alert Channels → channel → copy ID.
// Leave as 0 for channels you don't use; the placeholders below are commented out
// until you wire them up.
export const alertChannelIds = {
  slack: 0,
  opsGenieP1: 0,
  opsGenieP3: 0,
}

// export const slackOps = SlackAlertChannel.fromId(alertChannelIds.slack)
// export const opsGenieP1 = OpsgenieAlertChannel.fromId(alertChannelIds.opsGenieP1)
// export const opsGenieP3 = OpsgenieAlertChannel.fromId(alertChannelIds.opsGenieP3)

export const alertChannels: (SlackAlertChannel | OpsgenieAlertChannel)[] = [
  // slackOps,
  // opsGenieP3,
]

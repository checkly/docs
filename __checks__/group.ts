import { CheckGroupV2 } from 'checkly/constructs'
import { slackChannelOps } from './alertChannels'

export const docsGroup = new CheckGroupV2('docs-monitoring', {
  name: 'checklyhq.com/docs',
  tags: ['docs'],
  alertChannels: [slackChannelOps],
  muted: true,
})

import { CheckGroupV2 } from 'checkly/constructs'
import { alertChannels } from './alertChannels'

export const docsGroup = new CheckGroupV2('docs-monitoring', {
  name: 'checklyhq.com/docs',
  tags: ['docs', 'production'],
  alertChannels,
})

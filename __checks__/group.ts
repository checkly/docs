import { CheckGroupV2, RetryStrategyBuilder } from 'checkly/constructs'
import { slackChannelOps } from './alertChannels'

export const docsGroup = new CheckGroupV2('docs-monitoring', {
  name: 'checklyhq.com/docs',
  tags: ['docs'],
  alertChannels: [slackChannelOps],
  locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  runParallel: true,
  retryStrategy: RetryStrategyBuilder.fixedStrategy({
    baseBackoffSeconds: 30,
    maxRetries: 2,
    sameRegion: true,
  }),
})

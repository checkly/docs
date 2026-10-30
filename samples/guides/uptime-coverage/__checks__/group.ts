import { AlertEscalationBuilder, CheckGroupV2, RetryStrategyBuilder } from 'checkly/constructs'

// Every monitor in this guide joins this group and inherits its locations
// and alert policy. Retries are off so a failure shows on the first run.
export const shopGroup = new CheckGroupV2('shop-uptime', {
  name: 'Shop uptime',
  locations: ['us-east-1', 'eu-west-1'],
  runParallel: true,
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(1),
  retryStrategy: RetryStrategyBuilder.noRetries(),
})

// Slow is not down: over 3 seconds is degraded, over 5 seconds fails.
export const responseTimes = {
  degradedResponseTime: 3000,
  maxResponseTime: 5000,
}

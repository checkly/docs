import { AlertEscalationBuilder, CheckGroupV2, RetryStrategyBuilder } from 'checkly/constructs'

// Every API check in this guide joins this group. The base URL lives here,
// so a check reads {{API_BASE_URL}} instead of repeating the host, and a
// staging copy of the group only changes one value.
export const apiGroup = new CheckGroupV2('shop-api', {
  name: 'Shop API',
  locations: ['us-east-1', 'eu-west-1'],
  runParallel: true,
  environmentVariables: [{ key: 'API_BASE_URL', value: 'https://danube-web.shop/api' }],
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(1),
  retryStrategy: RetryStrategyBuilder.noRetries(),
})

// Slow is not down: over 1 second is degraded, over 5 seconds fails.
export const responseTimes = {
  degradedResponseTime: 1000,
  maxResponseTime: 5000,
}

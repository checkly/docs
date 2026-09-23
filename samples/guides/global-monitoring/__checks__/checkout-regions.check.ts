import { AlertEscalationBuilder, BrowserCheck, Frequency, RetryStrategyBuilder } from 'checkly/constructs'
import * as path from 'path'
import { AMERICAS, EUROPE, ASIA_PACIFIC } from './locations'

// A full browser flow from one location per continent your users are on.
// Retries stay in the region that failed, and an alert needs half the
// locations to agree, so one bad path to one region is not a page.
new BrowserCheck('shop-checkout-regions', {
  name: 'Checkout from three continents',
  frequency: Frequency.EVERY_10M,
  locations: [AMERICAS[0], EUROPE[1], ASIA_PACIFIC[3]],
  runParallel: true,
  retryStrategy: RetryStrategyBuilder.fixedStrategy({
    baseBackoffSeconds: 30,
    maxRetries: 2,
    sameRegion: true,
  }),
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(
    1,
    { interval: 10, amount: 0 },
    { enabled: true, percentage: 50 },
  ),
  code: {
    entrypoint: path.join(__dirname, 'checkout.spec.ts'),
  },
})

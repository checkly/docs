import { UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'
import { responseTimes, shopGroup } from './group'

// A page that always takes about a second, so you can see where the
// degraded and failed thresholds sit relative to a real response time.
new UrlMonitor('shop-slow-page', {
  name: 'Slow page (httpbin delay)',
  group: shopGroup,
  ...responseTimes,
  request: {
    url: 'https://httpbin.org/delay/1',
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})

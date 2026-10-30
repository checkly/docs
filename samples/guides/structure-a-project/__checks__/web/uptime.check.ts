import { Frequency, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'
import { webGroup } from './group'

new UrlMonitor('shop-homepage-uptime', {
  name: 'Homepage uptime',
  group: webGroup,
  // Overrides the project default: uptime is cheap, run it more often.
  frequency: Frequency.EVERY_1M,
  degradedResponseTime: 3000,
  maxResponseTime: 10000,
  request: {
    url: 'https://danube-web.shop/',
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})

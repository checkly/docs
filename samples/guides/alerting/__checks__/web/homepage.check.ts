import { AlertEscalationBuilder, Frequency, UrlAssertionBuilder, UrlMonitor } from 'checkly/constructs'

// Three regions vote. One region failing is recorded, two page.
new UrlMonitor('shop-homepage', {
  name: 'Homepage',
  frequency: Frequency.EVERY_5M,
  locations: ['us-east-1', 'eu-central-1', 'ap-southeast-2'],
  runParallel: true,
  degradedResponseTime: 1500,
  maxResponseTime: 10000,
  alertEscalationPolicy: AlertEscalationBuilder.runBasedEscalation(
    1,
    { amount: 1, interval: 10 },
    { enabled: true, percentage: 50 },
  ),
  request: {
    url: 'https://danube-web.shop/',
    followRedirects: true,
    assertions: [UrlAssertionBuilder.statusCode().equals(200)],
  },
})

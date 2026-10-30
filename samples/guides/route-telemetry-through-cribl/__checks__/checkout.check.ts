import { BrowserCheck } from 'checkly/constructs'
import * as path from 'path'
import { criblAlerts } from './alert-channels'

new BrowserCheck('otel-demo-checkout', {
  name: 'OTel demo checkout',
  alertChannels: [criblAlerts],
  code: {
    entrypoint: path.join(__dirname, 'checkout.spec.ts'),
  },
})

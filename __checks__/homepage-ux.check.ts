import { BrowserCheck, Frequency } from 'checkly/constructs'
import { docsGroup } from './group'

new BrowserCheck('docs-homepage-ux', {
  name: 'Docs homepage UX',
  group: docsGroup,
  activated: true,
  frequency: Frequency.EVERY_15M,
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['docs'],
  code: {
    entrypoint: './homepage-ux.spec.ts',
  },
})

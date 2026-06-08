import { BrowserCheck, Frequency } from 'checkly/constructs'
import { docsGroup } from './group'

new BrowserCheck('docs-homepage-ux', {
  name: 'Docs homepage UX',
  group: docsGroup,
  activated: true,
  frequency: Frequency.EVERY_15M,
  tags: ['docs'],
  code: {
    entrypoint: './homepage-ux.spec.ts',
  },
})

import { BrowserCheck, Frequency } from 'checkly/constructs'
import { docsGroup } from './group'

new BrowserCheck('docs-no-console-errors', {
  name: 'Docs no console errors',
  group: docsGroup,
  activated: true,
  frequency: Frequency.EVERY_15M,
  tags: ['docs'],
  code: {
    entrypoint: './no-console-errors.spec.ts',
  },
})

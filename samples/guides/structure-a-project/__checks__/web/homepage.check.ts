import { BrowserCheck } from 'checkly/constructs'
import * as path from 'path'
import { webGroup } from './group'

new BrowserCheck('shop-homepage', {
  name: 'Homepage renders',
  group: webGroup,
  code: {
    entrypoint: path.join(__dirname, 'homepage.spec.ts'),
  },
})

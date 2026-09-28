import * as fs from 'fs'
import * as path from 'path'
import {
  ApiCheck,
  AssertionBuilder,
  BrowserCheck,
  CheckGroupV2,
} from 'checkly/constructs'

// Mirrors the Terraform resources so `npx checkly test` can run them on
// Checkly without `terraform apply`. Every check is testOnly: never deployed.
const group = new CheckGroupV2('verify-terraform-shop', {
  name: 'Shop (Terraform) verification',
  environmentVariables: [{ key: 'SHOP_URL', value: 'https://danube-web.shop' }],
})

for (const [id, name] of [
  ['home', 'Shop home page'],
  ['search', 'Shop search'],
]) {
  new BrowserCheck(`verify-browser-${id}`, {
    name,
    group,
    testOnly: true,
    code: {
      content: fs.readFileSync(
        path.join(__dirname, '..', 'scripts', `${id}.spec.ts`),
        'utf8',
      ),
    },
  })
}

new ApiCheck('verify-books-api', {
  name: 'Shop books API',
  group,
  testOnly: true,
  degradedResponseTime: 1000,
  maxResponseTime: 3000,
  request: {
    url: 'https://danube-web.shop/api/books',
    method: 'GET',
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.headers('content-type').contains('application/json'),
      AssertionBuilder.jsonBody('$.length').greaterThan(0),
    ],
  },
})

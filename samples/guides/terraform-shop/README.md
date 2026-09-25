# Monitor a shop with Terraform

Self-contained sample for `/guides/monitoring-ecommerce-apps-using-terraform`. Run commands from this directory using your own Checkly account credentials.

```bash
npm ci
npx playwright install chromium
npx playwright test

export TF_VAR_checkly_api_key="<your user API key>"
export TF_VAR_checkly_account_id="<your account ID>"
export TF_VAR_alert_email="<your email>"
terraform init
terraform plan
terraform apply
```

The Terraform configuration creates five resources with the `checkly/checkly` provider: an email alert channel, a `checkly_check_group_v2` that enforces two parallel locations, a linear retry strategy, and a run-based alert policy, two Browser Checks whose scripts are the spec files in `scripts/`, and an API check for `https://danube-web.shop/api/books` with status code, header, and JSON body assertions.

`checkly.config.ts` and `verify/shop.check.ts` are for author verification only. They mirror the Terraform resources as `testOnly` constructs so `npx checkly test` can run the same spec files on Checkly, sent as raw script content like Terraform's `file()`, without applying anything.

## Author verification

Run on 2026-09-25 against the Checkly Marketing account.

- `terraform init`: resolved `checkly/checkly` v1.29.0 from `~> 1.0` with Terraform v1.16.4.
- `terraform fmt -check -recursive` and `terraform validate`: passed.
- `terraform plan` with `TF_VAR_alert_email=oncall@example.com`: `Plan: 5 to add, 0 to change, 0 to destroy.`
- `npx playwright test`: both specs passed locally against danube-web.shop. Changing `'Baiting for Robot'` to `'Waiting for Robot'` in `scripts/search.spec.ts` failed the search test with a `toHaveText` diff, then the file was restored.
- `npx checkly test --record`: all three mirrored checks passed on Checkly. A second run with the search typo and `$.length` greater than 100 failed both the search Browser Check and the API check, confirming the assertions bite.
- `terraform apply` was intentionally not run, so nothing from this sample exists in any Checkly account.
- Raw terminal captures live in the gitignored `.captures/` directory.

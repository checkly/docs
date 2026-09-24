terraform {
  required_providers {
    checkly = {
      source  = "checkly/checkly"
      version = "~> 1.0"
    }
  }
}

variable "checkly_api_key" {}
variable "checkly_account_id" {}

provider "checkly" {
  api_key    = var.checkly_api_key
  account_id = var.checkly_account_id
}

# The checkout flow as a Browser Check. The script is the same spec the
# Browser Check path uses; only the wrapper changes.
resource "checkly_check" "shop_checkout" {
  name                      = "Shop checkout (Terraform)"
  type                      = "BROWSER"
  activated                 = true
  frequency                 = 10
  use_global_alert_settings = true
  run_parallel              = true

  locations = [
    "us-east-1",
    "eu-west-1"
  ]

  retry_strategy {
    type = "LINEAR"
  }

  environment_variable {
    key   = "SHOP_URL"
    value = "https://danube-web.shop"
  }

  script = file("${path.module}/../checks/checkout.spec.ts")
}

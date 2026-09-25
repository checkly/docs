variable "shop_url" {
  type    = string
  default = "https://danube-web.shop"
}

# Every check in this guide joins this group. The enforce blocks make the
# group, not each check, own locations, scheduling, retries, and alerting.
resource "checkly_check_group_v2" "shop" {
  name      = "Shop (Terraform)"
  activated = true
  tags      = ["terraform-shop"]

  enforce_locations {
    enabled   = true
    locations = ["us-east-1", "eu-west-1"]
  }

  enforce_scheduling_strategy {
    enabled      = true
    run_parallel = true
  }

  enforce_retry_strategy {
    enabled = true
    retry_strategy {
      type                 = "LINEAR"
      max_retries          = 2
      base_backoff_seconds = 30
      same_region          = false
    }
  }

  enforce_alert_settings {
    enabled = true

    alert_settings {
      escalation_type = "RUN_BASED"
      run_based_escalation {
        failed_run_threshold = 1
      }
    }

    alert_channel_subscription {
      channel_id = checkly_alert_channel.shop_email.id
      activated  = true
    }
  }

  environment_variable {
    key   = "SHOP_URL"
    value = var.shop_url
  }
}

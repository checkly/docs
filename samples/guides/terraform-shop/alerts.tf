variable "alert_email" {
  type        = string
  description = "Where failure and recovery emails go."
}

resource "checkly_alert_channel" "shop_email" {
  email {
    address = var.alert_email
  }

  send_failure  = true
  send_recovery = true
  send_degraded = false
}

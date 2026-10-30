terraform {
  required_providers {
    checkly = {
      source  = "checkly/checkly"
      version = "~> 1.0"
    }
  }
}

variable "checkly_api_key" {
  type      = string
  sensitive = true
}

variable "checkly_account_id" {
  type = string
}

provider "checkly" {
  api_key    = var.checkly_api_key
  account_id = var.checkly_account_id
}

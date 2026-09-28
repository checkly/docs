# One Browser Check per spec file in scripts/. To monitor another flow,
# add a spec file and one line here.
locals {
  browser_flows = {
    home   = "Shop home page"
    search = "Shop search"
  }
}

resource "checkly_check" "browser" {
  for_each = local.browser_flows

  name      = each.value
  type      = "BROWSER"
  activated = true
  frequency = 10
  group_id  = checkly_check_group_v2.shop.id

  script = file("${path.module}/scripts/${each.key}.spec.ts")
}

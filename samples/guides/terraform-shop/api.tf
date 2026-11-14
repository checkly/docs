resource "checkly_check" "books_api" {
  name      = "Shop books API"
  type      = "API"
  activated = true
  frequency = 1
  group_id  = checkly_check_group_v2.shop.id

  degraded_response_time = 1000
  max_response_time      = 3000

  request = {
    url    = "${var.shop_url}/api/books"
    method = "GET"

    assertions = [
      {
        source     = "STATUS_CODE"
        comparison = "EQUALS"
        target     = "200"
      },
      {
        source     = "HEADERS"
        property   = "content-type"
        comparison = "CONTAINS"
        target     = "application/json"
      },
      {
        source     = "JSON_BODY"
        property   = "$.length"
        comparison = "GREATER_THAN"
        target     = "0"
      },
    ]
  }
}

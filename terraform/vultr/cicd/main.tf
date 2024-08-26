resource "vultr_container_registry" "vcr" {
  name = "polytlk"
  region = "ewr"
  plan = "start_up"
  public = false
}
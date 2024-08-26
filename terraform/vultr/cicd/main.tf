resource "vultr_container_registry" "vcr" {
  name = "polytlkcontainerregistry"
  region = "ewr"
  plan = "start_up"
  public = false
}
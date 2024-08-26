locals {
  workspace_name = terraform.workspace
  
  split_workspace = split("-", local.workspace_name)
  
  environment = local.split_workspace[1]
}

resource "vultr_database" "redis_instance" {
    database_engine = "redis"
    database_engine_version = "7"
    region = "ewr"
    plan = "vultr-dbaas-hobbyist-rp-intel-1-11-1"
    label = "${local.environment}-redis"
}
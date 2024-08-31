locals {
  workspace_name = terraform.workspace

  split_workspace = split("-", local.workspace_name)

  environment = local.split_workspace[1]
}

resource "vultr_kubernetes" "vke_cluster" {
  region  = "ewr"
  label   = "${local.environment}-cluster"
  version = "v1.31.0+1"

  dynamic "node_pools" {
    for_each = var.node_pools_config

    content {
      node_quantity = node_pools.value.node_quantity
      plan          = node_pools.value.plan
      label         = node_pools.value.label
      auto_scaler   = node_pools.value.auto_scaler
      min_nodes     = node_pools.value.min_nodes
      max_nodes     = node_pools.value.max_nodes
    }
  }
}

# This resource must be created and attached to the cluster
# before removing the default node from the vultr_kubernetes resource
resource "vultr_kubernetes_node_pools" "node_pool_1" {
  cluster_id    = vultr_kubernetes.vke_cluster.id
  node_quantity = 1
  plan          = "vc2-4c-8gb"
  label         = "${local.environment}-node-pool-1"
  auto_scaler   = false
  min_nodes     = 1
  max_nodes     = 1
}


resource "vultr_kubernetes_node_pools" "node_pool_2" {
  cluster_id    = vultr_kubernetes.vke_cluster.id
  node_quantity = 1
  plan          = "vc2-4c-8gb"
  label         = "${local.environment}-node-pool-2"
  auto_scaler   = false
  min_nodes     = 1
  max_nodes     = 1
}

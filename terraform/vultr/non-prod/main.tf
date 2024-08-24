resource "vultr_kubernetes" "vke_np_cluster" {
  region  = "ewr"
  label   = "vke-np-cluster"
  version = "v1.31.0+1"
}

# This resource must be created and attached to the cluster
# before removing the default node from the vultr_kubernetes resource
resource "vultr_kubernetes_node_pools" "np_node_pool" {
  cluster_id    = vultr_kubernetes.vke_np_cluster.id
  node_quantity = 1
  plan          = "vc2-1c-2gb"
  label         = "vke-np-node-pool"
  auto_scaler   = false
  min_nodes     = 1
  max_nodes     = 1
}

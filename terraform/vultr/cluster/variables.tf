variable "VULTR_API_KEY" {
  type      = string
  sensitive = true
}

variable "node_pools_config" {
  description = "Configuration for node pools. Provide an empty list to disable."
  type = list(object({
    node_quantity = number
    plan          = string
    label         = string
    auto_scaler   = bool
    min_nodes     = number
    max_nodes     = number
  }))
  default = [
    {
      node_quantity = 1
      plan          = "vc2-1c-2gb"
      label         = "default-node-pool"
      auto_scaler   = false
      min_nodes     = 1
      max_nodes     = 1
    }
  ]
}

variable "project_id" {
  type        = string
  description = "The project ID to host the cluster in"
}

variable "gha_token" {
  type        = string
  description = "The token for GHA runner"
}

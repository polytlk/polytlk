variable "project_id" {
  type        = string
  description = "The project ID to host the cluster in"
}

variable "image_name" {
  type        = string
  description = "The image name of the packer image used for GHA runner"
}

variable "pat_token" {
  description = "GitHub PAT token"
  type        = string
}

variable "runner_zone" {
  description = "The zone in us-central1 for the runner"
  type        = string
}

variable "target_size" {
  description = "The amount of instances needed for GHA runners"
  type        = number
  default     = 0
}


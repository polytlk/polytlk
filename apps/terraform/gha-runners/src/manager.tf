resource "google_compute_instance_group_manager" "gha_runner_manager" {
  name               = "gha-runner-manager"
  base_instance_name = "gha-runner"
  zone               = var.runner_zone
  target_size        = var.target_size

  version {
    instance_template = google_compute_instance_template.gha_runner_template.self_link
  }

  depends_on = [
    google_compute_instance_template.gha_runner_template
  ]
}


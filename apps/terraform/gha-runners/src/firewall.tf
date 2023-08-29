resource "google_compute_firewall" "allow_github" {
  name    = "allow-github"
  network = google_compute_network.gha_network.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_tags = ["gha-runner"]
}
resource "google_compute_firewall" "allow_github" {
  name    = "allow-github"
  network = google_compute_network.gha_network.name

  allow {
    protocol = "tcp"
    ports    = ["443"]
  }

  source_tags = ["gha-runner"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "allow-ssh-gha-runner"
  network = google_compute_network.gha_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  target_tags   = ["gha-runner"] # Target instances with this tag for the rule
  source_ranges = ["0.0.0.0/0"]  # Allow from any IP. You might want to restrict this!
}

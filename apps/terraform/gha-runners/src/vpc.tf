resource "google_compute_network" "gha_network" {
  name                    = "gha-network"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"

  depends_on = [
    google_project_service.compute
  ]
}

resource "google_compute_subnetwork" "gha_subnetwork" {
  name          = "gha-subnetwork"
  region        = "us-central1"
  network       = google_compute_network.gha_network.name
  ip_cidr_range = "10.2.0.0/16"
}

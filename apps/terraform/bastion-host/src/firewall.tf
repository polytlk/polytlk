# https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_firewall
resource "google_compute_firewall" "iap-bastion" {
  name    = "iap-bastion"
  network = data.google_compute_network.cluster_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  target_tags   = ["bastion"]
  # https://cloud.google.com/iap/docs/using-tcp-forwarding
  source_ranges = ["35.235.240.0/20"]
}

resource "google_compute_firewall" "allow-ssh" {
  name    = "allow-ssh"
  network = data.google_compute_network.cluster_network.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  target_tags   = ["bastion"]
  source_ranges = ["172.56.220.0/23"]
}

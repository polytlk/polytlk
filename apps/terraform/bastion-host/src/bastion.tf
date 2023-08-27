data "google_compute_network" "cluster_network" {
  name = "main"
}

data "google_compute_subnetwork" "private" {
  name = "private"
}

resource "google_service_account" "bastion_sa" {
  account_id   = "bastion-service-account"
  display_name = "Bastion Service Account"
  description  = "Service Account for Bastion Host"
}

resource "google_compute_instance" "bastion" {
  name         = "bastion-host"
  tags         = ["bastion"]
  machine_type = "f1-micro"
  zone         = "us-central1-a"

  allow_stopping_for_update = true

  scheduling {
    automatic_restart   = false
    on_host_maintenance = "TERMINATE"
    preemptible         = false
  }
  // Create a new boot disk from an image
  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }

    auto_delete = true
  }

  shielded_instance_config {
    enable_integrity_monitoring = true
  }
  network_interface {
    network = data.google_compute_network.cluster_network.name

    subnetwork = data.google_compute_subnetwork.private.name
  }
  metadata = {
    enable-oslogin         = "True"
    enable-oslogin-2fa     = "True"
    block-project-ssh-keys = true
  }

  # https://cloud.google.com/kubernetes-engine/docs/tutorials/private-cluster-bastion
  metadata_startup_script = <<SCRIPT
    #! /bin/bash
    apt-get update 
    apt-get install -y tinyproxy
    echo "Allow localhost" >> /etc/tinyproxy/tinyproxy.conf
    service tinyproxy restart
    SCRIPT

  service_account {
    email  = google_service_account.bastion_sa.email
    scopes = []
  }
}

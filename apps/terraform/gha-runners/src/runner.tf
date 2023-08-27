resource "google_project_service" "compute" {
  service = "compute.googleapis.com"
}

resource "google_compute_instance" "gha-runner" {
  name         = "gha-runner"
  tags         = ["gha-runner"]
  machine_type = "f1-micro"
  zone         = "us-central1-a"

  allow_stopping_for_update = true

  scheduling {
    automatic_restart   = false
    on_host_maintenance = "TERMINATE"
    preemptible         = false
  }
  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }

    auto_delete = true
  }

  network_interface {
    network = google_compute_network.gha_network.name

    subnetwork = google_compute_subnetwork.gha_subnetwork.name

    access_config {
    }
  }

  shielded_instance_config {
    enable_integrity_monitoring = true
  }

  metadata = {
    enable-oslogin         = "True"
    enable-oslogin-2fa     = "True"
    block-project-ssh-keys = true
  }

  # curl -fsSL https://fnm.vercel.app/install | bash
  # fnm install 20
  # nohup ./run.sh &
  metadata_startup_script = <<SCRIPT
    #! /bin/bash
    apt-get update 
    apt-get install -y unzip
    SCRIPT

  depends_on = [
    google_project_service.compute
  ]
}

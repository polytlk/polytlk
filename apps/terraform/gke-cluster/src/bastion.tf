resource "google_project_service" "iap" {
  service = "iap.googleapis.com"
}

resource "google_project_service" "networkmanagement" {
  service = "networkmanagement.googleapis.com"

  disable_dependent_services = true
}

resource "google_service_account" "bastion_sa" {
  account_id   = "bastion-service-account"
  display_name = "Bastion Service Account"
  description  = "Service Account for Bastion Host"
}

resource "google_project_iam_member" "bastion_sa_gke_engine_viewer" {
  project = var.project_id
  role    = "roles/container.viewer"
  member  = "serviceAccount:${google_service_account.bastion_sa.email}"
}

resource "google_compute_instance_template" "bastion-template" {
  name                 = "bastion-template"
  description          = "This template is used to create bastion instances."
  tags                 = ["bastion"]
  instance_description = "Instance used for bastion"
  machine_type         = "f1-micro"
  scheduling {
    automatic_restart   = false
    on_host_maintenance = "TERMINATE"
    preemptible         = false
  }
  // Create a new boot disk from an image
  disk {
    source_image = "debian-cloud/debian-11"
    auto_delete  = true
    boot         = true
  }
  network_interface {
    network = google_compute_network.main.name

    subnetwork = google_compute_subnetwork.private.name
  }
  metadata = {
    enable-oslogin     = "True"
    enable-oslogin-2fa = "True"
  }

  service_account {
    email  = google_service_account.bastion_sa.email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  # MANUALLY RUN THIS ONCE AFTER CREATING BASTION
  # gcloud container clusters get-credentials primary-cluster --region us-central1-a
  metadata_startup_script = <<SCRIPT
    #! /bin/bash
    apt-get update
    apt-get install -y kubectl google-cloud-sdk-gke-gcloud-auth-plugin
    SCRIPT

}

resource "google_compute_instance_from_template" "bastion" {
  name = "bastion"
  zone = "us-central1-a"

  source_instance_template = google_compute_instance_template.bastion-template.self_link_unique
}

resource "google_iap_tunnel_instance_iam_member" "member" {
  project  = var.project_id
  zone     = "us-central1-a"
  instance = google_compute_instance_from_template.bastion.name
  role     = "roles/iap.tunnelResourceAccessor"
  member   = "user:derrick@polytlk.io"

  depends_on = [
    google_project_service.iap
  ]
}

resource "google_compute_instance_iam_member" "member" {
  project       = var.project_id
  zone          = "us-central1-a"
  instance_name = google_compute_instance_from_template.bastion.name
  role          = "roles/compute.osLogin"
  member        = "group:devops@polytlk.io"

  depends_on = [
    google_project_service.iap
  ]
}

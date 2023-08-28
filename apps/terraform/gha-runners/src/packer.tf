resource "google_service_account" "packer_service_account" {
  account_id   = "packer-service-account"
  display_name = "Packer Service Account"
  description  = "Service Account for Packer to create GCE VM Machine Images"
}

resource "google_project_iam_binding" "service_account_user_binding" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"

  members = [
    "serviceAccount:${google_service_account.packer_service_account.email}"
  ]
}

resource "google_project_iam_binding" "compute_instance_admin_binding" {
  project = var.project_id
  role    = "roles/compute.instanceAdmin.v1"

  members = [
    "serviceAccount:${google_service_account.packer_service_account.email}"
  ]
}

resource "google_project_service" "iap" {
  service = "iap.googleapis.com"
}

resource "google_iap_tunnel_instance_iam_member" "member" {
  project  = var.project_id
  zone     = "us-central1-a"
  instance = google_compute_instance.bastion.name
  role     = "roles/iap.tunnelResourceAccessor"
  member   = "user:derrick@polytlk.io"

  depends_on = [
    google_project_service.iap
  ]
}

resource "google_compute_instance_iam_member" "member" {
  project       = var.project_id
  zone          = "us-central1-a"
  instance_name = google_compute_instance.bastion.name
  role          = "roles/compute.osLogin"
  member        = "group:devops@polytlk.io"

  depends_on = [
    google_project_service.iap
  ]
}

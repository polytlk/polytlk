resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_project_service" "cloudkms" {
  service = "cloudkms.googleapis.com"
}

resource "google_project_service" "storage" {
  service = "storage.googleapis.com"
}

resource "google_kms_key_ring" "terraform_state" {
  name     = "${random_id.bucket_prefix.hex}-bucket-tfstate"
  location = "us"

  depends_on = [
    google_project_service.cloudkms,
    google_project_service.storage
  ]
}

resource "google_kms_crypto_key" "terraform_state_bucket" {
  name            = "terraform-state-bucket"
  key_ring        = google_kms_key_ring.terraform_state.id
  rotation_period = "86400s"

  lifecycle {
    prevent_destroy = false
  }
}

# Enable the Cloud Storage service account to encrypt/decrypt Cloud KMS keys
# https://cloud.google.com/storage/docs/getting-service-agent
data "google_project" "project" {
}

resource "google_service_account" "kms_service_account" {
  account_id   = "kms-account"
  display_name = "KMS Service Account"
}

resource "google_project_iam_member" "default" {
  project = data.google_project.project.project_id
  role    = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member  = "serviceAccount:service-${data.google_project.project.number}@gs-project-accounts.iam.gserviceaccount.com"

  depends_on = [
    google_service_account.kms_service_account
  ]
}

resource "google_storage_bucket" "default" {
  name                        = "${var.project_id}-bucket-tfstate"
  force_destroy               = false
  location                    = "US"
  storage_class               = "STANDARD"
  public_access_prevention    = "enforced"
  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }
  encryption {
    default_kms_key_name = google_kms_crypto_key.terraform_state_bucket.id
  }
  depends_on = [
    google_project_iam_member.default
  ]
}

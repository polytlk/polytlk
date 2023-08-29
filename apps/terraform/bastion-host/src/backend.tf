terraform {
  backend "gcs" {
    prefix = "bastion-host"
  }
}

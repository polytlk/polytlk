packer {
  required_plugins {
    googlecompute = {
      version = ">= 1.1.1"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}


source "googlecompute" "basic-example" {
  project_id   = "ply-cicd"
  source_image = "debian-12-bookworm-v20230814"
  ssh_username = "debian"
  image_name   = "gha-runner-{{timestamp}}"
  image_labels = {
    type : "gha-runner"
  }
  zone                  = "us-central1-b"
  service_account_email = "packer-service-account@ply-cicd.iam.gserviceaccount.com"
  startup_script_file   = "./setup.sh"
}

build {
  sources = ["sources.googlecompute.basic-example"]
}
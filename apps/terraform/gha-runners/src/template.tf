resource "google_project_service" "compute" {
  service = "compute.googleapis.com"
}

resource "google_compute_instance_template" "gha_runner_template" {
  name         = "gha-runner-template"
  tags         = ["gha-runner"]
  machine_type = "g1-small"

  scheduling {
    automatic_restart   = false
    on_host_maintenance = "TERMINATE"
    preemptible         = false
  }

  disk {
    source_image = var.image_name
    auto_delete  = true

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
    shutdown-script        = "export RUNNER_ALLOW_RUNASROOT='1' && cd actions-runner && ./cleanup.sh"
  }

  metadata_startup_script = <<SCRIPT
    export PATH="/.local/share/fnm:$PATH"
    eval "$(fnm env)"

    cd actions-runner

    OWNER="dethereum"
    REPO="polytlk"
    WORKER_NAME="worker-$(date +%s)-$RANDOM"
    export RUNNER_ALLOW_RUNASROOT="1"

    AUTH_TOKEN=$(curl -s -X POST -H "authorization: token ${var.pat_token}" "https://api.github.com/repos/$${OWNER}/$${REPO}/actions/runners/registration-token" | jq -r .token)

    echo "#!/bin/bash" > /actions-runner/cleanup.sh
    echo "echo 'REMOVING RUNNER $${WORKER_NAME}'" >> /actions-runner/cleanup.sh
    echo "./config.sh remove --token $${AUTH_TOKEN}" >> /actions-runner/cleanup.sh
    chmod +x /actions-runner/cleanup.sh

    ./config.sh \
      --url "https://github.com/$${OWNER}/$${REPO}" \
      --token "$${AUTH_TOKEN}" \
      --name "$${WORKER_NAME}" \
      --unattended \
      --work _work

    ./run.sh
    SCRIPT

  depends_on = [
    google_project_service.compute
  ]
}

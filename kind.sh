#!/bin/sh
set -o errexit

# List of apps that should skip secret creation
BLACKLIST=("olivia")
BASE_DIR="apps"
reg_name='kind-registry'
reg_port='5001'


PODMAN_REGISTRIES_CONFIG=$(cat <<EOF
[[registry]]
location = "localhost:${reg_port}"
insecure = true
EOF
)

run_in_podman_vm() {
  podman machine ssh "$@"
}

create_namespace_and_secret() {
  local app_type="$1"    # Either microservices or workers
  local app_name="$2"    # Name of the app (e.g., eden or heimdall)
  local namespace_name   # Namespace to be created
  local secret_name      # Secret name

    # Check if the app is blacklisted
  if [[ " ${BLACKLIST[@]} " =~ " ${app_name} " ]]; then
    echo "Skipping secret creation for blacklisted app: $app_name"
    return
  fi

  # Determine namespace and secret name based on type of application
  if [[ "$app_type" == "microservices" ]]; then
    namespace_name="$app_name"
    secret_name="${app_name}-svc-secret-env"
  elif [[ "$app_type" == "workers" ]]; then
    namespace_name="${app_name}-worker"
    secret_name="${app_name}-worker-secret-env"
  fi
  # Create the namespace
  kubectl create namespace "$namespace_name" 2>/dev/null || true

  # Create the secret (assuming .env file is present inside the app folder)
  env_file="$BASE_DIR/$app_type/$app_name/.env"

  if [[ -f "$env_file" ]]; then
    if ! kubectl get secret "$secret_name" -n "$namespace_name" &> /dev/null; then
      kubectl create secret generic "$secret_name" --from-env-file="$env_file" -n "$namespace_name"
      echo "Secret '$secret_name' created in namespace '$namespace_name'"
    fi
  else
    echo "No .env file found for $app_name in $env_file"
  fi
}

check_cluster_exists() {
  # Try to get the nodes in the cluster
  kubectl get nodes &> /dev/null

  if [[ $? -eq 0 ]]; then
    return 0
  else
    return 1
  fi
}

create_kind_cluster_with_registry() {
  # 2. Create kind cluster with containerd registry config dir enabled
  # TODO: kind will eventually enable this by default and this patch will
  # be unnecessary.
  #
  # See:
  # https://github.com/kubernetes-sigs/kind/issues/2875
  # https://github.com/containerd/containerd/blob/main/docs/cri/config.md#registry-configuration
  # See: https://github.com/containerd/containerd/blob/main/docs/hosts.md
  cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry]
    config_path = "/etc/containerd/certs.d"
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
  labels:
    role: app
- role: worker
  labels:
    role: ops
EOF

  # 3. Add the registry config to the nodes
  #
  # This is necessary because localhost resolves to loopback addresses that are
  # network-namespace local.
  # In other words: localhost in the container is not localhost on the host.
  #
  # We want a consistent name that works from both ends, so we tell containerd to
  # alias localhost:${reg_port} to the registry container when pulling images
  REGISTRY_DIR="/etc/containerd/certs.d/localhost:${reg_port}"
  for node in $(kind get nodes); do
    podman exec "${node}" mkdir -p "${REGISTRY_DIR}"
    cat <<EOF | podman exec -i "${node}" cp /dev/stdin "${REGISTRY_DIR}/hosts.toml"
[host."http://${reg_name}:5000"]
EOF
  done

  # 4. Connect the registry to the cluster network if not already connected
  # This allows kind to bootstrap the network but ensures they're on the same network
  if [ "$(podman inspect -f='{{json .NetworkSettings.Networks.kind}}' "${reg_name}")" = 'null' ]; then
    echo "network is not connected. connecting now"
    podman network connect "kind" "${reg_name}"
  fi

  # 5. Document the local registry
  # https://github.com/kubernetes/enhancements/tree/master/keps/sig-cluster-lifecycle/generic/1755-communicating-a-local-registry
  cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:${reg_port}"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF
}


#https://medium.com/@fishpercolator/using-tilt-kubernetes-podman-to-get-a-dev-environment-on-silverblue-without-running-anything-1a6ef7de07ee

if [ "$(podman machine inspect --format '{{.State}}'  2>/dev/null)" == 'stopped' ]; then
  echo "Starting podman machine"
  podman machine start
fi

if [ "$(podman machine inspect --format '{{.State}}'  2>/dev/null)" == '' ]; then
  echo "Creating podman machine"
  podman machine init --cpus=4 --memory=4096
  podman machine set --rootful
  podman machine start

  run_in_podman_vm "echo '$PODMAN_REGISTRIES_CONFIG' | sudo tee /etc/containers/registries.conf.d/kind.conf > /dev/null"

  podman machine stop
  podman machine start
fi

if [ "$(podman inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  echo "Creating local registry"
  podman run \
    -d --restart=always -p "127.0.0.1:${reg_port}:5000" --network bridge --name "kind-registry" registry:2
fi


if check_cluster_exists; then
  echo "Cluster is already running. No need to create a new one."
else
  echo "No cluster found. You can proceed with cluster creation."
  create_kind_cluster_with_registry
fi


# Loop through the microservices and workers directories
for app_type in microservices workers; do
  if [[ -d "$BASE_DIR/$app_type" ]]; then
    for app_path in "$BASE_DIR/$app_type"/*; do
      if [[ -d "$app_path" ]]; then
        # Get the app name (basename of the directory)
        app_name=$(basename "$app_path")
        
        # Create namespaces and secrets, skipping blacklisted apps
        create_namespace_and_secret "$app_type" "$app_name"
      fi
    done
  else
    echo "Directory $BASE_DIR/$app_type does not exist"
  fi
done

kubectl create namespace web 2>/dev/null || true

tilt ci
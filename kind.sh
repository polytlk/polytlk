#!/bin/sh
set -o errexit

binaries=("podman" "tilt" "kind" "kubectl" "helm" "doppler")
missing_binaries=()

for binary in "${binaries[@]}"; do
    if ! which "$binary" > /dev/null 2>&1; then
        missing_binaries+=("$binary")
    fi
done

if [ ${#missing_binaries[@]} -ne 0 ]; then
    echo "The following binaries are missing:\n"
    for missing in "${missing_binaries[@]}"; do
        echo "\t- $missing"
    done
    echo "\nPlease install them and try again."
    exit 1
fi

echo "All required binaries are installed."

if doppler me > /dev/null 2>&1; then
    echo "You are logged into Doppler."
else
    echo "You are not logged into Doppler."
    echo "Please log in with the following command:"
    echo "doppler login"
    exit 1
fi

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

ROOT_DIR=$(pwd)

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
    echo "Setting up doppler"
    cd "$BASE_DIR/$app_type/$app_name"
    doppler setup -p $app_name -c local
    pwd
    doppler secrets download --format=env-no-quotes --no-file > .env
    cd "$ROOT_DIR"
  fi
}

create_namespace_and_secret_for_addons() {
    # Directory to loop through
    ADDONS_DIR="tilt/addons"

    ADDON_BLACKLIST=("ingress-nginx" "tyk") 

    # Loop through each subdirectory in the addons directory
    for dir in "$ADDONS_DIR"/*; do
        # Check if it's a directory
        if [ -d "$dir" ]; then
            addon_name=$(basename "$dir")
            
            kubectl create namespace "$addon_name" 2>/dev/null || true

            # Check if the addon is in the blacklist, and skip secret logic if so
            if [[ " ${ADDON_BLACKLIST[@]} " =~ " ${addon_name} " ]]; then
                echo "Skipping secret logic for $addon_name as it does not need it"
                continue
            fi

            env_file="$dir/.env"
            secret_name="$addon_name-secret-env"
            # Check if the .env file exists in this directory
            if [ -f "$dir/.env" ]; then
              if ! kubectl get secret "$secret_name" -n "$addon_name" &> /dev/null; then
                kubectl create secret generic "$secret_name" --from-env-file="$env_file" -n "$addon_name"
                echo "Secret '$secret_name' created in namespace '$addon_name'"
              fi
            else
              echo "No .env file found for $addon_name in $env_file"
              echo "Setting up doppler"
              cd "$ADDONS_DIR/$addon_name"
              doppler setup -p $addon_name -c local
              pwd
              doppler secrets download --format=env-no-quotes --no-file > .env
              cd "$ROOT_DIR"
            fi
        fi
    done
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
  image: kindest/node:v1.31.0
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
        system-reserved: "memory=5914Mi,cpu=2"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
  image: kindest/node:v1.31.0
  labels:
    role: app
  kubeadmConfigPatches:
  - |
    kind: JoinConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        system-reserved: "memory=5914Mi,cpu=3"
- role: worker
  image: kindest/node:v1.31.0
  labels:
    role: ops
  kubeadmConfigPatches:
  - |
    kind: JoinConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        system-reserved: "memory=6914Mi,cpu=3"
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

  # 6. annotate the nodes so tilt automatically knows where to push builds
  kubectl annotate node kind-control-plane tilt.dev/registry-from-cluster=localhost:5001 tilt.dev/registry=localhost:5001
  kubectl annotate node kind-worker tilt.dev/registry-from-cluster=localhost:5001 tilt.dev/registry=localhost:5001
  kubectl annotate node kind-worker2 tilt.dev/registry-from-cluster=localhost:5001 tilt.dev/registry=localhost:5001

  # 7. add metrics server
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.7.2/components.yaml
  kubectl patch -n kube-system deployment metrics-server --type=json -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
}


#https://medium.com/@fishpercolator/using-tilt-kubernetes-podman-to-get-a-dev-environment-on-silverblue-without-running-anything-1a6ef7de07ee

if [ "$(podman machine inspect --format '{{.State}}'  2>/dev/null)" == 'stopped' ]; then
  echo "Starting podman machine"
  podman machine start
fi

if [ "$(podman machine inspect --format '{{.State}}'  2>/dev/null)" == '' ]; then
  echo "Creating podman machine"
  podman machine init --cpus=4 --memory=8192
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

  echo "Cluster is ready!"
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

# Check if .npmrc already exists, and skip the steps if it does
if [ -f "apps/web-client/.npmrc" ]; then
    echo ".npmrc already exists in apps/web-client, skipping token setup."
else
    echo ".npmrc does not exist, setting up Doppler and creating .npmrc file."

    # Change to the apps/web-client directory
    cd apps/web-client

    # Set up Doppler for the web-client project
    doppler setup -p web -c local

    # Download secrets and format the .npmrc file
    doppler secrets download --format=env-no-quotes --no-file | grep NPM_TOKEN | \
    sed 's/NPM_TOKEN=//g' | \
    awk '{print "//registry.npmjs.org/:_authToken="$1"\nregistry=https://registry.npmjs.org/"}' > .npmrc

    echo ".npmrc file created with NPM_TOKEN."

    # Return to the original directory
    cd "$ROOT_DIR"
fi

kubectl create namespace flower 2>/dev/null || true

# Check if .npmrc already exists, and skip the steps if it does
if [ -f "tilt/flower/.env" ]; then
  if ! kubectl get secret flower-secret-env -n flower &> /dev/null; then
    kubectl create secret generic flower-secret-env --from-env-file=tilt/flower/.env -n flower
    echo "Secretflower-secret-env created in namespace flower"
  fi
    echo ".env already exists in tilt/flower, skipping secret setup."
else
    echo ".env does not exist, setting up Doppler and creating .env file."

    cd tilt/flower
    doppler setup -p flower -c local
    doppler secrets download --format=env-no-quotes --no-file > .env
    echo ".env created"

    # Return to the original directory
    cd "$ROOT_DIR"
fi

create_namespace_and_secret_for_addons

# tilt ci
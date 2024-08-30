create k8s manifests for tilt using these commands
HEIMDALL_ALLOWED_HOSTS="heimdall-svc.heimdall.svc,localhost" helmfile template -f helm/heimdall/helmfile.yaml -l type=deployment > apps/microservices/heimdall/tilt/kubernetes.yaml
HEIMDALL_ALLOWED_HOSTS="heimdall-svc.heimdall.svc,localhost" helmfile template -f helm/heimdall/helmfile.yaml -l type=deployment > apps/microservices/heimdall/tilt/kubernetes.yaml

manual deploy to dev 

HEIMDALL_ALLOWED_HOSTS="heimdall-svc.heimdall.svc,localhost" helmfile apply -e development -f helm/heimdall/helmfile.yaml
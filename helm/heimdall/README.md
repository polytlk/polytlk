create k8s manifests for tilt using these commands
helmfile template -f helm/heimdall/helmfile.yaml -l type=deployment > apps/microservices/heimdall/tilt/kubernetes.yaml
helmfile template -f helm/heimdall/helmfile.yaml -l type=api > apps/microservices/heimdall/tilt/api.yaml

manual deploy to dev 

helmfile apply -e development -f helm/heimdall/helmfile.yaml
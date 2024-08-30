create k8s manifests for tilt using these commands
helmfile template -f helm/eden/helmfile.yaml -l type=deployment > apps/microservices/eden/tilt/kubernetes.yaml
helmfile template -f helm/eden/helmfile.yaml -l type=api > apps/microservices/eden/tilt/api.yaml

manual deploy to dev 

helmfile apply -e development -f helm/eden/helmfile.yaml

create k8s manifests for tilt using these commands
helmfile template -f helm/eden-worker/helmfile.yaml > apps/workers/eden/tilt/kubernetes.yaml

manual deploy to dev 

helmfile apply -e development -f helm/eden-worker/helmfile.yaml

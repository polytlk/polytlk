create k8s manifests for tilt using these commands
helmfile template -f helm/socrates/helmfile.yaml > apps/microservices/socrates/tilt/kubernetes.yaml
manual deploy to dev 

helmfile apply -e development -f helm/socrates/helmfile.yaml
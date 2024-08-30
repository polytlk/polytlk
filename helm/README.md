# how to quickly manual deploy to dev

## deploy base components first
helmfile apply -e development -f helm/base/helmfile.yaml

## deploy services
helmfile apply -e development -f helm/helmfile.yaml

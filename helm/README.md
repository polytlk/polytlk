# how to quickly manual deploy to dev

## deploy base components first
helmfile apply -e development -f helm/base/helmfile.yaml

## deploy services
helmfile apply -e development -f helm/helmfile.yaml

# how to reset dev env

## destroy services first
helmfile destroy -e development -f helm/helmfile.yaml

## destroy base components
helmfile destroy -e development -f helm/base/helmfile.yaml



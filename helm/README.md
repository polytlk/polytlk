# how to quickly manual deploy to dev

## deploy base components first
helmfile apply -e development -f helm/base/helmfile.yaml

## deploy tyk-api-gateway second
helmfile apply -e development -f helm/tyk/helmfile.yaml.gotmpl

## deploy apps last
helmfile apply -e development -f helm/helmfile.yaml

# how to reset dev env

## destroy apps first
helmfile destroy -e development -f helm/helmfile.yaml

## deploy tyk-api-gateway second
helmfile destroy -e development -f helm/tyk/helmfile.yaml.gotmpl

## destroy base components last
helmfile destroy -e development -f helm/base/helmfile.yaml


